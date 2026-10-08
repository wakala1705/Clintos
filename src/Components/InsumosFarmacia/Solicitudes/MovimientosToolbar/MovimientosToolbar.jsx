'use client';

import './MovimientosToolbar.css';
import FilterListDropdown from '../FilterListDropdown/FilterListDropdown';
import VistaModoMenu from '../VistaModoMenu/VistaModoMenu';
import SearchField from '@/Components/SearchField/SearchField';
import {
  ESTADO_OPTIONS, TRNS_OPTIONS, TIPO_ARTICULO_OPTIONS, PROCEDENCIA_OPTIONS, BUSQUEDA_CAMPO_OPTIONS,
} from '@/hooks/InsumosFarmacia/mockSolicitudesData';

// Toolbar de una sola fila (buscador → filter-spacer → filtros), ver
// AGENTS.md "Barra de filtros de listado". .filter-bar/.search-field/
// .filter-spacer/.filter-cluster: definidas en ../shared/shared.css.
// VistaModoMenu (Lista/Dividida) va al final de la fila, fuera de
// .filter-cluster -- no es un filtro, mismo lugar (extremo derecho) que
// ocupa en el toolbar de FacturaVistaClasica.
export default function MovimientosToolbar({
  filtros, onChange, modo, onModoChange,
}) {
  return (
    <div className="filter-bar mig-toolbar">
      <SearchField
        fields={BUSQUEDA_CAMPO_OPTIONS}
        field={filtros.campoBusqueda}
        onChangeField={(v) => onChange({ campoBusqueda: v })}
        value={filtros.busqueda}
        onChange={(v) => onChange({ busqueda: v })}
        ariaLabel="Buscar movimiento"
      />

      <div className="filter-spacer" />

      <div className="filter-cluster">
        <FilterListDropdown
          label="TRNS"
          showLabel
          options={TRNS_OPTIONS}
          value={filtros.trns}
          onChange={(v) => onChange({ trns: v })}
        />

        <FilterListDropdown
          label="Estado"
          options={ESTADO_OPTIONS}
          value={filtros.estado}
          onChange={(v) => onChange({ estado: v })}
        />

        <FilterListDropdown
          label="Tipo artículo"
          showLabel
          options={TIPO_ARTICULO_OPTIONS}
          value={filtros.tipoArticulo}
          onChange={(v) => onChange({ tipoArticulo: v })}
        />

        <FilterListDropdown
          label="Procedencia"
          showLabel
          options={PROCEDENCIA_OPTIONS}
          value={filtros.procedencia}
          onChange={(v) => onChange({ procedencia: v })}
        />
      </div>

      <VistaModoMenu modo={modo} onChange={onModoChange} />
    </div>
  );
}
