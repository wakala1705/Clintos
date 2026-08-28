'use client';

import { useMemo, useState } from 'react';
import './AlertListPanel.css';
import AlertTable from './AlertTable/AlertTable';
import AlertsPagination from './AlertsPagination/AlertsPagination';
import DateRangeFilter from './DateRangeFilter/DateRangeFilter';
import FilterDropdown from '@/Components/FilterDropdown/FilterDropdown';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import {
  AREAS_ALERTA, FECHA_ALERTAS, PRIORIDADES_ALERTA, TIPOS_ALERTA,
} from '@/hooks/GestionEnfermeria/mockAlertasData';
import { LuFilterX, LuSearch } from 'react-icons/lu';

export const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'criticas', label: 'Críticas' },
  { key: 'vencidas', label: 'Vencidas' },
  { key: 'resueltas', label: 'Resueltas' },
  { key: 'pospuestas', label: 'Pospuestas' },
];

// Sin filtro "Estado" (encargo explícito): es 100% redundante con los tabs
// de arriba (Todas/Pendientes/Vencidas/Resueltas/Pospuestas ya cubren las 4
// estados posibles) — a diferencia de "Prioridad", que sigue aportando algo
// que ningún tab cubre (Alta/Media/Baja, solo "Críticas" tiene tab propio).
const FILTROS_INICIALES = { tipo: 'todos', area: 'todos', prioridad: 'todos' };

const OPCIONES_TIPO = [{ value: 'todos', label: 'Tipo de alerta' }, ...TIPOS_ALERTA];
const OPCIONES_AREA = [{ value: 'todos', label: 'Área' }, ...AREAS_ALERTA];
const OPCIONES_PRIORIDAD = [{ value: 'todos', label: 'Prioridad' }, ...PRIORIDADES_ALERTA];

function matchesTab(a, k) {
  if (k === 'pendientes') return a.estado === 'pendiente';
  if (k === 'criticas') return a.prioridad === 'critica' && a.estado !== 'resuelta';
  if (k === 'vencidas') return a.estado === 'vencida';
  if (k === 'resueltas') return a.estado === 'resuelta';
  if (k === 'pospuestas') return a.estado === 'pospuesta';
  return a.estado !== 'resuelta'; // 'todas' = todo lo activo, el historial de resueltas es otra pestaña
}

// Dueño de su propio estado de tab/filtros/búsqueda/orden/paginación —
// mismo patrón que TaskListPanel.jsx (Tareas de enfermería): recibe la lista
// completa y deriva todo lo demás internamente. `initialTab` (opcional)
// siembra la pestaña al entrar desde un deep-link del sidebar (ver
// AlertasEnfermeria.jsx/page.jsx) — después de montado, el tab es puro
// estado local, no se vuelve a sincronizar con la URL.
export default function AlertListPanel({ alertas, initialTab = 'todas', selectedId, onSelect, onAccionPrimaria }) {
  const [tab, setTab] = useState(TABS.some((t) => t.key === initialTab) ? initialTab : 'todas');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [query, setQuery] = useState('');
  const [rangoFechas, setRangoFechas] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const counts = useMemo(() => Object.fromEntries(
    TABS.map((tb) => [tb.key, alertas.filter((a) => matchesTab(a, tb.key)).length]),
  ), [alertas]);

  function matchesFiltros(a) {
    if (filtros.tipo !== 'todos' && a.tipo !== filtros.tipo) return false;
    if (filtros.area !== 'todos' && a.area !== filtros.area) return false;
    if (filtros.prioridad !== 'todos' && a.prioridad !== filtros.prioridad) return false;
    if (rangoFechas?.desde && FECHA_ALERTAS < rangoFechas.desde) return false;
    if (rangoFechas?.hasta && FECHA_ALERTAS > rangoFechas.hasta) return false;
    return true;
  }

  const alertasFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alertas.filter((a) => {
      if (!matchesTab(a, tab)) return false;
      if (!matchesFiltros(a)) return false;
      if (!q) return true;
      return a.titulo.toLowerCase().includes(q)
        || a.detalle?.toLowerCase().includes(q)
        || a.paciente?.toLowerCase().includes(q)
        || a.cama?.toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertas, tab, filtros, query, rangoFechas]);

  const cantidadFiltrosActivos = Object.values(filtros).filter((v) => v !== 'todos').length
    + (query.trim() !== '' ? 1 : 0) + (rangoFechas ? 1 : 0);
  const hayFiltrosActivos = cantidadFiltrosActivos > 0;

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES);
    setQuery('');
    setRangoFechas(null);
  }

  function cambiarTab(k) {
    setTab(k);
    setPage(1);
  }

  const totalPaginas = Math.max(1, Math.ceil(alertasFiltradas.length / pageSize));
  const paginaSegura = Math.min(page, totalPaginas);
  const alertasPagina = alertasFiltradas.slice((paginaSegura - 1) * pageSize, paginaSegura * pageSize);

  const opcionesTab = TABS.map((tb) => ({ value: tb.key, label: tb.label, count: counts[tb.key] }));

  return (
    <section className="card alert-list-card">
      {/* Una sola fila (buscador a la izquierda, filtros a la derecha) —
          mismo patrón que .pg-patients-toolbar en PatientsPanel.jsx, ver
          AGENTS.md "Barra de filtros de listado". Antes eran 2 bloques
          separados (tabs arriba, filtros abajo); se unificaron para no
          divergir del resto del proyecto. */}
      <div className="filter-bar alert-list-toolbar">
        <div className="search-field">
          <LuSearch className="icon" />
          <input
            type="text"
            placeholder="Buscar alerta, paciente, cama..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            aria-label="Buscar alerta, paciente, cama o medicamento"
          />
        </div>

        <div className="filter-spacer" />

        <SegmentedFilterBar options={opcionesTab} value={tab} onChange={cambiarTab} ariaLabel="Estado de las alertas" />

        <div className="filter-cluster">
          <FilterDropdown label="Tipo de alerta" options={OPCIONES_TIPO} value={filtros.tipo} onChange={(v) => { setFiltros((f) => ({ ...f, tipo: v })); setPage(1); }} />
          <FilterDropdown label="Área" options={OPCIONES_AREA} value={filtros.area} onChange={(v) => { setFiltros((f) => ({ ...f, area: v })); setPage(1); }} />
          <FilterDropdown label="Prioridad" options={OPCIONES_PRIORIDAD} value={filtros.prioridad} onChange={(v) => { setFiltros((f) => ({ ...f, prioridad: v })); setPage(1); }} />
          <DateRangeFilter value={rangoFechas} onChange={(v) => { setRangoFechas(v); setPage(1); }} />
        </div>

        {hayFiltrosActivos && (
          <button type="button" className="btn-sm btn btn-secondary alert-filtros-activos-btn" onClick={limpiarFiltros}>
            <LuFilterX className="icon" />
            Limpiar filtros
            <span className="badge-count">{cantidadFiltrosActivos}</span>
          </button>
        )}
      </div>

      <AlertTable
        alertas={alertasPagina}
        selectedId={selectedId}
        onSelect={onSelect}
        onAccionPrimaria={onAccionPrimaria}
      />

      <AlertsPagination
        page={paginaSegura}
        pageSize={pageSize}
        total={alertasFiltradas.length}
        onChangePage={setPage}
        onChangePageSize={(n) => { setPageSize(n); setPage(1); }}
      />
    </section>
  );
}
