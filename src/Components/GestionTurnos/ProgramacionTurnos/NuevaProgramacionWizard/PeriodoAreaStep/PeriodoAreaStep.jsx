'use client';

import './PeriodoAreaStep.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREAS_TURNOS_PROGRAMABLES, addDias, addMeses, mesLabel, rangoSemanaLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Paso 1 del wizard — tipo de período (segmented control reutilizando
// `.chip-group.segmented` ya global, ver GestionTurnos.css) + navegación
// prev/siguiente (reutiliza `.day-nav*` ya global, mismo patrón que el
// header del calendario) + AreaSelector (mismo componente que el filtro de
// header de ProgramacionTurnos.jsx). Siempre válido por default (semana/área
// ya vienen precargadas desde la pantalla activa al abrir el wizard) — no
// hay estado de error que mostrar acá.
export default function PeriodoAreaStep({
  tipo, onTipoChange, weekStart, onWeekStartChange, monthStart, onMonthStartChange, area, onAreaChange,
}) {
  return (
    <div className="pas-step">
      <h4 className="npw-step-title">Define el período de programación</h4>

      <div className="form-field">
        <label>Tipo de período</label>
        <div className="chip-group segmented">
          <button
            type="button"
            className={`chip-filter${tipo === 'semana' ? ' active' : ''}`}
            aria-pressed={tipo === 'semana'}
            onClick={() => onTipoChange('semana')}
          >
            Semana
          </button>
          <button
            type="button"
            className={`chip-filter${tipo === 'mes' ? ' active' : ''}`}
            aria-pressed={tipo === 'mes'}
            onClick={() => onTipoChange('mes')}
          >
            Mes
          </button>
        </div>
      </div>

      {tipo === 'semana' ? (
        <div className="form-field">
          <label>Semana</label>
          <div className="day-nav">
            <button type="button" className="day-nav-btn" aria-label="Semana anterior" onClick={() => onWeekStartChange(addDias(weekStart, -7))}>
              <LuChevronLeft className="icon" />
            </button>
            <span className="day-nav-label">{rangoSemanaLabel(weekStart)}</span>
            <button type="button" className="day-nav-btn" aria-label="Semana siguiente" onClick={() => onWeekStartChange(addDias(weekStart, 7))}>
              <LuChevronRight className="icon" />
            </button>
          </div>
        </div>
      ) : (
        <div className="form-field">
          <label>Mes</label>
          <div className="day-nav">
            <button type="button" className="day-nav-btn" aria-label="Mes anterior" onClick={() => onMonthStartChange(addMeses(monthStart, -1))}>
              <LuChevronLeft className="icon" />
            </button>
            <span className="day-nav-label">{mesLabel(monthStart)}</span>
            <button type="button" className="day-nav-btn" aria-label="Mes siguiente" onClick={() => onMonthStartChange(addMeses(monthStart, 1))}>
              <LuChevronRight className="icon" />
            </button>
          </div>
        </div>
      )}

      <div className="form-field">
        <label htmlFor="pas-area">Área o servicio</label>
        <FormSelect
          id="pas-area"
          value={area}
          onChange={onAreaChange}
          options={AREAS_TURNOS_PROGRAMABLES}
          placeholder="Selecciona un área o servicio"
        />
        {!area && <span className="pas-form-error">Selecciona un área o servicio para continuar.</span>}
      </div>
    </div>
  );
}
