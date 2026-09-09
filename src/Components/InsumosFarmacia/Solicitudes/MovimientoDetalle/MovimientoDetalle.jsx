'use client';

import { useState } from 'react';
import './MovimientoDetalle.css';
import MovimientoItemsTable from './MovimientoItemsTable/MovimientoItemsTable';
import Button from '@/Components/Button/Button';
import { formatFecha } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

const TABS = [
  { id: 'detalle', label: 'Detalle' },
  { id: 'linea', label: 'Línea' },
  { id: 'prefijos', label: 'Prefijos' },
];

// El padre (Solicitudes.jsx) monta este componente con key={movimiento?.id}
// -- al cambiar de movimiento seleccionado, React lo desmonta/remonta,
// reseteando `activeTab` a 'detalle' automáticamente sin necesitar el truco
// "ajustar estado durante el render" de otras pantallas (más simple porque
// acá no hay más estado que compartir con el resto del árbol). Tabs "Línea"/
// "Prefijos" son placeholders sin contenido propio en V1 (ver spec).
export default function MovimientoDetalle({ movimiento }) {
  const [activeTab, setActiveTab] = useState('detalle');

  if (!movimiento) {
    return <div className="mig-detail-empty">Selecciona un movimiento en la tabla para ver su detalle.</div>;
  }

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
    <div className="mig-detalle">
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
        {activeTab === 'detalle' && <MovimientoItemsTable articulos={movimiento.articulos} />}
        {activeTab !== 'detalle' && <div className="mig-tab-empty">Sin información disponible.</div>}
      </div>

      <div className="mig-detalle-actions">
        <Button variant="secondary" size="sm">Cambiar</Button>
        <Button variant="secondary" size="sm">Ver</Button>
        <Button variant="secondary" size="sm">Movimiento</Button>
      </div>
    </div>
  );
}
