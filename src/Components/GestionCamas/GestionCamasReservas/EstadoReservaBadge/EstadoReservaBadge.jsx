import './EstadoReservaBadge.css';
import {
  LuBan, LuBedDouble, LuCircleCheck, LuClock, LuTriangleAlert,
} from 'react-icons/lu';

// EstadoReservaBadge — mismo criterio "píldora ícono+texto" que
// EstadoLimpiezaBadge (nunca solo color, WCAG). 5 estados de una reserva
// (encargo sección 9): Pendiente/Confirmada/Utilizada + las 2 salidas
// (Vencida automática, Cancelada manual). "Vencida" usa tono naranja (no
// ámbar) para no confundirse con "Pendiente" al escanear la columna.
const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', icon: LuClock, tono: 'amber' },
  confirmada: { label: 'Confirmada', icon: LuCircleCheck, tono: 'green' },
  utilizada: { label: 'Utilizada', icon: LuBedDouble, tono: 'violet' },
  vencida: { label: 'Vencida', icon: LuTriangleAlert, tono: 'orange' },
  cancelada: { label: 'Cancelada', icon: LuBan, tono: 'gray' },
};

export default function EstadoReservaBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado];
  const Icon = cfg.icon;
  return (
    <span className={`cbr-badge cbr-tono-${cfg.tono}`}>
      <Icon className="icon" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
