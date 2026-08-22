'use client';

import { useEffect, useMemo, useState } from 'react';
import './TareasEnfermeria.css';
import '@/Components/GestionEnfermeria/shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import GestionEnfermeriaSidebar from '@/Components/GestionEnfermeria/GestionEnfermeriaSidebar/GestionEnfermeriaSidebar';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import TaskSummaryCard from './TaskSummaryCard/TaskSummaryCard';
import TaskListPanel from './TaskListPanel/TaskListPanel';
import ShiftChangeBanner from './ShiftChangeBanner/ShiftChangeBanner';
import TaskDetailPanel from './TaskDetailPanel/TaskDetailPanel';
import NewTaskModal from './NewTaskModal/NewTaskModal';
import ReassignModal from './ReassignModal/ReassignModal';
import RescheduleModal from './RescheduleModal/RescheduleModal';
import CompleteVitalsModal from './CompleteVitalsModal/CompleteVitalsModal';
import { AREAS_OPERATIVAS } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import {
  AHORA_LABEL, TAREAS, TURNO_ACTUAL, USUARIO_ACTUAL,
} from '@/hooks/GestionEnfermeria/mockTareasData';
import {
  LuCalendarPlus, LuCircleCheck, LuClipboardList, LuClock, LuClockAlert, LuOctagonAlert, LuUserRoundX,
} from 'react-icons/lu';

// Bandeja central de tareas de enfermería (encargo explícito) — accesible
// desde "Tareas" en el header del Panel General (ver PanelGeneral.jsx).
// Mismo shell app/main/content que PanelGeneral.jsx (Sidebar + Topbar +
// content), pero con su propio breadcrumb ("Hospitalización / Gestión de
// Enfermería / Tareas") y su propio dataset (`TAREAS`, ver
// mockTareasData.js — mismos pacientes/camas que Panel General para que el
// piso se lea como uno solo).
//
// El selector "Área operativa" del header (reutiliza AreaSelector.jsx de
// PanelGeneral, sin la opción "Todo el área" — acá siempre se trabaja un
// sector) fija cuál es "mi área" ahora mismo — alimenta la pestaña "Del
// área" de TaskListPanel.jsx, pero NO filtra el resto de la pantalla (KPIs/
// "Todas"): son 2 preguntas distintas ("¿cuánto hay en total?" vs "¿cuánto
// hay en mi sector?"), colapsarlas en un solo filtro global dejaría la
// pestaña "Del área" sin sentido (idéntica a "Todas").
// "Pendientes" incluye las vencidas (encargo explícito: "una tarea vencida
// sigue siendo una tarea pendiente") — así el número que se filtra al
// hacer clic coincide con el que se muestra (nunca 2 conteos que se leen
// como contradictorios); la relación se comunica aparte vía `sublabel` en
// vez de restarla, ver el render de TaskSummaryCard más abajo. "Completadas"
// usa tono 'gray' (en vez de 'green') + la prop `secondary` de
// TaskSummaryCard — encargo: "mantener como información secundaria, con
// menor peso visual".
const KPIS = [
  { key: 'pendientes', label: 'Pendientes', icon: LuClipboardList, tono: 'neutral', match: (t) => t.estado === 'pendiente' || t.estado === 'vencida' },
  { key: 'vence-pronto', label: 'Vencen pronto', icon: LuClockAlert, tono: 'amber', match: (t) => t.programacion.tono === 'vence-pronto' },
  { key: 'vencidas', label: 'Vencidas', icon: LuOctagonAlert, tono: 'red', match: (t) => t.estado === 'vencida' },
  { key: 'sin-asignar', label: 'Sin asignar', icon: LuUserRoundX, tono: 'amber', match: (t) => t.estado === 'sin-asignar' },
  { key: 'completadas', label: 'Completadas', icon: LuCircleCheck, tono: 'gray', match: (t) => t.estado === 'completada' },
];

export default function TareasEnfermeria() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [areaOperativa, setAreaOperativa] = useState('norte');
  const [tareas, setTareas] = useState(TAREAS);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [kpiFiltro, setKpiFiltro] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [reassignTarget, setReassignTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [vitalsTarget, setVitalsTarget] = useState(null);

  function actualizarTarea(id, cambios) {
    setTareas((ts) => ts.map((t) => (t.id === id ? { ...t, ...cambios } : t)));
  }

  function handleIniciar(id) {
    actualizarTarea(id, { estado: 'en-curso', programacion: { label: `En curso · desde ${AHORA_LABEL}`, tono: 'en-curso' } });
  }

  function handleCompletar(id) {
    const t = tareas.find((x) => x.id === id);
    if (t.tipo === 'signos-vitales') { setVitalsTarget(t); return; }
    actualizarTarea(id, { estado: 'completada', programacion: { label: `Completada · ${AHORA_LABEL}`, tono: 'completada' } });
    window.ncToast?.(`"${t.nombre}" marcada como completada.`);
  }

  function confirmVitals(id) {
    actualizarTarea(id, { estado: 'completada', programacion: { label: `Completada · ${AHORA_LABEL}`, tono: 'completada' } });
    setVitalsTarget(null);
    window.ncToast?.('Signos vitales registrados y tarea completada.');
  }

  function handleNoRealizada(id) {
    actualizarTarea(id, { estado: 'no-realizada', programacion: { label: 'No realizada', tono: 'neutral' } });
  }

  function handleCancelar(id) {
    actualizarTarea(id, { estado: 'cancelada', programacion: { label: 'Cancelada', tono: 'neutral' } });
  }

  function confirmReasignar(id, responsable) {
    const t = tareas.find((x) => x.id === id);
    actualizarTarea(id, {
      responsable,
      estado: responsable ? (t.estado === 'sin-asignar' ? 'pendiente' : t.estado) : 'sin-asignar',
    });
    setReassignTarget(null);
  }

  // Asignación rápida en fila (encargo: "sin abandonar la bandeja") — misma
  // transición de estado que confirmReasignar (sin-asignar → pendiente),
  // solo que viene de QuickAssignMenu en vez de ReassignModal, así que acá
  // sí vale la pena un toast: no hay un modal que se cierre confirmando la
  // acción.
  function handleAsignarRapido(id, responsable) {
    confirmReasignar(id, responsable);
    window.ncToast?.(`Tarea asignada a ${responsable}.`);
  }

  function confirmReprogramar(id, fecha, hora) {
    actualizarTarea(id, {
      estado: 'reprogramada',
      ventana: `${fecha} · ${hora}`,
      programacion: { label: `Reprogramada · ${fecha} ${hora}`, tono: 'neutral' },
    });
    setRescheduleTarget(null);
  }

  function handleAsumir(id) {
    actualizarTarea(id, {
      responsable: USUARIO_ACTUAL,
      estado: 'pendiente',
      programacion: { label: 'Asumida al inicio de turno', tono: 'proxima' },
    });
  }

  function handleCreateTask(nuevaTarea) {
    setTareas((ts) => [nuevaTarea, ...ts]);
    setShowNewTaskModal(false);
    window.ncToast?.(`Tarea "${nuevaTarea.nombre}" creada.`);
  }

  const kpiCounts = useMemo(() => Object.fromEntries(
    KPIS.map((k) => [k.key, tareas.filter(k.match).length]),
  ), [tareas]);

  const tareasParaLista = useMemo(() => (
    kpiFiltro ? tareas.filter(KPIS.find((k) => k.key === kpiFiltro).match) : tareas
  ), [tareas, kpiFiltro]);

  const tareasTurnoAnterior = useMemo(
    () => tareas.filter((t) => t.esDelTurnoAnterior && t.estado === 'sin-asignar'),
    [tareas],
  );

  const selectedTarea = tareas.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Hospitalización', { label: 'Gestión de Enfermería', href: '/gestion-enfermeria' }]}
          page="Tareas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ge-shell-content">
          <GestionEnfermeriaSidebar />

          <div className="ge-page-body">
            <div className="tk-header">
              <div>
                <h1>Tareas de enfermería</h1>
                <p>Organiza y registra las actividades asistenciales y operativas del turno.</p>
              </div>
              <div className="tk-header-actions">
                <span className="tk-turno-indicator">
                  <LuClock className="icon" aria-hidden="true" />
                  {TURNO_ACTUAL.label} · {TURNO_ACTUAL.rango}
                </span>
                <AreaSelector
                  options={AREAS_OPERATIVAS.filter((a) => a.value !== 'todo')}
                  value={areaOperativa}
                  onChange={setAreaOperativa}
                />
                <button type="button" className="btn btn-primary" onClick={() => setShowNewTaskModal(true)}>
                  <LuCalendarPlus className="icon" />
                  Nueva tarea
                </button>
              </div>
            </div>

            <div className="tk-summary-row">
              {KPIS.map((k) => (
                <TaskSummaryCard
                  key={k.key}
                  icon={k.icon}
                  label={k.label}
                  value={kpiCounts[k.key]}
                  sublabel={k.key === 'pendientes' && kpiCounts.vencidas > 0 ? `${kpiCounts.vencidas} vencidas` : null}
                  tono={k.tono}
                  secondary={k.key === 'completadas'}
                  active={kpiFiltro === k.key}
                  onClick={() => setKpiFiltro((f) => (f === k.key ? null : k.key))}
                />
              ))}
            </div>

            {tareasTurnoAnterior.length > 0 && (
              <ShiftChangeBanner tareas={tareasTurnoAnterior} onAsumir={handleAsumir} />
            )}

            <TaskListPanel
              tareas={tareasParaLista}
              areaSeleccionada={areaOperativa}
              selectedId={selectedTaskId}
              onSelect={setSelectedTaskId}
              onIniciar={handleIniciar}
              onCompletar={handleCompletar}
              onAsignarRapido={handleAsignarRapido}
              onReasignar={(id) => setReassignTarget(tareas.find((t) => t.id === id))}
              onReprogramar={(id) => setRescheduleTarget(tareas.find((t) => t.id === id))}
              onNoRealizada={handleNoRealizada}
              onCancelar={handleCancelar}
            />
          </div>
        </div>
      </div>

      {selectedTarea && (
        <TaskDetailPanel
          tarea={selectedTarea}
          onClose={() => setSelectedTaskId(null)}
          onIniciar={handleIniciar}
          onReasignar={(id) => setReassignTarget(tareas.find((t) => t.id === id))}
          onReprogramar={(id) => setRescheduleTarget(tareas.find((t) => t.id === id))}
        />
      )}

      {showNewTaskModal && <NewTaskModal onClose={() => setShowNewTaskModal(false)} onCreate={handleCreateTask} />}
      {reassignTarget && <ReassignModal tarea={reassignTarget} onClose={() => setReassignTarget(null)} onConfirm={confirmReasignar} />}
      {rescheduleTarget && <RescheduleModal tarea={rescheduleTarget} onClose={() => setRescheduleTarget(null)} onConfirm={confirmReprogramar} />}
      {vitalsTarget && <CompleteVitalsModal tarea={vitalsTarget} onClose={() => setVitalsTarget(null)} onConfirm={confirmVitals} />}
    </div>
  );
}
