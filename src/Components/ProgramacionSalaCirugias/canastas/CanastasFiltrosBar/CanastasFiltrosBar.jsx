'use client';

import { LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import './CanastasFiltrosBar.css';

const ESTADO_OPTIONS = [
  { value: 'pendientes', label: 'Pendientes de recepción' },
  { value: 'recibidas', label: 'Recibidas' },
  { value: 'todas', label: 'Todas' },
];

// Una sola fila (AGENTS.md "Barra de filtros de listado"), con el navegador
// de fecha al extremo izquierdo (encargo explícito, 2026-09-29 -- antes vivía
// en el header de la página junto al selector de sala): buscador, spacer,
// chips de estado de recepción. La sala del turno sigue en el header de la
// página, no acá -- es contexto de toda la pantalla, no un filtro de este
// listado. `onChange` recibe solo las claves que cambian, mismo criterio que
// VencidasFiltrosBar.
export default function CanastasFiltrosBar({
  filtros, conteo, onChange, fechaLabel, onDiaAnterior, onDiaSiguiente,
}) {
  const estadoOptions = ESTADO_OPTIONS.map((o) => ({ ...o, count: conteo[o.value] }));

  return (
    <div className="filter-bar">
      <div className="cnc-date-nav">
        <button type="button" className="psc-agenda-nav-btn" aria-label="Día anterior" onClick={onDiaAnterior}>
          <LuChevronLeft className="icon" aria-hidden="true" />
        </button>
        <span className="cnc-date-nav-label">{fechaLabel}</span>
        <button type="button" className="psc-agenda-nav-btn" aria-label="Día siguiente" onClick={onDiaSiguiente}>
          <LuChevronRight className="icon" aria-hidden="true" />
        </button>
      </div>
      <div className="search-field">
        <LuSearch className="icon" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar paciente o procedimiento"
          aria-label="Buscar paciente o procedimiento"
          value={filtros.busqueda}
          onChange={(e) => onChange({ busqueda: e.target.value })}
        />
      </div>
      <div className="filter-spacer" />
      <SegmentedFilterBar
        options={estadoOptions}
        value={filtros.estado}
        onChange={(estado) => onChange({ estado })}
        ariaLabel="Estado de recepción"
      />
    </div>
  );
}
