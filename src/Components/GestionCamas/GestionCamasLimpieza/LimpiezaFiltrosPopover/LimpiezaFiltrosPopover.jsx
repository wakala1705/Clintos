'use client';

import { useEffect, useRef, useState } from 'react';
import { LuFilter } from 'react-icons/lu';
import { PISOS, SECTORES, TIEMPOS } from '@/hooks/GestionCamas/mockLimpiezaData';

// "Más filtros" — Piso/Sector/Tiempo (encargo: agrupar acá el filtro de SLA
// en vez de un AreaSelector propio en el filter-bar, para simplificar la
// franja de filtros visibles). Mismo patrón borrador+aplicar que
// MasFiltrosPopover.jsx (GestionCamas.jsx): los clics acá solo tocan `draft`,
// recién se confirman en la pantalla al hacer clic en "Aplicar filtros".
export default function LimpiezaFiltrosPopover({
  piso, sector, tiempo, onChange, onLimpiar,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ piso, sector, tiempo });
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
    if (!open) setDraft({ piso, sector, tiempo });
    setOpen((v) => !v);
  }

  function handleAplicar() {
    onChange('piso', draft.piso);
    onChange('sector', draft.sector);
    onChange('tiempo', draft.tiempo);
    setOpen(false);
  }

  function handleLimpiarTodo() {
    onLimpiar();
    setOpen(false);
  }

  const activos = (piso !== 'todos' ? 1 : 0) + (sector !== 'todos' ? 1 : 0) + (tiempo !== 'todos' ? 1 : 0);

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
            <span className="fp-section-title">Piso</span>
            <div className="chip-group">
              {PISOS.slice(1).map((o) => (
                <button
                  type="button"
                  key={o.value}
                  role="option"
                  aria-selected={o.value === draft.piso}
                  className={`chip-filter${o.value === draft.piso ? ' active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, piso: o.value === d.piso ? 'todos' : o.value }))}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fp-section">
            <span className="fp-section-title">Sector</span>
            <div className="chip-group">
              {SECTORES.slice(1).map((o) => (
                <button
                  type="button"
                  key={o.value}
                  role="option"
                  aria-selected={o.value === draft.sector}
                  className={`chip-filter${o.value === draft.sector ? ' active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, sector: o.value === d.sector ? 'todos' : o.value }))}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fp-section">
            <span className="fp-section-title">Tiempo</span>
            <div className="chip-group">
              {TIEMPOS.slice(1).map((o) => (
                <button
                  type="button"
                  key={o.value}
                  role="option"
                  aria-selected={o.value === draft.tiempo}
                  className={`chip-filter${o.value === draft.tiempo ? ' active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, tiempo: o.value === d.tiempo ? 'todos' : o.value }))}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fp-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLimpiarTodo}>
              Limpiar todo
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAplicar}>
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
