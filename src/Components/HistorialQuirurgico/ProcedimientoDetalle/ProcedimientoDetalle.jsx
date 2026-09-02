'use client';

import { useState } from 'react';
import './ProcedimientoDetalle.css';
import InsumosTab from './tabs/InsumosTab/InsumosTab';
import FarmaciaTab from './tabs/FarmaciaTab/FarmaciaTab';
import PersonalTab from './tabs/PersonalTab/PersonalTab';
import EquiposTab from './tabs/EquiposTab/EquiposTab';

const TABS = [
  { id: 'insumos', label: 'Insumos' },
  { id: 'farmacia', label: 'Farmacia' },
  { id: 'personal', label: 'Personal clínico' },
  { id: 'equipos', label: 'Equipos' },
];

// Mismo patrón ARIA que .dcp-tabs-bar de DetalleCirugiaPanel (Programación
// de Sala de Cirugías): role="tablist" + roving tabindex + flechas ←/→.
// `activeTab` se resetea a "insumos" al cambiar de procedimiento con el
// mismo truco "ajustar estado durante el render" que usa DetalleCirugiaPanel
// para `lastCirugiaId` (evita el warning de React sobre set-state-in-effect)
// -- estas 4 tabs representan perspectivas del mismo procedimiento, no pasos
// de un proceso, ver spec.
export default function ProcedimientoDetalle({ procedimiento }) {
  const [activeTab, setActiveTab] = useState('insumos');
  const [lastProcedimientoId, setLastProcedimientoId] = useState(procedimiento?.id ?? null);
  if ((procedimiento?.id ?? null) !== lastProcedimientoId) {
    setLastProcedimientoId(procedimiento?.id ?? null);
    setActiveTab('insumos');
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

  if (!procedimiento) return null;

  return (
    <div className="hq-detalle">
      <div className="hq-tabs-bar" role="tablist" aria-label="Detalle del procedimiento" onKeyDown={handleTabsKeyDown}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`hq-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`hq-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hq-tab-body" role="tabpanel" id={`hq-panel-${activeTab}`}>
        {activeTab === 'insumos' && <InsumosTab procedimiento={procedimiento} />}
        {activeTab === 'farmacia' && <FarmaciaTab procedimiento={procedimiento} />}
        {activeTab === 'personal' && <PersonalTab procedimiento={procedimiento} />}
        {activeTab === 'equipos' && <EquiposTab procedimiento={procedimiento} />}
      </div>
    </div>
  );
}
