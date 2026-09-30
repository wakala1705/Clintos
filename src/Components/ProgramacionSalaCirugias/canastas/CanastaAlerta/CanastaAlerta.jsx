'use client';

import { LuPackage } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import { iniciaEnLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './CanastaAlerta.css';

// Atajo a la SIGUIENTE canasta despachada por recibir (`cirugia`, distinta de
// la que ya está abierta en el detalle). El orquestador no lo monta si no hay
// otra pendiente.
export default function CanastaAlerta({ cirugia, ahora, onVerificar }) {
  const cuando = iniciaEnLabel(cirugia, ahora);
  return (
    <div className="cnc-alerta" role="status">
      <LuPackage className="cnc-alerta-icon" aria-hidden="true" />
      <span className="cnc-alerta-text">
        <strong className="cnc-alerta-titulo">Siguiente por recibir</strong>
        {cirugia.paciente.nombre} · {cirugia.horaInicio} — {cuando.charAt(0).toLowerCase() + cuando.slice(1)}
      </span>
      <Button variant="outline" size="sm" onClick={() => onVerificar(cirugia.id)}>Verificar ahora</Button>
    </div>
  );
}
