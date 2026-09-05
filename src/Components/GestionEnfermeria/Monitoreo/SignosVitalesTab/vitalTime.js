// Formateo de fecha/hora de una lectura de signos vitales — usado por la
// tabla y el resumen de "último valor". La fecha/hora real siempre se
// muestra completa; lo relativo ("Hace 2 h") es solo un complemento, nunca
// un reemplazo (ver encargo de rediseño, punto 5).
export function toDate(fecha, hora) {
  return new Date(`${fecha}T${hora}:00`);
}

export function formatFecha(fecha) {
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

export function formatFechaHora(fecha, hora) {
  return `${formatFecha(fecha)} · ${hora}`;
}

export function formatRelative(fecha, hora) {
  const diffMs = Date.now() - toDate(fecha, hora).getTime();
  if (Number.isNaN(diffMs)) return null;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Hace instantes';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `Hace ${diffD} d`;
}
