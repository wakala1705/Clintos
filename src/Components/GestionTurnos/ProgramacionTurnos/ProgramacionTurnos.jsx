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
import {
  AREAS_TURNOS, NURSES, SCHEDULE, SEMANA_ANCLA, addDias, diasDeSemana, rangoSemanaLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import {
  LuCalendarRange, LuChevronLeft, LuChevronRight, LuClipboardCheck, LuPlus, LuSearch, LuTriangleAlert, LuUserRoundX, LuUsers,
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
// GestionTurnosSidebar) — programación semanal enfermera x día (encargo
// explícito, ver mockProgramacionData.js). Vivía antes en Gestión de
// Enfermería → Turnos (`/gestion-enfermeria/turnos`); se mudó acá completa
// (encargo: "pasemos la pantalla de turnos a la ruta de planificación/
// programación") — el ítem "Turnos" ya se quitó del sidebar de Gestión de
// Enfermería (ver GestionEnfermeriaSidebar.jsx), esta es ahora su única
// entrada. "Tipo de turno"/"Estado" filtran a nivel de ENFERMERA (fila
// completa), no de celda individual: ocultar solo algunas celdas de una fila
// rompería la lectura semanal de esa persona, así que el criterio es "¿esta
// enfermera tiene ALGUNA celda que matchea?" — misma pregunta que un
// coordinador se haría ("¿quién trabaja de noche esta semana?", "¿quién
// tiene algo sin asignar?").
//
// Estado de interacción de celda (encargo explícito, ver TurnosCalendar.jsx
// y su comentario de progressive disclosure):
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
  // Copia local mutable del mock (ver los handlers de mutación más abajo) —
  // nunca se muta SCHEDULE directamente, o la próxima vez que se monte esta
  // pantalla arrancaría con los cambios de la sesión anterior todavía
  // aplicados.
  const [schedule, setSchedule] = useState(SCHEDULE);
  const [selectedCell, setSelectedCell] = useState(null);
  const [modal, setModal] = useState(null);

  const days = useMemo(() => diasDeSemana(weekStart), [weekStart]);
  const rangeLabel = useMemo(() => rangoSemanaLabel(weekStart), [weekStart]);

  const nursesArea = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NURSES.filter((n) => {
      if (areaOperativa !== 'todas' && n.area !== areaOperativa) return false;
      if (q && !n.nombre.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [areaOperativa, query]);

  // Enfermeras que de verdad se pintan en la grilla — además de área/
  // búsqueda, aplica Tipo de turno/Estado (incluido el filtro que dispara el
  // footer al hacer click en "sin asignar"/"conflicto", ver
  // handleFiltrarResumen).
  const nurses = useMemo(() => nursesArea.filter((n) => {
    const celdas = schedule[n.id];
    if (tipoFiltro !== 'todos' && !celdas.some((c) => c.estado === 'turno' && c.tipo === tipoFiltro)) return false;
    if (estadoFiltro === 'programado' && !celdas.some((c) => c.estado === 'turno')) return false;
    if (estadoFiltro === 'sin-asignar' && !celdas.some((c) => c.estado === 'vacio')) return false;
    if (estadoFiltro === 'con-conflicto' && !celdas.some((c) => c.conflicto)) return false;
    return true;
  }), [nursesArea, tipoFiltro, estadoFiltro, schedule]);

  // Franja de métricas compactas (encargo: "sin convertirlas en grandes KPI
  // cards") — se derivan de `nursesArea` (área + búsqueda), NUNCA de
  // `nurses`: si dependieran del filtro Estado que el propio footer dispara,
  // hacer click en "2 sin asignar" reduciría la grilla a esas enfermeras y
  // el conteo de "sin asignar" del footer se recalcularía sobre ese
  // subconjunto — perdiendo de vista el total apenas se usa el filtro que
  // el mismo footer ofrece.
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
    setSchedule((prev) => ({
      ...prev,
      [nurseId]: prev[nurseId].map((c, i) => (i === dayIdx ? { estado: 'vacio' } : c)),
    }));
    setSelectedCell(null);
    window.ncToast?.(`Turno de ${nombreDe(nurseId)} eliminado.`);
  }

  function handleResolverConflicto(nurseId, dayIdx) {
    setSchedule((prev) => ({
      ...prev,
      [nurseId]: prev[nurseId].map((c, i) => {
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
    setSchedule((prev) => {
      const moviendo = updates.nurseId !== originalNurseId || updates.dayIdx !== originalDayIdx;
      const next = moviendo
        ? { ...prev, [originalNurseId]: prev[originalNurseId].map((c, i) => (i === originalDayIdx ? { estado: 'vacio' } : c)) }
        : { ...prev };
      const destino = [...next[updates.nurseId]];
      destino[updates.dayIdx] = { estado: 'turno', tipo: updates.tipo, horario: updates.horario };
      next[updates.nurseId] = destino;
      return next;
    });
    setModal(null);
    window.ncToast?.('Turno actualizado.');
  }

  function handleConfirmReasignar(originalNurseId, dayIdx, nuevaEnfermeraId) {
    setSchedule((prev) => {
      const original = prev[originalNurseId][dayIdx];
      return {
        ...prev,
        [originalNurseId]: prev[originalNurseId].map((c, i) => (i === dayIdx ? { estado: 'vacio' } : c)),
        [nuevaEnfermeraId]: prev[nuevaEnfermeraId].map((c, i) => (
          i === dayIdx ? { estado: 'turno', tipo: original.tipo, horario: original.horario } : c
        )),
      };
    });
    setModal(null);
    window.ncToast?.(`Turno reasignado a ${nombreDe(nuevaEnfermeraId)}.`);
  }

  function handleAssign({
    nurseId, dayIdx, tipo, horario,
  }) {
    setSchedule((prev) => ({
      ...prev,
      [nurseId]: prev[nurseId].map((c, i) => (i === dayIdx ? { estado: 'turno', tipo, horario } : c)),
    }));
    setModal(null);
    window.ncToast?.(`Turno asignado a ${nombreDe(nurseId)}.`);
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
                <h1>Programación de turnos</h1>
                <p>Gestiona la asignación y cobertura del personal de enfermería.</p>
              </div>
              <div className="tu-header-actions">
                <AreaSelector label="Área o servicio" options={AREAS_TURNOS} value={areaOperativa} onChange={setAreaOperativa} />
                <button type="button" className="date-picker-btn" onClick={() => window.ncToast?.('Vista mensual en desarrollo.')}>
                  <LuCalendarRange className="icon" />
                  Semana
                </button>
                <Button icon={LuPlus} onClick={handleOpenAsignarHeader}>Asignar turno</Button>
              </div>
            </div>

            <div className="card tu-calendar-card">
              <div className="tu-calendar-header">
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
                  <FilterDropdown label="Tipo de turno" options={TIPO_OPTIONS} value={tipoFiltro} onChange={setTipoFiltro} />
                  <FilterDropdown label="Estado" options={ESTADO_OPTIONS} value={estadoFiltro} onChange={setEstadoFiltro} />
                  <div className="search-field">
                    <LuSearch className="icon" />
                    <input
                      type="text"
                      placeholder="Buscar enfermera..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Buscar enfermera"
                    />
                  </div>
                </div>
              </div>

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
          onClose={handleCloseModal}
          onConfirm={handleConfirmReasignar}
        />
      )}
      {modal?.type === 'asignar' && (
        <AsignarTurnoModal
          nurseId={modal.nurseId}
          dayIdx={modal.dayIdx}
          days={days}
          locked={modal.locked}
          reemplazaDescanso={modal.reemplazaDescanso}
          onClose={handleCloseModal}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
