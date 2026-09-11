'use client';

import { useMemo, useState, useEffect } from 'react';
import './AlistarPedidoModal.css';
import {
  LuClipboardCheck, LuPackage, LuPencil, LuRefreshCw, LuThumbsUp, LuTrash2,
} from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import ArticulosItemsTable from './ArticulosItemsTable/ArticulosItemsTable';
import LotesDisponiblesTable from './LotesDisponiblesTable/LotesDisponiblesTable';
import { formatFecha, formatMoneda } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

const ESTADO_ENTREGA_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'entregado', label: 'Entregado' },
];

// Mismo mapa tono/label que MovimientosGrid.jsx (estado del movimiento
// completo, no del ítem) -- se muestra junto al título en mig-alistar-identity,
// réplica del "Estado: 0-Sin Confirmado" de la referencia.
const ESTADO_BADGE = {
  confirmado: { tone: 'success', label: 'Confirmado' },
  'sin-confirmar': { tone: 'warn', label: 'Sin Confirmar' },
  anulado: { tone: 'danger', label: 'Anulado' },
};

function estadoEntregaDe(a) {
  return a.cantidadEntregada > 0 ? 'entregado' : 'pendiente';
}

// Mismo helper Field que FacturaDetalleModalClasico.jsx/MovimientoDetalleModal.jsx
// (duplicado a propósito -- ver AGENTS.md/comentario de .mig-field en
// Solicitudes/shared/shared.css): label chico + valor, sin componente propio
// en @/Components porque es de un solo uso por modal.
function Field({ label, value }) {
  return (
    <div className="mig-field">
      <span className="mig-field-label">{label}</span>
      <span className="mig-field-value">{value}</span>
    </div>
  );
}

// Réplica de "Catálogo Movimiento De Inventario -> Artículos Genéricos"
// (acción "Alistar pedido" de un movimiento Sin Confirmar) -- iteración
// sobre la primera versión visual (encargo explícito) sobre datos mock
// (`movimiento.articulos`/`.lotes`, ver mockSolicitudesData.js); sin
// acciones reales todavía (Sugerir/Confirmar/Editar/Borrar/Movimiento son
// visual-only, mismo criterio que Editar/Imprimir/Anular en
// MovimientoRowMenu). El "mig-tabs-bar" (Por Consecutivo/Por Id Articulo)
// se eliminó (encargo explícito) -- mismo criterio que MovimientoDetalleModal
// (que ya pasó por esto: tabs sin contenido diferenciado real se reemplazan
// por el contenido plano directo, no por un selector que no aporta).
//
// Rediseño (encargo explícito: "repliquemos el mismo diseño del detalle de
// facturas") sobre FacturaDetalleModalClasico.jsx -- mig-alistar-identity
// (ícono+título+badge+subtítulo, paciente/admisión, Costo Total) es el mismo
// patrón que fvcd-identity-row; mig-resumen/Field (arriba) es el mismo
// fvcd-compact-fields con el resto de los campos del movimiento que no viven
// ya en la identity row. El "Resumen" de Facturas (fvcd-bottom-summary,
// responde a la fila seleccionada de la tabla) se aplicó puntualmente a la
// SEGUNDA tabla (encargo explícito) -- mig-lotes-summary, a la derecha de
// LotesDisponiblesTable, responde a `selectedLoteIndex` con el mismo criterio
// "sin selección, hint" que fvcd-summary-hint.
export default function AlistarPedidoModal({ movimiento, onClose }) {
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [filtroEstadoEntrega, setFiltroEstadoEntrega] = useState('todos');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedLoteIndex, setSelectedLoteIndex] = useState(null);

  useEffect(() => {
    if (!movimiento) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [movimiento, onClose]);

  // Reinicia filtros/selección al abrir un movimiento distinto -- ajuste de
  // estado durante el render (patrón oficial de React para "resetear estado
  // cuando cambia una prop", ver react.dev/learn/you-might-not-need-an-effect)
  // en vez de un useEffect, para no arrastrar el estado de un "Alistar
  // pedido" anterior al siguiente sin una vuelta de render extra.
  const [resetKey, setResetKey] = useState(movimiento?.id ?? null);
  if ((movimiento?.id ?? null) !== resetKey) {
    setResetKey(movimiento?.id ?? null);
    setFiltroCodigo('');
    setFiltroDescripcion('');
    setFiltroEstadoEntrega('todos');
    setSelectedItem(null);
    setSelectedLoteIndex(null);
  }

  const articulosFiltrados = useMemo(() => (movimiento?.articulos ?? []).filter((a) => {
    if (filtroCodigo && !a.codigo.toLowerCase().includes(filtroCodigo.trim().toLowerCase())) return false;
    if (filtroDescripcion && !a.descripcion.toLowerCase().includes(filtroDescripcion.trim().toLowerCase())) return false;
    if (filtroEstadoEntrega !== 'todos' && estadoEntregaDe(a) !== filtroEstadoEntrega) return false;
    return true;
  }), [movimiento, filtroCodigo, filtroDescripcion, filtroEstadoEntrega]);

  // Sin useState/useEffect: mismo patrón "siempre hay algo seleccionado" que
  // effectiveSelectedId en Solicitudes.jsx.
  const effectiveSelected = articulosFiltrados.some((a) => a.item === selectedItem)
    ? articulosFiltrados.find((a) => a.item === selectedItem)
    : (articulosFiltrados[0] ?? null);

  const lotes = effectiveSelected?.lotes ?? [];

  // La lista de lotes cambia con el ítem elegido arriba -- si la selección de
  // lote quedó fuera de rango (o el ítem cambió), la resetea durante el
  // render en vez de un useEffect (mismo criterio que el reset de arriba).
  const [lastArticuloItem, setLastArticuloItem] = useState(effectiveSelected?.item ?? null);
  if ((effectiveSelected?.item ?? null) !== lastArticuloItem) {
    setLastArticuloItem(effectiveSelected?.item ?? null);
    if (selectedLoteIndex !== null) setSelectedLoteIndex(null);
  }
  const selectedLote = selectedLoteIndex !== null ? (lotes[selectedLoteIndex] ?? null) : null;

  const costoTotalMovimiento = useMemo(
    () => (movimiento?.articulos ?? []).reduce((acc, a) => acc + a.costoTotal.neto, 0),
    [movimiento],
  );

  if (!movimiento) return null;

  const estadoBadge = ESTADO_BADGE[movimiento.estado];

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal mig-alistar-modal" role="dialog" aria-modal="true" aria-labelledby="mig-alistar-title">
        <ModalHeader
          title="Artículos Genéricos"
          titleId="mig-alistar-title"
          onClose={onClose}
        />

        <div className="modal-body mig-alistar-body">
          <div className="mig-alistar-identity">
            <div className="mig-alistar-icon">
              <LuPackage className="icon" aria-hidden="true" />
            </div>
            <div className="mig-alistar-identity-text">
              <div className="mig-alistar-identity-name">
                {`${movimiento.trns.toUpperCase()} · ${movimiento.consecutivo}`}
                <Badge tone={estadoBadge.tone} className="mig-alistar-badge">{estadoBadge.label}</Badge>
              </div>
              <div className="mig-alistar-identity-sub">{movimiento.movimiento}</div>
            </div>

            <div className="mig-alistar-divider" aria-hidden="true" />

            <div className="mig-alistar-identity-text">
              <div className="mig-alistar-identity-name">{movimiento.paciente}</div>
              <div className="mig-alistar-identity-sub">No. Admisión {movimiento.noAdmision}</div>
            </div>

            <div className="mig-alistar-identity-total">
              <span className="mig-field-label">Costo Total</span>
              <span className="mig-alistar-total-value">${formatMoneda(costoTotalMovimiento)}</span>
            </div>
          </div>

          <div className="mig-resumen">
            <Field label="Fecha" value={formatFecha(movimiento.fecha)} />
            <Field label="Hora" value={movimiento.hora} />
            <Field label="Solicitante" value={movimiento.solicitante} />
            <Field label="Ubicación" value={movimiento.ubicacion} />
            <Field label="No. Admisión" value={movimiento.noAdmision} />
            <Field label="No. Prestación" value={movimiento.noPrestacion} />
            <Field label="Procedencia" value={movimiento.procedencia} />
            <Field label="Id. Contrato" value={movimiento.idContrato} />
          </div>

          <div className="mig-articulos-panel">
            <div className="mig-alistar-filters">
              <div className="mig-inline-field">
                <label htmlFor="mig-alistar-estado-entrega">Estado De Entrega:</label>
                <FormSelect
                  id="mig-alistar-estado-entrega"
                  value={filtroEstadoEntrega}
                  onChange={setFiltroEstadoEntrega}
                  options={ESTADO_ENTREGA_OPTIONS}
                />
              </div>

              <Button variant="outline" icon={LuRefreshCw}>Sugerir Todos</Button>
            </div>

            <ArticulosItemsTable
              articulos={articulosFiltrados}
              selectedItem={effectiveSelected?.item ?? null}
              onSelect={setSelectedItem}
            />
          </div>

          <div className="mig-lotes-section">
            <h4 className="mig-lotes-title">
              Artículos disponibles para el código:
              {effectiveSelected && (
                <>
                  <span className="mig-lotes-codigo">{effectiveSelected.codigo}</span>
                  <span className="mig-lotes-descripcion">{effectiveSelected.descripcion}</span>
                </>
              )}
            </h4>

            <div className="mig-lotes-row">
              <LotesDisponiblesTable lotes={lotes} selectedIndex={selectedLoteIndex} onSelect={setSelectedLoteIndex} />

              <div className="mig-lotes-summary">
                <div className="mig-summary-title">Resumen de lote</div>
                {!selectedLote && <div className="mig-summary-hint">Selecciona un lote de la tabla para ver su resumen.</div>}
                <div className="mig-summary-row"><span>Stock</span><span>{(selectedLote?.stock ?? 0).toFixed(2)}</span></div>
                <div className="mig-summary-row"><span>Esperada</span><span>{(selectedLote?.esperada ?? 0).toFixed(2)}</span></div>
                <div className="mig-summary-row"><span>Cantidad</span><span>{(selectedLote?.cantidad ?? 0).toFixed(2)}</span></div>
                <div className="mig-summary-row"><span>Vence</span><span>{selectedLote ? selectedLote.vence.replaceAll('-', '/') : '—'}</span></div>
                <div className="mig-summary-row"><span>Días vence</span><span>{selectedLote?.diasVence ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Lote serie</span><span>{selectedLote?.loteSerie ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Trans.</span><span>{selectedLote?.trans ?? '—'}</span></div>
                <div className="mig-summary-divider" aria-hidden="true" />
                <div className="mig-summary-row mig-summary-total"><span>No.Documento</span><span>{selectedLote?.noDocumento ?? '—'}</span></div>
              </div>
            </div>

            <div className="mig-alistar-actions">
              <Button variant="outline" icon={LuRefreshCw}>Sugerir</Button>
              <Button variant="primary" icon={LuThumbsUp}>Confirmar</Button>
              <Button variant="outline" icon={LuPencil}>Editar</Button>
              <Button variant="danger-outline" icon={LuTrash2}>Borrar</Button>
              <Button variant="secondary" icon={LuClipboardCheck}>Movimiento</Button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
