'use client';

import { useEffect, useRef, useState } from 'react';
import './FormSelect.css';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

// Reemplaza el <select> nativo dentro de un .form-field (encargo explícito)
// por un dropdown propio — mismo patrón autocontenido que AreaSelector.jsx
// (estado local `open` + cierre por click-afuera/Escape), pero el trigger
// se dimensiona como un input de formulario (mismo alto/borde que
// .form-field input en shared.css) en vez de como un botón de header.
export default function FormSelect({
  id, value, onChange, options, placeholder, disabled = false,
}) {
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

  const selected = options.find((o) => o.value === value);

  function handleSelect(v) {
    setOpen(false);
    if (v !== value) onChange(v);
  }

  return (
    <div className="form-select" ref={rootRef}>
      <button
        type="button"
        id={id}
        className={`form-select-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={selected ? 'form-select-value' : 'form-select-placeholder'}>
          {selected ? selected.label : (placeholder ?? 'Selecciona una opción')}
        </span>
        <LuChevronDown className={`icon form-select-chev${open ? ' open' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <ul className="form-select-dropdown" role="listbox" aria-labelledby={id}>
          {options.map((o) => (
            <li key={o.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`form-select-option${o.value === value ? ' active' : ''}`}
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
