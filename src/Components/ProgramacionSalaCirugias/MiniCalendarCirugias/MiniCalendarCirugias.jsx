'use client';

import { useState } from 'react';
import './MiniCalendarCirugias.css';
import { addMeses, grillaMes, mesLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  LuChevronDown, LuChevronLeft, LuChevronRight, LuChevronUp, LuTriangleAlert,
} from 'react-icons/lu';
import ProgramarCirugiaDropdown from '../ProgramarCirugiaDropdown/ProgramarCirugiaDropdown';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';

const ESTADOS_LEYENDA = ['programada', 'urgencia', 'realizada', 'cancelada', 'incumplida'];

// Bloque único de la columna lateral (mismo lugar que MiniCalendar en
// Programar cita, ver .psc-side-col en ProgramacionSalaCirugias.css): 4
// secciones separadas por .mcc-divider — acción principal "Programar
// cirugía", mini-calendario, resumen de agenda y leyenda de estados. Las
// acciones sobre una cirugía seleccionada ("Reprogramar"/"Cancelar"/"Más
// acciones") viven en el drawer de detalle (ver DetalleCirugiaPanel.jsx), no
// acá -- encargo explícito: este panel se estira hasta el fondo de la
// pantalla (ver .mcc-panel en MiniCalendarCirugias.css) y ya no depende de
// si hay una cirugía seleccionada. La leyenda de estados se trasladó acá
// desde el pie de AgendaSemana/AgendaMes (.psc-agenda-legend, encargo
// explícito) -- antes vivía duplicada al pie de cada vista del calendario.
export default function MiniCalendarCirugias({
  selectedDate, onSelectDate, onNuevaCirugia, onNuevaUrgencia, resumen,
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

      {/* Resumen operativo de la agenda actualmente visible (sala/estado/
          rango de la grilla principal, ver resumenAgenda en
          mockCirugiaData.js) -- no colapsa junto con el calendario (`!collapsed`
          de arriba solo esconde .mcc-grid): es un bloque propio, no una
          extensión del mini-calendario. Sin tarjeta/borde propio (encargo
          explícito "no crear una tarjeta visualmente pesada") -- mismo
          criterio minimalista que .mcc-legend de abajo, solo título + grid. */}
      <div className="mcc-divider" />
      <div className="mcc-resumen">
        <span className="mcc-resumen-title">Resumen de agenda</span>
        <div className="mcc-resumen-grid">
          <div className="mcc-resumen-stat">
            <span className="mcc-resumen-value">{resumen.totalCirugias}</span>
            <span className="mcc-resumen-label">Cirugías programadas</span>
          </div>
          <div className="mcc-resumen-stat">
            <span className="mcc-resumen-value">{resumen.horasOcupadasLabel}</span>
            <span className="mcc-resumen-label">Horas ocupadas</span>
          </div>
          <div className="mcc-resumen-stat">
            <span className="mcc-resumen-value">{resumen.salasOcupadas} / {resumen.salasTotal}</span>
            <span className="mcc-resumen-label">Salas ocupadas</span>
          </div>
          <div className="mcc-resumen-stat">
            <span className="mcc-resumen-value">{resumen.ocupacionPct}%</span>
            <span className="mcc-resumen-label">Ocupación</span>
          </div>
        </div>
        {resumen.urgencias > 0 && (
          <div className="mcc-resumen-urgencia">
            <LuTriangleAlert className="icon" aria-hidden="true" />
            <span>{resumen.urgencias} {resumen.urgencias === 1 ? 'cirugía de urgencia' : 'cirugías de urgencia'}</span>
          </div>
        )}
      </div>

      <div className="mcc-legend-group">
        <div className="mcc-divider" />

        <div className="mcc-legend">
          <span className="mcc-legend-title">Estados:</span>
          <div className="mcc-legend-list">
            {ESTADOS_LEYENDA.map((estado) => (
              <EstadoCirugiaBadge key={estado} estado={estado} size="sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
