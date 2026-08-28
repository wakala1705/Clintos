// Mock de "Tipos de turno" (V1, ver AGENTS.md — solo tipos de turno + turnos
// permitidos por enfermera, sin disponibilidad semanal/rotaciones/reglas
// avanzadas). IDs estables usados también por mockEnfermerasData.js
// (turnosPermitidos) para no acoplar ese archivo a los nombres, que sí son
// editables desde NuevoTurnoModal.
export const TURNO_ID = {
  MANANA: 'manana',
  TARDE: 'tarde',
  NOCHE: 'noche',
};

export const ESTADO_TURNO_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

// Duración en horas entre horaInicio/horaFin ("HH:MM", 24h) — soporta
// turnos que cruzan medianoche (Noche: 22:00–06:00) sumando 24h cuando el
// fin cae numéricamente antes que el inicio.
export function duracionHoras(horaInicio, horaFin) {
  const [hi, mi] = horaInicio.split(':').map(Number);
  const [hf, mf] = horaFin.split(':').map(Number);
  let minutos = (hf * 60 + mf) - (hi * 60 + mi);
  if (minutos <= 0) minutos += 24 * 60;
  return Math.round(minutos / 60);
}

export const TIPOS_TURNO_INICIALES = [
  {
    id: TURNO_ID.MANANA, nombre: 'Mañana', horaInicio: '06:00', horaFin: '14:00', estado: 'activo',
  },
  {
    id: TURNO_ID.TARDE, nombre: 'Tarde', horaInicio: '14:00', horaFin: '22:00', estado: 'activo',
  },
  {
    id: TURNO_ID.NOCHE, nombre: 'Noche', horaInicio: '22:00', horaFin: '06:00', estado: 'activo',
  },
];

// Tono de badge por tipo de turno (encargo: Mañana azul claro / Tarde
// morado claro / Noche verde claro) — keyeado por id, no por nombre, para
// que un turno renombrado desde el modal conserve su tono.
export const TURNO_BADGE_TONE = {
  [TURNO_ID.MANANA]: 'blue',
  [TURNO_ID.TARDE]: 'violet',
  [TURNO_ID.NOCHE]: 'green',
};
