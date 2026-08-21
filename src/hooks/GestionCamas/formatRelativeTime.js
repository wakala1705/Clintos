// Formato de tiempo relativo/hora compartido por LastUpdated/ActivityPanel/
// ActivityDrawer (encargo: "Actualizado hace 12 s", "Hace 2 min", timestamps
// de la actividad reciente) — un único lugar para no repetir 3 veces la
// misma escala s→min→h en cada componente.
export function formatRelativeTime(timestampMs, nowMs = Date.now()) {
  const diffSec = Math.max(0, Math.round((nowMs - timestampMs) / 1000));
  if (diffSec < 5) return 'ahora';
  if (diffSec < 60) return `hace ${diffSec} s`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHoras = Math.round(diffMin / 60);
  return `hace ${diffHoras} h`;
}

export function formatHora(timestampMs) {
  return new Date(timestampMs).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function horaAhora() {
  return formatHora(Date.now());
}
