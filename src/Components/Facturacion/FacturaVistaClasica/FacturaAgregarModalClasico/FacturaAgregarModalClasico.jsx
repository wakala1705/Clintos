'use client';

import { useEffect, useState } from 'react';
import './FacturaAgregarModalClasico.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CurrencyInput from '@/Components/CurrencyInput/CurrencyInput';
import CatalogoAseguradorasModal from '@/Components/CatalogoAseguradorasModal/CatalogoAseguradorasModal';
import CatalogoTipoTerceroModal from '../CatalogoTipoTerceroModal/CatalogoTipoTerceroModal';
import CatalogoContratacionModal from '../CatalogoContratacionModal/CatalogoContratacionModal';
import AdmisionPickerModal from '../AdmisionPickerModal/AdmisionPickerModal';
import TipoFacturaSelector from '../TipoFacturaSelector/TipoFacturaSelector';
import {
  LuFilePlus2, LuFilePenLine, LuEye, LuCheck, LuTrash2, LuTriangleAlert, LuFileText, LuUser,
  LuClipboardList, LuCalculator, LuCoins, LuCreditCard, LuChartPie, LuInfo,
  LuRefreshCw, LuChevronUp, LuChevronDown,
} from 'react-icons/lu';

// icon/description por opción (consumido por TipoFacturaSelector, panel
// izquierdo) -- Normal se agrega como 4ta tarjeta (encargo explícito, ver
// imagen de referencia), antes vivía como opción de un FormSelect sin
// descripción.
const TIPO_FACTURA_OPTIONS = [
  {
    value: 'normal',
    label: 'Normal',
    description: 'Factura estándar con contrato, administradora y valores completos.',
    icon: LuFileText,
  },
  {
    value: 'copago',
    label: 'Copago',
    description: 'Cobro fijo a cargo del afiliado por la prestación del servicio.',
    icon: LuCoins,
  },
  {
    value: 'moderadora',
    label: 'Moderadora',
    description: 'Cuota moderadora según el régimen y servicio.',
    icon: LuCreditCard,
  },
  {
    value: 'pago-compartido',
    label: 'Pago Compartido',
    description: 'Porcentaje del valor del servicio a cargo del afiliado.',
    icon: LuChartPie,
  },
];
const TIPO_FACTURA_LABEL = Object.fromEntries(TIPO_FACTURA_OPTIONS.map((o) => [o.value, o.label]));

// Tipos de factura que restringen el formulario a un único valor a cargar
// (ver RESTRICTED_TIPOS/isRestricted más abajo) -- encargo explícito, ver
// imágenes de referencia.
const RESTRICTED_TIPOS = ['copago', 'moderadora', 'pago-compartido'];

// Listado por defecto -- Tipo Factura "normal" (sin caso especial abajo).
const ORIGEN_OPTIONS = [
  { value: 'admisiones', label: 'Admisiones' },
  { value: 'manual', label: 'Manual' },
];

// Origen depende del Tipo Factura elegido (encargo explícito, ver
// ORIGEN_OPTIONS_BY_TIPO/origenOptions más abajo): cada tipo restringido
// habilita un listado propio de procedencias en vez del genérico de
// arriba.
const ORIGEN_OPTIONS_COPAGO = [
  { value: 'admisiones', label: 'Admisiones' },
  { value: 'consulta-externa', label: 'Consulta Externa' },
];

const ORIGEN_OPTIONS_MODERADORA = [
  { value: 'admisiones', label: 'Admisiones' },
  { value: 'citas', label: 'Citas' },
  { value: 'ambulatorio', label: 'Ambulatorio' },
];

const ORIGEN_OPTIONS_PAGO_COMPARTIDO = [
  { value: 'admisiones', label: 'Admisiones' },
  { value: 'citas', label: 'Citas' },
  { value: 'consulta-externa', label: 'Consulta Externa' },
];

const ORIGEN_OPTIONS_BY_TIPO = {
  copago: ORIGEN_OPTIONS_COPAGO,
  moderadora: ORIGEN_OPTIONS_MODERADORA,
  'pago-compartido': ORIGEN_OPTIONS_PAGO_COMPARTIDO,
};

const MODO_FACTURACION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'contratacion', label: 'Contratación' },
  { value: 'union-temporal', label: 'Unión Temporal' },
];

const TIPO_CONTRATO_OPTIONS = [
  { value: 'evento', label: 'Evento' },
  { value: 'capita', label: 'Capita' },
  { value: 'pgp', label: 'PGP' },
];

// Reemplaza a "Tipo Contrato" cuando Modo Facturación es "Unión Temporal"
// (encargo explícito, ver imagen de referencia) -- listado propio, no
// reusa TIPO_CONTRATO_OPTIONS.
const PROCEDENCIA_FACTURA_UT_OPTIONS = [
  { value: 'salud', label: 'Salud' },
  { value: 'citas', label: 'Citas' },
  { value: 'autorizaciones-ce', label: 'Autorizaciones(CE)' },
  { value: 'pgp', label: 'PGP' },
  { value: 'capita', label: 'Capita' },
  { value: 'manual', label: 'Manual' },
];

// Por defecto Pesos -- ver buildInitialForm más abajo.
const MONEDA_OPTIONS = [
  { value: 'pesos', label: 'Pesos' },
  { value: 'dolar', label: 'Dólar' },
];

// Mismo valor que muestra el .fam-left-meta del panel izquierdo (placeholder
// hasta que haya lógica real de numeración). "No. de Factura" se eliminó de
// ese bloque (encargo explícito: era el mismo valor que Consecutivo, dato
// duplicado) -- por eso ya no hay un campo `noFactura` separado en el form.
const PROXIMO_CONSECUTIVO = '0200289592';

// Fecha Vencimiento es siempre un mes después de Fecha Factura (encargo
// explícito) -- se recalcula automáticamente cada vez que Fecha Factura
// cambia, ver handleChangeFechaFactura más abajo.
function addOneMonth(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function buildInitialForm(factura) {
  const today = new Date().toISOString().slice(0, 10);

  if (!factura) {
    return {
      tipoFactura: 'normal',
      origen: 'admisiones',
      noReferencia: '',
      fechaFactura: today,
      fechaVencimiento: addOneMonth(today),
      // Bajo isRestricted, este campo lo llena el nombre del afiliado de la
      // admisión elegida (ver handleSeleccionAdmision) -- es la persona a
      // facturar bajo Copago/Moderadora/Pago Compartido, no la
      // aseguradora/administradora como en Normal.
      idTercero: '',
      regimen: '',
      modoFacturacion: 'contratacion',
      tipoContrato: '',
      noContrato: '',
      idContrato: '0',
      administradora: '',
      procedenciaFacturaUT: '',
      valorServicios: '0.00',
      valorCopago: '0.00',
      valorPagoCompartido: '0.00',
      valorModeradora: '0.00',
      descuento: '0.00',
      moneda: 'pesos',
      concepto: '',
    };
  }

  // Modo edición (encargo explícito, ver comentario del componente más
  // abajo) -- precarga desde una fila de mockFacturasData.js, un modelo más
  // viejo que no cubre todos los campos de este formulario. `factura.tipo`
  // ('individual'/'masiva'/'copago'/'moderadora'/'pago-compartido') no tiene
  // 'individual'/'masiva' en TIPO_FACTURA_OPTIONS -- ambos caen a 'normal'.
  const tipoFactura = TIPO_FACTURA_OPTIONS.some((o) => o.value === factura.tipo) ? factura.tipo : 'normal';
  const isRestrictedTipo = RESTRICTED_TIPOS.includes(tipoFactura);
  return {
    tipoFactura,
    origen: (ORIGEN_OPTIONS_BY_TIPO[tipoFactura] ?? ORIGEN_OPTIONS)[0].value,
    noReferencia: factura.noAdmision ?? '',
    fechaFactura: factura.fecha ?? today,
    fechaVencimiento: factura.fechaVencimiento ?? addOneMonth(factura.fecha ?? today),
    // Bajo isRestricted, la persona a facturar (mismo criterio que
    // handleSeleccionAdmision) -- bajo Normal, la razón social del tercero
    // (mismo campo que muestra el picker, ver selectField="razonSocial" en
    // CatalogoAseguradorasModal más abajo).
    idTercero: (isRestrictedTipo ? factura.nombreAfiliado : factura.terceroRazonSocial) ?? '',
    regimen: '',
    // "Manual" (no "Contratación", el default de Agregar) porque el
    // registro legacy trae Tipo Contrato/Administradora, no No Contrato/ID
    // (ver showTipoContrato/showAdministradora más abajo) -- se puede
    // cambiar a mano después, igual que bajo Agregar.
    modoFacturacion: 'manual',
    tipoContrato: factura.tipoContrato === 'Evento' ? 'evento' : '',
    noContrato: '',
    idContrato: '0',
    administradora: factura.administradora ?? '',
    procedenciaFacturaUT: '',
    // Sin desglose por concepto en el modelo legacy -- todo el valor
    // conocido va a Servicios (Copago/Pago Comp./Moderadora/Descuento en
    // 0), así Valor Factura calculado en vivo reproduce factura.valorTotal.
    valorServicios: String(factura.valorTotal ?? 0),
    valorCopago: '0.00',
    valorPagoCompartido: '0.00',
    valorModeradora: '0.00',
    descuento: '0.00',
    moneda: 'pesos',
    concepto: '',
  };
}

function setField(setForm, key) {
  return (value) => setForm((f) => ({ ...f, [key]: value }));
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// Campos monetarios validados en handleGuardar (encargo: "validar rango
// no-negativo por campo y calcular Valor Factura en vivo") -- todos viven
// bajo !isRestricted, mismo criterio que su progressive disclosure de arriba.
const MONEY_FIELDS = [
  { key: 'valorServicios', label: 'Valor Servicios' },
  { key: 'valorCopago', label: 'Valor Copago' },
  { key: 'valorPagoCompartido', label: 'Valor Pago Comp.' },
  { key: 'valorModeradora', label: 'Valor Moderadora' },
  { key: 'descuento', label: 'Descuento' },
];

// Header de cada una de las 4 secciones del panel derecho (ícono en círculo +
// título + descripción + contenido final opcional) -- local a este archivo,
// no un componente de @/Components/ porque está fuertemente acoplado a la
// forma de estas 4 secciones puntuales (no se reusa en otro modal).
function SectionHeader({
  icon: Icon, title, subtitle, trailing,
}) {
  return (
    <div className="fam-section-header">
      <div className="fam-section-header-main">
        {Icon && <div className="fam-section-icon"><Icon className="icon" aria-hidden="true" /></div>}
        <div>
          <h4>{title}</h4>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {trailing && <div className="fam-section-header-trailing">{trailing}</div>}
    </div>
  );
}

// Modal disparado por el botón "Nueva factura" del header de Facturacion.jsx
// -- layout de 2 paneles (encargo explícito, ver imagen de referencia):
// izquierdo `TipoFacturaSelector` (tarjetas Normal/Copago/Moderadora/Pago
// Compartido) + Compañía/Consecutivo/No. de Factura, derecho el formulario
// agrupado en 4 secciones con SectionHeader (ícono+título+descripción). El
// único botón cerrar real vive en el `ModalHeader` homologado de arriba
// (ver AGENTS.md "Modales") -- "Formulario de factura" dentro del panel
// derecho es solo un heading de contenido, no repite esa fila de
// título+cierre.
//
// También cubre "Editar" (encargo explícito: "el modal de editar es un
// modal antiguo, debería ser el mismo modal de creación pero en modo
// edición") -- pasarle `factura` (fila de FacturasGridClasica/
// mockFacturasData.js) activa `isEditMode`: cambia ícono/título/subtítulo
// del header y Compañía/Consecutivo del panel izquierdo a los datos reales
// de esa factura en vez de los de un registro nuevo, y precarga el
// formulario (ver buildInitialForm). Reemplazó al viejo
// FacturaEditarModalClasico ("Cambiando un Registro", grid plano de 2
// columnas) -- ese componente y su .css se borraron, único consumidor era
// FacturaVistaClasica.jsx. El modelo de mockFacturasData.js es más viejo y
// no tiene equivalente para todos los campos de este formulario (viene de
// la grilla "clásica", con su propio shape histórico) -- lo que no matchea
// (Régimen, No Contrato/ID, Descuento, Moneda, Concepto...) queda en su
// default de "Nueva factura" en vez de inventar un valor. `isEditMode` fija
// Modo Facturación en "Manual" (el registro trae Tipo Contrato/
// Administradora, no No Contrato/ID, ver Modo Facturación en la sección 3)
// -- a diferencia de Agregar, sigue siendo editable a mano después.
//
// Solo pinta el front (encargo explícito: "creá la modal... y luego le
// damos lógica"): "Guardar" sigue sin persistir nada en un backend real --
// pero ahora valida (Fecha Vencimiento >= Fecha Factura, montos no
// negativos), calcula Valor Factura en vivo, y muestra un aviso "Guardado
// (simulado)" antes de cerrar en vez de un cierre silencioso indistinguible
// de un guardado real (ver validate/handleGuardar más abajo). Cerrar con
// cambios sin guardar (Cancelar/overlay/Escape/botón X) pide confirmación
// primero (ver attemptClose/fvc-discard-modal, clases compartidas en
// shared.css). Id Tercero y Administradora reusan el mismo
// CatalogoAseguradorasModal (ya existe -- encargo explícito:
// "administradora... me debería abrir el mismo modal de id terceros", cada
// uno con su propio estado de apertura para no compartir instancia),
// Régimen reusa ../CatalogoTipoTerceroModal/CatalogoTipoTerceroModal, No
// Contrato reusa ../CatalogoContratacionModal/CatalogoContratacionModal y
// No. Referencia reusa ../AdmisionPickerModal/AdmisionPickerModal (los 3
// nuevos, ver esos archivos) -- este último trae el dataset mock de
// /admisiones adentro del modal en vez de navegar a esa ruta, para no
// perder el formulario en curso.
//
// "Origen" (par de Tipo Factura, encargo explícito) no tiene equivalente en
// el mock de facturas todavía -- placeholder hasta que haya lógica real
// (mismo criterio que Compañía/Consecutivo bajo Agregar). Ver isRestricted
// más abajo para la lógica de Copago/Moderadora/Pago Compartido.
export default function FacturaAgregarModalClasico({ factura, onClose }) {
  const isEditMode = Boolean(factura);
  const [form, setForm] = useState(() => buildInitialForm(factura));
  const [catalogoTerceroAbierto, setCatalogoTerceroAbierto] = useState(false);
  const [catalogoRegimenAbierto, setCatalogoRegimenAbierto] = useState(false);
  const [catalogoContratacionAbierto, setCatalogoContratacionAbierto] = useState(false);
  const [catalogoAdministradoraAbierto, setCatalogoAdministradoraAbierto] = useState(false);
  const [admisionPickerAbierto, setAdmisionPickerAbierto] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  // Admisión confirmada vía AdmisionPickerModal (para cualquier tipo, no
  // solo isRestricted) -- maneja el banner "Admisión encontrada"/"Cambiar
  // admisión" de la sección 1. Se limpia si el usuario edita "No.
  // Referencia" a mano (ver handleChangeNoReferencia), porque en ese caso
  // el texto ya no refleja la admisión confirmada.
  const [admisionSeleccionada, setAdmisionSeleccionada] = useState(null);
  // Toggle "Contraer sección"/"Expandir sección" de "Información
  // contractual" (encargo explícito, ver imagen de referencia).
  const [contractSectionCollapsed, setContractSectionCollapsed] = useState(false);

  // Snapshot del form recién montado (mismo objeto que ya construyó
  // useState(buildInitialForm) arriba) -- useState en vez de useRef porque
  // isDirty lo lee durante el render (leer un ref en render rompe la regla
  // react-hooks/refs); el setter nunca se usa, solo sirve de referencia fija
  // para detectar cambios sin guardar antes de cerrar (ver attemptClose).
  const [initialForm] = useState(form);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  // Intercepta cualquier intento de cerrar (Cancelar/overlay/Escape/botón X
  // de ModalHeader) -- si hay cambios sin guardar, pide confirmación en vez
  // de cerrar directo; onClose real solo corre desde "Sí, descartar" o
  // cuando no hay nada que perder. Ignorado mientras `saving` muestra el
  // aviso de guardado simulado (ver handleGuardar).
  function attemptClose() {
    if (saving) return;
    if (isDirty) setConfirmingClose(true);
    else onClose();
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') attemptClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  // Copago/Moderadora/Pago Compartido son tipos de factura "de un solo
  // valor" (encargo explícito, ver imágenes de referencia): autoseleccionan
  // Modo Facturación en "Manual" (queda seleccionable igual, no se
  // deshabilita -- encargo explícito). Progressive disclosure (encargo
  // explícito: "en vez de mostrar esos campos muertos ahi, vamos a
  // ocultarlos"): No Contrato/Descuento/ID/Valor Copago/Valor Pago Comp./
  // Valor Moderadora/Valor Factura/Moneda se OCULTAN por completo (no solo
  // se deshabilitan) cuando isRestricted -- los 4
  // "Valor X" quedan ocultos siempre bajo isRestricted, incluso el que
  // coincide con el tipo elegido (encargo explícito, ningún caso especial
  // por tipo). Tipo Contrato es la excepción: a diferencia de sus vecinos
  // de fila (No Contrato/ID), queda siempre visible/habilitado -- también
  // bajo isRestricted (encargo explícito, mismas opciones Evento/Capita/
  // PGP) -- y se precarga en "Evento" cada vez que se elige uno de estos 3
  // tipos (encargo explícito, ver handleChangeTipoFactura; queda
  // seleccionable igual, el usuario puede cambiarlo a mano después). Los
  // campos que quedan sin su vecino de fila bajo isRestricted
  // (Modo Facturación, Tipo Contrato) pasan a `fam-col-span-2` para no dejar
  // hueco en el grid. Fecha Factura/Fecha Vencimiento/No. Referencia/Tercero
  // (Id Tercero)/Régimen/Concepto nunca se restringen ni se ocultan.
  // "Administradora" se oculta bajo isRestricted sin reemplazo (encargo
  // explícito): "Tercero / Administradora" pasa a ser la persona a facturar
  // bajo esos tipos, ver handleSeleccionAdmision. "Normal" no oculta ni
  // deshabilita nada.
  const isRestricted = RESTRICTED_TIPOS.includes(form.tipoFactura);
  // Listado de Origen habilitado para el Tipo Factura activo (encargo
  // explícito: Copago->Admisiones/Consulta Externa, Moderadora->Admisiones/
  // Citas/Ambulatorio, Pago Compartido->Admisiones/Citas/Consulta Externa).
  const origenOptions = ORIGEN_OPTIONS_BY_TIPO[form.tipoFactura] ?? ORIGEN_OPTIONS;

  // Visibilidad de "3. Información contractual" según Modo Facturación
  // (encargo explícito, solo bajo Normal -- isRestricted mantiene su
  // comportamiento de siempre: No Contrato/ID/Administradora/Procedencia UT
  // ocultos, Tipo Contrato siempre visible, sin importar el modo elegido).
  // - Manual: sin No Contrato/ID (no hay contrato que referenciar), con
  //   Tipo Contrato y Administradora.
  // - Contratación: con No Contrato/ID (el contrato es la fuente del tipo),
  //   sin Tipo Contrato, con Administradora.
  // - Unión Temporal: con No Contrato/ID, sin Tipo Contrato ni
  //   Administradora -- en su lugar, "Procedencia Factura UT".
  const showNoContratoEId = !isRestricted && form.modoFacturacion !== 'manual';
  const showTipoContrato = isRestricted || form.modoFacturacion === 'manual';
  const showAdministradora = !isRestricted && form.modoFacturacion !== 'union-temporal';
  const showProcedenciaFacturaUT = !isRestricted && form.modoFacturacion === 'union-temporal';
  // Grid de "3. Información contractual" por Modo Facturación (encargo
  // explícito) -- Contratación pasa a 3 columnas (Modo Facturación/No
  // Contrato/ID llenan la fila, Administradora baja a ocupar el ancho
  // completo); Unión Temporal a 2x2 (fila 1 Modo Facturación/Procedencia
  // Factura UT, fila 2 No Contrato/ID, ver reordenamiento del JSX más abajo).
  // isRestricted y Manual siguen en 4 columnas, sin cambios.
  const contractGridClass = !isRestricted && form.modoFacturacion === 'contratacion'
    ? 'fam-fields-3'
    : !isRestricted && form.modoFacturacion === 'union-temporal'
      ? 'fam-fields-2'
      : 'fam-fields-4';

  function handleChangeTipoFactura(value) {
    const nextOrigenOptions = ORIGEN_OPTIONS_BY_TIPO[value] ?? ORIGEN_OPTIONS;
    const nextIsRestricted = RESTRICTED_TIPOS.includes(value);
    setForm((f) => ({
      ...f,
      tipoFactura: value,
      modoFacturacion: nextIsRestricted ? 'manual' : f.modoFacturacion,
      origen: nextOrigenOptions.some((o) => o.value === f.origen) ? f.origen : nextOrigenOptions[0].value,
      tipoContrato: nextIsRestricted ? 'evento' : f.tipoContrato,
    }));
  }

  // Bajo Copago/Moderadora/Pago Compartido (encargo explícito), elegir una
  // admisión en AdmisionPickerModal carga el nombre del afiliado en
  // "Tercero / Administradora" (`idTercero`) -- es la persona a la que se le
  // factura bajo estos tipos, a diferencia de Normal donde ese campo es la
  // aseguradora/administradora. Fuera de isRestricted el picker solo carga
  // "No. Referencia", igual que antes. `admisionSeleccionada` (cualquier
  // tipo) dispara el banner "Admisión encontrada" de la sección 1.
  function handleSeleccionAdmision(admision) {
    setAdmisionSeleccionada(admision);
    setForm((f) => ({
      ...f,
      noReferencia: admision.numeroAdmision,
      idTercero: isRestricted ? admision.nombreAfiliado : f.idTercero,
    }));
  }

  // Edición manual de "No. Referencia" (a diferencia de elegirla vía el
  // picker de arriba) -- limpia la admisión confirmada, porque el texto ya
  // no representa una admisión confirmada.
  function handleChangeNoReferencia(value) {
    setAdmisionSeleccionada(null);
    setField(setForm, 'noReferencia')(value);
  }

  function handleChangeFechaFactura(value) {
    setForm((f) => ({ ...f, fechaFactura: value, fechaVencimiento: addOneMonth(value) }));
    setErrors((er) => (er.fechaVencimiento ? { ...er, fechaVencimiento: undefined } : er));
  }

  function handleChangeFechaVencimiento(value) {
    setField(setForm, 'fechaVencimiento')(value);
    setErrors((er) => (er.fechaVencimiento ? { ...er, fechaVencimiento: undefined } : er));
  }

  function handleChangeMoneyField(key) {
    return (value) => {
      setField(setForm, key)(value);
      setErrors((er) => (er[key] ? { ...er, [key]: undefined } : er));
    };
  }

  // Suma de Servicios + Copago + Pago Comp. + Moderadora - Descuento (mismo
  // criterio que el comentario original del campo readOnly) -- calculado en
  // vivo en el cliente; sigue sin persistir nada, ver handleGuardar.
  const valorFactura = isRestricted ? 0 : (
    toNumber(form.valorServicios) + toNumber(form.valorCopago)
    + toNumber(form.valorPagoCompartido) + toNumber(form.valorModeradora)
    - toNumber(form.descuento)
  );

  function validate() {
    const errs = {};
    if (form.fechaFactura && form.fechaVencimiento && form.fechaVencimiento < form.fechaFactura) {
      errs.fechaVencimiento = 'No puede ser anterior a la Fecha Factura.';
    }
    if (!isRestricted) {
      MONEY_FIELDS.forEach(({ key, label }) => {
        if (toNumber(form[key]) < 0) errs[key] = `${label} no puede ser negativo.`;
      });
    }
    return errs;
  }

  function handleGuardar() {
    if (saving) return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    setTimeout(onClose, 1100);
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) attemptClose(); }}>
      <div className="modal fam-modal" role="dialog" aria-modal="true" aria-labelledby="fam-title">
        <ModalHeader
          icon={isEditMode ? LuFilePenLine : LuFilePlus2}
          title={isEditMode ? 'Editar factura' : 'Nueva factura'}
          titleId="fam-title"
          subtitle={isEditMode ? `Factura ${factura.numero}` : undefined}
          onClose={attemptClose}
        />

        {/* Layout de 2 paneles con riel izquierdo estilizado (encargo
            explícito: bg + divider, mismo criterio visual que
            .wizard-rail/.wizard-main de NuevaCitaFlow.css) -- reemplaza el
            .modal-body genérico de shared.css (padding/scroll únicos) por
            uno propio de este modal: cada panel maneja su propio padding y
            scroll interno, igual que .wizard-rail/.wizard-content, para que
            el fondo y el divider del riel corran toda la altura del modal
            sin importar cuál panel tenga más contenido. */}
        <div className="fam-body">
          {/* Panel izquierdo: selector de tipo (encargo explícito, ver
              imagen de referencia) -- reemplaza el FormSelect de "Tipo
              Factura" que vivía en el grid de campos. */}
          <div className="fam-type-panel">
            <p className="fam-type-panel-lead">Selecciona el tipo de factura para continuar.</p>
            <TipoFacturaSelector
              value={form.tipoFactura}
              onChange={handleChangeTipoFactura}
              options={TIPO_FACTURA_OPTIONS}
            />

            <div className="fam-type-bottom">
              <div className="fam-type-info">
                <LuInfo className="icon" aria-hidden="true" />
                <p>El tipo de factura define los campos que debes completar. La información puede autocompletarse desde una admisión.</p>
              </div>

              <div className="fam-left-meta">
                {/* Bajo isEditMode, datos reales de la factura (mismo
                    criterio que .fem-readonly-row del viejo
                    FacturaEditarModalClasico) en vez del placeholder de
                    "próximo consecutivo" de Agregar. */}
                <div className="fam-left-meta-item"><span>Compañía</span><strong>{isEditMode ? factura.sedeCodigo : '02'}</strong></div>
                <div className="fam-left-meta-item"><span>Consecutivo</span><strong>{isEditMode ? factura.noAdmision : PROXIMO_CONSECUTIVO}</strong></div>
              </div>
            </div>
          </div>

          <div className="fam-form-panel">
            <div className="fam-form-scroll">
              {saving && (
                <div className="fvc-save-toast" role="status" aria-live="polite">
                  <LuCheck className="icon" aria-hidden="true" />
                  {isEditMode
                    ? 'Cambios guardados (simulado) — no persiste todavía en el servidor.'
                    : 'Factura guardada (simulado) — no persiste todavía en el servidor.'}
                </div>
              )}

              <div className="fam-panel-heading">
                <h4>Formulario de factura</h4>
                <p>
                  {form.tipoFactura === 'normal'
                    ? 'Completa la información para generar la factura.'
                    : `Completa la información para generar la factura de ${TIPO_FACTURA_LABEL[form.tipoFactura].toLowerCase()}.`}
                </p>
              </div>

              <section className="fam-section">
                <SectionHeader
                  icon={LuFileText}
                  title="1. Información de la factura"
                  subtitle="Datos básicos para identificar la factura."
                  trailing={<span className="fam-required-note">Los campos marcados con * son obligatorios</span>}
                />
                {/* 2x2 bajo isRestricted (Origen/No. Referencia/Fecha
                    Factura/Fecha Vencimiento, encargo explícito) -- 3
                    columnas en Normal, que no muestra "Origen" (ver más
                    abajo) y queda con los 3 campos restantes en una sola
                    fila. */}
                <div className={`fam-fields ${isRestricted ? 'fam-fields-2' : 'fam-fields-3'}`}>
                  {/* "Origen" no aplica a Normal (encargo explícito) -- solo
                      tiene sentido para Copago/Moderadora/Pago Compartido,
                      que son los únicos tipos con un listado propio en
                      ORIGEN_OPTIONS_BY_TIPO. */}
                  {form.tipoFactura !== 'normal' && (
                    <div className="form-field">
                      <label htmlFor="fam-origen">Origen</label>
                      <FormSelect
                        id="fam-origen"
                        value={form.origen}
                        onChange={setField(setForm, 'origen')}
                        options={origenOptions}
                      />
                    </div>
                  )}

                  <div className="form-field">
                    <label htmlFor="fam-no-referencia">No. Referencia<span className="fam-required-mark">*</span></label>
                    <div className="field-with-search">
                      <input
                        id="fam-no-referencia"
                        type="text"
                        value={form.noReferencia}
                        onChange={(e) => handleChangeNoReferencia(e.target.value)}
                        required
                        placeholder="Ej. 0000277489"
                      />
                      <button
                        type="button"
                        className="search-btn"
                        onClick={() => setAdmisionPickerAbierto(true)}
                        aria-label="Buscar admisión de referencia"
                        title="Buscar admisión de referencia"
                      >
                        <LuEye className="icon" />
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="fam-fecha-factura">Fecha Factura<span className="fam-required-mark">*</span></label>
                    <input
                      id="fam-fecha-factura"
                      type="date"
                      value={form.fechaFactura}
                      onChange={(e) => handleChangeFechaFactura(e.target.value)}
                      required
                    />
                  </div>
                  <div className={`form-field${errors.fechaVencimiento ? ' has-error' : ''}`}>
                    <label htmlFor="fam-fecha-vencimiento">Fecha Vencimiento<span className="fam-required-mark">*</span></label>
                    <input
                      id="fam-fecha-vencimiento"
                      type="date"
                      value={form.fechaVencimiento}
                      onChange={(e) => handleChangeFechaVencimiento(e.target.value)}
                      required
                      aria-invalid={!!errors.fechaVencimiento}
                    />
                    {errors.fechaVencimiento && <span className="form-field-error">{errors.fechaVencimiento}</span>}
                  </div>

                  {/* Banner "Admisión encontrada" (encargo explícito, funcional
                      para cualquier tipo) -- ver admisionSeleccionada/
                      handleSeleccionAdmision/handleChangeNoReferencia arriba. */}
                  {admisionSeleccionada && (
                    <div className="fam-admision-banner fam-col-span-full">
                      <span className="fam-admision-banner-text">
                        <LuCheck className="icon" aria-hidden="true" />
                        <span>
                          <strong>Admisión encontrada</strong>
                          <br />
                          Se cargó la información del afiliado y del contrato.
                        </span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={LuRefreshCw}
                        onClick={() => setAdmisionPickerAbierto(true)}
                      >
                        Cambiar admisión
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              <section className="fam-section">
                <SectionHeader
                  icon={LuUser}
                  // "Info tercero" solo bajo Normal (encargo explícito) --
                  // Copago/Moderadora/Pago Compartido conservan el label
                  // original, ya que ahí "Tercero / Administradora" sigue
                  // siendo el afiliado a facturar (ver handleSeleccionAdmision).
                  title={form.tipoFactura === 'normal' ? '2. Info tercero' : '2. Información del afiliado'}
                  subtitle="Datos del tercero y régimen."
                />
                {/* Siempre 2 columnas (Tercero/Régimen) -- "Administradora"
                    se movió a la sección 3 "Información contractual"
                    (encargo explícito, solo aplica bajo Normal, ver abajo). */}
                <div className="fam-fields fam-fields-2">
                  <div className="form-field">
                    <label htmlFor="fam-id-tercero">Tercero / Administradora<span className="fam-required-mark">*</span></label>
                    <div className="field-with-search">
                      <input
                        id="fam-id-tercero"
                        type="text"
                        value={form.idTercero}
                        onChange={(e) => setField(setForm, 'idTercero')(e.target.value)}
                        required
                        placeholder="Ej. Coosalud EPS-S"
                      />
                      <button
                        type="button"
                        className="search-btn"
                        onClick={() => setCatalogoTerceroAbierto(true)}
                        aria-label="Buscar tercero"
                        title="Buscar tercero"
                      >
                        <LuEye className="icon" />
                      </button>
                    </div>
                  </div>
                  <div className="form-field">
                    <label htmlFor="fam-regimen">Régimen<span className="fam-required-mark">*</span></label>
                    <div className="field-with-search">
                      <input
                        id="fam-regimen"
                        type="text"
                        value={form.regimen}
                        onChange={(e) => setField(setForm, 'regimen')(e.target.value)}
                        required
                        placeholder="Ej. Contributivo"
                      />
                      <button
                        type="button"
                        className="search-btn"
                        onClick={() => setCatalogoRegimenAbierto(true)}
                        aria-label="Buscar régimen"
                        title="Buscar régimen"
                      >
                        <LuEye className="icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="fam-section">
                <SectionHeader
                  icon={LuClipboardList}
                  title="3. Información contractual"
                  subtitle="Datos relacionados con el contrato y la facturación."
                  trailing={(
                    <button
                      type="button"
                      className="fam-section-toggle"
                      onClick={() => setContractSectionCollapsed((c) => !c)}
                      aria-expanded={!contractSectionCollapsed}
                    >
                      {contractSectionCollapsed ? 'Expandir sección' : 'Contraer sección'}
                      {contractSectionCollapsed
                        ? <LuChevronDown className="icon" aria-hidden="true" />
                        : <LuChevronUp className="icon" aria-hidden="true" />}
                    </button>
                  )}
                />
                {!contractSectionCollapsed && (
                  <div className={`fam-fields ${contractGridClass}`}>
                    <div className={`form-field${isRestricted ? ' fam-col-span-2' : ''}`}>
                      <label htmlFor="fam-modo-facturacion">Modo Facturación</label>
                      <FormSelect
                        id="fam-modo-facturacion"
                        value={form.modoFacturacion}
                        onChange={setField(setForm, 'modoFacturacion')}
                        options={MODO_FACTURACION_OPTIONS}
                      />
                    </div>

                    {/* Solo bajo Modo Facturación "Unión Temporal" (encargo
                        explícito, ver imagen de referencia) -- va justo
                        después de Modo Facturación para que ambos compongan
                        la fila 1 del grid 2x2 (No Contrato/ID quedan como
                        fila 2, ver showNoContratoEId debajo). Toma el lugar
                        de Tipo Contrato/Administradora, ambos ocultos bajo
                        ese modo. */}
                    {showProcedenciaFacturaUT && (
                      <div className="form-field">
                        <label htmlFor="fam-procedencia-factura-ut">Procedencia Factura UT</label>
                        <FormSelect
                          id="fam-procedencia-factura-ut"
                          value={form.procedenciaFacturaUT}
                          onChange={setField(setForm, 'procedenciaFacturaUT')}
                          options={PROCEDENCIA_FACTURA_UT_OPTIONS}
                          placeholder="Selecciona una opción"
                        />
                      </div>
                    )}
                    {showNoContratoEId && (
                      <div className="form-field">
                        <label htmlFor="fam-no-contrato">No Contrato</label>
                        <div className="field-with-search">
                          <input
                            id="fam-no-contrato"
                            type="text"
                            value={form.noContrato}
                            onChange={(e) => setField(setForm, 'noContrato')(e.target.value)}
                          />
                          <button
                            type="button"
                            className="search-btn"
                            onClick={() => setCatalogoContratacionAbierto(true)}
                            aria-label="Buscar contrato"
                            title="Buscar contrato"
                          >
                            <LuEye className="icon" />
                          </button>
                        </div>
                      </div>
                    )}
                    {showNoContratoEId && (
                      <div className="form-field">
                        <label htmlFor="fam-id-contrato">ID<span className="fam-required-mark">*</span></label>
                        <input
                          id="fam-id-contrato"
                          type="number"
                          value={form.idContrato}
                          onChange={(e) => setField(setForm, 'idContrato')(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    {/* Oculto bajo Modo Facturación "Contratación"/"Unión
                        Temporal" (encargo explícito) -- el contrato ya trae
                        su propio tipo bajo esos modos. */}
                    {showTipoContrato && (
                      <div className={`form-field${isRestricted ? ' fam-col-span-2' : ''}`}>
                        <label htmlFor="fam-tipo-contrato">Tipo Contrato</label>
                        <FormSelect
                          id="fam-tipo-contrato"
                          value={form.tipoContrato}
                          onChange={setField(setForm, 'tipoContrato')}
                          options={TIPO_CONTRATO_OPTIONS}
                          placeholder="Selecciona una opción"
                        />
                      </div>
                    )}

                    {/* Movida acá desde "2. Información del afiliado"
                        (encargo explícito, solo bajo Normal) -- oculta bajo
                        Modo Facturación "Unión Temporal" (reemplazada ahí por
                        "Procedencia Factura UT" arriba). Bajo Contratación
                        (grid de 3 columnas) ocupa el ancho completo del
                        bloque en vez de compartir fila (encargo explícito);
                        bajo Manual (grid de 4 columnas) sigue a media fila
                        junto a Modo Facturación/Tipo Contrato. */}
                    {showAdministradora && (
                      <div className={`form-field${form.modoFacturacion === 'contratacion' ? ' fam-col-span-full' : ' fam-col-span-2'}`}>
                        <label htmlFor="fam-administradora">Administradora<span className="fam-required-mark">*</span></label>
                        <div className="field-with-search">
                          <input
                            id="fam-administradora"
                            type="text"
                            value={form.administradora}
                            onChange={(e) => setField(setForm, 'administradora')(e.target.value)}
                            required
                            placeholder="Ej. Clintos"
                          />
                          <button
                            type="button"
                            className="search-btn"
                            onClick={() => setCatalogoAdministradoraAbierto(true)}
                            aria-label="Buscar administradora"
                            title="Buscar administradora"
                          >
                            <LuEye className="icon" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="fam-section">
                <SectionHeader
                  icon={LuCalculator}
                  title="4. Detalle del cobro"
                  subtitle={
                    form.tipoFactura === 'normal'
                      ? 'Ingresa los valores correspondientes a la factura.'
                      : `Ingresa los valores correspondientes al ${TIPO_FACTURA_LABEL[form.tipoFactura].toLowerCase()}.`
                  }
                  trailing={!isRestricted && (
                    <span className="fam-cobro-note">
                      <LuInfo className="icon" aria-hidden="true" />
                      El valor total se calcula automáticamente.
                    </span>
                  )}
                />
                <div className="fam-fields fam-fields-2">
                  {!isRestricted && (
                    <div className={`form-field${errors.valorServicios ? ' has-error' : ''}`}>
                      <label htmlFor="fam-valor-servicios">Valor Servicios<span className="fam-required-mark">*</span></label>
                      <CurrencyInput
                        id="fam-valor-servicios"
                        value={form.valorServicios}
                        onChange={handleChangeMoneyField('valorServicios')}
                        required
                        aria-invalid={!!errors.valorServicios}
                      />
                      {errors.valorServicios && <span className="form-field-error">{errors.valorServicios}</span>}
                    </div>
                  )}
                  {!isRestricted && (
                    <div className={`form-field${errors.valorCopago ? ' has-error' : ''}`}>
                      <label htmlFor="fam-valor-copago">Valor Copago<span className="fam-required-mark">*</span></label>
                      <CurrencyInput
                        id="fam-valor-copago"
                        value={form.valorCopago}
                        onChange={handleChangeMoneyField('valorCopago')}
                        required
                        aria-invalid={!!errors.valorCopago}
                      />
                      {errors.valorCopago && <span className="form-field-error">{errors.valorCopago}</span>}
                    </div>
                  )}

                  {!isRestricted && (
                    <div className={`form-field${errors.valorPagoCompartido ? ' has-error' : ''}`}>
                      <label htmlFor="fam-pago-compartido">Valor Pago Comp.<span className="fam-required-mark">*</span></label>
                      <CurrencyInput
                        id="fam-pago-compartido"
                        value={form.valorPagoCompartido}
                        onChange={handleChangeMoneyField('valorPagoCompartido')}
                        required
                        aria-invalid={!!errors.valorPagoCompartido}
                      />
                      {errors.valorPagoCompartido && <span className="form-field-error">{errors.valorPagoCompartido}</span>}
                    </div>
                  )}
                  {!isRestricted && (
                    <div className={`form-field${errors.valorModeradora ? ' has-error' : ''}`}>
                      <label htmlFor="fam-valor-moderadora">Valor Moderadora<span className="fam-required-mark">*</span></label>
                      <CurrencyInput
                        id="fam-valor-moderadora"
                        value={form.valorModeradora}
                        onChange={handleChangeMoneyField('valorModeradora')}
                        required
                        aria-invalid={!!errors.valorModeradora}
                      />
                      {errors.valorModeradora && <span className="form-field-error">{errors.valorModeradora}</span>}
                    </div>
                  )}

                  {!isRestricted && (
                    <div className={`form-field${errors.descuento ? ' has-error' : ''}`}>
                      <label htmlFor="fam-descuento">Descuento<span className="fam-required-mark">*</span></label>
                      <CurrencyInput
                        id="fam-descuento"
                        value={form.descuento}
                        onChange={handleChangeMoneyField('descuento')}
                        required
                        aria-invalid={!!errors.descuento}
                      />
                      {errors.descuento && <span className="form-field-error">{errors.descuento}</span>}
                    </div>
                  )}
                  {/* Moneda va después de Descuento (encargo explícito: bloque
                      de 3x2 -- Servicios/Copago, Pago Comp./Moderadora,
                      Descuento/Moneda), ya no fam-col-span-full. */}
                  {!isRestricted && (
                    <div className="form-field">
                      <label htmlFor="fam-moneda">Moneda<span className="fam-required-mark">*</span></label>
                      <FormSelect
                        id="fam-moneda"
                        value={form.moneda}
                        onChange={setField(setForm, 'moneda')}
                        options={MONEDA_OPTIONS}
                        required
                      />
                    </div>
                  )}

                  {!isRestricted && (
                    // Suma de Servicios + Copago + Pago Comp. + Moderadora -
                    // Descuento, calculada en vivo (ver valorFactura más
                    // arriba) -- antes un <input readOnly>, ahora el box
                    // resaltado "Total factura" (encargo explícito, ver
                    // imagen de referencia). Mismo separador de miles "."/
                    // decimales "," que los CurrencyInput de arriba (encargo
                    // explícito: "aplicale el mismo tratamiento") -- sin
                    // símbolo $, eso sigue sin pedirse. No es un
                    // CurrencyInput (no es un input, es un <span> de solo
                    // lectura) -- toLocaleString('es-CO') directo, forzando
                    // 2 decimales (mismo criterio que formatCOP en
                    // mockFacturasData.js).
                    <div className="fam-col-span-full">
                      <div className="fam-total-box">
                        <span className="fam-total-icon"><LuCalculator className="icon" aria-hidden="true" /></span>
                        <span className="fam-total-copy">
                          <span className="fam-total-label">Total factura</span>
                          <span className="fam-total-value">
                            {valorFactura.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="form-field fam-col-span-full">
                    <label htmlFor="fam-concepto">Concepto<span className="fam-required-mark">*</span></label>
                    <textarea
                      id="fam-concepto"
                      value={form.concepto}
                      onChange={(e) => setField(setForm, 'concepto')(e.target.value)}
                      required
                      placeholder="Descripción del concepto de facturación"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={attemptClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" onClick={handleGuardar} disabled={saving}>Guardar</Button>
        </div>
      </div>

      {catalogoTerceroAbierto && (
        <CatalogoAseguradorasModal
          selectField="razonSocial"
          onSelect={setField(setForm, 'idTercero')}
          onClose={() => setCatalogoTerceroAbierto(false)}
        />
      )}

      {catalogoRegimenAbierto && (
        <CatalogoTipoTerceroModal
          onSelect={setField(setForm, 'regimen')}
          onClose={() => setCatalogoRegimenAbierto(false)}
        />
      )}

      {catalogoContratacionAbierto && (
        <CatalogoContratacionModal
          idTercero={form.idTercero}
          tipoTercero={form.regimen}
          fecha={form.fechaFactura}
          onSelect={({ noContrato, idContrato, tipoContrato }) => setForm((f) => ({
            ...f, noContrato, idContrato, tipoContrato,
          }))}
          onClose={() => setCatalogoContratacionAbierto(false)}
        />
      )}

      {catalogoAdministradoraAbierto && (
        <CatalogoAseguradorasModal
          selectField="razonSocial"
          onSelect={setField(setForm, 'administradora')}
          onClose={() => setCatalogoAdministradoraAbierto(false)}
        />
      )}

      {admisionPickerAbierto && (
        <AdmisionPickerModal
          onSelect={handleSeleccionAdmision}
          onClose={() => setAdmisionPickerAbierto(false)}
        />
      )}

      {confirmingClose && (
        <div className="modal-overlay" role="presentation">
          <div className="fvc-discard-modal" role="alertdialog" aria-modal="true" aria-labelledby="fam-discard-title" aria-describedby="fam-discard-desc">
            <div className="fvc-discard-icon"><LuTriangleAlert className="icon" aria-hidden="true" /></div>
            <h3 id="fam-discard-title">¿Descartar los cambios?</h3>
            <p id="fam-discard-desc">Vas a perder la información que ingresaste en este formulario. Esta acción no se puede deshacer.</p>
            <div className="fvc-discard-actions">
              <Button variant="secondary" onClick={() => setConfirmingClose(false)}>Seguir editando</Button>
              <Button variant="danger-outline" icon={LuTrash2} onClick={onClose}>Sí, descartar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
