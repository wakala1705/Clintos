import './TrazabilidadToolbar.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import { ESTADO_OPTIONS, TIPO_OPTIONS } from '@/hooks/Trazabilidad/mockTrazabilidadData';
import { LuRefreshCw, LuSearch, LuWrench, LuX } from 'react-icons/lu';

// Filtros de tipo "formulario" (ver Trazabilidad.jsx): todo acá es `draft`
// hasta que se aprieta "Buscar" -- por eso ESTADO/TIPO DE OPERACIÓN/fechas
// no disparan un fetch por sí solos, a diferencia del resto del proyecto
// (FormSelect+date-range suelen filtrar en vivo). Encargo explícito de la
// referencia (auditoría de jobs: se arma el criterio completo antes de
// consultar, no en cada tecla).
export default function TrazabilidadToolbar({
  draft, onDraftChange, onBuscar, onLimpiar, onReintentarColgados,
}) {
  return (
    <div className="filter-bar traz-toolbar">
      <div className="search-field traz-search-field">
        <LuSearch className="icon" />
        <input
          type="text"
          placeholder="Buscar por Admisión, Cns, Factura, Job ID, Usuario..."
          value={draft.query}
          onChange={(e) => onDraftChange({ query: e.target.value })}
          aria-label="Buscar por referencia"
        />
      </div>

      <div className="filter-spacer" />

      <div className="filter-cluster">
        <FormSelect
          id="traz-estado"
          ariaLabel="Estado"
          value={draft.estado}
          onChange={(v) => onDraftChange({ estado: v })}
          options={ESTADO_OPTIONS}
        />
        <FormSelect
          id="traz-tipo"
          ariaLabel="Tipo de operación"
          value={draft.tipo}
          onChange={(v) => onDraftChange({ tipo: v })}
          options={TIPO_OPTIONS}
        />
        <div className="traz-date-field">
          <label htmlFor="traz-desde" className="filter-label">Desde</label>
          <input id="traz-desde" type="date" value={draft.desde} onChange={(e) => onDraftChange({ desde: e.target.value })} />
        </div>
        <div className="traz-date-field">
          <label htmlFor="traz-hasta" className="filter-label">Hasta</label>
          <input id="traz-hasta" type="date" value={draft.hasta} onChange={(e) => onDraftChange({ hasta: e.target.value })} />
        </div>
      </div>

      <div className="traz-toolbar-actions">
        <Button variant="secondary" icon={LuX} onClick={onLimpiar}>Limpiar</Button>
        <Button variant="primary" icon={LuRefreshCw} onClick={onBuscar}>Buscar</Button>
        <Button variant="secondary" icon={LuWrench} onClick={onReintentarColgados}>Reintentar Colgados (&gt;30m)</Button>
      </div>
    </div>
  );
}
