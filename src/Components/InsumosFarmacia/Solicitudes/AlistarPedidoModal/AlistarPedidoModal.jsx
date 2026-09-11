'use client';

import { useMemo, useState, useEffect } from 'react';
import './AlistarPedidoModal.css';
import {
  LuClipboardCheck, LuPencil, LuRefreshCw, LuThumbsUp, LuTrash2,
} from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import ArticulosItemsTable from './ArticulosItemsTable/ArticulosItemsTable';
import LotesDisponiblesTable from './LotesDisponiblesTable/LotesDisponiblesTable';

const ESTADO_ENTREGA_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'entregado', label: 'Entregado' },
];

// Mismo mapa tono/label que MovimientosGrid.jsx (estado del movimiento
// completo, no del ítem) -- se muestra en mig-alistar-meta, réplica del
// "Estado: 0-Sin Confirmado" de la referencia.
const ESTADO_BADGE = {
  confirmado: { tone: 'success', label: 'Confirmado' },
  'sin-confirmar': { tone: 'warn', label: 'Sin Confirmar' },
  anulado: { tone: 'danger', label: 'Anulado' },
};

function estadoEntregaDe(a) {
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
export default function AlistarPedidoModal({ movimiento, onClose }) {
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [filtroEstadoEntrega, setFiltroEstadoEntrega] = useState('todos');
  const [selectedItem, setSelectedItem] = useState(null);

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
          <div className="mig-articulos-panel">
            <div className="mig-alistar-filters">
              <div className="mig-alistar-meta">
                <span className="mig-alistar-meta-text">{`${movimiento.trns.toUpperCase()} · ${movimiento.consecutivo}`}</span>
                <Badge tone={estadoBadge.tone}>{estadoBadge.label}</Badge>
              </div>

              <div className="filter-spacer" />

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

            <LotesDisponiblesTable lotes={effectiveSelected?.lotes ?? []} />

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
