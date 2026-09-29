'use client';

import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuChevronDown } from 'react-icons/lu';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';
import './FilterListDropdown.css';

// Filtro de selección única con las opciones en lista, no en chips (encargo
// explícito -- a diferencia de @/Components/FilterDropdown, que arma su
// popover con un chip-group de ChipFilter, acá el contenido usa el listbox
// de @/Components/DropdownPanel, mismo patrón ítem+✓ que VistaModoMenu.jsx
// de esta misma feature). Mismo trigger .filters-more-btn/.filter-popover-wrap
// que FilterDropdown, sin el modificador `.active` (encargo explícito): ahí
// tiene sentido porque "todos" es el estado neutro real (sin filtrar) de esa
// dimensión, pero acá siempre hay una opción elegida (el tab por defecto es
// "Sin Confirmar", no "Todos") -- resaltar el trigger habría quedado
// permanentemente "activo" incluso sin que el usuario tocara nada, distinto
// de cómo se usa en el resto de los droplist del proyecto.
export default function FilterListDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  function handleSelect(v) {
    setOpen(false);
    if (v !== value) onChange(v);
  }

  return (
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className="filters-more-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected?.label ?? label}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className={`fld-dropdown ${panel.panel}`} role="listbox" aria-label={label}>
          <div className={panel.groupLabel}>{label}</div>
          {options.map((o) => (
            <button
              type="button"
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={[panel.item, o.value === value && panel.selected].filter(Boolean).join(' ')}
              onClick={() => handleSelect(o.value)}
            >
              {o.label}
              {o.value === value && <LuCheck className={panel.check} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
