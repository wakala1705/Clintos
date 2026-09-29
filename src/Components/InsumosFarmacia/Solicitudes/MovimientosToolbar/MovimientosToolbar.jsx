'use client';

import './MovimientosToolbar.css';
import FilterListDropdown from '../FilterListDropdown/FilterListDropdown';
import MovimientosFiltrosPopover from '../MovimientosFiltrosPopover/MovimientosFiltrosPopover';
import VistaModoMenu from '../VistaModoMenu/VistaModoMenu';
import { ESTADO_OPTIONS } from '@/hooks/InsumosFarmacia/mockSolicitudesData';
import { LuSearch } from 'react-icons/lu';

// Toolbar de una sola fila (buscador → filter-spacer → filtros), ver
// AGENTS.md "Barra de filtros de listado". .filter-bar/.search-field/
// .filter-spacer/.filter-cluster: definidas en ../shared/shared.css.
// VistaModoMenu (Lista/Dividida) va al final de la fila, fuera de
// .filter-cluster -- no es un filtro, mismo lugar (extremo derecho) que
// ocupa en el toolbar de FacturaVistaClasica.
export default function MovimientosToolbar({
  filtros, onChange, modo, onModoChange,
}) {
  const activeFiltrosCount = (filtros.tipoArticulo !== 'todos' ? 1 : 0) + (filtros.procedencia !== 'todos' ? 1 : 0);

  return (
    <div className="filter-bar mig-toolbar">
      <div className="search-field">
        <LuSearch className="icon" />
        <input
          type="text"
          placeholder="Buscar por consecutivo"
          aria-label="Buscar por consecutivo"
          value={filtros.noDoc}
          onChange={(e) => onChange({ noDoc: e.target.value })}
        />
      </div>

      <div className="filter-spacer" />

      <div className="filter-cluster">
        <FilterListDropdown
          label="Estado"
          options={ESTADO_OPTIONS}
          value={filtros.estado}
          onChange={(v) => onChange({ estado: v })}
        />

        <MovimientosFiltrosPopover
          filtros={{ tipoArticulo: filtros.tipoArticulo, procedencia: filtros.procedencia }}
          onApply={onChange}
          activeCount={activeFiltrosCount}
        />
      </div>

      <VistaModoMenu modo={modo} onChange={onModoChange} />
    </div>
  );
}
