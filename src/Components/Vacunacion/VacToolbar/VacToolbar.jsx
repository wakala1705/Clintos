import './VacToolbar.css';
import { LuSearch } from 'react-icons/lu';
import { ESQUEMA_OPTIONS, ESTADO_OPTIONS, PROXIMA_OPTIONS, QUICK_FILTERS } from '@/hooks/Vacunacion/mockVacunacionData';

// Barra de herramientas: fila de búsqueda + 3 filtros dedicados, y debajo el
// segmented control de acceso rápido (Todos/Pendientes/Atrasados/Próximos).
// Son dos filtros independientes que se combinan por AND (ver Vacunacion.jsx
// — filtrarPacientes): el segmented control no reemplaza al filtro "Estado",
// solo ofrece los 3 recortes más usados a un clic, sin abrir un select.
// `counts` trae cuántos pacientes calzan cada segmento (sobre el dataset
// completo, no sobre el ya filtrado por búsqueda/selects) para que el
// segmented control se lea como el resto de badges con contador del proyecto.
export default function VacToolbar({
  query, onQueryChange,
  esquema, onEsquemaChange,
  estado, onEstadoChange,
  proxima, onProximaChange,
  quickFilter, onQuickFilterChange,
  counts,
}) {
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

        <div className="vac-select-field">
          <label htmlFor="vac-filter-esquema">Esquema</label>
          <select id="vac-filter-esquema" value={esquema} onChange={(e) => onEsquemaChange(e.target.value)}>
            <option value="">Todos</option>
            {ESQUEMA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="vac-select-field">
          <label htmlFor="vac-filter-estado">Estado</label>
          <select id="vac-filter-estado" value={estado} onChange={(e) => onEstadoChange(e.target.value)}>
            <option value="">Todos</option>
            {ESTADO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="vac-select-field">
          <label htmlFor="vac-filter-proxima">Próxima aplicación</label>
          <select id="vac-filter-proxima" value={proxima} onChange={(e) => onProximaChange(e.target.value)}>
            <option value="">Todas</option>
            {PROXIMA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

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
    </div>
  );
}
