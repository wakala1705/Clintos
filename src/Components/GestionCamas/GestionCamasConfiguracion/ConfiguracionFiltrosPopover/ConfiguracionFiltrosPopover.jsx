'use client';

import { useEffect, useRef, useState } from 'react';
import './ConfiguracionFiltrosPopover.css';
import { RANGO_CAMBIOS_OPTIONS } from '@/hooks/GestionCamas/mockConfiguracionData';
import { LuFilter } from 'react-icons/lu';

// Progressive disclosure (encargo, sección 3) — único filtro avanzado hoy es
// el rango de fecha de "Cambios recientes" (Sede/Servicio/Estado ya tienen
// su propio selector fijo, ver GestionCamasConfiguracion.jsx). Mismo patrón
// borrador+Aplicar/Limpiar que InconsistenciasFiltrosPopover (Integridad).
export default function ConfiguracionFiltrosPopover({ rango, onChange, onLimpiar }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(rango);
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

  function handleToggleOpen() {
    if (!open) setDraft(rango);
    setOpen((v) => !v);
  }
  function handleAplicar() { onChange(draft); setOpen(false); }
  function handleLimpiarTodo() { onLimpiar(); setOpen(false); }

  const activos = rango !== 'cualquiera' ? 1 : 0;

  return (
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className={`filters-more-btn${activos > 0 ? ' active' : ''}`}
        onClick={handleToggleOpen}
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
            <div className="form-field">
              <label htmlFor="cbc-fp-rango" className="fp-section-title">Cambios recientes</label>
              <select id="cbc-fp-rango" value={draft} onChange={(e) => setDraft(e.target.value)}>
                {RANGO_CAMBIOS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="fp-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLimpiarTodo}>Limpiar todo</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAplicar}>Aplicar filtros</button>
          </div>
        </div>
      )}
    </div>
  );
}
