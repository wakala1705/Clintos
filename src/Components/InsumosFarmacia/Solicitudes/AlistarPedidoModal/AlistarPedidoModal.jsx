'use client';

import { useMemo, useState, useEffect } from 'react';
import './AlistarPedidoModal.css';
import { LuPackage, LuThumbsUp } from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import ArticulosItemsTable from './ArticulosItemsTable/ArticulosItemsTable';
import LotesDisponiblesTable from './LotesDisponiblesTable/LotesDisponiblesTable';

// Mismo mapa tono/label que MovimientosGrid.jsx (estado del movimiento
// completo, no del ítem) -- se muestra junto al título en mig-alistar-identity,
// réplica del "Estado: 0-Sin Confirmado" de la referencia.
const ESTADO_BADGE = {
  confirmado: { tone: 'success', label: 'Confirmado' },
  'sin-confirmar': { tone: 'warn', label: 'Sin Confirmar' },
  anulado: { tone: 'danger', label: 'Anulado' },
};

// Un movimiento "Sin Confirmar" todavía no entregó nada de verdad (encargo
// explícito) -- aunque cantidadEntregada venga > 0 en el mock, se muestra
// "Pendiente" para todos sus ítems mientras el movimiento como un todo siga
// sin confirmar. Solo "Confirmado"/"Anulado" respetan cantidadEntregada tal
// cual. Mismo criterio duplicado en ArticulosItemsTable.jsx (ver ese
// archivo), que es quien realmente pinta el Badge -- esta copia solo
// alimenta filtroEstadoEntrega, hoy sin control visible que lo cambie.
function estadoEntregaDe(a, movimientoEstado) {
  if (movimientoEstado === 'sin-confirmar') return 'pendiente';
  return a.cantidadEntregada > 0 ? 'entregado' : 'pendiente';
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
// (ícono+título+badge+subtítulo, paciente/admisión, Solicitante) es el mismo
// patrón que fvcd-identity-row. El "mig-resumen" (fvcd-compact-fields, resto
// de campos del movimiento) se eliminó (encargo explícito) -- Solicitante,
// el único dato de ese bloque que se conservó, se movió a la identity row.
// El "Resumen" de Facturas (fvcd-bottom-summary, responde a la fila
// seleccionada de la tabla) se aplicó puntualmente a la SEGUNDA tabla
// (encargo explícito) -- mig-lotes-summary, a la derecha de
// LotesDisponiblesTable, responde a `effectiveLoteIndex`. A diferencia de
// fvcd-summary-hint, acá el primer lote llega seleccionado por defecto
// (encargo explícito) -- el hint solo se ve cuando no hay lotes.
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
    if (filtroEstadoEntrega !== 'todos' && estadoEntregaDe(a, movimiento?.estado) !== filtroEstadoEntrega) return false;
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

  // Igual que effectiveSelected de arriba -- por defecto, el primer lote
  // queda seleccionado en vez de dejar la tabla sin selección (encargo
  // explícito).
  const effectiveLoteIndex = selectedLoteIndex !== null && lotes[selectedLoteIndex]
    ? selectedLoteIndex
    : (lotes.length > 0 ? 0 : null);
  const selectedLote = effectiveLoteIndex !== null ? lotes[effectiveLoteIndex] : null;

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
              <div className="mig-alistar-identity-sub">{movimiento.solicitante}</div>
            </div>
          </div>

          <ArticulosItemsTable
            articulos={articulosFiltrados}
            selectedItem={effectiveSelected?.item ?? null}
            onSelect={setSelectedItem}
            movimientoEstado={movimiento.estado}
          />

          <div className="mig-lotes-section">
            <h4 className="mig-lotes-title">
              Artículos disponibles para el código:
              {effectiveSelected && (
                <>
                  <span className="mig-lotes-codigo">{effectiveSelected.codigo}</span>
                  <span className="mig-lotes-descripcion">{effectiveSelected.descripcion}</span>
                  <span className="mig-lotes-esperada">
                    Cnt. Esperada: <strong>{effectiveSelected.cantidadSolicitada.toFixed(2)}</strong>
                  </span>
                </>
              )}
            </h4>

            <div className="mig-lotes-row">
              <LotesDisponiblesTable lotes={lotes} selectedIndex={effectiveLoteIndex} onSelect={setSelectedLoteIndex} />

              <div className="mig-lotes-summary">
                <div className="mig-summary-title">Resumen de lote</div>
                {!selectedLote && <div className="mig-summary-hint">Selecciona un lote de la tabla para ver su resumen.</div>}
                <div className="mig-summary-row"><span>Id Sede</span><span>{selectedLote?.idSede ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Id.Bdg</span><span>{selectedLote?.bdg ?? '—'}</span></div>
                <div className="mig-summary-row"><span>No.Documento</span><span>{selectedLote?.noDocumento ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Genérico</span><span>{selectedLote?.generico ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Días vence</span><span>{selectedLote?.diasVence ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Lote serie</span><span>{selectedLote?.loteSerie ?? '—'}</span></div>
                <div className="mig-summary-row"><span>Trans.</span><span>{selectedLote?.trans ?? '—'}</span></div>
                <div className="mig-summary-divider" aria-hidden="true" />
                <div className="mig-summary-row mig-summary-total"><span>Id. Artículo</span><span>{selectedLote?.generico ?? '—'}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" icon={LuThumbsUp}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
