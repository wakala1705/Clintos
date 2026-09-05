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
    : 'Personalizado';

  return (
    <>
      <div className="chip-group segmented">
        <button
          type="button"
          className={`chip-filter${value.mode === '24h' ? ' active' : ''}`}
          aria-pressed={value.mode === '24h'}
          onClick={() => onChange({ mode: '24h', desde: null, hasta: null })}
        >
          24 h
        </button>
        <button
          type="button"
          className={`chip-filter${value.mode === '7d' ? ' active' : ''}`}
          aria-pressed={value.mode === '7d'}
          onClick={() => onChange({ mode: '7d', desde: null, hasta: null })}
        >
          7 días
        </button>
        <button
          type="button"
          className={`chip-filter${value.mode === '30d' ? ' active' : ''}`}
          aria-pressed={value.mode === '30d'}
          onClick={() => onChange({ mode: '30d', desde: null, hasta: null })}
        >
          30 días
        </button>
      </div>

      <div className="filter-popover-wrap" ref={rootRef}>
        <button
          type="button"
          className="date-picker-btn"
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <LuCalendar className="icon" aria-hidden="true" />
          <span>{label}</span>
          <LuChevronDown className="icon chev" aria-hidden="true" />
        </button>

        {open && (
          <div
            className="filter-popover drc-popover"
            role="dialog"
            aria-label="Seleccionar rango de fechas"
            onClick={(e) => e.stopPropagation()}
          >
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
              {/* raw <button className="btn ..."> here, not <Button>: .fp-actions .btn has a
                  padding override (shared.css) that a CSS-Modules Button component can't be
                  targeted by without a browser check — see AGENTS.md Botones section on
                  documented divergences */}
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
