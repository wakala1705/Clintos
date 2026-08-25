'use client';

import { useEffect, useRef, useState } from 'react';
import './MasFiltrosPopover.css';
import { LuFilter } from 'react-icons/lu';

// Filtros avanzados agrupados por categoría conceptual, no por campo
// (encargo) — 2 columnas: "Ubicación" (Piso/Sector/Habitación) y Clasificación
// (Tipo). "Atributos"/"Operativo de soporte" (Temporal/Con reserva/
// Aislamiento/Bloqueada/Limpieza/Mantenimiento) se quitaron de acá — salvo
// Temporal/Con reserva, todos duplicaban valores que ya vive el filtro
// "Estado" del filter-bar (GestionCamas.jsx). Edición en BORRADOR: los clics
// acá (chips/select) solo tocan `draft`, nunca los props reales — recién
// se aplican a
// GestionCamas.jsx (piso/sector/tipo/filtrosAvanzados) al confirmar
// "Aplicar filtros" (encargo: footer con Limpiar todo/Aplicar filtros). Esto
// evita que la grilla se re-filtre en cada click mientras el usuario todavía
// está combinando varios filtros dentro del mismo popover. Cerrar sin
// aplicar (click afuera/Escape) descarta el borrador solo: `handleOpen`
// vuelve a tomar una foto de los props reales cada vez que se abre.
export default function MasFiltrosPopover({
  piso, pisoOptions, onChangePiso,
  sector, sectorOptions, onChangeSector,
  tipo, tipoOptions, onChangeTipo,
  filtros, onChange, onLimpiar,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    piso, sector, tipo, filtros,
  });
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
    if (!open) {
      setDraft({
        piso, sector, tipo, filtros,
      });
    }
    setOpen((v) => !v);
  }

  function setDraftPiso(v) { setDraft((d) => ({ ...d, piso: v })); }
  function setDraftSector(v) { setDraft((d) => ({ ...d, sector: v })); }
  function setDraftTipo(v) { setDraft((d) => ({ ...d, tipo: v })); }
  function setDraftFiltro(key, value) {
    setDraft((d) => ({ ...d, filtros: { ...d.filtros, [key]: value } }));
  }

  function handleAplicar() {
    onChangePiso(draft.piso);
    onChangeSector(draft.sector);
    onChangeTipo(draft.tipo);
    Object.entries(draft.filtros).forEach(([key, value]) => {
      if (filtros[key] !== value) onChange(key, value);
    });
    setOpen(false);
  }

  function handleLimpiarTodo() {
    onLimpiar();
    setOpen(false);
  }

  // Badge del botón cerrado: refleja lo REALMENTE aplicado (props), no el
  // borrador en curso — es lo que hoy filtra la grilla.
  const activos = (piso !== 'todos' ? 1 : 0) + (sector !== 'todos' ? 1 : 0) + (tipo !== 'todos' ? 1 : 0)
    + (filtros.habitacion.trim() !== '' ? 1 : 0);

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
        <div className="filter-popover filter-popover-right cb-mf-popover open">
          <div className="cb-mf-columns">
            <div>
              <span className="cb-mf-column-title">Ubicación</span>

              <div className="fp-section">
                <div className="cb-mf-field-head">
                  <span className="fp-section-title">Piso</span>
                  {draft.piso !== 'todos' && (
                    <button type="button" className="cb-mf-clear-link" onClick={() => setDraftPiso('todos')}>Limpiar</button>
                  )}
                </div>
                <div className="chip-group">
                  {pisoOptions.slice(1).map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      role="option"
                      aria-selected={o.value === draft.piso}
                      className={`chip-filter${o.value === draft.piso ? ' active' : ''}`}
                      onClick={() => setDraftPiso(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fp-section">
                <div className="cb-mf-field-head">
                  <span className="fp-section-title">Sector</span>
                  {draft.sector !== 'todos' && (
                    <button type="button" className="cb-mf-clear-link" onClick={() => setDraftSector('todos')}>Limpiar</button>
                  )}
                </div>
                <div className="chip-group">
                  {sectorOptions.slice(1).map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      role="option"
                      aria-selected={o.value === draft.sector}
                      className={`chip-filter${o.value === draft.sector ? ' active' : ''}`}
                      onClick={() => setDraftSector(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fp-section">
                <span className="fp-section-title">Habitación</span>
                <input
                  type="text"
                  className="cb-mf-input"
                  placeholder="Número de habitación..."
                  value={draft.filtros.habitacion}
                  onChange={(e) => setDraftFiltro('habitacion', e.target.value)}
                />
              </div>
            </div>

            <div>
              <span className="cb-mf-column-title">Clasificación</span>
              <div className="fp-section">
                <div className="form-field">
                  <label htmlFor="cb-mf-tipo" className="fp-section-title">Tipo</label>
                  <select id="cb-mf-tipo" value={draft.tipo} onChange={(e) => setDraftTipo(e.target.value)}>
                    {tipoOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className="cb-mf-hint">Códigos en definición con backend</div>
                </div>
              </div>
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
