'use client';

import ChipFilter from '@/Components/ChipFilter/ChipFilter';

// Franja de chips segmentados clickeable — extraído de PatientsPanel.jsx
// (el "Todos (14) / Con pendientes (6) / Prolongados (3)" de Panel General),
// que hasta ahora repetía este mismo `.map()` inline; con Bed Board como
// segundo consumidor pasa a vivir acá (ver AGENTS.md "App-wide components").
// El contenedor `.chip-group.segmented` sigue siendo la clase compartida por
// feature; cada segmento es <ChipFilter variant="segmented"> (ver AGENTS.md
// "Chips de filtro").
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
        <ChipFilter
          key={o.value}
          variant="segmented"
          role="tab"
          aria-selected={value === o.value}
          active={value === o.value}
          count={o.count}
          onClick={() => handleClick(o.value)}
        >
          {o.label}
        </ChipFilter>
      ))}
    </div>
  );
}
