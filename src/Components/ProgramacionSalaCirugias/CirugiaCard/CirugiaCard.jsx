'use client';

import './CirugiaCard.css';

// Jerarquía fija horario→paciente→procedimiento→cirujano (spec sección
// "Tarjeta de cirugía"; el estado se comunica solo con el color de la card,
// sin badge). `style` viene de AgendaSemana (posición en la grilla) — este
// componente no sabe nada de horas/slots.
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
    </button>
  );
}
