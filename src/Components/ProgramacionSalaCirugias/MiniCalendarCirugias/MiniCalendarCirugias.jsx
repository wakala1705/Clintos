'use client';

import { useState } from 'react';
import './MiniCalendarCirugias.css';
import { addMeses, grillaMes, mesLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuChevronDown, LuChevronLeft, LuChevronRight, LuChevronUp } from 'react-icons/lu';
import ProgramarCirugiaDropdown from '../ProgramarCirugiaDropdown/ProgramarCirugiaDropdown';
import AccionesBar from '../AccionesBar/AccionesBar';

// Bloque único de la columna lateral (mismo lugar que MiniCalendar en
// Programar cita, ver .psc-side-col en ProgramacionSalaCirugias.css): 3
// secciones separadas por .mcc-divider — acción principal "Programar
// cirugía", mini-calendario, "Otras acciones" (depende de una cirugía
// seleccionada) al final. Sin leyenda de estados propia: ya vive al pie de
// AgendaSemana (.as-legend), duplicarla acá solo agregaría una segunda
// fuente para lo mismo.
export default function MiniCalendarCirugias({
  selectedDate, onSelectDate, onNuevaCirugia, onNuevaUrgencia,
  selected, onReprogramar, onCancelar, onMarcarProgramada, onMarcarIncumplida, onVerInfo,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const { dowLabels, days } = grillaMes(monthDate);

  function esMismoDia(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  return (
    <div className="mcc-panel">
      <ProgramarCirugiaDropdown onNuevaCirugia={onNuevaCirugia} onNuevaUrgencia={onNuevaUrgencia} />

      <div className="mcc-divider" />

      <div className={`mcc-head${collapsed ? ' collapsed' : ''}`}>
        <span className="mcc-month">{mesLabel(monthDate)}</span>
        <div className="mcc-nav">
          <button
            type="button"
            className="mcc-nav-btn"
            aria-label="Mes anterior"
            onClick={() => setMonthDate((d) => addMeses(d, -1))}
          >
            <LuChevronLeft className="icon" />
          </button>
          <button
            type="button"
            className="mcc-nav-btn"
            aria-label="Mes siguiente"
            onClick={() => setMonthDate((d) => addMeses(d, 1))}
          >
            <LuChevronRight className="icon" />
          </button>
          <span className="mcc-nav-divider" />
          <button
            type="button"
            className="mcc-nav-btn"
            aria-label={collapsed ? 'Expandir calendario' : 'Colapsar calendario'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <LuChevronDown className="icon" /> : <LuChevronUp className="icon" />}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="mcc-grid">
          {dowLabels.map((d) => (
            <div className="mcc-dow" key={d}>{d}</div>
          ))}
          {days.map((d, i) => {
            const diaSeleccionado = selectedDate && esMismoDia(d.date, selectedDate);
            return (
              <button
                type="button"
                key={i}
                className={`mcc-day${d.muted ? ' muted' : ''}${d.today ? ' today' : ''}${diaSeleccionado ? ' selected' : ''}`}
                aria-current={d.today ? 'date' : undefined}
                aria-pressed={diaSeleccionado || undefined}
                onClick={() => onSelectDate?.(d.date)}
              >
                {d.n}
              </button>
            );
          })}
        </div>
      )}

      <div className="mcc-divider" />

      <AccionesBar
        selected={selected}
        onReprogramar={onReprogramar}
        onCancelar={onCancelar}
        onMarcarProgramada={onMarcarProgramada}
        onMarcarIncumplida={onMarcarIncumplida}
        onVerInfo={onVerInfo}
      />
    </div>
  );
}
