'use client';

import { useEffect, useRef, useState } from 'react';
import './MasFiltrosPopover.css';
import { LuFilter } from 'react-icons/lu';

// Filtros avanzados (encargo: "no aumentar la cantidad de controles visibles
// en la barra principal") — mismo trigger+popover que FilterDropdown.jsx
// (.filters-more-btn/.filter-popover, shared.css), pero con checkboxes/texto
// en vez de una lista de opción única, porque acá varios filtros pueden
// combinarse a la vez (ej. Temporal + Aislamiento).
export default function MasFiltrosPopover({ filtros, onChange, onLimpiar }) {
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

  const activos = (filtros.habitacion.trim() !== '' ? 1 : 0)
    + (filtros.temporal ? 1 : 0) + (filtros.reserva ? 1 : 0) + (filtros.aislamiento ? 1 : 0)
    + (filtros.mantenimiento ? 1 : 0) + (filtros.bloqueada ? 1 : 0);

  return (
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className={`filters-more-btn${activos > 0 ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LuFilter className="icon" aria-hidden="true" />
        Más filtros
        {activos > 0 && <span className="badge-count">{activos}</span>}
      </button>

      {open && (
        <div className="filter-popover filter-popover-right open">
          <div className="fp-section">
            <div className="fp-section-title">Habitación</div>
            <input
              type="text"
              className="cb-mf-input"
              placeholder="Número de habitación..."
              value={filtros.habitacion}
              onChange={(e) => onChange('habitacion', e.target.value)}
            />
          </div>

          <div className="fp-section">
            <div className="fp-section-title">Atributos</div>
            <label className="cb-mf-check">
              <input type="checkbox" checked={filtros.temporal} onChange={(e) => onChange('temporal', e.target.checked)} />
              Temporal
            </label>
            <label className="cb-mf-check">
              <input type="checkbox" checked={filtros.reserva} onChange={(e) => onChange('reserva', e.target.checked)} />
              Con reserva
            </label>
            <label className="cb-mf-check">
              <input type="checkbox" checked={filtros.aislamiento} onChange={(e) => onChange('aislamiento', e.target.checked)} />
              Aislamiento
            </label>
            <label className="cb-mf-check">
              <input type="checkbox" checked={filtros.mantenimiento} onChange={(e) => onChange('mantenimiento', e.target.checked)} />
              Mantenimiento
            </label>
            <label className="cb-mf-check">
              <input type="checkbox" checked={filtros.bloqueada} onChange={(e) => onChange('bloqueada', e.target.checked)} />
              Bloqueada
            </label>
          </div>

          <div className="fp-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onLimpiar} disabled={activos === 0}>
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
