'use client';

import { useEffect, useRef, useState } from 'react';
import './AuditoriaFiltrosPopover.css';
import { SERVICIOS } from '@/hooks/GestionCamas/mockAuditoriaData';
import { LuFilter } from 'react-icons/lu';

// Progressive disclosure (encargo, sección 4): Servicio + Habitación quedan
// acá — Tipo de evento/Módulo/Usuario/Sede ya tienen su propio selector fijo
// en la barra principal. "Estado anterior"/"Estado posterior" y "Tipo de
// cama" del encargo no se agregan acá: no todo evento tiene un cambio de
// estado ni una cama con tipo asociado (ver EVENTOS en mockAuditoriaData.js
// — solo los eventos de tipo "modificacion"/"cambio-estado" traen
// `valores`), así que un filtro sobre esos campos rompería para el resto —
// mismo criterio de "no fabricar un filtro que el modelo no soporta" que el
// resto del proyecto.
export default function AuditoriaFiltrosPopover({
  servicio, habitacion, onChange, onLimpiar,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ servicio, habitacion });
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
    if (!open) setDraft({ servicio, habitacion });
    setOpen((v) => !v);
  }
  function handleAplicar() { onChange(draft); setOpen(false); }
  function handleLimpiarTodo() { onLimpiar(); setOpen(false); }

  const activos = (servicio !== 'todos' ? 1 : 0) + (habitacion.trim() !== '' ? 1 : 0);

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
              <label htmlFor="cbau-fp-servicio" className="fp-section-title">Servicio</label>
              <select id="cbau-fp-servicio" value={draft.servicio} onChange={(e) => setDraft((d) => ({ ...d, servicio: e.target.value }))}>
                {SERVICIOS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="fp-section">
            <span className="fp-section-title">Habitación / cama</span>
            <input
              type="text"
              className="cbau-fp-input"
              placeholder="Ej. C-101 o H-202"
              value={draft.habitacion}
              onChange={(e) => setDraft((d) => ({ ...d, habitacion: e.target.value }))}
            />
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
