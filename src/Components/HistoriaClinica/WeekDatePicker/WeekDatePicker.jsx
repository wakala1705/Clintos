'use client';

import { useState } from 'react';
import './WeekDatePicker.css';
import { weekDays, weekMonthLabel } from '@/hooks/HistoriaClinica/mockAgendaData';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Calendario semanal (L-D) para elegir el día de la agenda. `weekAnchor`
// gobierna la semana visible y es independiente de `selectedDate`: hojear
// semanas con las flechas no cambia el día seleccionado hasta que se hace
// clic en una píldora.
export default function WeekDatePicker({ selectedDate, onSelectDate }) {
  const [weekAnchor, setWeekAnchor] = useState(() => new Date(`${selectedDate}T00:00:00`));

  const days = weekDays(weekAnchor);
  const monthLabel = weekMonthLabel(weekAnchor);

  function goToPrevWeek() {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() - 7);
    setWeekAnchor(d);
  }

  function goToNextWeek() {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() + 7);
    setWeekAnchor(d);
  }

  return (
    <div className="wdp-card">
      <div className="wdp-header">
        <button type="button" className="wdp-nav-btn" onClick={goToPrevWeek} aria-label="Semana anterior">
          <LuChevronLeft className="icon" />
        </button>
        <span className="wdp-month-label">{monthLabel}</span>
        <button type="button" className="wdp-nav-btn" onClick={goToNextWeek} aria-label="Semana siguiente">
          <LuChevronRight className="icon" />
        </button>
      </div>
      <div className="wdp-days-row">
        {days.map((day) => (
          <button
            type="button"
            key={day.iso}
            className={`wdp-day${day.iso === selectedDate ? ' active' : ''}${day.isToday && day.iso !== selectedDate ? ' today' : ''}`}
            onClick={() => onSelectDate(day.iso)}
            aria-pressed={day.iso === selectedDate}
            aria-label={`Ver agenda del ${day.dayNumber}`}
          >
            <span className="wdp-day-letter">{day.letter}</span>
            <span className="wdp-day-number">{day.dayNumber}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
