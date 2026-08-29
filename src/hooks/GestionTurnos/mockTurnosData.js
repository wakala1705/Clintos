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

// Área o servicio canónica de Gestión de turnos — única fuente para las dos
// pantallas que necesitan el mismo recorte por servicio/unidad de
// internación (Enfermeras y Programación de turnos, ver mockEnfermerasData.js/
// mockProgramacionData.js): antes cada una tenía su propia lista de áreas
// (una genérica de 5, otra real de 8) y una enfermera podía quedar en un área
// que Programación de turnos ni siquiera ofrecía como filtro. Vive acá (en
// vez de en cualquiera de esos dos archivos) para que ambos puedan
// importarla sin depender uno del otro.
export const AREAS_SERVICIO = [
  { value: 'todas', label: 'Todas las áreas' },
  { value: 'urgencias', label: 'Urgencias' },
  { value: 'uci', label: 'UCI' },
  { value: 'hosp-general-p4-t1', label: 'Hospitalización General P4 T1' },
  { value: 'hosp-piso2-t1', label: 'Hospitalización Piso 2 T1' },
  { value: 'hosp-piso3-t1', label: 'Hospitalización Piso 3 T1' },
  { value: 'hosp-piso4-t1', label: 'Hospitalización Piso 4 T1' },
  { value: 'hosp-piso4-t2', label: 'Hospitalización Piso 4 T2' },
  { value: 'hosp-piso5-t2', label: 'Hospitalización Piso 5 T2' },
];
export const AREA_SERVICIO_LABEL = Object.fromEntries(AREAS_SERVICIO.map((a) => [a.value, a.label]));
export const AREAS_SERVICIO_PROGRAMABLES = AREAS_SERVICIO.filter((a) => a.value !== 'todas');

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
