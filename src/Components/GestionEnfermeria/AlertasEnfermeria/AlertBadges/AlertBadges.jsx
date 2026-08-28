import './AlertBadges.css';
import {
  LuActivity, LuArrowDown, LuArrowRightLeft, LuCircleAlert, LuCircleCheck, LuClipboardCheck, LuClipboardList,
  LuClockAlert, LuClockArrowUp, LuListChecks, LuOctagonAlert, LuPill, LuSparkles, LuStethoscope, LuSyringe, LuTriangleAlert,
} from 'react-icons/lu';

// mockAlertasData.js guarda los íconos de TIPOS_ALERTA/accion como *nombre*
// (string), no como componente — un módulo de datos puro no debería importar
// react-icons (mismo criterio que TIPOS_TAREA/PROGRAMACION_ICONO en
// TaskTable.jsx, que resuelven su propio ícono localmente). Este mapa central
// traduce esos nombres a componentes para AlertTable/AlertDetailDrawer/los 3
// modales de acción, que comparten el mismo catálogo de tipos.
export const ICONOS_ALERTA = {
  LuPill, LuSyringe, LuActivity, LuClipboardList, LuClipboardCheck, LuSparkles, LuArrowRightLeft, LuListChecks, LuCircleCheck, LuOctagonAlert, LuStethoscope,
};

// PriorityBadge + StatusBadge del Centro de Alertas — mismo patrón
// pill+ícono que TaskBadges.jsx (Tareas de enfermería), en su propio
// componente/carpeta (no se reutiliza TaskBadges directo: los estados de
// alerta son otro dominio, aunque compartan la forma visual).
export const PRIORIDAD_CONFIG = {
  critica: { label: 'Crítica', icon: LuOctagonAlert, tono: 'red' },
  alta: { label: 'Alta', icon: LuTriangleAlert, tono: 'amber' },
  media: { label: 'Media', icon: LuCircleAlert, tono: 'yellow' },
  baja: { label: 'Baja', icon: LuArrowDown, tono: 'info' },
};

// El estado "Pendiente" toma el tono de la PRIORIDAD de la alerta (encargo
// explícito, sección 5) — nunca un ámbar fijo: una pendiente crítica se debe
// leer roja también en la columna Estado, no solo en Prioridad. "Vencida"
// es siempre roja sin importar prioridad (encargo: "las alertas vencidas
// deben identificarse claramente") — no compite con el tono de prioridad.
export function StatusBadge({ estado, prioridad }) {
  if (estado === 'pendiente') {
    const cfg = PRIORIDAD_CONFIG[prioridad];
    const Icon = cfg.icon;
    return (
      <span className={`alert-badge alert-badge-${cfg.tono}`}>
        <Icon className="icon" aria-hidden="true" />
        Pendiente
      </span>
    );
  }
  const cfg = {
    vencida: { label: 'Vencida', icon: LuClockAlert, tono: 'red' },
    resuelta: { label: 'Resuelta', icon: LuCircleCheck, tono: 'green' },
    pospuesta: { label: 'Pospuesta', icon: LuClockArrowUp, tono: 'gray' },
  }[estado];
  const Icon = cfg.icon;
  return (
    <span className={`alert-badge alert-badge-${cfg.tono}`}>
      <Icon className="icon" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ prioridad }) {
  const cfg = PRIORIDAD_CONFIG[prioridad];
  const Icon = cfg.icon;
  return (
    <span className={`alert-badge alert-badge-${cfg.tono}`}>
      <Icon className="icon" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
