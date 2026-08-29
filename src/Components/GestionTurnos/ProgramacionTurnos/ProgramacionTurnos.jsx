'use client';

import { useEffect, useMemo, useState } from 'react';
import '../GestionTurnos.css';
import './ProgramacionTurnos.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import GestionTurnosSidebar from '../GestionTurnosSidebar/GestionTurnosSidebar';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import FilterDropdown from '@/Components/FilterDropdown/FilterDropdown';
import TurnosCalendar from './TurnosCalendar/TurnosCalendar';
import EditarTurnoModal from './EditarTurnoModal/EditarTurnoModal';
import ReasignarTurnoModal from './ReasignarTurnoModal/ReasignarTurnoModal';
import AsignarTurnoModal from './AsignarTurnoModal/AsignarTurnoModal';
import NuevaProgramacionWizard from './NuevaProgramacionWizard/NuevaProgramacionWizard';
import RevisionProgramacionModal from './RevisionProgramacionModal/RevisionProgramacionModal';
import {
  AREAS_TURNOS, NURSES, PROGRAMACIONES_SEED, SEMANA_ANCLA, addDias, diasDeSemana, rangoSemanaLabel, resolverProgramacion,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import {
  LuCalendarPlus, LuCalendarRange, LuChevronLeft, LuChevronRight, LuClipboardCheck, LuPlus, LuSearch, LuTriangleAlert, LuUserRoundX, LuUsers,
} from 'react-icons/lu';

const TIPO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' },
];
const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'programado', label: 'Programado' },
  { value: 'sin-asignar', label: 'Sin asignar' },
  { value: 'con-conflicto', label: 'Con conflicto' },
];

// Sección "Planificación → Programación de turnos" de Gestión de turnos (ver
// GestionTurnosSidebar). El calendario ya no lee de un `schedule`/`NURSES`
// globales fijos: `programaciones` es un mapa keyed por período (ver
// mockProgramacionData.js, resolverProgramacion) — cada semana/mes tiene su
// propia programación (período/área/personal/estado/schedule) o ninguna,
// disparando el estado vacío de la sección 1 del encargo (ver
// docs/superpowers/specs/2026-08-28-programacion-turnos-flujo-design.md).
//
// Estado de interacción de celda (sin cambios respecto a antes):
//  - `selectedCell` controla el popover de detalle abierto (turno/
//    conflicto/descanso) — un solo popover a la vez, en toda la grilla.
//  - `modal` controla el modal de formulario abierto (Editar/Reasignar/
//    Asignar) — se reutilizan los 3 mismos componentes sin importar desde
//    qué celda o botón se llegó.
export default function ProgramacionTurnos() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [weekStart, setWeekStart] = useState(SEMANA_ANCLA);
  const [areaOperativa, setAreaOperativa] = useState('todas');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [query, setQuery] = useState('');
  // Mapa de programaciones keyed por período — nunca se muta directamente,
  // mismo criterio que el `schedule` local de siempre.
  const [programaciones, setProgramaciones] = useState(PROGRAMACIONES_SEED);
  const [selectedCell, setSelectedCell] = useState(null);
  const [modal, setModal] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);

  const days = useMemo(() => diasDeSemana(weekStart), [weekStart]);
  const rangeLabel = useMemo(() => rangoSemanaLabel(weekStart), [weekStart]);

  const resuelto = useMemo(() => resolverProgramacion(programaciones, weekStart), [programaciones, weekStart]);
  const programacionActiva = resuelto?.programacion ?? null;
  const activePeriodKey = resuelto?.periodKey ?? null;
  const schedule = programacionActiva?.schedule ?? {};

  // Personal de la programación activa (subconjunto de NURSES) — nada se
  // pinta ni se filtra más abajo sin pasar primero por acá.
  const nursesPrograma = useMemo(() => {
    if (!programacionActiva) return [];
    return NURSES.filter((n) => programacionActiva.nurseIds.includes(n.id));
  }, [programacionActiva]);

  const nursesArea = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nursesPrograma.filter((n) => {
      if (areaOperativa !== 'todas' && n.area !== areaOperativa) return false;
      if (q && !n.nombre.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [nursesPrograma, areaOperativa, query]);

  // Enfermeras que de verdad se pintan en la grilla — además de área/
  // búsqueda, aplica Tipo de turno/Estado (incluido el filtro que dispara el
  // footer al hacer click en "sin asignar"/"conflicto", ver
  // handleFiltrarResumen más abajo, ya existente).
  const nurses = useMemo(() => nursesArea.filter((n) => {
    const celdas = schedule[n.id];
    if (tipoFiltro !== 'todos' && !celdas.some((c) => c.estado === 'turno' && c.tipo === tipoFiltro)) return false;
    if (estadoFiltro === 'programado' && !celdas.some((c) => c.estado === 'turno')) return false;
    if (estadoFiltro === 'sin-asignar' && !celdas.some((c) => c.estado === 'vacio')) return false;
    if (estadoFiltro === 'con-conflicto' && !celdas.some((c) => c.conflicto)) return false;
    return true;
  }), [nursesArea, tipoFiltro, estadoFiltro, schedule]);

  const resumen = useMemo(() => {
    let turnos = 0; let sinAsignar = 0; let conflictos = 0;
    nursesArea.forEach((n) => {
      schedule[n.id].forEach((c) => {
        if (c.estado === 'turno') turnos += 1;
        if (c.estado === 'vacio') sinAsignar += 1;
        if (c.conflicto) conflictos += 1;
      });
    });
    return { enfermeras: nursesArea.length, turnos, sinAsignar, conflictos };
  }, [nursesArea, schedule]);

  function nombreDe(nurseId) {
    return NURSES.find((n) => n.id === nurseId)?.nombre;
  }

  // Aplica `updater(scheduleActual)` sobre el schedule de la programación
  // resuelta para la semana visible — punto único de mutación para todos
  // los handlers de abajo, así ninguno necesita saber si `activePeriodKey`
  // es una clave de semana o de mes.
  function updateActiveSchedule(updater) {
    if (!activePeriodKey) return;
    setProgramaciones((prev) => ({
      ...prev,
      [activePeriodKey]: { ...prev[activePeriodKey], schedule: updater(prev[activePeriodKey].schedule) },
    }));
  }

  function handleOpenPopover(nurseId, dayIdx) {
    const misma = selectedCell?.nurseId === nurseId && selectedCell?.dayIdx === dayIdx;
    setSelectedCell(misma ? null : { nurseId, dayIdx });
  }
  function handleClosePopover() {
    setSelectedCell(null);
  }

  function handleOpenAsignar(nurseId, dayIdx, opts) {
    setSelectedCell(null);
    setModal({
      type: 'asignar', nurseId, dayIdx, locked: true, reemplazaDescanso: opts?.reemplazaDescanso ?? false,
    });
  }
  function handleOpenAsignarHeader() {
    setSelectedCell(null);
    setModal({
      type: 'asignar', nurseId: null, dayIdx: null, locked: false, reemplazaDescanso: false,
    });
  }
  function handleEditar(nurseId, dayIdx) {
    setSelectedCell(null);
    setModal({ type: 'editar', nurseId, dayIdx });
  }
  function handleReasignar(nurseId, dayIdx) {
    setSelectedCell(null);
    setModal({ type: 'reasignar', nurseId, dayIdx });
  }
  function handleCloseModal() {
    setModal(null);
  }

  function handleEliminar(nurseId, dayIdx) {
    updateActiveSchedule((sched) => ({
      ...sched,
      [nurseId]: sched[nurseId].map((c, i) => (i === dayIdx ? { estado: 'vacio' } : c)),
    }));
    setSelectedCell(null);
    window.ncToast?.(`Turno de ${nombreDe(nurseId)} eliminado.`);
  }

  function handleResolverConflicto(nurseId, dayIdx) {
    updateActiveSchedule((sched) => ({
      ...sched,
      [nurseId]: sched[nurseId].map((c, i) => {
        if (i !== dayIdx) return c;
        const { conflicto, conflictoNota, conflictoOtro, ...resto } = c;
        return resto;
      }),
    }));
    setSelectedCell(null);
    window.ncToast?.('Conflicto resuelto.');
  }

  function handleEditarDescanso(nurseId) {
    setSelectedCell(null);
    window.ncToast?.(`Editar descanso de ${nombreDe(nurseId)} (en desarrollo).`);
  }

  function handleSaveEditar(originalNurseId, originalDayIdx, updates) {
    updateActiveSchedule((sched) => {
      const moviendo = updates.nurseId !== originalNurseId || updates.dayIdx !== originalDayIdx;
      const next = moviendo
        ? { ...sched, [originalNurseId]: sched[originalNurseId].map((c, i) => (i === originalDayIdx ? { estado: 'vacio' } : c)) }
        : { ...sched };
      const destino = [...next[updates.nurseId]];
      destino[updates.dayIdx] = { estado: 'turno', tipo: updates.tipo, horario: updates.horario };
      next[updates.nurseId] = destino;
      return next;
    });
    setModal(null);
    window.ncToast?.('Turno actualizado.');
  }

  function handleConfirmReasignar(originalNurseId, dayIdx, nuevaEnfermeraId) {
    updateActiveSchedule((sched) => {
      const original = sched[originalNurseId][dayIdx];
      return {
        ...sched,
        [originalNurseId]: sched[originalNurseId].map((c, i) => (i === dayIdx ? { estado: 'vacio' } : c)),
        [nuevaEnfermeraId]: sched[nuevaEnfermeraId].map((c, i) => (
          i === dayIdx ? { estado: 'turno', tipo: original.tipo, horario: original.horario } : c
        )),
      };
    });
    setModal(null);
    window.ncToast?.(`Turno reasignado a ${nombreDe(nuevaEnfermeraId)}.`);
  }

  function handleAssign({
    nurseId, dayIdxs, tipo, horario,
  }) {
    updateActiveSchedule((sched) => ({
      ...sched,
      [nurseId]: sched[nurseId].map((c, i) => {
        if (!dayIdxs.includes(i)) return c;
        return tipo === 'descanso' ? { estado: 'descanso' } : { estado: 'turno', tipo, horario };
      }),
    }));
    setModal(null);
    window.ncToast?.(tipo === 'descanso' ? `Descanso asignado a ${nombreDe(nurseId)}.` : `Turno asignado a ${nombreDe(nurseId)}.`);
  }

  function handleAbrirWizard() {
    setWizardOpen(true);
  }
  function handleCerrarWizard() {
    setWizardOpen(false);
  }
  function handleCrearProgramacion({
    periodKey, programacion, weekStart: nuevoWeekStart, area,
  }) {
    setProgramaciones((prev) => ({ ...prev, [periodKey]: programacion }));
    setWeekStart(nuevoWeekStart);
    setAreaOperativa(area);
    setWizardOpen(false);
    window.ncToast?.('Programación creada.');
  }

  function handlePublicar() {
    if (!activePeriodKey) return;
    setProgramaciones((prev) => ({
      ...prev,
      [activePeriodKey]: { ...prev[activePeriodKey], estado: 'publicada' },
    }));
    setRevisionOpen(false);
    window.ncToast?.('Programación publicada correctamente.');
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de turnos', href: '/gestion-turnos' }]}
          page="Programación de turnos"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ct-content">
          <GestionTurnosSidebar />

          <div className="ct-page-body">
            <div className="tu-header">
              <div>
                <h1>
                  Programación de turnos
                  {programacionActiva?.estado === 'publicada' && <span className="tu-badge-publicada">Publicada</span>}
                  {programacionActiva?.estado === 'borrador' && <span className="tu-badge-borrador">Borrador</span>}
                </h1>
                <p>Gestiona la asignación y cobertura del personal de enfermería.</p>
              </div>
              <div className="tu-header-actions">
                <button type="button" className="date-picker-btn" onClick={() => window.ncToast?.('Vista mensual en desarrollo.')}>
                  <LuCalendarRange className="icon" />
                  Semana
                </button>
                {programacionActiva?.estado === 'borrador' && (
                  <Button variant="outline" icon={LuClipboardCheck} onClick={() => setRevisionOpen(true)}>Revisar programación</Button>
                )}
                {programacionActiva && (
                  <Button icon={LuPlus} onClick={handleOpenAsignarHeader}>Asignar turno</Button>
                )}
                <Button icon={LuCalendarPlus} onClick={handleAbrirWizard}>Nueva programación</Button>
              </div>
            </div>

            <div className="card tu-calendar-card">
              <div className="tu-calendar-header">
                <div className="search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar personal..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar personal"
                  />
                </div>

                <div className="day-nav">
                  <button type="button" className="day-nav-btn" aria-label="Semana anterior" onClick={() => setWeekStart((w) => addDias(w, -7))}>
                    <LuChevronLeft className="icon" />
                  </button>
                  <span className="day-nav-label">{rangeLabel}</span>
                  <button type="button" className="day-nav-btn" aria-label="Semana siguiente" onClick={() => setWeekStart((w) => addDias(w, 7))}>
                    <LuChevronRight className="icon" />
                  </button>
                  <button type="button" className="day-nav-today-btn" onClick={() => setWeekStart(SEMANA_ANCLA)}>Hoy</button>
                </div>

                <div className="filter-spacer" />

                <div className="tu-filters">
                  <AreaSelector label="Área o servicio" options={AREAS_TURNOS} value={areaOperativa} onChange={setAreaOperativa} />
                  <FilterDropdown label="Tipo de turno" options={TIPO_OPTIONS} value={tipoFiltro} onChange={setTipoFiltro} />
                  <FilterDropdown label="Estado" options={ESTADO_OPTIONS} value={estadoFiltro} onChange={setEstadoFiltro} />
                </div>
              </div>

              {!programacionActiva ? (
                <div className="ct-empty-state">
                  <div className="ct-empty-icon"><LuCalendarRange className="icon" aria-hidden="true" /></div>
                  <div className="ct-empty-title">No hay una programación para este período</div>
                  <div className="ct-empty-sub">Selecciona el período, el área y el personal para comenzar a asignar turnos.</div>
                  <Button icon={LuCalendarPlus} onClick={handleAbrirWizard} className="tu-empty-cta">Iniciar programación</Button>
                </div>
              ) : (
                <>
                  <TurnosCalendar
                    nurses={nurses}
                    days={days}
                    schedule={schedule}
                    selectedCell={selectedCell}
                    onOpenPopover={handleOpenPopover}
                    onClosePopover={handleClosePopover}
                    onOpenAsignar={handleOpenAsignar}
                    onEditar={handleEditar}
                    onReasignar={handleReasignar}
                    onEliminar={handleEliminar}
                    onResolverConflicto={handleResolverConflicto}
                    onEditarDescanso={handleEditarDescanso}
                  />

                  <div className="tu-summary" aria-label="Resumen de la programación">
                    <div className="tu-summary-group">
                      <span className="tu-summary-item">
                        <LuUsers className="icon" aria-hidden="true" />
                        {resumen.enfermeras} enfermeras
                      </span>
                      <span className="tu-summary-dot" aria-hidden="true">·</span>
                      <span className="tu-summary-item">
                        <LuClipboardCheck className="icon" aria-hidden="true" />
                        {resumen.turnos} turnos programados
                      </span>
                    </div>

                    {(resumen.sinAsignar > 0 || resumen.conflictos > 0) && (
                      <>
                        <span className="tu-summary-divider" aria-hidden="true" />
                        <div className="tu-summary-group">
                          {resumen.sinAsignar > 0 && (
                            <button
                              type="button"
                              className={`tu-summary-item warn tu-summary-clickable${estadoFiltro === 'sin-asignar' ? ' active' : ''}`}
                              aria-pressed={estadoFiltro === 'sin-asignar'}
                              onClick={() => setEstadoFiltro((f) => (f === 'sin-asignar' ? 'todos' : 'sin-asignar'))}
                            >
                              <LuUserRoundX className="icon" aria-hidden="true" />
                              {resumen.sinAsignar} sin asignar
                            </button>
                          )}
                          {resumen.sinAsignar > 0 && resumen.conflictos > 0 && (
                            <span className="tu-summary-dot" aria-hidden="true">·</span>
                          )}
                          {resumen.conflictos > 0 && (
                            <button
                              type="button"
                              className={`tu-summary-item danger tu-summary-clickable${estadoFiltro === 'con-conflicto' ? ' active' : ''}`}
                              aria-pressed={estadoFiltro === 'con-conflicto'}
                              onClick={() => setEstadoFiltro((f) => (f === 'con-conflicto' ? 'todos' : 'con-conflicto'))}
                            >
                              <LuTriangleAlert className="icon" aria-hidden="true" />
                              {resumen.conflictos} {resumen.conflictos === 1 ? 'conflicto' : 'conflictos'}
                            </button>
                          )}
                          {estadoFiltro === 'sin-asignar' || estadoFiltro === 'con-conflicto' ? (
                            <button type="button" className="tu-summary-reset" onClick={() => setEstadoFiltro('todos')}>
                              Ver todos
                            </button>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {modal?.type === 'editar' && (
        <EditarTurnoModal
          nurseId={modal.nurseId}
          dayIdx={modal.dayIdx}
          cell={schedule[modal.nurseId][modal.dayIdx]}
          days={days}
          nurses={nursesPrograma}
          onClose={handleCloseModal}
          onSave={handleSaveEditar}
        />
      )}
      {modal?.type === 'reasignar' && (
        <ReasignarTurnoModal
          nurseId={modal.nurseId}
          dayIdx={modal.dayIdx}
          cell={schedule[modal.nurseId][modal.dayIdx]}
          schedule={schedule}
          days={days}
          nurses={nursesPrograma}
          onClose={handleCloseModal}
          onConfirm={handleConfirmReasignar}
        />
      )}
      {modal?.type === 'asignar' && (
        <AsignarTurnoModal
          nurseId={modal.nurseId}
          dayIdx={modal.dayIdx}
          days={days}
          nurses={nursesPrograma}
          locked={modal.locked}
          reemplazaDescanso={modal.reemplazaDescanso}
          onClose={handleCloseModal}
          onAssign={handleAssign}
        />
      )}
      {wizardOpen && (
        <NuevaProgramacionWizard
          initialWeekStart={weekStart}
          initialArea={areaOperativa}
          onClose={handleCerrarWizard}
          onCreate={handleCrearProgramacion}
        />
      )}
      {revisionOpen && (
        <RevisionProgramacionModal
          resumen={resumen}
          onClose={() => setRevisionOpen(false)}
          onPublicar={handlePublicar}
          onVerEnCalendario={(filtro) => {
            setRevisionOpen(false);
            setEstadoFiltro(filtro);
          }}
        />
      )}
    </div>
  );
}
