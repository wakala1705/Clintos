'use client';

import { useEffect, useState } from 'react';
import './CitaPickerModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import FormSelect from '@/Components/FormSelect/FormSelect';
import DateRangeFilter from '../DateRangeFilter/DateRangeFilter';
import { CITAS, ESTADO_LABEL, ESTADO_TONE } from '@/hooks/Facturacion/mockCitasData';

import SearchField from '@/Components/SearchField/SearchField';

const ESTADO_FILTER_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Sin facturar' },
  { value: 'facturada', label: 'Facturada' },
];

// Quita tildes -- mismo helper que CatalogoPrefijoModal.jsx/
// AdmisionPickerModal.jsx (no compartido entre features, ver AGENTS.md
// "Component organization").
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

function formatCOP(value) {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MESES_ABBR = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// "Fecha cita" en una sola línea (encargo explícito) -- `c.fecha` viene en
// "DD.MM.YYYY" (mock, ver mockCitasData.js), se muestra "DD.MES.YYYY -
// HH:mm" en formato de 24h ("hora militar", encargo explícito: no hay
// AM/PM que convertir, `c.hora` ya viene en 24h).
function formatFechaCita(fecha, hora) {
  const [dia, mes, anio] = fecha.split('.');
  return `${dia}.${MESES_ABBR[Number(mes) - 1]}.${anio} - ${hora}`;
}

// `c.fecha` viene "DD.MM.YYYY" (mock, ver mockCitasData.js) -- se convierte a
// ISO solo para comparar contra `rango.desde`/`rango.hasta` (mismos valores
// "YYYY-MM-DD" que entrega el `<input type="date">` de DateRangeFilter, ver
// FacturaVistaClasica.jsx para el mismo patrón de comparación por string).
function fechaCitaToISO(fecha) {
  const [dia, mes, anio] = fecha.split('.');
  return `${anio}-${mes}-${dia}`;
}

// Reemplaza al picker legacy "Registros de CIT" para el campo
// "No. Referencia" bajo Tipo Factura "Moderadora" (encargo explícito) --
// montado en FacturaAgregarModalClasico vía abrirPickerReferencia/
// handleSeleccionAdmision (generalizado para aceptar tanto una admisión
// como una cita, ver ese archivo). Mismo patrón que AdmisionPickerModal
// (picker "extragrande" con buscador + tabla, sin paginación).
//
// Mejoras aplicadas sobre la referencia legacy (bitácora de la revisión
// PD, ver AGENTS.md-style de esta feature):
// 1. "Estado" reemplaza la columna "Llegada" que mezclaba Si/No con
//    "Facturada" en el mismo valor -- ahora "Estado" es solo el estado de
//    facturación (Sin facturar/Facturada, encargo explícito: "cambiemos
//    los estados de 'llego - no llego' por sin facturar, que me indica el
//    estado de facturación"), mismo shape/tono/label que ESTADO_FACTURACION
//    de FacturasGridClasica (misma feature, ver ESTADO_LABEL/ESTADO_TONE de
//    mockCitasData.js). El estado de llegada lo indica "Hora llegada" (ver
//    punto 9): con hora = llegó, "—" = no llegó -- ya no es parte de
//    "Estado".
// 2. Un solo buscador combinado (consecutivo/documento/nombre) en vez de 2
//    pestañas -- mismo patrón que AdmisionPickerModal.
// 3. Filtro "Estado" (`ESTADO_FILTER_OPTIONS`: Todos/Sin facturar/
//    Facturada) para acotar a pendientes de facturar sin tener que leerlas
//    una por una.
// 4. Columna "Tipo solicitud" oculta (encargo explícito) -- se reemplazó
//    por el desglose "Vlr moderadora"/"Vlr compartido"/"Vlr copago"/
//    "Vlr excedente" (reintroducido, ver mockCitasData.js), junto a
//    "Valor total"; los 4 son montos reales, alineados a la derecha con
//    `.cip-money` igual que "Valor total".
// 5. Botón "Seleccionar" en vez de "Elegir" (mismo criterio ya aplicado en
//    AdmisionPickerModal).
// 6. Sin fila seleccionada por defecto ni datos de prueba colados (la
//    referencia abría con un registro dummy "PRUEBAS PRUEBAS..." ya
//    seleccionado).
// 7. "Afiliado" agrupa Nombre + Documento, "Servicio" agrupa Descripción +
//    Id. Servicio (encargo explícito) -- 2 líneas jerarquizadas por celda
//    en vez de 4 columnas sueltas, ver `.cip-stack`/`-primary`/`-secondary`
//    en el CSS. Nombre/Descripción en mayúscula (encargo explícito),
//    Documento/Id. Servicio no.
// 8. Modal a 90% de ancho/alto de pantalla (encargo explícito) -- mismo
//    criterio que `.fvcd-modal` de FacturaDetalleModalClasico (`height`
//    fijo + `.modal-body{flex:1}` para que la tabla, no un hueco vacío,
//    absorba el alto sobrante).
// 9. "Fecha cita" agrupa Fecha + Hora en una sola línea (encargo
//    explícito: "acortalos para que queden en una sola línea", a
//    diferencia de "Afiliado"/"Servicio" del punto 7, que sí son 2 líneas)
//    -- formato "DD.MES.YYYY - HH:mm" en 24h (encargo explícito, ver
//    formatFechaCita), ej. "01.SEP.2026 - 09:31". "Hora llegada" (columna
//    nueva, ver punto 1) va justo después -- con `horaLlegada`, la hora en
//    sí va dentro de un Badge verde (encargo explícito: "que el badge sea
//    la hora", sin un label "Llegada" aparte); `null` (nunca se presentó)
//    se muestra como "—", sin badge (ver mockCitasData.js). Labels de
//    encabezado acortados para no wrappear a 2 líneas en la fila
//    `cip-row-head`.
export default function CitaPickerModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  // Default "Sin facturar" (encargo explícito) -- este picker existe para
  // encontrar citas pendientes de facturar, no para revisar el historial
  // completo; "Todos" sigue disponible a mano.
  const [estado, setEstado] = useState('pendiente');
  const [rango, setRango] = useState({ desde: '', hasta: '' });
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = normalizar(query.trim());
  const filtered = CITAS.filter((c) => {
    const fechaISO = fechaCitaToISO(c.fecha);
    return (estado === 'todos' || c.estado === estado)
      && (!rango.desde || fechaISO >= rango.desde)
      && (!rango.hasta || fechaISO <= rango.hasta)
      && (!q
        || normalizar(c.consecutivo).includes(q)
        || normalizar(c.documento).includes(q)
        || normalizar(c.nombreAfiliado).includes(q));
  });

  // Recibe el registro por parámetro (no lee `seleccion` del state) para que
  // el doble clic de una fila pueda confirmar en el mismo evento sin esperar
  // el próximo render -- mismo patrón que SedePickerModal.jsx ("clic
  // selecciona, doble clic confirma").
  function handleSeleccionar(item = seleccion) {
    if (!item) return;
    onSelect(item);
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal cip-modal" role="dialog" aria-modal="true" aria-labelledby="cip-title">
        <ModalHeader
          title="Seleccionar cita"
          titleId="cip-title"
          onClose={onClose}
          closeLabel="Cerrar selección de cita"
        />

        <div className="modal-body">
          <div className="cip-toolbar">
            <SearchField className="cip-search" value={query} onChange={(v) => setQuery(v)} placeholder="Buscar por consecutivo, documento o nombre del afiliado" ariaLabel="Buscar cita" />
            <div className="cip-estado-filter">
              <FormSelect
                id="cip-estado"
                value={estado}
                onChange={setEstado}
                options={ESTADO_FILTER_OPTIONS}
                ariaLabel="Filtrar por estado"
              />
            </div>
            <DateRangeFilter
              desde={rango.desde}
              hasta={rango.hasta}
              onChange={setRango}
            />
          </div>

          <div className="cip-table">
            <div className="cip-row cip-row-head">
              <span>Consecutivo</span>
              <span>Fecha cita</span>
              <span>Hora llegada</span>
              <span>Estado</span>
              <span>Afiliado</span>
              <span>Servicio</span>
              <span className="cip-money">Valor total</span>
              <span className="cip-money">Vlr moderadora</span>
              <span className="cip-money">Vlr compartido</span>
              <span className="cip-money">Vlr copago</span>
              <span className="cip-money">Vlr excedente</span>
            </div>
            <div className="cip-list" role="listbox" aria-labelledby="cip-title">
              {filtered.length === 0 && (
                <div className="cip-empty">Sin resultados para los filtros aplicados.</div>
              )}
              {filtered.map((c) => {
                const active = seleccion?.id === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    role="option"
                    aria-selected={active}
                    className={`cip-row cip-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(c)}
                    onDoubleClick={() => handleSeleccionar(c)}
                  >
                    <span className="cip-num">{c.consecutivo}</span>
                    <span className="cip-num">{formatFechaCita(c.fecha, c.hora)}</span>
                    <span>
                      {c.horaLlegada ? <Badge tone="success">{c.horaLlegada}</Badge> : '—'}
                    </span>
                    <span><Badge tone={ESTADO_TONE[c.estado]}>{ESTADO_LABEL[c.estado]}</Badge></span>
                    <span className="cip-stack">
                      <span className="cip-stack-primary">{c.nombreAfiliado}</span>
                      <span className="cip-stack-secondary">{c.documento}</span>
                    </span>
                    <span className="cip-stack">
                      <span className="cip-stack-primary">{c.descripcion}</span>
                      <span className="cip-stack-secondary">{c.idServicio}</span>
                    </span>
                    <span className="cip-money">{formatCOP(c.valorTotal)}</span>
                    <span className="cip-money">{formatCOP(c.valorModeradora)}</span>
                    <span className="cip-money">{formatCOP(c.valorCompartido)}</span>
                    <span className="cip-money">{formatCOP(c.valorCopago)}</span>
                    <span className="cip-money">{formatCOP(c.valorExcedente)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSeleccionar} disabled={!seleccion}>Seleccionar</Button>
        </div>
      </div>
    </div>
  );
}
