'use client';

import './PeriodoAreaStep.css';
import {
  AREAS_TURNOS_PROGRAMABLES, addDias, addMeses, mesLabel, rangoSemanaLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Paso 1 del wizard — tipo de período + navegación prev/siguiente (reutiliza
// `.day-nav*` ya global, mismo patrón que el header del calendario), ambos
// agrupados en una sola fila (`.pas-row`) para ganar el espacio vertical que
// se le da a la tabla de área. Siempre válido por default (semana/área ya
// vienen precargadas desde la pantalla activa al abrir el wizard) — no hay
// estado de error que mostrar en ese bloque.
//
// Tipo de período y Área o servicio son el mismo tipo de campo (selección
// única y excluyente, con consecuencia real sobre la programación que se va
// a crear — no un filtro de vista) así que comparten tratamiento: radio
// buttons en vez de un segmented control (que en el resto del proyecto se
// reserva para alternar la vista de un listado, no para un dato del
// formulario). Mismo criterio que ".at-tipo-option" en AsignarTurnoModal.css:
// mejor usabilidad para una sola opción entre pocas, y en el caso del área
// además ahorra el click de abrir el dropdown.
export default function PeriodoAreaStep({
  tipo, onTipoChange, weekStart, onWeekStartChange, monthStart, onMonthStartChange, area, onAreaChange,
}) {
  return (
    <div className="pas-step">
      <h4 className="npw-step-title">Define el período de programación</h4>

      <div className="pas-row">
        <div className="form-field">
          <label id="pas-tipo-label">Tipo de período</label>
          <div className="pas-tipo-group" role="radiogroup" aria-labelledby="pas-tipo-label">
            <label className={`pas-tipo-option${tipo === 'semana' ? ' checked' : ''}`}>
              <input type="radio" name="pas-tipo" checked={tipo === 'semana'} onChange={() => onTipoChange('semana')} />
              Semana
            </label>
            <label className={`pas-tipo-option${tipo === 'mes' ? ' checked' : ''}`}>
              <input type="radio" name="pas-tipo" checked={tipo === 'mes'} onChange={() => onTipoChange('mes')} />
              Mes
            </label>
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
      </div>

      <div className="form-field">
        <label id="pas-area-label">Área o servicio<span className="req">*</span></label>
        <div className="pas-area-table" role="radiogroup" aria-labelledby="pas-area-label">
          <table>
            <thead>
              <tr><th>Área o servicio</th></tr>
            </thead>
            <tbody>
              {AREAS_TURNOS_PROGRAMABLES.map((a) => (
                <tr
                  key={a.value}
                  className={area === a.value ? 'selected' : ''}
                  onClick={() => onAreaChange(a.value)}
                >
                  <td>
                    <label className="pas-area-row">
                      <input
                        type="radio"
                        name="pas-area"
                        checked={area === a.value}
                        onChange={() => onAreaChange(a.value)}
                      />
                      {a.label}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
