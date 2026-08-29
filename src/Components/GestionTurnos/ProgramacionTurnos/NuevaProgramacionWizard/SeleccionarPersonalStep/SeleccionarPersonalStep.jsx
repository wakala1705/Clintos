'use client';

import { useState } from 'react';
import './SeleccionarPersonalStep.css';
import FilterDropdown from '@/Components/FilterDropdown/FilterDropdown';
import { AREA_TURNO_LABEL, NURSES } from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuSearch } from 'react-icons/lu';

const CARGO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'Enfermera profesional', label: 'Enfermera profesional' },
  { value: 'Enfermero profesional', label: 'Enfermero profesional' },
];

// Paso 2 del wizard — lista de personal seleccionable con checkbox. Solo se
// ofrece personal elegible para el área elegida en el paso 1 (encargo
// sección 3: "mostrar únicamente personal elegible para el área
// seleccionada") — por eso ya no hay un filtro de Área acá (sería
// contradictorio dejar ver/tildar personal de otra área): el área ya quedó
// fijada un paso atrás y esta lista es su universo completo. Cargo +
// búsqueda siguen siendo filtros locales (solo acotan qué fila se ve, no
// persisten en el form del wizard). Lo que sí persiste es `selectedIds`,
// controlado por el padre (NuevaProgramacionWizard) — cambiar de filtro o
// volver de este paso nunca pierde la selección ya hecha. Fila
// avatar+nombre+cargo reutiliza `.npw-nurse-row` (definida en
// NuevaProgramacionWizard.css, ver ese archivo para el porqué de vivir ahí
// en vez de acá — la reusa también ConfirmarStep).
export default function SeleccionarPersonalStep({
  area, selectedIds, onToggle, onToggleAll, onClearAll,
}) {
  const [query, setQuery] = useState('');
  const [cargoFiltro, setCargoFiltro] = useState('todos');

  const q = query.trim().toLowerCase();
  const elegibles = NURSES.filter((n) => n.area === area);
  const visibles = elegibles.filter((n) => {
    if (cargoFiltro !== 'todos' && n.cargo !== cargoFiltro) return false;
    if (q && !n.nombre.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="sps-step">
      <h4 className="npw-step-title">Selecciona el personal</h4>
      <p className="npw-step-hint">
        Personal elegible de <strong>{AREA_TURNO_LABEL[area]}</strong> para esta programación.
      </p>

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
        <FilterDropdown label="Cargo" options={CARGO_OPTIONS} value={cargoFiltro} onChange={setCargoFiltro} />
        <div className="sps-actions">
          <button type="button" className="sps-action-link" onClick={() => onToggleAll(visibles, true)}>Seleccionar todas</button>
          <button type="button" className="sps-action-link" onClick={onClearAll}>Limpiar selección</button>
        </div>
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
