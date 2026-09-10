'use client';

import './MovimientosToolbar.css';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import MovimientosFiltrosPopover from '../MovimientosFiltrosPopover/MovimientosFiltrosPopover';
import { ESTADO_OPTIONS } from '@/hooks/InsumosFarmacia/mockSolicitudesData';
import { LuSearch } from 'react-icons/lu';

// Toolbar de una sola fila (buscador → filter-spacer → filtros), ver
// AGENTS.md "Barra de filtros de listado". .filter-bar/.search-field/
// .filter-spacer/.filter-cluster: definidas en ../shared/shared.css.
export default function MovimientosToolbar({ filtros, onChange, estadoCounts }) {
  const estadoOptions = ESTADO_OPTIONS.map((o) => ({ ...o, count: estadoCounts[o.value] }));
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
        <SegmentedFilterBar
          options={estadoOptions}
          value={filtros.estado}
          onChange={(v) => onChange({ estado: v })}
          ariaLabel="Filtrar por estado"
        />

        <MovimientosFiltrosPopover
          filtros={{ tipoArticulo: filtros.tipoArticulo, procedencia: filtros.procedencia }}
          onApply={onChange}
          activeCount={activeFiltrosCount}
        />
      </div>
    </div>
  );
}
