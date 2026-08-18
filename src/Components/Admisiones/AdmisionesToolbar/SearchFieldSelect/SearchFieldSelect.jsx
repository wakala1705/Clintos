'use client';

import { useEffect, useRef, useState } from 'react';
import './SearchFieldSelect.css';
import { LuChevronDown } from 'react-icons/lu';

// Reemplaza el <select> nativo del campo "Buscar por" (su popup de opciones
// no es estilable — queda con la apariencia del SO). Mismo patrón
// autocontenido de apertura/cierre (click-afuera/Escape) que RowActionsMenu
// (ver AdmisionesTable/RowActionsMenu) en vez del SelectorModal de
// AgendaToolbar, que es de más peso del que necesitan estas 3 opciones.
export default function SearchFieldSelect({ options, value, onChange, label }) {
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

  const current = options.find((o) => o.value === value);

  function handleSelect(v) {
    setOpen(false);
    onChange(v);
  }

  return (
    <div className="adm-search-select" ref={rootRef}>
      <button
        type="button"
        className="adm-search-select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        <span>{current?.label}</span>
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="adm-search-select-dropdown" role="listbox">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={`adm-search-select-item${o.value === value ? ' selected' : ''}`}
              onClick={() => handleSelect(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
