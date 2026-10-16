'use client';

import './EntradasToolbar.css';
import FilterListDropdown from '../../Solicitudes/FilterListDropdown/FilterListDropdown';
import VistaModoMenu from '../../Solicitudes/VistaModoMenu/VistaModoMenu';
import SearchField from '@/Components/SearchField/SearchField';
import {
  BUSQUEDA_ENTRADA_OPTIONS, ESTADO_ENTRADA_OPTIONS, ORIGEN_ENTRADA_OPTIONS,
} from '@/hooks/InsumosFarmacia/entradasAsistenciales';

// Toolbar de una sola fila, mismo orden que MovimientosToolbar (Salidas): buscador →
// filter-spacer → filtros → selector de vista. Ver AGENTS.md "Barra de filtros de listado".
export default function EntradasToolbar({
  filtros, onChange, modo, onModoChange,
}) {
  return (
    <div className="filter-bar mig-toolbar">
      <SearchField
        fields={BUSQUEDA_ENTRADA_OPTIONS}
        field={filtros.campoBusqueda}
        onChangeField={(v) => onChange({ campoBusqueda: v })}
        value={filtros.busqueda}
        onChange={(v) => onChange({ busqueda: v })}
        ariaLabel="Buscar entrada"
      />

      <div className="filter-spacer" />

      <div className="filter-cluster">
        <FilterListDropdown
          label="Estado"
          options={ESTADO_ENTRADA_OPTIONS}
          value={filtros.estado}
          onChange={(v) => onChange({ estado: v })}
        />

        <FilterListDropdown
          label="Origen"
          options={ORIGEN_ENTRADA_OPTIONS}
          value={filtros.origen}
          onChange={(v) => onChange({ origen: v })}
        />
      </div>

      <VistaModoMenu modo={modo} onChange={onModoChange} />
    </div>
  );
}
