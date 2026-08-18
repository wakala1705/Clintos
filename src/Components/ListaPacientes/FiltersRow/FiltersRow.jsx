'use client';

import { useEffect, useRef, useState } from 'react';
import './FiltersRow.css';
import { EPS_OPTIONS, RANGO_EDAD_OPTIONS, SEDE_OPTIONS } from '@/hooks/ListaPacientes/mockPatientsData';
import { LuChevronDown, LuFilter } from 'react-icons/lu';

const FILTER_KEYS = ['estado', 'eps', 'sexo', 'rangoEdad', 'sede'];

// Los 5 filtros (Estado/Asegurador/Sexo/Rango de edad/Sede) se agrupan en un
// único botón "Filtros" con popover — mismo patrón .filters-more-btn/
// .filter-popover que "Otros filtros" en GestionEnfermeria (ver
// RecepcionSub.jsx) en vez de una fila de 5 selects sueltos. "Ordenar por"
// no es un filtro (no recorta resultados) y queda fuera del botón, como en
// el resto del proyecto (ver .lp-sort-field más abajo).
export default function FiltersRow({ filters, onChangeFilter, showSede, sortBy, onChangeSortBy }) {
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

  const activeCount = FILTER_KEYS.filter((key) => filters[key]).length;

  function handleClear() {
    FILTER_KEYS.forEach((key) => onChangeFilter(key, ''));
  }

  return (
    <div className="lp-filters-row">
      <div className="filter-popover-wrap" ref={rootRef}>
        <button
          type="button"
          className={`filters-more-btn${activeCount > 0 ? ' active' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <LuFilter className="icon" />
          Filtros
          {activeCount > 0 && <span className="badge-count">{activeCount}</span>}
          <LuChevronDown className="icon chev" aria-hidden="true" />
        </button>

        {open && (
          <div className="filter-popover filter-popover-wide" role="dialog" aria-label="Filtros">
            <div className="fp-section">
              <div className="fp-section-title">Estado</div>
              <select value={filters.estado} onChange={(e) => onChangeFilter('estado', e.target.value)} aria-label="Filtrar por estado">
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div className="fp-section">
              <div className="fp-section-title">Asegurador</div>
              <select value={filters.eps} onChange={(e) => onChangeFilter('eps', e.target.value)} aria-label="Filtrar por asegurador">
                <option value="">Todos</option>
                {EPS_OPTIONS.map((eps) => <option key={eps} value={eps}>{eps}</option>)}
              </select>
            </div>

            <div className="fp-section">
              <div className="fp-section-title">Sexo</div>
              <select value={filters.sexo} onChange={(e) => onChangeFilter('sexo', e.target.value)} aria-label="Filtrar por sexo">
                <option value="">Todos</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>

            <div className="fp-section">
              <div className="fp-section-title">Rango de edad</div>
              <select value={filters.rangoEdad} onChange={(e) => onChangeFilter('rangoEdad', e.target.value)} aria-label="Filtrar por rango de edad">
                <option value="">Todas</option>
                {RANGO_EDAD_OPTIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>

            {showSede && (
              <div className="fp-section">
                <div className="fp-section-title">Sede</div>
                <select value={filters.sede} onChange={(e) => onChangeFilter('sede', e.target.value)} aria-label="Filtrar por sede">
                  <option value="">Todas</option>
                  {SEDE_OPTIONS.map((sede) => <option key={sede} value={sede}>{sede}</option>)}
                </select>
              </div>
            )}

            <div className="fp-actions">
              <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={activeCount === 0}>Limpiar</button>
              <button type="button" className="btn btn-primary" onClick={() => setOpen(false)}>Aplicar</button>
            </div>
          </div>
        )}
      </div>

      <div className="lp-filters-spacer"></div>

      <div className="lp-select-field lp-sort-field">
        <label htmlFor="lp-sort-by">Ordenar por</label>
        <select id="lp-sort-by" value={sortBy} onChange={(e) => onChangeSortBy(e.target.value)}>
          <option value="apellido">Primer apellido (A-Z)</option>
          <option value="registro">Fecha de registro (recientes)</option>
        </select>
      </div>
    </div>
  );
}
