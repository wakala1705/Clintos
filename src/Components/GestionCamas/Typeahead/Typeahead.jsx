'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './Typeahead.css';
import { LuSearch } from 'react-icons/lu';

let requestSeq = 0;

// Campo de búsqueda con autocompletado (Paciente/Admisión, ver
// ReservarCamaModal.jsx) — controlado desde afuera (`value`/`onValueChange`)
// para que el padre pueda forzar el texto (ej. autocompletar Paciente al
// elegir una Admisión). `search(query)` es cualquier función que devuelva
// una Promise<item[]> (ver buscarPacientes/buscarAdmisiones,
// mockCamasData.js) — este componente no sabe nada de pacientes/admisiones
// en particular, solo orquesta debounce + dropdown + navegación por
// teclado.
//
// Portal a document.body + position:fixed (mismo patrón que
// FormSelect/BedActionsMenu/InfoTooltip, ver AGENTS.md/bitácora de esta
// sesión): `.modal-card > form` tiene overflow:hidden, y un dropdown
// position:absolute ahí adentro le suma alto a .modal-body (scroll de más)
// en vez de quedar recortado — el motivo es distinto al de los otros 3
// casos, pero la solución es la misma.
export default function Typeahead({
  id, value, onValueChange, onSelect, search, getOptionSub, getOptionLabel,
  placeholder, disabled = false, error = false, describedBy, inputRef: externalRef, minChars = 1, autoFocus = false,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState(null);

  const rootRef = useRef(null);
  const localInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const inputRef = externalRef ?? localInputRef;

  useLayoutEffect(() => {
    if (!open) return;
    function updateCoords() {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [open, inputRef]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current?.contains(e.target)) return;
      if (dropdownRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  function ejecutarBusqueda(query) {
    const seq = (requestSeq += 1);
    setLoading(true);
    search(query).then((items) => {
      if (seq !== requestSeq) return; // respuesta obsoleta (llegó otra búsqueda después) — se ignora
      setResults(items);
      setLoading(false);
      setActiveIndex(items.length ? 0 : -1);
    }).catch(() => {
      if (seq !== requestSeq) return;
      setResults([]);
      setLoading(false);
      setActiveIndex(-1);
    });
  }

  function handleChange(e) {
    const text = e.target.value;
    onValueChange(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < minChars) {
      setResults([]);
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    debounceRef.current = setTimeout(() => ejecutarBusqueda(text.trim()), 300);
  }

  function handleSelect(item) {
    onSelect(item);
    setOpen(false);
    setResults([]);
  }

  function handleKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const listboxId = `${id}-listbox`;
  const activeId = activeIndex >= 0 && results[activeIndex] ? `${id}-option-${activeIndex}` : undefined;

  return (
    <div className="cbta-field" ref={rootRef}>
      <input
        id={id}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setOpen(false)}
      />
      <LuSearch className="icon cbta-icon" aria-hidden="true" />

      {open && coords && createPortal(
        <ul
          ref={dropdownRef}
          id={listboxId}
          role="listbox"
          className="cbta-dropdown"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
          {loading && <li className="cbta-status">Buscando…</li>}
          {!loading && results.length === 0 && <li className="cbta-status">Sin resultados</li>}
          {!loading && results.map((item, i) => (
            <li key={item.key ?? i} role="presentation">
              <button
                type="button"
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`cbta-option${i === activeIndex ? ' active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => handleSelect(item)}
              >
                <span>{getOptionLabel(item)}</span>
                {getOptionSub && <span className="cbta-option-sub">{getOptionSub(item)}</span>}
              </button>
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </div>
  );
}
