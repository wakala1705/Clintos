import './AdmisionesToolbar.css';
import EstadoChipGroup from './EstadoChipGroup/EstadoChipGroup';
import SearchFieldSelect from './SearchFieldSelect/SearchFieldSelect';
import { SEARCH_FIELD_OPTIONS } from '@/hooks/Admisiones/mockAdmisionesData';
import { LuSearch } from 'react-icons/lu';

// Los CTA principales ("Nueva"/"Pre ingreso") viven en adm-page-header (ver
// Admisiones.jsx), mismo patrón que el resto de páginas de nivel superior
// (ej. .pc-page-header-actions en ProgramarCita) — este toolbar solo lleva
// los controles de búsqueda/filtro de la lista.
export default function AdmisionesToolbar({
  searchField, onChangeSearchField, query, onChangeQuery, estado, onChangeEstado,
}) {
  return (
    <div className="adm-toolbar">
      <div className="adm-search-field">
        <LuSearch className="icon" />
        <SearchFieldSelect
          options={SEARCH_FIELD_OPTIONS}
          value={searchField}
          onChange={onChangeSearchField}
          label="Buscar por"
        />
        <span className="adm-search-field-divider"></span>
        <input
          type="text"
          placeholder="Buscar"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          aria-label="Buscar admisión"
        />
      </div>

      <EstadoChipGroup value={estado} onChange={onChangeEstado} />
    </div>
  );
}
