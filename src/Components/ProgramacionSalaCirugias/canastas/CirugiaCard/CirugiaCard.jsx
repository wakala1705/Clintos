'use client';

import Badge from '@/Components/Badge/Badge';
import EstadoCirugiaBadge from '../../EstadoCirugiaBadge/EstadoCirugiaBadge';
import { CANASTA_ESTADO_LABEL, iniciaEnLabel, resumenCanasta } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { CANASTA_META, badgeProps } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CirugiaCard.css';

export default function CirugiaCard({
  cirugia, ahora, seleccionada, onSelect,
}) {
  const { estado } = resumenCanasta(cirugia);
  return (
    <button
      type="button"
      className={`cnc-cir-card${seleccionada ? ' selected' : ''}`}
      aria-pressed={seleccionada}
      onClick={() => onSelect(cirugia.id)}
    >
      <div className="cnc-cc-hora">
        <span className="cnc-cc-hora-valor">{cirugia.horaInicio}</span>
        <span className="cnc-cc-hora-cuando">{iniciaEnLabel(cirugia, ahora)}</span>
      </div>
      <div className="cnc-cc-body">
        <div className="cnc-cc-paciente-row">
          <span className="cnc-cc-paciente">{cirugia.paciente.nombre}</span>
          {cirugia.estado === 'urgencia' && <EstadoCirugiaBadge estado="urgencia" size="sm" />}
        </div>
        <div className="cnc-cc-linea">
          <span className="cnc-cc-proc">{cirugia.procedimientoPrincipal}</span>
          <span className="cnc-cc-sep" aria-hidden="true"> · </span>
          <span className="cnc-cc-cirujano">{cirugia.cirujano}</span>
        </div>
        <div className="cnc-cc-badges">
          <Badge {...badgeProps(CANASTA_META[estado])}>{CANASTA_ESTADO_LABEL[estado]}</Badge>
        </div>
      </div>
    </button>
  );
}
