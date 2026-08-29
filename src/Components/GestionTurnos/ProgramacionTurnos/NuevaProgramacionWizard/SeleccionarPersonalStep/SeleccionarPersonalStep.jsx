'use client';

import { useEffect, useRef, useState } from 'react';
import './SeleccionarPersonalStep.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { AREA_TURNO_LABEL, NURSES } from '@/hooks/GestionTurnos/mockProgramacionData';
import { CARGO_OPTIONS } from '@/hooks/GestionTurnos/mockEnfermerasData';
import { LuSearch } from 'react-icons/lu';

// Paso 2 del wizard — lista de personal seleccionable con checkbox. Solo se
// ofrece personal elegible para el área elegida en el paso 1 (encargo
// sección 3: "mostrar únicamente personal elegible para el área
// seleccionada") — por eso ya no hay un filtro de Área acá (sería
// contradictorio dejar ver/tildar personal de otra área): el área ya quedó
// fijada un paso atrás y esta lista es su universo completo. Cargo +
// búsqueda siguen siendo filtros locales (solo acotan qué fila se ve, no
// persisten en el form del wizard). Lo que sí persiste es `selectedIds`,
// controlado por el padre (NuevaProgramacionWizard) — cambiar de filtro o
// volver de este paso nunca pierde la selección ya hecha.
export default function SeleccionarPersonalStep({
  area, selectedIds, onToggle, onToggleAll,
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

  // Checkbox "seleccionar todas" del header de tabla — reemplaza los links
  // "Seleccionar todas"/"Limpiar selección" (encargo). Refleja y opera solo
  // sobre `visibles` (mismo scope que tenía "Seleccionar todas": no toca
  // personal oculto por el filtro de cargo/búsqueda). indeterminate cuando
  // hay selección parcial; un click ahí limpia en vez de completar — evita
  // que el usuario necesite dos clicks para vaciar una selección parcial.
  const todasVisiblesSeleccionadas = visibles.length > 0 && visibles.every((n) => selectedIds.includes(n.id));
  const algunaVisibleSeleccionada = visibles.some((n) => selectedIds.includes(n.id));
  const headerCheckboxRef = useRef(null);
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = algunaVisibleSeleccionada && !todasVisiblesSeleccionadas;
    }
  }, [algunaVisibleSeleccionada, todasVisiblesSeleccionadas]);
  function handleToggleTodasVisibles() {
    onToggleAll(visibles, !todasVisiblesSeleccionadas);
  }

  return (
    <div className="sps-step">
      <h4 className="npw-step-title">Selecciona el personal</h4>
      <p className="npw-step-hint">
        Personal elegible de <strong>{AREA_TURNO_LABEL[area]}</strong> para esta programación.
      </p>

      <div className="sps-count">{selectedIds.length} enfermeras seleccionadas</div>

      <div className="sps-block">
        <div className="sps-toolbar">
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
          <div className="sps-cargo-select">
            <FormSelect id="sps-cargo" value={cargoFiltro} onChange={setCargoFiltro} options={CARGO_OPTIONS} />
          </div>
        </div>

        {visibles.length === 0 ? (
          <div className="ct-empty-cell">No se encontraron enfermeras con estos filtros.</div>
        ) : (
          <div className="sps-list">
            <table className="npw-table">
              <thead>
                <tr>
                  <th className="sps-col-check">
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={todasVisiblesSeleccionadas}
                      onChange={handleToggleTodasVisibles}
                      aria-label="Seleccionar todo el personal visible"
                    />
                  </th>
                  <th>Nombre</th>
                  <th>Cargo</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((n) => (
                  <tr key={n.id} className={selectedIds.includes(n.id) ? 'selected' : ''} onClick={() => onToggle(n.id)}>
                    <td className="sps-col-check">
                      <input type="checkbox" checked={selectedIds.includes(n.id)} onChange={() => onToggle(n.id)} onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td>
                      <span className="npw-nurse-name-cell">
                        <span className="npw-nurse-avatar" aria-hidden="true">{n.iniciales}</span>
                        <span className="npw-nurse-name">{n.nombre}</span>
                      </span>
                    </td>
                    <td className="npw-nurse-cargo">{n.cargo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
