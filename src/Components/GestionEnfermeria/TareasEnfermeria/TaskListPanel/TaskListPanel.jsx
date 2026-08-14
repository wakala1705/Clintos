'use client';

import { useMemo, useState } from 'react';
import './TaskListPanel.css';
import TaskTable from './TaskTable/TaskTable';
import FilterDropdown from './FilterDropdown/FilterDropdown';
import {
  ESTADOS, PRIORIDADES, RESPONSABLES, TIPOS_TAREA, TURNOS, USUARIO_ACTUAL, fechaDeTarea,
} from '@/hooks/GestionEnfermeria/mockTareasData';
import { LuFilterX, LuSearch } from 'react-icons/lu';

const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'mis-tareas', label: 'Mis tareas' },
  { key: 'del-area', label: 'Del área' },
  { key: 'vencidas', label: 'Vencidas' },
  { key: 'completadas', label: 'Completadas' },
];

const FILTROS_INICIALES = {
  estado: 'todos', prioridad: 'todos', tipo: 'todos', responsable: 'todos', turno: 'todos', fecha: 'todos',
};

const OPCIONES_ESTADO = [{ value: 'todos', label: 'Estado' }, ...ESTADOS];
const OPCIONES_PRIORIDAD = [{ value: 'todos', label: 'Prioridad' }, ...PRIORIDADES];
const OPCIONES_TIPO = [{ value: 'todos', label: 'Tipo' }, ...TIPOS_TAREA];
const OPCIONES_RESPONSABLE = [
  { value: 'todos', label: 'Responsable' },
  ...RESPONSABLES.map((r) => ({ value: r, label: r })),
  { value: 'sin-asignar', label: 'Sin asignar' },
];
const OPCIONES_TURNO = [{ value: 'todos', label: 'Turno' }, ...TURNOS];
const OPCIONES_FECHA = [
  { value: 'todos', label: 'Fecha' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'manana', label: 'Mañana' },
];

// `areaSeleccionada` decide qué es "Del área" (encargo: la pestaña, no el
// selector "Área operativa" del header, que solo fija el contexto de
// trabajo actual — ver comentario en TareasEnfermeria.jsx). Mismo patrón
// que PatientsPanel.jsx: dueño de su propio estado de tab/filtros/búsqueda,
// deriva counts y lista filtrada de la prop `tareas` que recibe ya recortada
// por el filtro rápido de las tarjetas KPI (ver TareasEnfermeria.jsx).
export default function TaskListPanel({
  tareas, areaSeleccionada, selectedId, onSelect, onIniciar, onCompletar, onAsignarRapido, onReasignar, onReprogramar, onNoRealizada, onCancelar,
}) {
  const [tab, setTab] = useState('todas');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [query, setQuery] = useState('');

  function matchesTab(t, k) {
    if (k === 'mis-tareas') return t.responsable === USUARIO_ACTUAL;
    if (k === 'del-area') return t.areaOperativa === areaSeleccionada;
    if (k === 'vencidas') return t.estado === 'vencida';
    if (k === 'completadas') return t.estado === 'completada';
    return true;
  }

  const counts = useMemo(() => Object.fromEntries(
    TABS.map((tb) => [tb.key, tareas.filter((t) => matchesTab(t, tb.key)).length]),
  ), [tareas, areaSeleccionada]);

  function matchesFiltros(t) {
    if (filtros.estado !== 'todos' && t.estado !== filtros.estado) return false;
    if (filtros.prioridad !== 'todos' && t.prioridad !== filtros.prioridad) return false;
    if (filtros.tipo !== 'todos' && t.tipo !== filtros.tipo) return false;
    if (filtros.responsable !== 'todos') {
      if (filtros.responsable === 'sin-asignar' ? t.responsable : t.responsable !== filtros.responsable) return false;
    }
    if (filtros.turno !== 'todos' && t.turno !== filtros.turno) return false;
    if (filtros.fecha !== 'todos' && fechaDeTarea(t) !== filtros.fecha) return false;
    return true;
  }

  const tareasFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tareas.filter((t) => {
      if (!matchesTab(t, tab)) return false;
      if (!matchesFiltros(t)) return false;
      if (!q) return true;
      const pacienteMatch = t.paciente?.toLowerCase().includes(q);
      const camaMatch = t.cama?.toLowerCase().includes(q);
      return t.nombre.toLowerCase().includes(q) || !!pacienteMatch || !!camaMatch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareas, tab, filtros, query, areaSeleccionada]);

  const cantidadFiltrosActivos = Object.values(filtros).filter((v) => v !== 'todos').length + (query.trim() !== '' ? 1 : 0);
  const hayFiltrosActivos = cantidadFiltrosActivos > 0;

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES);
    setQuery('');
  }

  return (
    <section className="card task-list-card">
      <div className="task-list-tabs">
        <div className="chip-group segmented" role="tablist" aria-label="Ámbito de tareas">
          {TABS.map((tb) => (
            <button
              type="button"
              key={tb.key}
              role="tab"
              aria-selected={tab === tb.key}
              className={`chip-filter${tab === tb.key ? ' active' : ''}`}
              onClick={() => setTab(tb.key)}
            >
              {tb.label} <span className="count">({counts[tb.key]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-bar task-list-toolbar">
        <div className="search-field">
          <LuSearch className="icon" />
          <input
            type="text"
            placeholder="Buscar tarea, paciente o habitación..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar tarea, paciente o habitación"
          />
        </div>

        <div className="filter-cluster">
          <FilterDropdown label="Estado" options={OPCIONES_ESTADO} value={filtros.estado} onChange={(v) => setFiltros((f) => ({ ...f, estado: v }))} />
          <FilterDropdown label="Prioridad" options={OPCIONES_PRIORIDAD} value={filtros.prioridad} onChange={(v) => setFiltros((f) => ({ ...f, prioridad: v }))} />
          <FilterDropdown label="Tipo" options={OPCIONES_TIPO} value={filtros.tipo} onChange={(v) => setFiltros((f) => ({ ...f, tipo: v }))} />
          <FilterDropdown label="Responsable" options={OPCIONES_RESPONSABLE} value={filtros.responsable} onChange={(v) => setFiltros((f) => ({ ...f, responsable: v }))} />
          <FilterDropdown label="Turno" options={OPCIONES_TURNO} value={filtros.turno} onChange={(v) => setFiltros((f) => ({ ...f, turno: v }))} />
          <FilterDropdown label="Fecha" options={OPCIONES_FECHA} value={filtros.fecha} onChange={(v) => setFiltros((f) => ({ ...f, fecha: v }))} />
        </div>

        <div className="filter-spacer" />

        {hayFiltrosActivos && (
          <button type="button" className="btn-sm btn btn-secondary task-filtros-activos-btn" onClick={limpiarFiltros}>
            <LuFilterX className="icon" />
            Limpiar filtros
            <span className="badge-count">{cantidadFiltrosActivos}</span>
          </button>
        )}
      </div>

      <TaskTable
        tareas={tareasFiltradas}
        selectedId={selectedId}
        onSelect={onSelect}
        onIniciar={onIniciar}
        onCompletar={onCompletar}
        onAsignarRapido={onAsignarRapido}
        onReasignar={onReasignar}
        onReprogramar={onReprogramar}
        onNoRealizada={onNoRealizada}
        onCancelar={onCancelar}
      />
    </section>
  );
}
