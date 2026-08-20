'use client';

import { useState } from 'react';
import './MiniCalendar.css';
import { addMonths, generateMonthGrid, isSameDate, monthLabel } from '@/hooks/ProgramarCita/agendaMockData';
import { LuChevronDown, LuChevronLeft, LuChevronRight, LuChevronUp } from 'react-icons/lu';
import NuevaCitaDropdown from '@/Components/ProgramarCita/NuevaCitaDropdown/NuevaCitaDropdown';

// Leyenda de estados de cita (ver ScheduleGrid.css .pc-appt-card.*): 6
// colores sin ningún punto de referencia en pantalla — la única forma de
// saber qué significa cada uno era pasar el mouse sobre una cita (title
// nativo, no descubrible) o abrir su detalle uno por uno (auditoría
// heurística #6). Reutiliza las mismas clases .pc-estado-badge/estado que
// ya pinta DetalleCitaModal, para no duplicar la paleta de colores. Vive acá
// (y no en ProgramarCita.jsx) porque se integró dentro de este mismo panel,
// debajo del calendario.
const ESTADO_LEYENDA = [
  { estado: 'agendada', label: 'Agendada' },
  { estado: 'confirmada', label: 'Confirmada' },
  { estado: 'pendiente', label: 'Pendiente' },
  { estado: 'reprogramada', label: 'Reprogramada' },
  { estado: 'no-asistio', label: 'No asistió' },
  { estado: 'cancelada', label: 'Cancelada' },
];

// `selectedDate`/`onSelectDate` conectan el mini-calendario con la agenda
// principal (ver ProgramarCita.jsx: viewDate) — clickear un día navega la
// grilla a ese día en vista "Por médico / Día", sin perder la marca de "hoy"
// (día real) que es un concepto distinto del día seleccionado/navegado.
// `onNuevaCita` dispara el mismo wizard que el botón "Agendar cita" del
// header de página (ver ProgramarCita.jsx) — un atajo más cerca del
// calendario, no un flujo distinto.
export default function MiniCalendar({ selectedDate, onSelectDate, onNuevaCita }) {
  const [collapsed, setCollapsed] = useState(false);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const { dowLabels, days } = generateMonthGrid(monthDate);

  return (
    <div className="pc-panel pc-mini-cal">
      <NuevaCitaDropdown onNuevaCita={onNuevaCita} />
      <div className="pc-mini-cal-divider"></div>

      <div className={`pc-mini-cal-head${collapsed ? ' collapsed' : ''}`}>
        <span className="pc-mini-cal-month">{monthLabel(monthDate)}</span>
        <div className="pc-mini-cal-nav">
          <button
            type="button"
            className="pc-mini-cal-nav-btn"
            aria-label="Mes anterior"
            onClick={() => setMonthDate((d) => addMonths(d, -1))}
          >
            <LuChevronLeft className="icon" />
          </button>
          <button
            type="button"
            className="pc-mini-cal-nav-btn"
            aria-label="Mes siguiente"
            onClick={() => setMonthDate((d) => addMonths(d, 1))}
          >
            <LuChevronRight className="icon" />
          </button>
          <span className="pc-mini-cal-nav-divider"></span>
          <button
            type="button"
            className="pc-mini-cal-nav-btn"
            aria-label={collapsed ? 'Expandir calendario' : 'Colapsar calendario'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <LuChevronDown className="icon" /> : <LuChevronUp className="icon" />}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="pc-mini-cal-grid">
          {dowLabels.map((d) => (
            <div className="pc-mini-cal-dow" key={d}>{d}</div>
          ))}
          {days.map((d, i) => {
            const selected = selectedDate && isSameDate(d.date, selectedDate);
            return (
              <button
                type="button"
                key={i}
                className={`pc-mini-cal-day${d.muted ? ' muted' : ''}${d.today ? ' today' : ''}${selected ? ' selected' : ''}`}
                aria-current={d.today ? 'date' : undefined}
                aria-pressed={selected || undefined}
                onClick={() => onSelectDate?.(d.date)}
              >
                {d.n}
              </button>
            );
          })}
        </div>
      )}

      <div className="pc-legend" aria-label="Referencia de colores de estado de cita">
        {ESTADO_LEYENDA.map((e) => (
          <span key={e.estado} className="pc-legend-item">
            <span className={`pc-legend-dot ${e.estado}`} aria-hidden="true"></span>
            {e.label}
          </span>
        ))}
      </div>
    </div>
  );
}
