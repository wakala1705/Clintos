'use client';

import './ActivityPanel.css';
import { formatRelativeTime } from '@/hooks/GestionCamas/formatRelativeTime';
import {
  LuArrowRightLeft, LuChevronRight, LuCircleCheck, LuClock, LuLock, LuLogOut, LuSprayCan, LuUserPlus, LuWrench,
} from 'react-icons/lu';

// Ícono + color por tipo de evento (9 tipos del encargo) — mismo criterio
// que ESTADO_ICONO en EstadoCamaBadge.jsx: vive en el componente, no en
// mockCamasData.js, para que la data no importe react-icons. Los colores
// reusan la misma paleta de 5 tonos que EstadoCamaBadge/cb-card-* (nunca uno
// nuevo, ver AGENTS.md "Estados visuales"). Exportado porque BedDetailModal
// reusa el mismo mapeo para su bloque "Actividad reciente" (mismos eventos,
// filtrados a una sola cama) en vez de duplicarlo.
export const EVENTO_CONFIG = {
  'cama-liberada': { icon: LuCircleCheck, color: 'green' },
  'paciente-asignado': { icon: LuUserPlus, color: 'blue' },
  'paciente-trasladado': { icon: LuArrowRightLeft, color: 'blue' },
  'paciente-alta': { icon: LuLogOut, color: 'green' },
  'limpieza-iniciada': { icon: LuSprayCan, color: 'amber' },
  'limpieza-finalizada': { icon: LuSprayCan, color: 'green' },
  'cama-reservada': { icon: LuClock, color: 'amber' },
  'cama-bloqueada': { icon: LuLock, color: 'gray' },
  'cama-mantenimiento': { icon: LuWrench, color: 'orange' },
  'nueva-admision': { icon: LuUserPlus, color: 'blue' },
};
export const EVENTO_CONFIG_DEFAULT = { icon: LuCircleCheck, color: 'gray' };

// Panel de contexto operativo permanente (encargo explícito: "no es una
// acción, es un panel siempre visible junto al grid de camas") — columna
// derecha fija en desktop (ver .cb-layout en GestionCamas.css), colapsa a
// drawer por debajo de --bp-desktop (ver ActivityDrawer.jsx, mismo trigger
// "Ver toda la actividad"). `now` llega desde el tick de GestionCamas.jsx
// (setInterval de 1s) para que los "Hace N min" avancen solos sin que este
// componente tenga su propio reloj.
export default function ActivityPanel({ eventos, now, onVerTodo }) {
  return (
    <aside className="cb-activity-panel" aria-label="Actividad reciente">
      <div className="cb-activity-header">
        <h2>Actividad reciente</h2>
        <button type="button" className="cb-activity-see-all" onClick={onVerTodo}>
          Ver toda la actividad
          <LuChevronRight className="icon" aria-hidden="true" />
        </button>
      </div>

      <div className="cb-activity-list">
        {eventos.length === 0 ? (
          <div className="cb-activity-empty">Sin actividad reciente.</div>
        ) : eventos.map((ev) => {
          const { icon: Icon, color } = EVENTO_CONFIG[ev.tipo] ?? EVENTO_CONFIG_DEFAULT;
          return (
            <div className="cb-activity-item" key={ev.id}>
              <span className={`cb-activity-dot dot-${color}`}>
                <Icon className="icon" aria-hidden="true" />
              </span>
              <div className="cb-activity-body">
                <div className="cb-activity-title">{ev.titulo}</div>
                <div className="cb-activity-desc">{ev.detalle}</div>
                <div className="cb-activity-time">{formatRelativeTime(ev.timestamp, now)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
