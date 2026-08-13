'use client';

import { useEffect, useId, useRef, useState } from 'react';
import './SearchableSelect.css';
import { LuChevronDown, LuSearch } from 'react-icons/lu';

// Combobox de búsqueda (ver ProximasCitasStep.jsx, 2 reusos: "Profesional
// próxima cita" y "Especialidad de destino" — el encargo pide "select
// searchable" para ambos). No hay un <select> nativo con búsqueda en HTML,
// así que se arma con un <input role="combobox"> + listbox propio (mismo
// patrón WAI-ARIA que PlantillaModal.jsx, versión compacta de un solo
// campo). Escribir filtra las opciones en vivo; el ícono de lupa + chevron
// dejan claro que es a la vez buscable y desplegable (encargo: "los
// selects deben mostrar claramente que son campos desplegables").
export default function SearchableSelect({ label, value, onChange, options, placeholder, required, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
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

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  function handlePick(option) {
    onChange(option);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="form-field ss-wrap" ref={wrapRef}>
      {label && <label htmlFor={id}>{label}{required && <span className="req">*</span>}</label>}
      <div className={`ss-control${disabled ? ' disabled' : ''}`}>
        <LuSearch className="icon ss-search-icon" aria-hidden="true" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={open ? query : value}
          onFocus={() => { if (!disabled) { setOpen(true); setQuery(''); } }}
          onChange={(e) => setQuery(e.target.value)}
        />
        <LuChevronDown className="icon ss-chevron" aria-hidden="true" />
      </div>

      {open && !disabled && (
        <ul className="ss-listbox" role="listbox">
          {filtered.length === 0 && <li className="ss-empty">Sin resultados</li>}
          {filtered.map((option) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                type="button"
                className={`ss-option${option === value ? ' active' : ''}`}
                onClick={() => handlePick(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
