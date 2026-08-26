import './MantenimientoBadges.css';
import {
  LuBan, LuCalendarClock, LuCircleCheck, LuTriangleAlert, LuWrench,
} from 'react-icons/lu';

const ESTADO_CONFIG = {
  programado: { label: 'Programado', icon: LuCalendarClock, tono: 'blue' },
  'en-proceso': { label: 'En proceso', icon: LuWrench, tono: 'amber' },
  vencido: { label: 'Vencido', icon: LuTriangleAlert, tono: 'red' },
  finalizado: { label: 'Finalizado', icon: LuCircleCheck, tono: 'green' },
  cancelado: { label: 'Cancelado', icon: LuBan, tono: 'neutral' },
};

export function EstadoMantenimientoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado];
  const Icon = cfg.icon;
  return (
    <span className={`cbm-badge cbm-tono-${cfg.tono}`}>
      <Icon className="icon" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

const PRIORIDAD_CONFIG = {
  alta: { label: 'Alta', tono: 'red' },
  media: { label: 'Media', tono: 'amber' },
  baja: { label: 'Baja', tono: 'neutral' },
};

// Sin ícono (encargo sección 8: "no utilizar iconos grandes") — a diferencia
// de EstadoMantenimientoBadge, esta píldora es solo texto.
export function PrioridadBadge({ prioridad }) {
  const cfg = PRIORIDAD_CONFIG[prioridad];
  return <span className={`cbm-badge cbm-tono-${cfg.tono}`}>{cfg.label}</span>;
}
