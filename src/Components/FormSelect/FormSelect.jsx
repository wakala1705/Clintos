'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './FormSelect.css';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

// Reemplaza el <select> nativo dentro de un .form-field (encargo explícito)
// por un dropdown propio — mismo patrón autocontenido que AreaSelector.jsx
// (estado local `open` + cierre por click-afuera/Escape), pero el trigger
// se dimensiona como un input de formulario (mismo alto/borde que
// .form-field input en shared.css) en vez de como un botón de header.
//
// El listado se porta a document.body con position:fixed (en vez de
// position:absolute dentro de .form-select) porque este componente se usa
// dentro de .modal-body (overflow-y:auto) — si quedara absoluto ahí, su alto
// suma al scrollHeight del modal y genera un scroll que no debería existir.
export default function FormSelect({
  id, value, onChange, options, placeholder, disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) return;
    function updateCoords() {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      const insideTrigger = rootRef.current && rootRef.current.contains(e.target);
      const insideDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!insideTrigger && !insideDropdown) setOpen(false);
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
        ref={triggerRef}
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

      {open && coords && createPortal(
        <ul
          ref={dropdownRef}
          className="form-select-dropdown"
          role="listbox"
          aria-labelledby={id}
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
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
        </ul>,
        document.body,
      )}
    </div>
  );
}
