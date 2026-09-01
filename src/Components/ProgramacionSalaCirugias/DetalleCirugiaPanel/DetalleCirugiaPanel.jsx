'use client';

import { useEffect, useRef, useState } from 'react';
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
import {
  LuBan, LuCalendarClock, LuChevronUp, LuCircleCheck, LuInfo, LuPencil,
} from 'react-icons/lu';

const ESTADOS_TERMINALES = ['cancelada', 'incumplida'];

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'procedimientos', label: 'Procedimientos' },
  { id: 'personal', label: 'Personal' },
  { id: 'equipos', label: 'Equipos' },
  { id: 'insumos', label: 'Insumos' },
  { id: 'farmacia', label: 'Farmacia' },
];

// Siempre se muestra como drawer superpuesto (nunca docked en el layout) —
// mismo patrón que DetalleCitaModal en Programar cita: la agenda ocupa todo
// el ancho y seleccionar una cirugía abre el detalle encima, sin empujar el
// grid. `onClose` deselecciona y cierra el drawer.
export default function DetalleCirugiaPanel({
  cirugia, salaLabel, onClose, onEditar, onReprogramar, onCancelar,
  onMarcarProgramada, onMarcarIncumplida, onVerInfo,
}) {
  const [activeTab, setActiveTab] = useState('resumen');
  // Menú "Más acciones" (Marcar como programada/incumplida, Ver
  // información/historial) -- vivía en el panel lateral (AccionesBar, ver
  // MiniCalendarCirugias.jsx antes de este encargo) y se movió acá porque
  // ya depende de una cirugía seleccionada igual que el resto de este
  // drawer. Abre hacia arriba (`.dcp-more-dropdown`) por estar pegado al
  // borde inferior de la pantalla -- mismo patrón autocontenido de
  // click-afuera/Escape que tenía AccionesBar.
  const [masOpen, setMasOpen] = useState(false);
  const masRef = useRef(null);

  useEffect(() => {
    if (!masOpen) return undefined;
    function handleClickOutside(e) {
      if (masRef.current && !masRef.current.contains(e.target)) setMasOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [masOpen]);
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
    if (!cirugia) return undefined;
    function handleKeyDown(e) {
      if (e.key !== 'Escape') return;
      if (masOpen) setMasOpen(false);
      else onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cirugia, masOpen, onClose]);

  function handleTabsKeyDown(e) {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    let next;
    if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length;
    else return;
    e.preventDefault();
    setActiveTab(TABS[next].id);
  }

  if (!cirugia) return null;

  const puedeAccionar = !ESTADOS_TERMINALES.includes(cirugia.estado);
  const puedeMarcarProgramada = ['borrador', 'urgencia'].includes(cirugia.estado);
  const puedeMarcarIncumplida = cirugia.estado === 'programada';

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
        <div className="dcp-more-wrap" ref={masRef}>
          <Button variant="secondary" icon={LuChevronUp} onClick={() => setMasOpen((v) => !v)}>
            Más acciones
          </Button>
          {masOpen && (
            <div className="dcp-more-dropdown" role="menu">
              <button
                type="button"
                className="dcp-more-item"
                role="menuitem"
                disabled={!puedeMarcarProgramada}
                onClick={() => { setMasOpen(false); onMarcarProgramada(); }}
              >
                <LuCircleCheck className="icon" aria-hidden="true" />
                Marcar como programada
              </button>
              <button
                type="button"
                className="dcp-more-item"
                role="menuitem"
                disabled={!puedeMarcarIncumplida}
                onClick={() => { setMasOpen(false); onMarcarIncumplida(); }}
              >
                <LuCalendarClock className="icon" aria-hidden="true" />
                Marcar como incumplida
              </button>
              <button
                type="button"
                className="dcp-more-item"
                role="menuitem"
                onClick={() => { setMasOpen(false); onVerInfo(); }}
              >
                <LuInfo className="icon" aria-hidden="true" />
                Ver información/historial
              </button>
            </div>
          )}
        </div>

        <div className="dcp-actions-main">
          <Button variant="secondary" icon={LuPencil} disabled={!puedeAccionar} onClick={onEditar}>Editar</Button>
          <Button variant="secondary" icon={LuCalendarClock} disabled={!puedeAccionar} onClick={onReprogramar}>Reprogramar</Button>
          <Button variant="danger" icon={LuBan} disabled={!puedeAccionar} onClick={onCancelar}>Cancelar</Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="dcp-drawer-overlay" onClick={onClose}>
      <aside className="dcp-panel dcp-drawer-panel" onClick={(e) => e.stopPropagation()} aria-label="Detalle de la cirugía">
        {body}
      </aside>
    </div>
  );
}
