'use client';

import { useEffect, useId, useRef, useState } from 'react';
import './DiagnosticoField.css';
import { LuSearch } from 'react-icons/lu';
import { CIE_MOCK } from '../proximasCitasData';

// Una fila de diagnóstico (ver ProximasCitasStep.jsx, 4 reusos: principal +
// 3 relacionados) — campo de búsqueda/autocomplete de diagnóstico + su
// código CIE asociado, en vez del botón "..." ambiguo del legacy (encargo
// explícito: "evitar utilizar botones ambiguos como '...'; utilizar un
// patrón reconocible de búsqueda/selección"). Escribir en el campo filtra
// CIE_MOCK en vivo; el ícono de lupa al final también abre/cierra el
// listado completo sin necesidad de escribir — mismo mecanismo que
// SearchableSelect.jsx, pero acá cada opción trae 2 datos (texto + código)
// en vez de uno solo, así que no se reutiliza el mismo componente. El
// código sigue siendo editable a mano (un profesional puede conocerlo de
// memoria y escribirlo directo, sin pasar por el buscador).
export default function DiagnosticoField({
  label, texto, onTextoChange, codigo, onCodigoChange, required, placeholder,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const textoId = useId();
  const codigoId = useId();

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

  const q = texto.trim().toLowerCase();
  const filtered = q
    ? CIE_MOCK.filter((d) => d.texto.toLowerCase().includes(q) || d.codigo.toLowerCase().includes(q))
    : CIE_MOCK;

  function pick(diagnostico) {
    onTextoChange(diagnostico.texto);
    onCodigoChange(diagnostico.codigo);
    setOpen(false);
  }

  return (
    <div className="pcs-diag-row">
      <div className="form-field pcs-diag-search" ref={wrapRef}>
        <label htmlFor={textoId}>{label}{required && <span className="req">*</span>}</label>
        <div className="pcs-diag-input-wrap">
          <input
            id={textoId}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            required={required}
            placeholder={placeholder}
            value={texto}
            onFocus={() => setOpen(true)}
            onChange={(e) => { onTextoChange(e.target.value); setOpen(true); }}
          />
          <button
            type="button"
            className="pcs-diag-search-btn"
            aria-label="Buscar diagnóstico"
            onClick={() => setOpen((o) => !o)}
          >
            <LuSearch className="icon" aria-hidden="true" />
          </button>
        </div>

        {open && (
          <ul className="pcs-diag-listbox" role="listbox">
            {filtered.length === 0 && <li className="pcs-diag-empty">Sin resultados</li>}
            {filtered.map((d) => (
              <li key={d.codigo} role="option" aria-selected={d.codigo === codigo}>
                <button
                  type="button"
                  className={`pcs-diag-option${d.codigo === codigo ? ' active' : ''}`}
                  onClick={() => pick(d)}
                >
                  <span className="pcs-diag-option-texto">{d.texto}</span>
                  <span className="pcs-diag-option-codigo">{d.codigo}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-field pcs-diag-codigo">
        <label htmlFor={codigoId}>Código</label>
        <input id={codigoId} type="text" value={codigo} onChange={(e) => onCodigoChange(e.target.value)} />
      </div>
    </div>
  );
}
