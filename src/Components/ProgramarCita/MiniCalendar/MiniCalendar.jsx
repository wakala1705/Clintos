'use client';

import { useState } from 'react';
import './MiniCalendar.css';
import { addMonths, generateMonthGrid, isSameDate, monthLabel } from '@/hooks/ProgramarCita/agendaMockData';
import { LuChevronDown, LuChevronLeft, LuChevronRight, LuChevronUp } from 'react-icons/lu';

// `selectedDate`/`onSelectDate` conectan el mini-calendario con la agenda
// principal (ver ProgramarCita.jsx: viewDate) — clickear un día navega la
// grilla a ese día en vista "Por médico / Día", sin perder la marca de "hoy"
// (día real) que es un concepto distinto del día seleccionado/navegado.
export default function MiniCalendar({ selectedDate, onSelectDate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const { dowLabels, days } = generateMonthGrid(monthDate);

  return (
    <div className="pc-panel pc-mini-cal">
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
    </div>
  );
}
