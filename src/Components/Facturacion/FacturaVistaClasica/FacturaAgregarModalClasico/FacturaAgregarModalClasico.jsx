'use client';

import { useEffect, useState } from 'react';
import './FacturaAgregarModalClasico.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CatalogoAseguradorasModal from '@/Components/CatalogoAseguradorasModal/CatalogoAseguradorasModal';
import CatalogoTipoTerceroModal from '../CatalogoTipoTerceroModal/CatalogoTipoTerceroModal';
import CatalogoContratacionModal from '../CatalogoContratacionModal/CatalogoContratacionModal';
import AdmisionPickerModal from '../AdmisionPickerModal/AdmisionPickerModal';
import {
  LuFilePlus2, LuEye, LuCheck, LuTrash2, LuTriangleAlert,
} from 'react-icons/lu';

const TIPO_FACTURA_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'copago', label: 'Copago' },
  { value: 'moderadora', label: 'Moderadora' },
  { value: 'pago-compartido', label: 'Pago Compartido' },
];

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

// Por defecto Pesos -- ver buildInitialForm más abajo.
const MONEDA_OPTIONS = [
  { value: 'pesos', label: 'Pesos' },
  { value: 'dolar', label: 'Dólar' },
];

// Mismo valor que muestra el .fam-readonly-row de arriba (placeholder hasta
// que haya lógica real de numeración) -- No. de Factura arranca precargado
// con el consecutivo, como en la imagen de referencia.
const PROXIMO_CONSECUTIVO = '0200289592';

// Fecha Vencimiento es siempre un mes después de Fecha Factura (encargo
// explícito) -- se recalcula automáticamente cada vez que Fecha Factura
// cambia, ver handleChangeFechaFactura más abajo.
function addOneMonth(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function buildInitialForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    tipoFactura: 'normal',
    origen: 'admisiones',
    noReferencia: '',
    noFactura: PROXIMO_CONSECUTIVO,
    fechaFactura: today,
    fechaVencimiento: addOneMonth(today),
    idTercero: '',
    regimen: '',
    modoFacturacion: 'contratacion',
    tipoContrato: '',
    noContrato: '',
    idContrato: '0',
    administradora: '',
    valorServicios: '0.00',
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

// Modal disparado por el botón "Nueva factura" del header de Facturacion.jsx
// -- réplica de los campos del formulario legacy "Agregando un Registro"
// (encargo explícito, ver imagen de referencia), hermano de
// FacturaEditarModalClasico ("Cambiando un Registro"): mismo chrome
// homologado del proyecto (ModalHeader/FormSelect, ver AGENTS.md "Modales"/
// "Selects de formulario") en vez de la barra de título azul/fondo celeste
// del original, mismo criterio de agrupar campos en un grid de 2 columnas
// por afinidad de dominio en vez de replicar la posición exacta de la imagen
// (esa ya no aplicaba 1:1 con el chrome homologado).
//
// Solo pinta el front (encargo explícito: "creá la modal... y luego le
// damos lógica"): "Guardar" sigue sin persistir nada en un backend real --
// pero ahora valida (Fecha Vencimiento >= Fecha Factura, montos no
// negativos), calcula Valor Factura en vivo, y muestra un aviso "Guardado
// (simulado)" antes de cerrar en vez de un cierre silencioso indistinguible
// de un guardado real (ver validate/handleGuardar más abajo). Cerrar con
// cambios sin guardar (Cancelar/overlay/Escape/botón X) pide confirmación
// primero (ver attemptClose/fvc-discard-modal, clases compartidas con
// FacturaEditarModalClasico en shared.css). Id Tercero y Administradora reusan
// el mismo CatalogoAseguradorasModal (ya existe, mismo componente que usa
// FacturaEditarModalClasico -- encargo explícito: "administradora... me
// debería abrir el mismo modal de id terceros", cada uno con su propio
// estado de apertura para no compartir instancia), Régimen reusa
// ../CatalogoTipoTerceroModal/CatalogoTipoTerceroModal, No Contrato reusa
// ../CatalogoContratacionModal/CatalogoContratacionModal y No. Referencia
// reusa ../AdmisionPickerModal/AdmisionPickerModal (los 3 nuevos, ver esos
// archivos) -- este último trae el dataset mock de /admisiones adentro del
// modal en vez de navegar a esa ruta, para no perder el formulario en curso.
//
// "Origen" (par de Tipo Factura, encargo explícito) no tiene equivalente en
// el mock de facturas todavía -- placeholder hasta que haya lógica real
// (mismo criterio que Compañía/Consecutivo). Ver isRestricted más abajo
// para la lógica de Copago/Moderadora/Pago Compartido.
//
// No recibe `factura` -- a diferencia de Editar, es un registro nuevo desde
// cero. Compañía/Consecutivo quedan como texto fijo (placeholder hasta que
// haya lógica real de numeración), mismo criterio que
// FacturaEditarModalClasico.fem-readonly-row.
export default function FacturaAgregarModalClasico({ onClose }) {
  const [form, setForm] = useState(buildInitialForm);
  const [catalogoTerceroAbierto, setCatalogoTerceroAbierto] = useState(false);
  const [catalogoRegimenAbierto, setCatalogoRegimenAbierto] = useState(false);
  const [catalogoContratacionAbierto, setCatalogoContratacionAbierto] = useState(false);
  const [catalogoAdministradoraAbierto, setCatalogoAdministradoraAbierto] = useState(false);
  const [admisionPickerAbierto, setAdmisionPickerAbierto] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

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
  // ocultarlos"): No Contrato/Descuento/ID/Administradora/Valor Copago/
  // Valor Pago Comp./Valor Moderadora/Valor Factura/Moneda se OCULTAN por
  // completo (no solo se deshabilitan) cuando isRestricted -- los 4
  // "Valor X" quedan ocultos siempre bajo isRestricted, incluso el que
  // coincide con el tipo elegido (encargo explícito, ningún caso especial
  // por tipo). Tipo Contrato es la excepción: a diferencia de sus vecinos
  // de fila (No Contrato/ID), queda siempre visible/habilitado -- también
  // bajo isRestricted (encargo explícito, mismas opciones Evento/Capita/
  // PGP) -- y se precarga en "Evento" cada vez que se elige uno de estos 3
  // tipos (encargo explícito, ver handleChangeTipoFactura; queda
  // seleccionable igual, el usuario puede cambiarlo a mano después). Los
  // campos que quedan sin su vecino de fila bajo isRestricted
  // (Modo Facturación, Tipo Contrato) pasan a `fam-span-2` para no dejar
  // hueco en el grid. Fecha Factura/Fecha Vencimiento/No. Referencia/Id
  // Tercero/Régimen/Concepto nunca se restringen ni se ocultan. "Normal"
  // no oculta ni deshabilita nada.
  const isRestricted = RESTRICTED_TIPOS.includes(form.tipoFactura);
  // Listado de Origen habilitado para el Tipo Factura activo (encargo
  // explícito: Copago->Admisiones/Consulta Externa, Moderadora->Admisiones/
  // Citas/Ambulatorio, Pago Compartido->Admisiones/Citas/Consulta Externa).
  const origenOptions = ORIGEN_OPTIONS_BY_TIPO[form.tipoFactura] ?? ORIGEN_OPTIONS;

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
  // admisión en AdmisionPickerModal también autocompleta "Id Tercero" con
  // documento + nombre del afiliado de esa admisión (en vez de dejarlo para
  // buscar aparte en CatalogoAseguradorasModal) -- fuera de isRestricted el
  // picker solo carga "No. Referencia", igual que antes.
  function handleSeleccionAdmision(admision) {
    setForm((f) => ({
      ...f,
      noReferencia: admision.numeroAdmision,
      idTercero: isRestricted ? `${admision.documento} - ${admision.nombreAfiliado}` : f.idTercero,
    }));
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
          icon={LuFilePlus2}
          title="Agregando un registro"
          titleId="fam-title"
          onClose={attemptClose}
        />

        <div className="modal-body">
          {saving && (
            <div className="fvc-save-toast" role="status" aria-live="polite">
              <LuCheck className="icon" aria-hidden="true" />
              Factura guardada (simulado) — no persiste todavía en el servidor.
            </div>
          )}

          <div className="fam-readonly-row">
            <span className="fam-readonly-item"><span className="fam-readonly-label">Compañía:</span> 02</span>
            <span className="fam-readonly-item"><span className="fam-readonly-label">Consecutivo:</span> {PROXIMO_CONSECUTIVO}</span>
            <span className="fam-readonly-item"><span className="fam-readonly-label">No. de Factura:</span> {form.noFactura}</span>
          </div>

          <div className="fam-grid">
            <div className="form-field">
              <label htmlFor="fam-tipo-factura">Tipo Factura</label>
              <FormSelect
                id="fam-tipo-factura"
                value={form.tipoFactura}
                onChange={handleChangeTipoFactura}
                options={TIPO_FACTURA_OPTIONS}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fam-origen">Origen</label>
              <FormSelect
                id="fam-origen"
                value={form.origen}
                onChange={setField(setForm, 'origen')}
                options={origenOptions}
              />
            </div>

            <div className="form-field fam-span-2">
              <label htmlFor="fam-no-referencia">No. Referencia<span className="fam-required-mark">*</span></label>
              <div className="field-with-search">
                <input
                  id="fam-no-referencia"
                  type="text"
                  value={form.noReferencia}
                  onChange={(e) => setField(setForm, 'noReferencia')(e.target.value)}
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

            <div className="form-field">
              <label htmlFor="fam-id-tercero">Id Tercero<span className="fam-required-mark">*</span></label>
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

            <div className={`form-field${isRestricted ? ' fam-span-2' : ''}`}>
              <label htmlFor="fam-modo-facturacion">Modo Facturación</label>
              <FormSelect
                id="fam-modo-facturacion"
                value={form.modoFacturacion}
                onChange={setField(setForm, 'modoFacturacion')}
                options={MODO_FACTURACION_OPTIONS}
              />
            </div>
            {!isRestricted && (
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

            {!isRestricted && (
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
            <div className={`form-field${isRestricted ? ' fam-span-2' : ''}`}>
              <label htmlFor="fam-tipo-contrato">Tipo Contrato</label>
              <FormSelect
                id="fam-tipo-contrato"
                value={form.tipoContrato}
                onChange={setField(setForm, 'tipoContrato')}
                options={TIPO_CONTRATO_OPTIONS}
                placeholder="Selecciona una opción"
              />
            </div>

            {!isRestricted && (
              <div className="form-field fam-span-2">
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

            {!isRestricted && (
              <div className={`form-field${errors.valorServicios ? ' has-error' : ''}`}>
                <label htmlFor="fam-valor-servicios">Valor Servicios<span className="fam-required-mark">*</span></label>
                <input
                  id="fam-valor-servicios"
                  type="number"
                  step="0.01"
                  value={form.valorServicios}
                  onChange={(e) => handleChangeMoneyField('valorServicios')(e.target.value)}
                  required
                  aria-invalid={!!errors.valorServicios}
                />
                {errors.valorServicios && <span className="form-field-error">{errors.valorServicios}</span>}
              </div>
            )}
            {!isRestricted && (
              <div className={`form-field${errors.valorCopago ? ' has-error' : ''}`}>
                <label htmlFor="fam-valor-copago">Valor Copago<span className="fam-required-mark">*</span></label>
                <input
                  id="fam-valor-copago"
                  type="number"
                  step="0.01"
                  value={form.valorCopago}
                  onChange={(e) => handleChangeMoneyField('valorCopago')(e.target.value)}
                  required
                  aria-invalid={!!errors.valorCopago}
                />
                {errors.valorCopago && <span className="form-field-error">{errors.valorCopago}</span>}
              </div>
            )}

            {!isRestricted && (
              <div className={`form-field${errors.valorPagoCompartido ? ' has-error' : ''}`}>
                <label htmlFor="fam-pago-compartido">Valor Pago Comp.<span className="fam-required-mark">*</span></label>
                <input
                  id="fam-pago-compartido"
                  type="number"
                  step="0.01"
                  value={form.valorPagoCompartido}
                  onChange={(e) => handleChangeMoneyField('valorPagoCompartido')(e.target.value)}
                  required
                  aria-invalid={!!errors.valorPagoCompartido}
                />
                {errors.valorPagoCompartido && <span className="form-field-error">{errors.valorPagoCompartido}</span>}
              </div>
            )}
            {!isRestricted && (
              <div className={`form-field${errors.valorModeradora ? ' has-error' : ''}`}>
                <label htmlFor="fam-valor-moderadora">Valor Moderadora<span className="fam-required-mark">*</span></label>
                <input
                  id="fam-valor-moderadora"
                  type="number"
                  step="0.01"
                  value={form.valorModeradora}
                  onChange={(e) => handleChangeMoneyField('valorModeradora')(e.target.value)}
                  required
                  aria-invalid={!!errors.valorModeradora}
                />
                {errors.valorModeradora && <span className="form-field-error">{errors.valorModeradora}</span>}
              </div>
            )}

            {!isRestricted && (
              <div className={`form-field${errors.descuento ? ' has-error' : ''}`}>
                <label htmlFor="fam-descuento">Descuento<span className="fam-required-mark">*</span></label>
                <input
                  id="fam-descuento"
                  type="number"
                  step="0.01"
                  value={form.descuento}
                  onChange={(e) => handleChangeMoneyField('descuento')(e.target.value)}
                  required
                  aria-invalid={!!errors.descuento}
                />
                {errors.descuento && <span className="form-field-error">{errors.descuento}</span>}
              </div>
            )}
            {!isRestricted && (
              <div className="form-field">
                {/* Suma de Servicios + Copago + Pago Comp. + Moderadora - Descuento,
                    calculada en vivo (ver valorFactura más arriba) -- sigue sin
                    persistir, solo deja de ser el placeholder "0.00" fijo. */}
                <label htmlFor="fam-valor-factura">Valor Factura</label>
                <input id="fam-valor-factura" type="number" step="0.01" value={valorFactura.toFixed(2)} readOnly />
              </div>
            )}

            {!isRestricted && (
              <div className="form-field fam-span-2">
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

            <div className="form-field fam-span-2">
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
