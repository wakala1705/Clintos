'use client';

import { useEffect, useRef, useState } from 'react';
import './VacToolbar.css';
import { LuChevronDown, LuFilter, LuSearch } from 'react-icons/lu';
import { ESQUEMA_OPTIONS, ESTADO_OPTIONS, PROXIMA_OPTIONS, QUICK_FILTERS } from '@/hooks/Vacunacion/mockVacunacionData';

// Barra de herramientas en una sola línea: búsqueda a la izquierda, el
// segmented control de acceso rápido (Todos/Pendientes/Atrasados/Próximos) y
// el botón "Filtros" a la derecha — mismo patrón search-left/filters-right
// que FiltersRow (Lista de Pacientes) y RecepcionSub (GestionEnfermeria).
// Esquema/Estado/Próxima aplicación se agrupan en un único popover (botón
// "Filtros") en vez de 3 selects sueltos — mismo componente .filters-more-btn/
// .filter-popover que "Filtros" en FiltersRow.jsx, duplicado acá siguiendo el
// mismo criterio de copia por feature que el resto de clases compartidas
// (ver AGENTS.md). Siguen siendo dos filtros independientes que se combinan
// por AND con el quick filter (ver Vacunacion.jsx — filtrarPacientes): el
// segmented control no reemplaza al filtro "Estado" del popover, solo ofrece
// los 3 recortes más usados a un clic. `counts` trae cuántos pacientes
// calzan cada segmento (sobre el dataset completo, no sobre el ya filtrado)
// para que el segmented control se lea como el resto de badges con contador
// del proyecto.
const FILTER_KEYS = ['esquema', 'estado', 'proxima'];

export default function VacToolbar({
  query, onQueryChange,
  esquema, onEsquemaChange,
  estado, onEstadoChange,
  proxima, onProximaChange,
  quickFilter, onQuickFilterChange,
  counts,
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

  const filterValues = { esquema, estado, proxima };
  const activeCount = FILTER_KEYS.filter((key) => filterValues[key]).length;

  function handleClear() {
    onEsquemaChange('');
    onEstadoChange('');
    onProximaChange('');
  }

  return (
    <div className="vac-toolbar">
      <div className="vac-toolbar-row">
        <div className="search-field">
          <LuSearch className="icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar paciente por nombre o documento…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Buscar paciente por nombre o documento"
          />
        </div>

        <div className="filter-spacer"></div>

        <div className="chip-group segmented" role="tablist" aria-label="Filtro rápido">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={quickFilter === f.value}
              className={`chip-filter${quickFilter === f.value ? ' active' : ''}`}
              onClick={() => onQuickFilterChange(f.value)}
            >
              {f.label} <span className="count">{counts[f.value]}</span>
            </button>
          ))}
        </div>

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
            <div className="filter-popover filter-popover-right" role="dialog" aria-label="Filtros">
              <div className="fp-section">
                <div className="fp-section-title">Esquema</div>
                <select value={esquema} onChange={(e) => onEsquemaChange(e.target.value)} aria-label="Filtrar por esquema">
                  <option value="">Todos</option>
                  {ESQUEMA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="fp-section">
                <div className="fp-section-title">Estado</div>
                <select value={estado} onChange={(e) => onEstadoChange(e.target.value)} aria-label="Filtrar por estado">
                  <option value="">Todos</option>
                  {ESTADO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="fp-section">
                <div className="fp-section-title">Próxima aplicación</div>
                <select value={proxima} onChange={(e) => onProximaChange(e.target.value)} aria-label="Filtrar por próxima aplicación">
                  <option value="">Todas</option>
                  {PROXIMA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="fp-actions">
                <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={activeCount === 0}>Limpiar</button>
                <button type="button" className="btn btn-primary" onClick={() => setOpen(false)}>Aplicar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
