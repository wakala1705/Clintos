import './EstadoCamaBadge.css';
import { ESTADO_COLOR, ESTADO_LABEL } from '@/hooks/GestionCamas/mockCamasData';
import {
  LuBiohazard, LuCircleCheck, LuClock, LuLock, LuPowerOff, LuSprayCan, LuUser, LuWrench,
} from 'react-icons/lu';

// Ícono + texto por estado (nunca solo color, mismo criterio WCAG que
// ESTADO_ICONO en PatientsTable.jsx) — los 8 estados del Bed Board (Estados
// visuales, encargo sección 6).
const ESTADO_ICONO = {
  libre: LuCircleCheck,
  ocupada: LuUser,
  reservada: LuClock,
  limpieza: LuSprayCan,
  mantenimiento: LuWrench,
  bloqueada: LuLock,
  aislamiento: LuBiohazard,
  inactiva: LuPowerOff,
};

export default function EstadoCamaBadge({ estado }) {
  const Icon = ESTADO_ICONO[estado];
  return (
    <span className={`cb-estado-badge cb-estado-${ESTADO_COLOR[estado]}`}>
      <Icon className="icon" aria-hidden="true" />
      {ESTADO_LABEL[estado]}
    </span>
  );
}
