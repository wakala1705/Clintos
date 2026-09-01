'use client';

import './EstadoCirugiaBadge.css';
import {
  LuCalendarX, LuCircleCheck, LuCircleX, LuPencil, LuTriangleAlert,
} from 'react-icons/lu';

// Ícono + texto siempre visibles (nunca solo color, ver AGENTS.md/WCAG) —
// mismo patrón "píldora" que TurnoBadges/EstadoCamaBadge, un componente por
// feature en vez de una clase .badge genérica compartida.
const META = {
  borrador: { label: 'Borrador', icon: LuPencil, tone: 'blue' },
  programada: { label: 'Programada', icon: LuCircleCheck, tone: 'green' },
  urgencia: { label: 'Urgencia', icon: LuTriangleAlert, tone: 'violet' },
  cancelada: { label: 'Cancelada', icon: LuCircleX, tone: 'red' },
  incumplida: { label: 'Incumplida', icon: LuCalendarX, tone: 'gray' },
};

export default function EstadoCirugiaBadge({ estado, size = 'base' }) {
  const meta = META[estado];
  const Icon = meta.icon;
  return (
    <span className={`esb-badge esb-${meta.tone} esb-${size}`}>
      <Icon className="icon" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
