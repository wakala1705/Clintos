import './AdmisionesToolbar.css';
import SearchField from '@/Components/SearchField/SearchField';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { ESTADO_FILTER_OPTIONS, SEARCH_FIELD_OPTIONS } from '@/hooks/Admisiones/mockAdmisionesData';

// Los CTA principales ("Nueva"/"Pre ingreso") viven en adm-page-header (ver
// Admisiones.jsx), mismo patrón que el resto de páginas de nivel superior
// (ej. .pc-page-header-actions en ProgramarCita) — este toolbar solo lleva
// los controles de búsqueda/filtro de la lista.
export default function AdmisionesToolbar({
  searchField, onChangeSearchField, query, onChangeQuery, estado, onChangeEstado,
}) {
  return (
    <div className="adm-toolbar">
      <SearchField
        fields={SEARCH_FIELD_OPTIONS}
        field={searchField}
        onChangeField={onChangeSearchField}
        value={query}
        onChange={onChangeQuery}
        ariaLabel="Buscar admisión"
      />

      <div className="adm-estado-select">
        <FormSelect
          id="adm-estado-filter"
          ariaLabel="Filtrar por estado"
          value={estado}
          onChange={onChangeEstado}
          options={ESTADO_FILTER_OPTIONS}
        />
      </div>
    </div>
  );
}
