'use client';

import { useEffect, useState } from 'react';
import './MovimientoDetalleModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import MovimientoItemsTable from './MovimientoItemsTable/MovimientoItemsTable';
import { formatFecha } from '@/hooks/InsumosFarmacia/mockSolicitudesData';
import { LuArrowRightLeft, LuEye, LuRepeat } from 'react-icons/lu';

const TABS = [
  { id: 'detalle', label: 'Detalle' },
  { id: 'linea', label: 'Línea' },
  { id: 'prefijos', label: 'Prefijos' },
];

// Modal grande de detalle (encargo explícito), disparado por "Ver detalle"
// en MovimientoRowMenu (columna Acciones de MovimientosGrid) -- antes vivía
// siempre visible debajo de la grilla como MovimientoDetalle. Mismo patrón
// .modal-overlay/.modal extragrande que FacturaDetalleModalClasico (ver
// Solicitudes/shared/shared.css), `movimiento` null = cerrado. Tabs "Línea"/
// "Prefijos" siguen siendo placeholders sin contenido propio en V1 (ver
// spec).
export default function MovimientoDetalleModal({ movimiento, onClose }) {
  const [activeTab, setActiveTab] = useState('detalle');

  // Reset de tab a "detalle" al abrir un movimiento distinto -- ajustado
  // durante el render comparando contra el movimiento anterior (evita el
  // efecto con setState síncrono), mismo patrón que FiltrosFacturasPopover.
  const [lastMovimientoId, setLastMovimientoId] = useState(movimiento?.id ?? null);
  if ((movimiento?.id ?? null) !== lastMovimientoId) {
    setLastMovimientoId(movimiento?.id ?? null);
    setActiveTab('detalle');
  }

  useEffect(() => {
    if (!movimiento) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [movimiento, onClose]);

  if (!movimiento) return null;

  function handleTabsKeyDown(e) {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    let next;
    if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length;
    else return;
    e.preventDefault();
    setActiveTab(TABS[next].id);
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal mig-detalle-modal" role="dialog" aria-modal="true" aria-labelledby="mig-detalle-title">
        <ModalHeader
          title={`Detalle del movimiento ${movimiento.consecutivo}`}
          titleId="mig-detalle-title"
          onClose={onClose}
        />

        <div className="modal-body">
          <div className="mig-tabs-bar" role="tablist" aria-label="Detalle del movimiento" onKeyDown={handleTabsKeyDown}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`mig-panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`mig-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mig-tab-body" role="tabpanel" id={`mig-panel-${activeTab}`}>
            {activeTab === 'detalle' && (
              <div className="mig-items-card">
                <MovimientoItemsTable articulos={movimiento.articulos} />
              </div>
            )}
            {activeTab !== 'detalle' && <div className="mig-tab-empty">Sin información disponible.</div>}
          </div>

          <div className="mig-meta-bar">
            <div className="mig-meta-item">
              <span className="lbl">Fecha Contable:</span>
              <span className="val mig-meta-link">{formatFecha(movimiento.fechaContable)}</span>
            </div>
            <div className="mig-meta-item">
              <span className="lbl">Confirmó:</span>
              <span className="val">{movimiento.confirmo || '—'}</span>
            </div>
            <div className="mig-meta-item">
              <span className="lbl">Fecha:</span>
              <span className="val">{formatFecha(movimiento.fecha)}</span>
            </div>
            <label className="mig-meta-checkbox">
              <input type="checkbox" defaultChecked={movimiento.permitirEditarCostos} />
              Permitir editar costos?
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary-accent" icon={LuRepeat}>Cambiar</Button>
          <Button variant="secondary-accent" icon={LuEye}>Ver detalle</Button>
          <Button variant="secondary-accent" icon={LuArrowRightLeft}>Movimiento</Button>
        </div>
      </div>
    </div>
  );
}
