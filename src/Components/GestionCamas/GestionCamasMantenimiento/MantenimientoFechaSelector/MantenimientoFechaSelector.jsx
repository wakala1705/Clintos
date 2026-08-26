'use client';

import { useEffect, useRef, useState } from 'react';
import './MantenimientoFechaSelector.css';
import { LuCalendar, LuChevronDown } from 'react-icons/lu';

function ddmm(iso) {
  if (!iso) return null;
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function labelRango(desde, hasta) {
  if (!desde && !hasta) return 'Todas';
  if (desde && hasta) return `${ddmm(desde)} – ${ddmm(hasta)}`;
  if (desde) return `Desde ${ddmm(desde)}`;
  return `Hasta ${ddmm(hasta)}`;
}

// "Fecha: <rango>" — mismo patrón trigger+popover que FechaSelector.jsx
// (Reservas), pero con Desde/Hasta en vez de una fecha única (encargo
// sección 5: "el filtro de fecha debe permitir seleccionar un rango").
export default function MantenimientoFechaSelector({
  desde, hasta, onChange, onLimpiar,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const activo = Boolean(desde || hasta);

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
        className={`date-picker-btn${activo ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LuCalendar className="icon" aria-hidden="true" />
        {`Fecha: ${labelRango(desde, hasta)}`}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-popover open" role="dialog" aria-label="Filtrar por rango de fecha">
          <div className="fp-section">
            <span className="fp-section-title">Desde</span>
            <input
              type="date"
              className="cbm-fecha-input"
              value={desde}
              onChange={(e) => onChange('desde', e.target.value)}
              aria-label="Fecha desde"
            />
          </div>
          <div className="fp-section">
            <span className="fp-section-title">Hasta</span>
            <input
              type="date"
              className="cbm-fecha-input"
              value={hasta}
              onChange={(e) => onChange('hasta', e.target.value)}
              aria-label="Fecha hasta"
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
