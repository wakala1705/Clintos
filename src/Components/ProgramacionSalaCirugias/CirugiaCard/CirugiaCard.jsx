'use client';

import './CirugiaCard.css';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';

// Jerarquía fija horario→paciente→procedimiento→cirujano→estado (spec
// sección "Tarjeta de cirugía"). `style` viene de AgendaSemana (posición en
// la grilla) — este componente no sabe nada de horas/slots.
export default function CirugiaCard({
  cirugia, selected, onClick, style,
}) {
  return (
    <button
      type="button"
      className={`cc-card cc-${cirugia.estado}${selected ? ' selected' : ''}`}
      style={style}
      onClick={onClick}
    >
      <span className="cc-horario">{cirugia.horaInicio} – {cirugia.horaFin}</span>
      <span className="cc-paciente">{cirugia.paciente.nombre}</span>
      <span className="cc-procedimiento">{cirugia.procedimientoPrincipal}</span>
      <span className="cc-cirujano">{cirugia.cirujano}</span>
      <EstadoCirugiaBadge estado={cirugia.estado} size="sm" />
    </button>
  );
}
