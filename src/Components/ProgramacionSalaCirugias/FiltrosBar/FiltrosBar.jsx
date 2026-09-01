'use client';

import './FiltrosBar.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  ESTADO_FILTRO_OPTIONS, SALAS, SEDES, addDias, fechaISO, fechaLabel,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Vista Día/Mes: solo Semana está implementada en V1 (spec, sección
// "Alcance") — los otros 2 botones quedan visibles y clickeables pero
// jamás quedan "active": onVistaNoDisponible (pasado por el orquestador)
// dispara un toast en vez de cambiar de vista. Conectar una vista real acá
// implica agregar un tercer estado a este control y pasarlo hacia arriba
// como prop adicional, sin tocar el resto del feature.
export default function FiltrosBar({
  sedeId, onSedeChange, salaId, onSalaChange, weekStart, onWeekStartChange, estado, onEstadoChange, onVistaNoDisponible,
}) {
  const salasDeSede = SALAS.filter((s) => s.sedeId === sedeId);

  return (
    <div className="fb-bar">
      <div className="form-field">
        <label htmlFor="fb-sede">Sede</label>
        <FormSelect id="fb-sede" value={sedeId} onChange={onSedeChange} options={SEDES} />
      </div>
      <div className="form-field">
        <label htmlFor="fb-sala">Sala / Quirófano</label>
        <FormSelect
          id="fb-sala"
          value={salaId}
          onChange={onSalaChange}
          options={salasDeSede.map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>
      <div className="form-field">
        <label id="fb-fecha-label">Fecha</label>
        <div className="fb-fecha-nav" role="group" aria-labelledby="fb-fecha-label">
          <button type="button" className="fb-fecha-btn" aria-label="Semana anterior" onClick={() => onWeekStartChange(addDias(weekStart, -7))}>
            <LuChevronLeft className="icon" />
          </button>
          <span className="fb-fecha-value">{fechaLabel(fechaISO(weekStart))}</span>
          <button type="button" className="fb-fecha-btn" aria-label="Semana siguiente" onClick={() => onWeekStartChange(addDias(weekStart, 7))}>
            <LuChevronRight className="icon" />
          </button>
        </div>
      </div>
      <div className="form-field">
        <label id="fb-vista-label">Vista</label>
        <div className="chip-group segmented" role="group" aria-labelledby="fb-vista-label">
          <button type="button" className="chip-filter" onClick={onVistaNoDisponible}>Día</button>
          <button type="button" className="chip-filter active" aria-pressed="true">Semana</button>
          <button type="button" className="chip-filter" onClick={onVistaNoDisponible}>Mes</button>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="fb-estado">Estado</label>
        <FormSelect id="fb-estado" value={estado} onChange={onEstadoChange} options={ESTADO_FILTRO_OPTIONS} />
      </div>
    </div>
  );
}
