'use client';

import { LuArrowUp, LuArrowDown } from 'react-icons/lu';
import './VitalStatusTag.css';
import Badge from '@/Components/Badge/Badge';

const TONE_BY_STATUS = {
  normal: 'success',
  high: 'warn',
  low: 'warn',
  unknown: 'neutral',
};

// Diferenciación de valores fuera de rango: texto + ícono de dirección +
// color de refuerzo (nunca solo color) — ver encargo de rediseño de Signos
// Vitales, punto 6.
export default function VitalStatusTag({ status }) {
  if (!status) return null;
  return (
    <Badge tone={TONE_BY_STATUS[status.status]} className="svt-status-tag">
      {status.direction === 'up' && <LuArrowUp className="icon" aria-hidden="true" />}
      {status.direction === 'down' && <LuArrowDown className="icon" aria-hidden="true" />}
      {status.label}
    </Badge>
  );
}
