// Orden de las filas de la vista Tabla de la agenda: por fecha, luego hora de
// inicio y, a igualdad (agenda por médicos cruza salas), por sala. No muta la
// lista original.
export function ordenarCirugiasAgenda(cirugias) {
  return [...cirugias].sort(
    (a, b) => a.fecha.localeCompare(b.fecha)
      || a.horaInicio.localeCompare(b.horaInicio)
      || a.salaId.localeCompare(b.salaId),
  );
}
