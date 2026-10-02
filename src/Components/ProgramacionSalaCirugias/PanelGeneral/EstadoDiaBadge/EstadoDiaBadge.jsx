'use client';

import './EstadoDiaBadge.css';
import {
  LuCalendarX, LuCircleCheck, LuCircleX, LuClock, LuHeartPulse, LuTimer,
} from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import { ESTADO_VISUAL_LABEL } from '@/hooks/ProgramacionSalaCirugias/panel/panel';

// Estado visual derivado de la hora (ver estadoVisual en panel.js): ícono +
// texto, nunca solo color. Distinto de EstadoCirugiaBadge, que muestra el
// estado guardado (programada/urgencia/realizada/...).
const META = {
  pendiente: { tone: 'neutral', icon: LuClock },
  'en-curso': { tone: 'info', icon: LuHeartPulse },
  retrasada: { tone: 'warn', icon: LuTimer },
  finalizada: { tone: 'success', icon: LuCircleCheck },
  cancelada: { tone: 'danger', icon: LuCircleX },
  incumplida: { tone: 'neutral', icon: LuCalendarX },
};

export default function EstadoDiaBadge({ estado }) {
  const { tone, icon: Icon } = META[estado];
  return (
    <Badge tone={tone} className="edb-badge">
      <Icon className="icon" aria-hidden="true" />
      {ESTADO_VISUAL_LABEL[estado]}
    </Badge>
  );
}
