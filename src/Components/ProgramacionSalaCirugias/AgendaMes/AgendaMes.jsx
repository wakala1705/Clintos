'use client';

import './AgendaMes.css';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';
import FiltrosBar from '../FiltrosBar/FiltrosBar';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { fechaISO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const ESTADOS_LEYENDA = ['programada', 'borrador', 'urgencia', 'cancelada', 'incumplida'];

// Vista Mes: grilla de calendario (dowLabels/days ya calculados por
// grillaMes en el orquestador, mismo criterio que diasVisibles para
// AgendaSemana) mostrando la cantidad de cirugías de cada día -- clic en un
// día navega a la vista Día de esa fecha (onSelectDia). Grilla con conteo en
// vez de mini-tarjetas por día: decisión confirmada con el encargo.
export default function AgendaMes({
  monthLabel, dowLabels, days, cirugias, onSelectDia, onPrevMonth, onNextMonth,
  sedeId, salaId, onSalaChange, estado, onEstadoChange,
}) {
  function cantidadDelDia(date) {
    const fecha = fechaISO(date);
    return cirugias.filter((c) => c.fecha === fecha).length;
  }

  return (
    <div className="am-wrap">
      <div className="psc-agenda-nav">
        <div className="psc-agenda-nav-date">
          <button type="button" className="psc-agenda-nav-btn" aria-label="Mes anterior" onClick={onPrevMonth}>
            <LuChevronLeft className="icon" />
          </button>
          <span className="psc-agenda-nav-label">{monthLabel}</span>
          <button type="button" className="psc-agenda-nav-btn" aria-label="Mes siguiente" onClick={onNextMonth}>
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

      <div className="am-dow-row">
        {dowLabels.map((d) => (
          <div className="am-dow" key={d}>{d}</div>
        ))}
      </div>

      <div className="am-days-grid">
        {days.map((d) => {
          const cantidad = cantidadDelDia(d.date);
          return (
            <button
              type="button"
              key={fechaISO(d.date)}
              className={`am-day${d.muted ? ' muted' : ''}${d.today ? ' today' : ''}`}
              onClick={() => onSelectDia(d.date)}
            >
              <span className="am-day-num">{d.n}</span>
              {cantidad > 0 && <span className="am-day-count">{cantidad}</span>}
            </button>
          );
        })}
      </div>

      <div className="psc-agenda-legend">
        <span className="psc-agenda-legend-title">Estados:</span>
        {ESTADOS_LEYENDA.map((estado) => (
          <EstadoCirugiaBadge key={estado} estado={estado} size="sm" />
        ))}
      </div>
    </div>
  );
}
