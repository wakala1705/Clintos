'use client';

import Badge from '@/Components/Badge/Badge';
import { INCONSISTENCIAS } from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';
import './InconsistenciaBadge.css';

// Tipo de inconsistencia de una programación vencida -- texto + punto de
// color, nunca solo color (ver AGENTS.md "Badges").
export default function InconsistenciaBadge({ tipo }) {
  const meta = INCONSISTENCIAS[tipo];
  return (
    <Badge tone={meta.tone} dot className="rv-inconsistencia-badge">
      {meta.label}
    </Badge>
  );
}
