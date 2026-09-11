'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './TipoFacturaFilter.css';
import { LuChevronDown } from 'react-icons/lu';

// Filtro "Tipo Factura" de selección múltiple (encargo explícito, ver imagen
// de referencia) -- a diferencia de @/Components/FormSelect (una sola
// opción), acá el trigger porta un listado de checkboxes a document.body con
// position:fixed, mismo criterio que FormSelect.jsx (evita que el alto del
// listado sume al scroll de un contenedor con overflow), pero sin el patrón
// "listbox" de flechas/aria-activedescendant: cada opción es un
// <input type="checkbox"> real, así que Tab/click ya navegan y activan de
// forma nativa sin roving-tabindex.
//
// `value` es el array completo de valores seleccionados (no un sentinel
// "todas" como en FormSelect) -- el llamador decide qué significa vacío. En
// FacturaVistaClasica.jsx, tanto vacío como "todas las opciones marcadas"
// filtran igual (sin restricción), así que "Limpiar" (vacía el array) y
// "Todos" (marca todas) llegan al mismo resultado visible en la grilla, con
// el checkbox de cada uno mostrando su propio estado real.
export default function TipoFacturaFilter({
  id, value, onChange, options, ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) return undefined;
    function updateCoords() {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left, minWidth: rect.width });
    }
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !coords || !dropdownRef.current) return;
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const overflowRight = dropdownRect.right - (window.innerWidth - 8);
    if (overflowRight > 0.5) {
      setCoords((c) => (c ? { ...c, left: Math.max(8, c.left - overflowRight) } : c));
    }
  }, [open, coords]);

  useEffect(() => {
    if (!open) return undefined;
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

  function toggleOption(v) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  const label = (() => {
    if (value.length === 0 || value.length === options.length) return 'Todas';
    if (value.length === 1) return options.find((o) => o.value === value[0])?.label ?? 'Todas';
    return `${value.length} seleccionados`;
  })();

  return (
    <div className="tff-root" ref={rootRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={`tff-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className="tff-value">{label}</span>
        <LuChevronDown className={`icon tff-chev${open ? ' open' : ''}`} aria-hidden="true" />
      </button>

      {open && coords && createPortal(
        <div
          ref={dropdownRef}
          className="tff-dropdown"
          role="dialog"
          aria-label={ariaLabel}
          style={{ top: coords.top, left: coords.left, minWidth: coords.minWidth }}
        >
          <div className="tff-actions">
            <button type="button" className="tff-action-btn" onClick={() => onChange(options.map((o) => o.value))}>Todos</button>
            <button type="button" className="tff-action-btn" onClick={() => onChange([])}>Limpiar</button>
          </div>
          <ul className="tff-options">
            {options.map((o) => (
              <li key={o.value}>
                <label className="tff-option">
                  <input
                    type="checkbox"
                    checked={value.includes(o.value)}
                    onChange={() => toggleOption(o.value)}
                  />
                  {o.label}
                </label>
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
}
