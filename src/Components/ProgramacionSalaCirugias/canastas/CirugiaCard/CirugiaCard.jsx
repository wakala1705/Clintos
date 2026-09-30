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
  // Sin número de pedido ('—') la canasta aún no se solicitó: no hay nada que mostrar.
  const numeroPedido = cirugia.farmacia?.numeroPedido;
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
        {/* Hasta 2 líneas; el nombre completo va en el tooltip. El cirujano no va en la
            card: ya está en el detalle y competía por el espacio con el procedimiento. */}
        <p className="cnc-cc-proc" title={cirugia.procedimientoPrincipal}>{cirugia.procedimientoPrincipal}</p>
        <div className="cnc-cc-badges">
          <Badge {...badgeProps(CANASTA_META[estado])}>{CANASTA_ESTADO_LABEL[estado]}</Badge>
          {numeroPedido && numeroPedido !== '—' && <span className="cnc-cc-solicitud" title={`Solicitud ${numeroPedido}`}>{numeroPedido}</span>}
        </div>
      </div>
    </button>
  );
}
