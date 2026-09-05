'use client';

import './AgendaSemana.css';
import CirugiaCard from '../CirugiaCard/CirugiaCard';
import FiltrosBar from '../FiltrosBar/FiltrosBar';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const HORA_INICIO = 0;
const HORA_FIN = 24;
const SLOTS_POR_HORA = 2;
const SLOTS = (HORA_FIN - HORA_INICIO) * SLOTS_POR_HORA;
const HORAS = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i);

function horaASlot(hora) {
  const [h, m] = hora.split(':').map(Number);
  return (h - HORA_INICIO) * SLOTS_POR_HORA + (m >= 30 ? 1 : 0);
}

// Inversa de horaASlot -- traduce el slot clickeado de vuelta a "HH:mm" para
// precargar la hora de inicio del wizard "Nueva cirugía" (ver onSlotClick).
function slotAHora(slot) {
  const h = HORA_INICIO + Math.floor(slot / SLOTS_POR_HORA);
  const m = (slot % SLOTS_POR_HORA) * (60 / SLOTS_POR_HORA);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function AgendaSemana({
  label, days, cirugias, selectedId, onSelect, onPrevWeek, onNextWeek,
  navPrevLabel = 'Semana anterior', navNextLabel = 'Semana siguiente',
  sedeId, salaId, onSalaChange, estado, onEstadoChange, onSlotClick,
}) {
  return (
    <div className="as-wrap">
      <div className="psc-agenda-nav">
        <div className="psc-agenda-nav-date">
          <button type="button" className="psc-agenda-nav-btn" aria-label={navPrevLabel} onClick={onPrevWeek}>
            <LuChevronLeft className="icon" />
          </button>
          <span className="psc-agenda-nav-label">{label}</span>
          <button type="button" className="psc-agenda-nav-btn" aria-label={navNextLabel} onClick={onNextWeek}>
            <LuChevronRight className="icon" />
          </button>
        </div>

        <FiltrosBar
          sedeId={sedeId}
          salaId={salaId}
          onSalaChange={onSalaChange}
          estado={estado}
          onEstadoChange={onEstadoChange}
        />
      </div>

      <div className="as-scroll">
        <div
          className="as-grid"
          style={{
            gridTemplateColumns: `64px repeat(${days.length}, minmax(130px, 1fr))`,
            gridTemplateRows: `56px repeat(${SLOTS}, 30px)`,
          }}
        >
          <div className="as-corner" />

          {days.map((d, i) => (
            <div key={d.fecha} className={`as-day-head${d.isToday ? ' today' : ''}`} style={{ gridColumn: i + 2 }}>
              <span className="as-day-label">{d.label}</span>
              <span className="as-day-num">{d.dayNum}</span>
            </div>
          ))}

          {HORAS.map((h, i) => (
            <div
              key={h}
              className={`as-hour-label${i === 0 ? ' first' : ''}`}
              style={{ gridRow: `${i * SLOTS_POR_HORA + 2} / span ${SLOTS_POR_HORA}` }}
            >
              {String(h).padStart(2, '0')}:00
            </div>
          ))}

          {days.flatMap((d, dayIdx) => Array.from({ length: SLOTS }, (_, slot) => (
            <button
              key={`${d.fecha}-${slot}`}
              type="button"
              className={`as-slot${d.isToday ? ' today' : ''}${slot % SLOTS_POR_HORA === 0 ? ' hour-start' : ''}`}
              style={{ gridColumn: dayIdx + 2, gridRow: slot + 2 }}
              onClick={() => onSlotClick?.(d.fecha, slotAHora(slot))}
              aria-label={`Programar cirugía ${d.dayNum} ${slotAHora(slot)}`}
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
    </div>
  );
}
