import './TurnoBadges.css';
import { LuCheck, LuCircleCheck, LuCircleDashed, LuPause } from 'react-icons/lu';
import { TURNO_BADGE_TONE } from '@/hooks/ConfiguracionTurnos/mockTurnosData';

// Badges de Configuración de turnos (mismo patrón pill+ícono que
// AlertBadges.jsx — un componente por feature, no un genérico compartido
// entre features, ver AGENTS.md).
export function TurnoBadge({ turnoId, label }) {
  return (
    <span className={`ct-badge ct-badge-${TURNO_BADGE_TONE[turnoId] ?? 'gray'}`}>
      {label}
    </span>
  );
}

export function EstadoTurnoBadge({ estado }) {
  const activo = estado === 'activo';
  return (
    <span className={`ct-badge ${activo ? 'ct-badge-green' : 'ct-badge-gray'}`}>
      {activo ? <LuCheck className="icon" aria-hidden="true" /> : <LuPause className="icon" aria-hidden="true" />}
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

// "Configurada" en verde, "Pendiente" en naranja/rojo suave (encargo,
// sección 2/4) — usa el mismo tono ámbar que el resto del proyecto para
// "atención requerida sin ser un error" (ver --amber-*, AGENTS.md).
export function EstadoConfigBadge({ estado }) {
  const configurada = estado === 'configurada';
  return (
    <span className={`ct-badge ${configurada ? 'ct-badge-green' : 'ct-badge-amber'}`}>
      {configurada ? <LuCircleCheck className="icon" aria-hidden="true" /> : <LuCircleDashed className="icon" aria-hidden="true" />}
      {configurada ? 'Configurada' : 'Pendiente'}
    </span>
  );
}
