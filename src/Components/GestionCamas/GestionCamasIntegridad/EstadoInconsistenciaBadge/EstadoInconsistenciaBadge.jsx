import './EstadoInconsistenciaBadge.css';
import { ESTADO_LABEL } from '@/hooks/GestionCamas/mockIntegridadData';
import { LuCircleCheck, LuEyeOff, LuTriangleAlert } from 'react-icons/lu';

// Activa/Corregida/Ignorada — estado de SEGUIMIENTO de la inconsistencia
// (encargo, sección 10), distinto del Impacto (ver ImpactoBadge). "Ignorada"
// no es un estado positivo ni negativo (encargo: "no significa eliminar la
// inconsistencia"), por eso usa gris neutro y no rojo/verde.
const ESTADO_ICONO = {
  activa: LuTriangleAlert,
  corregida: LuCircleCheck,
  ignorada: LuEyeOff,
};

export default function EstadoInconsistenciaBadge({ estado }) {
  const Icon = ESTADO_ICONO[estado];
  return (
    <span className={`cbi-estado-badge cbi-estado-${estado}`}>
      <Icon className="icon" aria-hidden="true" />
      {ESTADO_LABEL[estado]}
    </span>
  );
}
