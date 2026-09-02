'use client';

import './EstadoIntervencionBadge.css';
import { LuCircleCheck } from 'react-icons/lu';

const ESTADO_LABEL = { realizada: 'Realizada' };

// Único estado en V1 (toda intervención del historial ya se realizó) --
// mapa de labels dejado explícito, no un string fijo, para que agregar un
// segundo estado a futuro sea un dato nuevo en este mapa, no una
// reescritura del componente. Ícono+texto siempre (nunca solo color), ver
// EstadoCirugiaBadge (Programación de Sala de Cirugías).
export default function EstadoIntervencionBadge({ estado }) {
  return (
    <span className="hq-estado-badge">
      <LuCircleCheck className="icon" aria-hidden="true" />
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  );
}
