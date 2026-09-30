'use client';

import { LuCircleCheck, LuPackage } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import { iniciaEnLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { primeraPorRecibir } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastaAlerta.css';

// Atajo a lo accionable: la primera cirugía (por hora) con la canasta
// despachada por recibir, o el estado verde si no hay ninguna pendiente.
export default function CanastaAlerta({ cirugias, ahora, onVerificar }) {
  const porRecibir = primeraPorRecibir(cirugias);
  if (!porRecibir) {
    return (
      <div className="cnc-alerta cnc-alerta-ok" role="status">
        <LuCircleCheck className="cnc-alerta-icon" aria-hidden="true" />
        <span>No hay canastas despachadas pendientes de recibir.</span>
      </div>
    );
  }
  const cuando = iniciaEnLabel(porRecibir, ahora);
  return (
    <div className="cnc-alerta" role="status">
      <LuPackage className="cnc-alerta-icon" aria-hidden="true" />
      <span className="cnc-alerta-text">
        <strong>{porRecibir.paciente.nombre} · {porRecibir.horaInicio}</strong> — {cuando.charAt(0).toLowerCase() + cuando.slice(1)}. Tiene una canasta despachada por recibir.
      </span>
      <Button variant="outline" size="sm" onClick={() => onVerificar(porRecibir.id)}>Verificar ahora</Button>
    </div>
  );
}
