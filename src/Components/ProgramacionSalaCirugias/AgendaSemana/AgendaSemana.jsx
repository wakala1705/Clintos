'use client';

import './AgendaSemana.css';
import CirugiaCard from '../CirugiaCard/CirugiaCard';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const HORA_INICIO = 6;
const HORA_FIN = 20;
const SLOTS_POR_HORA = 2;
const SLOTS = (HORA_FIN - HORA_INICIO) * SLOTS_POR_HORA;
const HORAS = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i);
const ESTADOS_LEYENDA = ['programada', 'borrador', 'urgencia', 'cancelada', 'incumplida'];

function horaASlot(hora) {
  const [h, m] = hora.split(':').map(Number);
  return (h - HORA_INICIO) * SLOTS_POR_HORA + (m >= 30 ? 1 : 0);
}

export default function AgendaSemana({
  weekLabel, days, cirugias, selectedId, onSelect, onPrevWeek, onNextWeek,
}) {
  return (
    <div className="as-wrap">
      <div className="as-week-nav">
        <button type="button" className="as-nav-btn" aria-label="Semana anterior" onClick={onPrevWeek}>
          <LuChevronLeft className="icon" />
        </button>
        <span className="as-week-label">{weekLabel}</span>
        <button type="button" className="as-nav-btn" aria-label="Semana siguiente" onClick={onNextWeek}>
          <LuChevronRight className="icon" />
        </button>
      </div>

      <div className="as-scroll">
        <div className="as-grid">
          <div className="as-corner" />

          {days.map((d, i) => (
            <div key={d.fecha} className={`as-day-head${d.isToday ? ' today' : ''}`} style={{ gridColumn: i + 2 }}>
              <span className="as-day-label">{d.label}</span>
              <span className="as-day-num">{d.dayNum}</span>
            </div>
          ))}

          {HORAS.map((h, i) => (
            <div key={h} className="as-hour-label" style={{ gridRow: `${i * SLOTS_POR_HORA + 2} / span ${SLOTS_POR_HORA}` }}>
              {String(h).padStart(2, '0')}:00
            </div>
          ))}

          {days.flatMap((d, dayIdx) => Array.from({ length: SLOTS }, (_, slot) => (
            <div
              key={`${d.fecha}-${slot}`}
              className={`as-slot${d.isToday ? ' today' : ''}${slot % SLOTS_POR_HORA === 0 ? ' hour-start' : ''}`}
              style={{ gridColumn: dayIdx + 2, gridRow: slot + 2 }}
            />
          )))}

          {cirugias.map((c) => {
            const dayIdx = days.findIndex((d) => d.fecha === c.fecha);
            if (dayIdx === -1) return null;
            const startSlot = horaASlot(c.horaInicio);
            const endSlot = horaASlot(c.horaFin);
            return (
              <CirugiaCard
                key={c.id}
                cirugia={c}
                selected={c.id === selectedId}
                onClick={() => onSelect(c.id)}
                style={{
                  gridColumn: dayIdx + 2,
                  gridRow: `${startSlot + 2} / span ${Math.max(endSlot - startSlot, 1)}`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="as-legend">
        <span className="as-legend-title">Estados:</span>
        {ESTADOS_LEYENDA.map((estado) => (
          <EstadoCirugiaBadge key={estado} estado={estado} size="sm" />
        ))}
      </div>
    </div>
  );
}
