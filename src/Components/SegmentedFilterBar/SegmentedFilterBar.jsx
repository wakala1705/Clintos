'use client';

// Franja de chips segmentados clickeable — extraído de PatientsPanel.jsx
// (el "Todos (14) / Con pendientes (6) / Prolongados (3)" de Panel General),
// que hasta ahora repetía este mismo `.map()` inline; con Bed Board como
// segundo consumidor pasa a vivir acá (ver AGENTS.md "App-wide components").
// Solo consume las clases ya compartidas por feature `.chip-group.segmented`/
// `.chip-filter` (mismo criterio que FilterDropdown.jsx: sin CSS propio).
//
// `resetValue` es opcional: sin él, este es un tablist de selección única de
// siempre-una-opción-activa (igual que PatientsPanel, que ya incluye su
// propio segmento "Todos"). Con él, volver a hacer click en el segmento ya
// activo dispara `onChange(resetValue)` en vez de no hacer nada — lo usa
// Bed Board, cuyo widget de 3 segmentos (Limpieza/Mantenim./Bloqueadas) no
// tiene un segmento propio de "sin filtro".
export default function SegmentedFilterBar({
  options, value, onChange, ariaLabel, resetValue,
}) {
  function handleClick(optionValue) {
    if (resetValue !== undefined && value === optionValue) {
      onChange(resetValue);
    } else {
      onChange(optionValue);
    }
  }

  return (
    <div className="chip-group segmented" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={`chip-filter${value === o.value ? ' active' : ''}`}
          onClick={() => handleClick(o.value)}
        >
          {o.label} <span className="count">({o.count})</span>
        </button>
      ))}
    </div>
  );
}
