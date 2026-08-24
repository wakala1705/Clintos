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

// Categoría del indicador de género/edad en BedCard (encargo explícito) — 3
// valores mutuamente excluyentes: "nino" prioriza sobre `genero` (un
// paciente pediátrico se identifica por edad, el mock no distingue su
// género en este indicador simplificado). 18 años como corte no está
// confirmado por ningún documento fuente — límite de prototipo (mayoría de
// edad), no una regla clínica. `null` cuando no hay datos suficientes, para
// que BedCard no pinte un indicador sin sentido.
const EDAD_PEDIATRICA = 18;

export function categoriaPaciente({ genero, edad } = {}) {
  if (typeof edad === 'number' && edad < EDAD_PEDIATRICA) return 'nino';
  if (genero === 'femenino' || genero === 'masculino') return genero;
  return null;
}

// Clave "clinical-status" del panel de BedCard (encargo explícito, rediseño
// 2 paneles v2 — "8 estados en 2 grupos", ver tokens --clinical-status-* en
// GestionCamas.css/shared.css): Libre/Reservada/Mantenimiento/Bloqueada/
// Limpieza llevan una clave fija 1:1 con `cama.estado`; Ocupada es la única
// que se separa en 3 según población del paciente (pediátrico prioriza
// sobre género, mismo criterio que categoriaPaciente). "Bloqueada" (nombre
// interno del estado, ver ESTADOS/TRANSICIONES_PERMITIDAS en
// mockCamasData.js — no se renombra, ver ESTADO_LABEL_CARD en BedCard.jsx)
// mapea a "out-of-service" ("Fuera de servicio" del encargo). `unknown`
// (paciente sin género ni edad registrados) no está en la tabla de 8
// estados del encargo — fallback propio, ver --red-solid en BedCard.css.
const ESTADO_CLINICAL_STATUS = {
  libre: 'available',
  reservada: 'reserved',
  limpieza: 'cleaning',
  mantenimiento: 'maintenance',
  bloqueada: 'out-of-service',
};
const CATEGORIA_CLINICAL_STATUS = {
  nino: 'occupied-pediatric', femenino: 'occupied-female', masculino: 'occupied-male',
};

export function cardHue(cama) {
  if (cama.estado === 'ocupada') {
    const categoria = categoriaPaciente(cama.paciente);
    return CATEGORIA_CLINICAL_STATUS[categoria] || 'unknown';
  }
  return ESTADO_CLINICAL_STATUS[cama.estado] || 'unknown';
}

// Leyenda del footer del Bed Board (encargo explícito: "actualicemos y
// agreguemos las leyendas de los estados") — clave = mismo valor que
// devuelve `cardHue`, así que un consumidor solo necesita
// `camas.map(cardHue)` para saber qué entradas de leyenda mostrar, sin
// reimplementar la lógica de población. Vive acá (no en BedBoardModal.jsx)
// porque es la misma taxonomía de 8 estados/2 grupos que ya define
// `cardHue` — mismo criterio "un solo lugar" que el resto de este archivo.
// Los labels son específicos de la leyenda (distinguen población: "Ocupada
// — masculino/femenino/pediátrico"), no los mismos que ESTADO_LABEL_CARD de
// BedCard.jsx (ahí los 3 casos comparten "Ocupada" a secas porque el color
// del panel ya distingue población en la propia tarjeta).
export const CLINICAL_STATUS_LABEL = {
  'occupied-male': 'Ocupada — masculino',
  'occupied-female': 'Ocupada — femenino',
  'occupied-pediatric': 'Ocupada — pediátrico',
  available: 'Disponible',
  reserved: 'Reservada',
  maintenance: 'En mantenimiento',
  'out-of-service': 'Fuera de servicio',
  cleaning: 'En limpieza',
  unknown: 'Ocupada — sin datos',
};

// 2 grupos (encargo explícito, sección "Agrupación visual en la UI") —
// mismo orden de la tabla original: clínicos (cama↔paciente) primero,
// administrativos (cama como recurso físico) después. "unknown" queda
// fuera de ambos grupos a propósito: no es uno de los 8 estados validados,
// solo aparece si algún día falta género/edad de un paciente ocupado.
export const CLINICAL_STATUS_GROUPS = [
  {
    label: 'Estados clínicos',
    claves: ['occupied-male', 'occupied-female', 'occupied-pediatric', 'available', 'reserved'],
  },
  {
    label: 'Estados administrativos',
    claves: ['maintenance', 'out-of-service', 'cleaning'],
  },
];

// Línea "67 años · 3 días de estancia" (encargo explícito) — cada mitad es
// opcional (`null` si falta el dato) para que nunca se arme un string a
// medias tipo "años ·" o "· días de estancia"; si faltan las 2, `null`
// entero (mismo criterio "nunca fila vacía" que InfoLine).
export function formatEdadEstancia({ edad, diasEstancia } = {}) {
  const partes = [];
  if (typeof edad === 'number') partes.push(`${edad} años`);
  if (typeof diasEstancia === 'number') partes.push(`${diasEstancia} ${diasEstancia === 1 ? 'día' : 'días'} de estancia`);
  return partes.length ? partes.join(' · ') : null;
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
