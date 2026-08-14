import './TaskBadges.css';
import {
  LuArrowDown, LuBan, LuCalendarClock, LuCircleCheck, LuCircleSlash, LuClock,
  LuClockAlert, LuLoaderCircle, LuMinus, LuOctagonAlert, LuTriangleAlert, LuUserRoundX,
} from 'react-icons/lu';

// PriorityBadge + StatusBadge — par de badges "ícono + texto" de Tareas de
// enfermería (nunca solo color, WCAG, mismo criterio que .pg-med-badge en
// PatientsTable.css/.dp-status-badge en shared.css). Viven en el mismo
// archivo/carpeta (no 2 componentes separados) porque son un único sistema
// visual con la misma forma (pill+ícono+texto) y siempre se leen juntos en
// cada fila de tarea — nunca se usan por separado.
export const PRIORIDAD_CONFIG = {
  critica: { label: 'Crítica', icon: LuOctagonAlert, tono: 'red' },
  alta: { label: 'Alta', icon: LuTriangleAlert, tono: 'amber' },
  normal: { label: 'Normal', icon: LuMinus, tono: 'info' },
  baja: { label: 'Baja', icon: LuArrowDown, tono: 'gray' },
};

export const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', icon: LuClock, tono: 'amber' },
  'en-curso': { label: 'En curso', icon: LuLoaderCircle, tono: 'info' },
  vencida: { label: 'Vencida', icon: LuClockAlert, tono: 'red' },
  completada: { label: 'Completada', icon: LuCircleCheck, tono: 'green' },
  reprogramada: { label: 'Reprogramada', icon: LuCalendarClock, tono: 'violet' },
  'no-realizada': { label: 'No realizada', icon: LuCircleSlash, tono: 'gray' },
  cancelada: { label: 'Cancelada', icon: LuBan, tono: 'gray' },
  'sin-asignar': { label: 'Sin asignar', icon: LuUserRoundX, tono: 'amber' },
};

export function PriorityBadge({ prioridad }) {
  const cfg = PRIORIDAD_CONFIG[prioridad];
  const Icon = cfg.icon;
  return (
    <span className={`task-badge task-badge-${cfg.tono}`}>
      <Icon className="icon" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

export function StatusBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado];
  const Icon = cfg.icon;
  return (
    <span className={`task-badge task-badge-${cfg.tono}`}>
      <Icon className="icon" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
