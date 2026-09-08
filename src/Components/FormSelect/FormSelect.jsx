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
//
// Navegación por teclado (hallazgo de auditoría WCAG 2.1 AA, 2.1.2/2.4.3/
// 4.1.2, 2026-09-08): antes solo se podía abrir con clic/Enter y no había
// forma de moverse entre opciones con flechas -- como el listado vive
// portado al final de `document.body`, Tab desde el trigger tampoco
// aterrizaba en la primera opción (saltaba al siguiente campo del
// formulario), así que en la práctica un usuario de teclado no podía elegir
// una opción distinta a la ya seleccionada. Se resuelve con el patrón
// "listbox popup" de WAI-ARIA APG: el foco del DOM nunca sale del botón
// disparador -- las flechas mueven `activeIndex` (opción "resaltada", no
// necesariamente seleccionada) y el trigger la anuncia vía
// `aria-activedescendant`; Enter/Espacio confirman la resaltada sin haber
// tocado Tab en ningún momento. Por eso las opciones llevan `tabIndex={-1}`
// (siguen siendo clicables con mouse, pero ya no son su propia parada de
// Tab -- ver AGENTS.md "Selects de formulario" para el resto del contrato).
// `required` (opcional): agrega el mismo resaltado ámbar "obligatorio y
// vacío" que .form-field input/textarea:required:placeholder-shown ya tiene
// en otras features (PlantillaCrecimt2.css, NuevaCitaFlow.css) — un
// <button> no tiene estado :required/:placeholder-shown nativo, así que acá
// se simula con un data-attribute que la CSS del feature dueño del formulario
// lee (gateado por el mismo data-required-highlight en <html>, ver
// ConfigModal.jsx). Opt-in: sin este prop no cambia nada para los demás
// consumidores de FormSelect.
// `ariaLabel` (opcional): nombre accesible del trigger para el caso sin
// <label htmlFor> visible en pantalla (ver FiltrosBar.jsx en Programación
// sala de cirugías) — sin esto el botón solo se anuncia por su valor
// seleccionado ("Quirófano #1"), sin contexto de qué campo es.
export default function FormSelect({
  id, value, onChange, options, placeholder, disabled = false, required = false, ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) return;
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

  // El ancho real del listado depende del label más largo (ej. "Administrado"
  // vs el trigger angosto "Todos"), no del trigger — por eso arriba solo se
  // fija minWidth. Acá, una vez montado con su ancho de contenido, se
  // corrige `left` si se pasa del borde derecho del viewport (filtros cerca
  // del borde, ej. columna "Estado" en Monitoreo de Atención de enfermería).
  useLayoutEffect(() => {
    if (!open || !coords || !dropdownRef.current) return;
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const overflowRight = dropdownRect.right - (window.innerWidth - 8);
    if (overflowRight > 0.5) {
      setCoords((c) => (c ? { ...c, left: Math.max(8, c.left - overflowRight) } : c));
    }
  }, [open, coords]);

  // Mantiene la opción resaltada visible al navegar con flechas -- el
  // listado puede ser más alto que su `max-height` (ver FormSelect.css).
  useLayoutEffect(() => {
    if (!open || activeIndex < 0 || !dropdownRef.current) return;
    dropdownRef.current.children[activeIndex]
      ?.querySelector('.form-select-option')
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

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
  const optionId = (i) => `${id}-option-${i}`;

  function handleSelect(v) {
    setOpen(false);
    if (v !== value) onChange(v);
  }

  function openDropdown(indexIfNoSelection = 0) {
    const currentIndex = options.findIndex((o) => o.value === value);
    setActiveIndex(currentIndex >= 0 ? currentIndex : indexIfNoSelection);
    setOpen(true);
  }

  function handleTriggerKeyDown(e) {
    if (disabled) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        openDropdown(e.key === 'End' ? options.length - 1 : 0);
      }
      return;
    }
    if (options.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0) handleSelect(options[activeIndex].value);
        break;
      case 'Tab':
        // No se cancela el Tab -- el foco debe seguir avanzando al próximo
        // campo con normalidad, el listado solo deja de tener sentido abierto.
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div className="form-select" ref={rootRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={`form-select-trigger${open ? ' open' : ''}`}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-label={ariaLabel}
        data-required-empty={required && !value ? 'true' : undefined}
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
          style={{ top: coords.top, left: coords.left, minWidth: coords.minWidth }}
        >
          {options.map((o, i) => (
            <li key={o.value} role="presentation">
              <button
                type="button"
                id={optionId(i)}
                role="option"
                tabIndex={-1}
                aria-selected={o.value === value}
                className={`form-select-option${o.value === value ? ' active' : ''}${i === activeIndex ? ' highlighted' : ''}`}
                onMouseEnter={() => setActiveIndex(i)}
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
