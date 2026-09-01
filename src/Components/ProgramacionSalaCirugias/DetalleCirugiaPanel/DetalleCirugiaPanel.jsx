'use client';

import { useEffect, useState } from 'react';
import './DetalleCirugiaPanel.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';
import ResumenTab from './tabs/ResumenTab/ResumenTab';
import ProcedimientosTab from './tabs/ProcedimientosTab/ProcedimientosTab';
import PersonalTab from './tabs/PersonalTab/PersonalTab';
import EquiposTab from './tabs/EquiposTab/EquiposTab';
import InsumosTab from './tabs/InsumosTab/InsumosTab';
import FarmaciaTab from './tabs/FarmaciaTab/FarmaciaTab';
import { duracionLabel, fechaLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuBan, LuCalendarClock, LuPencil } from 'react-icons/lu';

const NARROW_QUERY = '(max-width:1024px)';
const ESTADOS_TERMINALES = ['cancelada', 'incumplida'];

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'procedimientos', label: 'Procedimientos' },
  { id: 'personal', label: 'Personal' },
  { id: 'equipos', label: 'Equipos' },
  { id: 'insumos', label: 'Insumos' },
  { id: 'farmacia', label: 'Farmacia' },
];

// Docked por defecto (parte del flex row de la página, ver .psc-main-row en
// ProgramacionSalaCirugias.css) -- por debajo de 1024px pasa a overlay
// lateral (mismo patrón que TaskDetailPanel/AlertDetailDrawer de Gestión de
// Enfermería, ver spec). `onClose` siempre deselecciona: en modo docked eso
// vuelve al estado vacío, en modo drawer además cierra el overlay.
export default function DetalleCirugiaPanel({
  cirugia, salaLabel, onClose, onEditar, onReprogramar, onCancelar,
}) {
  const [narrow, setNarrow] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  // Resetear a "resumen" al cambiar de cirugía sin un useEffect (evita el
  // cascading-render que marca react-hooks/set-state-in-effect): mismo
  // patrón "ajustar estado durante el render" que recomienda React para
  // derivar estado de un prop que cambia, comparando contra el id anterior
  // guardado en estado.
  const [lastCirugiaId, setLastCirugiaId] = useState(cirugia?.id ?? null);
  if ((cirugia?.id ?? null) !== lastCirugiaId) {
    setLastCirugiaId(cirugia?.id ?? null);
    setActiveTab('resumen');
  }

  useEffect(() => {
    const mql = window.matchMedia(NARROW_QUERY);
    const update = () => setNarrow(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!narrow || !cirugia) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [narrow, cirugia, onClose]);

  function handleTabsKeyDown(e) {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    let next;
    if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length;
    else return;
    e.preventDefault();
    setActiveTab(TABS[next].id);
  }

  if (!cirugia) {
    if (narrow) return null;
    return (
      <aside className="dcp-panel dcp-docked">
        <div className="dcp-empty-state">
          <div className="dcp-empty-title">Selecciona una cirugía</div>
          <div className="dcp-empty-sub">Elige una cirugía de la agenda para ver su detalle.</div>
        </div>
      </aside>
    );
  }

  const puedeAccionar = !ESTADOS_TERMINALES.includes(cirugia.estado);

  const body = (
    <>
      <ModalHeader
        title="Detalle de la cirugía"
        titleId="dcp-title"
        trailing={<span className="dcp-id">ID {cirugia.id}</span>}
        onClose={onClose}
        closeLabel="Cerrar detalle"
      />
      <div className="dcp-status-row">
        <EstadoCirugiaBadge estado={cirugia.estado} />
      </div>

      <div className="dcp-info-grid">
        <div className="dcp-info-col">
          <div className="dcp-info-label">Paciente</div>
          <div className="dcp-info-value">{cirugia.paciente.nombre}</div>
          <div className="dcp-info-label">Documento</div>
          <div className="dcp-info-value">{cirugia.paciente.documento}</div>
          <div className="dcp-info-label">Edad / Sexo</div>
          <div className="dcp-info-value">{cirugia.paciente.edad} años / {cirugia.paciente.sexo}</div>
          <div className="dcp-info-label">Aseguradora</div>
          <div className="dcp-info-value">{cirugia.paciente.aseguradora}</div>
        </div>
        <div className="dcp-info-col">
          <div className="dcp-info-label">Procedimiento</div>
          <div className="dcp-info-value">{cirugia.procedimientoPrincipal}</div>
          <div className="dcp-info-label">Cirujano</div>
          <div className="dcp-info-value">{cirugia.cirujano}</div>
          <div className="dcp-info-label">Sala</div>
          <div className="dcp-info-value">{salaLabel}</div>
          <div className="dcp-info-label">Fecha y hora</div>
          <div className="dcp-info-value">
            {fechaLabel(cirugia.fecha)} {cirugia.horaInicio} - {cirugia.horaFin} ({duracionLabel(cirugia.horaInicio, cirugia.horaFin)})
          </div>
        </div>
      </div>

      <div className="dcp-tabs-bar" role="tablist" aria-label="Secciones del detalle de la cirugía" onKeyDown={handleTabsKeyDown}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`dcp-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`dcp-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dcp-tab-body" role="tabpanel" id={`dcp-panel-${activeTab}`}>
        {activeTab === 'resumen' && <ResumenTab cirugia={cirugia} onNavigateTab={setActiveTab} />}
        {activeTab === 'procedimientos' && <ProcedimientosTab cirugia={cirugia} />}
        {activeTab === 'personal' && <PersonalTab cirugia={cirugia} />}
        {activeTab === 'equipos' && <EquiposTab cirugia={cirugia} />}
        {activeTab === 'insumos' && <InsumosTab cirugia={cirugia} />}
        {activeTab === 'farmacia' && <FarmaciaTab cirugia={cirugia} />}
      </div>

      <div className="dcp-actions">
        <Button variant="secondary" icon={LuPencil} disabled={!puedeAccionar} onClick={onEditar}>Editar</Button>
        <Button variant="secondary" icon={LuCalendarClock} disabled={!puedeAccionar} onClick={onReprogramar}>Reprogramar</Button>
        <Button variant="danger" icon={LuBan} disabled={!puedeAccionar} onClick={onCancelar}>Cancelar</Button>
      </div>
    </>
  );

  if (narrow) {
    return (
      <div className="dcp-drawer-overlay" onClick={onClose}>
        <aside className="dcp-panel dcp-drawer-panel" onClick={(e) => e.stopPropagation()} aria-label="Detalle de la cirugía">
          {body}
        </aside>
      </div>
    );
  }

  return <aside className="dcp-panel dcp-docked">{body}</aside>;
}
