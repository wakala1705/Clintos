import './EstadoAdminBadge.css';
import { ESTADO_COLOR, ESTADO_LABEL } from '@/hooks/GestionCamas/mockCamasAdminData';
import {
  LuCircleCheck, LuLock, LuOctagonX, LuWrench,
} from 'react-icons/lu';

// Mismo patrón "píldora ícono+texto" que EstadoCamaBadge (Bed Board) — con
// su propio nombre/CSS porque los 4 valores son el estado ADMINISTRATIVO de
// esta pantalla (Habilitada/Mantenimiento/Fuera de servicio/Bloqueada), no
// los 6 estados operativos de aquel componente (ver mockCamasAdminData.js).
const ESTADO_ICONO = {
  habilitada: LuCircleCheck,
  mantenimiento: LuWrench,
  'fuera-servicio': LuOctagonX,
  bloqueada: LuLock,
};

export default function EstadoAdminBadge({ estado }) {
  const Icon = ESTADO_ICONO[estado];
  return (
    <span className={`cba-estado-badge cba-estado-${ESTADO_COLOR[estado]}`}>
      <Icon className="icon" aria-hidden="true" />
      {ESTADO_LABEL[estado]}
    </span>
  );
}
