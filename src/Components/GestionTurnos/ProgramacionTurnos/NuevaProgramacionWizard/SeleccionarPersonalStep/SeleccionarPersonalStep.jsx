'use client';

import { useState } from 'react';
import './SeleccionarPersonalStep.css';
import FilterDropdown from '@/Components/FilterDropdown/FilterDropdown';
import { AREAS_TURNOS, NURSES } from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuSearch } from 'react-icons/lu';

// FilterDropdown espera 'todos' como valor "sin filtro" (hardcoded ahí para
// Tipo de turno/Estado, ver ProgramacionTurnos.jsx) — AREAS_TURNOS usa
// 'todas' para ese mismo rol ("todas las áreas"), así que acá se arma una
// lista propia con el mismo primer valor pero sentinel 'todos', para que el
// estado "activo" del filtro se calcule bien sin tocar FilterDropdown.jsx.
const AREA_OPTIONS = [
  { value: 'todos', label: 'Todas las áreas' },
  ...AREAS_TURNOS.filter((a) => a.value !== 'todas'),
];
const CARGO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'Enfermera profesional', label: 'Enfermera profesional' },
  { value: 'Enfermero profesional', label: 'Enfermero profesional' },
];

// Paso 2 del wizard — lista de personal seleccionable con checkbox, filtros
// locales de Área/Cargo + búsqueda (solo acotan qué fila se ve, no
// persisten en el form del wizard). Lo que sí persiste es `selectedIds`,
// controlado por el padre (NuevaProgramacionWizard). Fila avatar+nombre+
// cargo reutiliza `.npw-nurse-row` (definida en NuevaProgramacionWizard.css,
// ver ese archivo para el porqué de vivir ahí en vez de acá — la reusa
// también ConfirmarStep).
export default function SeleccionarPersonalStep({ selectedIds, onToggle, onToggleAll }) {
  const [query, setQuery] = useState('');
  const [areaFiltro, setAreaFiltro] = useState('todos');
  const [cargoFiltro, setCargoFiltro] = useState('todos');

  const q = query.trim().toLowerCase();
  const visibles = NURSES.filter((n) => {
    if (areaFiltro !== 'todos' && n.area !== areaFiltro) return false;
    if (cargoFiltro !== 'todos' && n.cargo !== cargoFiltro) return false;
    if (q && !n.nombre.toLowerCase().includes(q)) return false;
    return true;
  });

  const todasVisiblesSeleccionadas = visibles.length > 0 && visibles.every((n) => selectedIds.includes(n.id));

  return (
    <div className="sps-step">
      <h4 className="npw-step-title">Selecciona el personal</h4>
      <p className="npw-step-hint">Selecciona las enfermeras que participarán en esta programación.</p>

      <div className="sps-count">{selectedIds.length} enfermeras seleccionadas</div>

      <div className="sps-toolbar">
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
        <FilterDropdown label="Área" options={AREA_OPTIONS} value={areaFiltro} onChange={setAreaFiltro} />
        <FilterDropdown label="Cargo" options={CARGO_OPTIONS} value={cargoFiltro} onChange={setCargoFiltro} />
        <button type="button" className="sps-select-all" onClick={() => onToggleAll(visibles, !todasVisiblesSeleccionadas)}>
          {todasVisiblesSeleccionadas ? 'Quitar todos' : 'Seleccionar todos'}
        </button>
      </div>

      <div className="sps-list">
        {visibles.length === 0 ? (
          <div className="ct-empty-cell">No se encontraron enfermeras con estos filtros.</div>
        ) : visibles.map((n) => (
          <label key={n.id} className="npw-nurse-row">
            <input type="checkbox" checked={selectedIds.includes(n.id)} onChange={() => onToggle(n.id)} />
            <span className="npw-nurse-avatar" aria-hidden="true">{n.iniciales}</span>
            <span className="npw-nurse-info">
              <span className="npw-nurse-name">{n.nombre}</span>
              <span className="npw-nurse-cargo">{n.cargo}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
