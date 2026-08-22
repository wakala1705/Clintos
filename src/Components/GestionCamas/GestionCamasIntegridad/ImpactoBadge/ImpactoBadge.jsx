import './ImpactoBadge.css';
import { IMPACTO_COLOR, IMPACTO_LABEL } from '@/hooks/GestionCamas/mockIntegridadData';
import { LuCircleAlert, LuInfo, LuTriangleAlert } from 'react-icons/lu';

// Mismo lenguaje "píldora ícono+texto" que EstadoAdminBadge (Camas) — con su
// propio nombre porque acá el valor es IMPACTO (crítico/advertencia/
// informativa), no un estado de cama. Encargo explícito (sección 16): estos
// 3 colores son administrativos, no el tratamiento visual de una alerta
// clínica — mismos tokens rojo/ámbar/azul que ya usa el resto del módulo
// (nunca el componente de alerta clínica del proyecto).
const IMPACTO_ICONO = {
  critico: LuCircleAlert,
  advertencia: LuTriangleAlert,
  informativa: LuInfo,
};

export default function ImpactoBadge({ impacto }) {
  const Icon = IMPACTO_ICONO[impacto];
  return (
    <span className={`cbi-impacto-badge cbi-impacto-${IMPACTO_COLOR[impacto]}`}>
      <Icon className="icon" aria-hidden="true" />
      {IMPACTO_LABEL[impacto]}
    </span>
  );
}
