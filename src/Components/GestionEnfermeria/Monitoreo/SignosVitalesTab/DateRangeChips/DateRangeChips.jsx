'use client';

import { useEffect, useRef, useState } from 'react';
import './DateRangeChips.css';
import { LuCalendar, LuChevronDown } from 'react-icons/lu';

export default function DateRangeChips({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [desde, setDesde] = useState(value.desde ?? '');
  const [hasta, setHasta] = useState(value.hasta ?? '');
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

  const label = value.mode === 'custom' && value.desde && value.hasta
    ? `${value.desde} – ${value.hasta}`
    : 'Rango personalizado';

  return (
    <>
      <div className="chip-group segmented">
        <button
          type="button"
          className={`chip-filter${value.mode === 'hoy' ? ' active' : ''}`}
          aria-pressed={value.mode === 'hoy'}
          onClick={() => onChange({ mode: 'hoy', desde: null, hasta: null })}
        >
          Hoy
        </button>
        <button
          type="button"
          className={`chip-filter${value.mode === 'semana' ? ' active' : ''}`}
          aria-pressed={value.mode === 'semana'}
          onClick={() => onChange({ mode: 'semana', desde: null, hasta: null })}
        >
          Última semana
        </button>
      </div>

      <div className="filter-popover-wrap" ref={rootRef}>
        <button
          type="button"
          className="date-picker-btn"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <LuCalendar className="icon" aria-hidden="true" />
          <span>{label}</span>
          <LuChevronDown className="icon chev" aria-hidden="true" />
        </button>

        {open && (
          <div className="filter-popover open" role="dialog" aria-label="Seleccionar rango de fechas">
            <div className="fp-title">Seleccionar rango de fechas</div>
            <div className="fp-date-row">
              <div className="fp-date-field">
                <label htmlFor="svt-date-from">Desde</label>
                <input id="svt-date-from" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>
              <div className="fp-date-field">
                <label htmlFor="svt-date-to">Hasta</label>
                <input id="svt-date-to" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>
            </div>
            <div className="fp-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setDesde(''); setHasta(''); }}
              >
                Limpiar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => { onChange({ mode: 'custom', desde, hasta }); setOpen(false); }}
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
