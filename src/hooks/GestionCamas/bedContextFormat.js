import { formatHora } from './formatRelativeTime';
import { HOY_ADMISION } from './mockCamasData';

// Formato de contexto por estado, reusado por BedCard (reposo de la
// tarjeta) y BedDetailModal (bloque "Estado actual") — vive acá para no
// duplicar la misma lógica de fechas/ETA en los 2 (ver AGENTS.md "Hooks /
// logic organization").

// "Hoy · HH:MM" si la fecha coincide con HOY_ADMISION (mock de "hoy" fijo),
// o "DD Mmm · HH:MM" para ingresos de días anteriores (los pacientes
// curados no entraron todos hoy).
export function formatIngreso(admisionIso, horaIngreso) {
  if (!horaIngreso) return null;
  if (admisionIso === HOY_ADMISION) return `Hoy · ${horaIngreso}`;
  const fecha = new Date(admisionIso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  return `${fecha} · ${horaIngreso}`;
}

function formatFechaCorta(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

// Ventana de una reserva (fechaInicio/fechaVencimiento del formulario
// "Reservar cama", ver ReservarCamaModal.jsx) — `null` cuando no hay
// fechaInicio (reservas viejas sin el campo, mismo criterio de "no mostrar
// fila vacía" que InfoLine).
export function formatVentanaReserva(fechaInicio, fechaVencimiento) {
  if (!fechaInicio) return null;
  const inicio = formatFechaCorta(fechaInicio);
  if (!fechaVencimiento) return `Desde ${inicio}`;
  return `${inicio} – ${formatFechaCorta(fechaVencimiento)}`;
}

// Limpieza: prioriza ETA sobre tiempo transcurrido (encargo explícito, "si
// la ETA está disponible, priorizar la ETA") — `etaTimestamp` llega desde
// GestionCamas.jsx (simulación de tick), nunca se calcula acá para que
// exista una única fuente de verdad del reloj de limpieza.
export function infoLimpieza(cama, etaTimestamp, now) {
  if (etaTimestamp) {
    const minsRestantes = Math.round((etaTimestamp - now) / 60000);
    const valor = minsRestantes > 0 ? `ETA ${formatHora(etaTimestamp)} · ${minsRestantes} min` : 'Finalizando…';
    return { label: 'Limpieza en progreso', valor };
  }
  if (cama.limpiezaDesde) {
    return { label: 'Limpieza en progreso', valor: `Iniciada ${cama.limpiezaDesde}` };
  }
  return { label: null, valor: null };
}
