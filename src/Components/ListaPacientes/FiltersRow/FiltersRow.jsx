import './FiltersRow.css';
import { EPS_OPTIONS, RANGO_EDAD_OPTIONS, SEDE_OPTIONS } from '@/hooks/ListaPacientes/mockPatientsData';

export default function FiltersRow({ filters, onChangeFilter, showSede, sortBy, onChangeSortBy }) {
  return (
    <div className="lp-filters-row">
      <div className="lp-select-field">
        <label htmlFor="lp-filter-estado">Estado</label>
        <select id="lp-filter-estado" value={filters.estado} onChange={(e) => onChangeFilter('estado', e.target.value)}>
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <div className="lp-select-field">
        <label htmlFor="lp-filter-eps">Asegurador</label>
        <select id="lp-filter-eps" value={filters.eps} onChange={(e) => onChangeFilter('eps', e.target.value)}>
          <option value="">Todos</option>
          {EPS_OPTIONS.map((eps) => <option key={eps} value={eps}>{eps}</option>)}
        </select>
      </div>

      <div className="lp-select-field">
        <label htmlFor="lp-filter-sexo">Sexo</label>
        <select id="lp-filter-sexo" value={filters.sexo} onChange={(e) => onChangeFilter('sexo', e.target.value)}>
          <option value="">Todos</option>
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
        </select>
      </div>

      <div className="lp-select-field">
        <label htmlFor="lp-filter-edad">Rango de edad</label>
        <select id="lp-filter-edad" value={filters.rangoEdad} onChange={(e) => onChangeFilter('rangoEdad', e.target.value)}>
          <option value="">Todas</option>
          {RANGO_EDAD_OPTIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      {showSede && (
        <div className="lp-select-field">
          <label htmlFor="lp-filter-sede">Sede</label>
          <select id="lp-filter-sede" value={filters.sede} onChange={(e) => onChangeFilter('sede', e.target.value)}>
            <option value="">Todas</option>
            {SEDE_OPTIONS.map((sede) => <option key={sede} value={sede}>{sede}</option>)}
          </select>
        </div>
      )}

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
