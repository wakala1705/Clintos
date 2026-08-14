'use client';

import { useEffect, useRef, useState } from 'react';
import './AreaSelector.css';
import { LuCheck, LuChevronDown, LuMapPin } from 'react-icons/lu';

// Reemplaza el <select> nativo de "Área operativa" (encargo explícito) por
// un dropdown propio — mismo patrón autocontenido que RowActionsMenu.jsx
// (estado local `open` + cierre por click-afuera/Escape) en vez del
// <select> del sistema operativo, para que el trigger se lea igual que el
// resto de botones del header (mismo .btn/.btn-secondary que "Tareas", ver
// AreaSelector.css) y el desplegable siga el mismo look que
// RowActionsMenu/ViewSettingsMenu. `value`/`onChange` controlados desde
// PanelGeneral.jsx — este componente no guarda su propia copia del área
// elegida, igual que lo haría un <select> controlado.
export default function AreaSelector({ options, value, onChange }) {
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

  const selected = options.find((o) => o.value === value) ?? options[0];

  function handleSelect(v) {
    setOpen(false);
    if (v !== value) onChange(v);
  }

  return (
    <div className="pg-area-select" ref={rootRef}>
      <button
        type="button"
        className="btn btn-secondary pg-area-select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <LuMapPin className="icon" aria-hidden="true" />
        {selected.label}
        <LuChevronDown className={`icon pg-area-select-chev${open ? ' open' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <ul className="pg-area-select-dropdown" role="listbox" aria-label="Área operativa">
          {options.map((o) => (
            <li key={o.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`pg-area-select-option${o.value === value ? ' active' : ''}`}
                onClick={() => handleSelect(o.value)}
              >
                {o.label}
                {o.value === value && <LuCheck className="icon" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
