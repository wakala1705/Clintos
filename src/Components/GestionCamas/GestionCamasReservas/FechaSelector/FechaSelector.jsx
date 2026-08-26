'use client';

import { useEffect, useRef, useState } from 'react';
import './FechaSelector.css';
import { LuCalendar, LuChevronDown } from 'react-icons/lu';

// Botón "Fecha: DD/MM/AAAA" + popover con un <input type="date"> (mismo
// patrón trigger+popover que ViewToggle.jsx: .date-picker-btn +
// .filter-popover, ambos ya compartidos vía GestionCamas.css). `value`/
// `onChange` van en formato ISO (yyyy-mm-dd, el nativo del input) — el label
// del trigger se muestra en dd/mm/aaaa vía `labelValue`, ya formateado por el
// padre (mismo criterio que otros triggers: este componente no sabe de
// locales, solo arma la UI).
export default function FechaSelector({
  value, labelValue, onChange, onLimpiar,
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

  return (
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className={`date-picker-btn${value ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LuCalendar className="icon" aria-hidden="true" />
        {`Fecha: ${labelValue}`}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-popover open" role="dialog" aria-label="Filtrar por fecha">
          <div className="fp-section">
            <span className="fp-section-title">Fecha</span>
            <input
              type="date"
              className="cbr-fecha-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              aria-label="Fecha de inicio de la reserva"
            />
          </div>
          <div className="fp-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { onLimpiar(); setOpen(false); }}>
              Limpiar
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
