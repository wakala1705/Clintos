import './TrazabilidadToolbar.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import { ESTADO_OPTIONS, TIPO_OPTIONS } from '@/hooks/Trazabilidad/mockTrazabilidadData';
import { LuSearch, LuWrench } from 'react-icons/lu';

// Filtrado en vivo (mismo criterio que el resto del proyecto, ver AGENTS.md
// "Barra de filtros de listado" y GestionCamasAuditoria.jsx) -- cada control
// dispara onFiltrosChange directo, sin botones "Buscar"/"Limpiar" (se
// quitaron por encargo explícito; la referencia original los tenía pero no
// es el patrón del proyecto).
export default function TrazabilidadToolbar({
  filtros, onFiltrosChange, onReintentarColgados,
}) {
  return (
    <div className="filter-bar traz-toolbar">
      <div className="search-field traz-search-field">
        <LuSearch className="icon" />
        <input
          type="text"
          placeholder="Buscar por Admisión, Cns, Factura, Job ID, Usuario..."
          value={filtros.query}
          onChange={(e) => onFiltrosChange({ query: e.target.value })}
          aria-label="Buscar por referencia"
        />
      </div>

      <div className="filter-spacer" />

      <div className="filter-cluster">
        <FormSelect
          id="traz-estado"
          ariaLabel="Estado"
          value={filtros.estado}
          onChange={(v) => onFiltrosChange({ estado: v })}
          options={ESTADO_OPTIONS}
        />
        <FormSelect
          id="traz-tipo"
          ariaLabel="Tipo de operación"
          value={filtros.tipo}
          onChange={(v) => onFiltrosChange({ tipo: v })}
          options={TIPO_OPTIONS}
        />
        <div className="traz-date-field">
          <label htmlFor="traz-desde" className="filter-label">Desde</label>
          <input id="traz-desde" type="date" value={filtros.desde} onChange={(e) => onFiltrosChange({ desde: e.target.value })} />
        </div>
        <div className="traz-date-field">
          <label htmlFor="traz-hasta" className="filter-label">Hasta</label>
          <input id="traz-hasta" type="date" value={filtros.hasta} onChange={(e) => onFiltrosChange({ hasta: e.target.value })} />
        </div>
      </div>

      <div className="traz-toolbar-actions">
        <Button variant="secondary-accent" icon={LuWrench} onClick={onReintentarColgados}>Reintentar Colgados (&gt;30m)</Button>
      </div>
    </div>
  );
}
