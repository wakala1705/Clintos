import './LimpiezaBadges.css';
import {
  LuCircleCheck, LuClock, LuShieldCheck, LuSprayCan, LuTriangleAlert,
} from 'react-icons/lu';

// EstadoLimpiezaBadge + SlaBadge — mismo criterio que PriorityBadge/
// StatusBadge en TaskBadges.jsx (GestionEnfermeria): un único sistema
// pill+ícono+texto, viven en el mismo archivo/carpeta porque siempre se leen
// juntos en cada fila de la cola de limpieza.
const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', icon: LuClock, tono: 'amber' },
  'en-proceso': { label: 'En proceso', icon: LuSprayCan, tono: 'blue' },
  finalizada: { label: 'Finalizada', icon: LuCircleCheck, tono: 'green' },
};

export function EstadoLimpiezaBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado];
  const Icon = cfg.icon;
  return (
    <span className={`cbl-badge cbl-tono-${cfg.tono}`}>
      <Icon className="icon" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

// `sla.estado` en tiempo usa un tono neutro (no verde) para no competir
// visualmente con el badge de Estado "Finalizada" — el verde queda reservado
// para "tarea completada", no para "SLA cumplido".
export function SlaBadge({ sla, slaMinutos }) {
  if (sla.estado === 'fuera-sla') {
    return (
      <span className="cbl-badge cbl-tono-red">
        <LuTriangleAlert className="icon" aria-hidden="true" />
        {`Fuera de SLA — ${sla.excedidoMin} min excedido`}
      </span>
    );
  }
  return (
    <span className="cbl-badge cbl-tono-neutral">
      <LuShieldCheck className="icon" aria-hidden="true" />
      {`En tiempo — SLA ${slaMinutos} min`}
    </span>
  );
}
