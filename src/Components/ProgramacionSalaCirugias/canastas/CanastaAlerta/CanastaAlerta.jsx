'use client';

import { LuCircleCheck, LuTriangleAlert } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import { gateCirugia, iniciaEnLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './CanastaAlerta.css';

// Primera cirugía con inicio bloqueado (compuerta `bloqueada`; una urgencia
// que aún puede autorizarse no cuenta) o, si no hay ninguna, el estado verde.
export default function CanastaAlerta({ cirugias, ahora, onVerificar }) {
  const bloqueada = cirugias.find((c) => gateCirugia(c) === 'bloqueada');
  if (!bloqueada) {
    return (
      <div className="cnc-alerta cnc-alerta-ok" role="status">
        <LuCircleCheck className="cnc-alerta-icon" aria-hidden="true" />
        <span>Ninguna cirugía programada está bloqueada por su canasta.</span>
      </div>
    );
  }
  const cuando = iniciaEnLabel(bloqueada, ahora);
  return (
    <div className="cnc-alerta" role="status">
      <LuTriangleAlert className="cnc-alerta-icon" aria-hidden="true" />
      <span className="cnc-alerta-text">
        <strong>{bloqueada.paciente.nombre} · {bloqueada.horaInicio}</strong> — {cuando.charAt(0).toLowerCase() + cuando.slice(1)}.
        {' '}La cirugía está bloqueada hasta recibir su canasta.
      </span>
      <Button variant="warning-outline" size="sm" onClick={() => onVerificar(bloqueada.id)}>Verificar ahora</Button>
    </div>
  );
}
