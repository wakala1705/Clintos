'use client';

import { useEffect, useRef, useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';

// Un único filtro-popover reutilizado por los 6 filtros de la barra de
// herramientas (Estado/Prioridad/Tipo/Responsable/Turno/Fecha) — mismo
// trigger+popover que .filters-more-btn/.filter-popover (shared.css, ya
// usado por Medicamentos/Órdenes/Pedidos), con las opciones como
// .chip-group de selección única. `value === 'todos'` es el estado inerte
// (sin filtrar) de cada dimensión, mismo criterio que "Todo el área" en
// AreaSelector.jsx.
export default function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
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

  const active = value !== 'todos';
  const selected = options.find((o) => o.value === value);

  return (
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className={`filters-more-btn${active ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {active ? selected.label : label}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-popover open" role="listbox" aria-label={label}>
          <div className="fp-section">
            <div className="fp-section-title">{label}</div>
            <div className="chip-group">
              {options.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  role="option"
                  aria-selected={o.value === value}
                  className={`chip-filter${o.value === value ? ' active' : ''}`}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
