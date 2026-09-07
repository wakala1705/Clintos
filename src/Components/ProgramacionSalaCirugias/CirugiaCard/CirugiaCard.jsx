'use client';

import './CirugiaCard.css';
import CirugiaCardMenu from '../CirugiaCardMenu/CirugiaCardMenu';

// Jerarquía fija horario→paciente→procedimiento→cirujano (spec sección
// "Tarjeta de cirugía"; el estado se comunica solo con el color de la card,
// sin badge). `style` viene de AgendaSemana (posición en la grilla) — este
// componente no sabe nada de horas/slots, pero sí recibe `compact` de ahí
// (duración <= 1h, ver AgendaSemana.jsx) porque decide qué líneas mostrar:
// una cirugía corta no tiene alto para las 4 sin cortarse (encargo
// explícito), así que en compacto solo queda el paciente -- el resto sigue
// disponible en DetalleCirugiaPanel al seleccionarla. `title` (tooltip
// nativo) siempre lleva el resumen completo, mismo criterio que
// pc-appt-card en ProgramarCita/ScheduleGrid.jsx para sus cards igual de
// angostas.
//
// Raíz `<div role="button">` en vez de `<button>` (encargo explícito,
// 2026-09-07: menú "..." con Editar/Reprogramar/Marcar como realizada/
// Marcar como incumplida/Cancelar) -- un `<button>` no puede anidar otro
// `<button>` (HTML inválido, además de que el clic del menú burbujearía al
// onClick de la card). Mismo patrón que BedCard.jsx (GestionCamas):
// tabIndex+onKeyDown replican la activación por Enter/Espacio que un
// `<button>` real trae gratis, y `.cc-menu-wrap` corta la propagación del
// clic/teclado del menú para que abrirlo no seleccione/deseleccione la
// card por accidente.
export default function CirugiaCard({
  cirugia, selected, onClick, style, compact = false,
  onEditar, onReprogramar, onMarcarRealizada, onMarcarIncumplida, onCancelar,
}) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected || undefined}
      className={`cc-card cc-${cirugia.estado}${selected ? ' selected' : ''}${compact ? ' compact' : ''}`}
      style={style}
      title={`${cirugia.paciente.nombre}\n${cirugia.horaInicio} – ${cirugia.horaFin}\n${cirugia.procedimientoPrincipal}\n${cirugia.cirujano}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="cc-menu-wrap"
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <CirugiaCardMenu
          cirugia={cirugia}
          onEditar={onEditar}
          onReprogramar={onReprogramar}
          onMarcarRealizada={onMarcarRealizada}
          onMarcarIncumplida={onMarcarIncumplida}
          onCancelar={onCancelar}
        />
      </div>

      {compact ? (
        <span className="cc-paciente">{cirugia.paciente.nombre}</span>
      ) : (
        <>
          <span className="cc-horario">{cirugia.horaInicio} – {cirugia.horaFin}</span>
          <span className="cc-paciente">{cirugia.paciente.nombre}</span>
          <span className="cc-procedimiento">{cirugia.procedimientoPrincipal}</span>
          <span className="cc-cirujano">{cirugia.cirujano}</span>
        </>
      )}
    </div>
  );
}
