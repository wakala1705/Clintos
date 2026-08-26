// Datos mock de "Mantenimiento" — tareas de mantenimiento preventivo/
// correctivo sobre camas, independientes del tablero de Estados visuales en
// GestionCamas.jsx (mismo criterio de pantalla propia que Limpieza/Reservas).
// SEDES/AREAS propias (no se importan de mockCamasData.js) — mismo criterio
// de duplicación por pantalla que mockLimpiezaData.js/mockReservasData.js.
//
// `cama` usa el mismo valor que el campo `numero` de mockCamasData.js — es
// el punto de enganche para la sincronización futura Mantenimiento↔Camas
// (encargo sección 13): esta pantalla no la implementa, solo deja la
// estructura de datos lista para ese cruce.
export const SEDES = [
  { value: 'todas', label: 'Todas las sedes' },
  { value: 'central', label: 'Sede Central' },
  { value: 'norte', label: 'Sede Norte' },
  { value: 'sur', label: 'Sede Sur' },
];

export const AREAS = [
  { value: 'todas', label: 'Todas las áreas' },
  { value: 'urgencias', label: 'Urgencias' },
  { value: 'uci', label: 'UCI' },
  { value: 'hospitalizacion', label: 'Hospitalización' },
  { value: 'pediatria', label: 'Pediatría' },
];

export const TIPOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
];

export const PRIORIDADES = [
  { value: 'todas', label: 'Todas' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
];

export const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'programado', label: 'Programado' },
  { value: 'en-proceso', label: 'En proceso' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
];

export const PISOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'piso-1', label: 'Piso 1' },
  { value: 'piso-2', label: 'Piso 2' },
];

export const SECTORES = [
  { value: 'todos', label: 'Todos' },
  { value: 'sector-a', label: 'Sector A' },
  { value: 'sector-b', label: 'Sector B' },
  { value: 'sector-c', label: 'Sector C' },
];

export const SEDE_LABEL = Object.fromEntries(SEDES.slice(1).map((s) => [s.value, s.label]));
export const AREA_LABEL = Object.fromEntries(AREAS.slice(1).map((a) => [a.value, a.label]));
export const TIPO_LABEL = Object.fromEntries(TIPOS.slice(1).map((t) => [t.value, t.label]));
export const PRIORIDAD_LABEL = Object.fromEntries(PRIORIDADES.slice(1).map((p) => [p.value, p.label]));
export const ESTADO_LABEL = Object.fromEntries(ESTADOS.slice(1).map((e) => [e.value, e.label]));

export const USUARIO_ACTUAL = { nombre: 'Camilo Grondona', rol: 'Administrador' };

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// "26 Ago 2026" — columna Fecha programada de la tabla (junto con
// formatHoraCorta) y bloque Detalle del modal (junto con " · ").
export function formatFecha(ts) {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

// "10:00"
export function formatHoraCorta(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// "26 Ago" — sin año/hora, para la lista de Historial (encargo sección 11,
// ejemplo literal: "26 Ago · Programado").
export function formatFechaCorta(ts) {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`;
}

// Fechas de la semilla, todas en Agosto 2026 — constructor local (no
// `new Date('2026-08-26')`, que Date parsea como UTC y puede correrse un día
// según el huso horario del navegador).
function fechaAgosto2026(dia, hora, minuto = 0) {
  return new Date(2026, 7, dia, hora, minuto).getTime();
}

let historialSeq = 0;
function evento(tipo, titulo, dia, hora, usuario) {
  historialSeq += 1;
  return {
    id: `H-${historialSeq}`, tipo, titulo, fecha: fechaAgosto2026(dia, hora), usuario,
  };
}

// Semilla visible de la tabla (encargo sección 6, los 8 registros de ejemplo
// literal). KPIS/OFFSETS abajo cubren el resto del universo "global" que no
// forma parte de esta muestra — mismo patrón que mockLimpiezaData.js.
export const MANTENIMIENTOS_SEED = [
  {
    id: 'MNT-1',
    cama: '101-A',
    ubicacion: 'Piso 1 · Sector A',
    piso: 'piso-1',
    sector: 'sector-a',
    sede: 'central',
    area: 'urgencias',
    tipo: 'preventivo',
    prioridad: 'media',
    estado: 'programado',
    fechaProgramada: fechaAgosto2026(26, 10, 0),
    responsable: 'Juan Pérez',
    descripcion: 'Revisión general de estructura, ruedas y mecanismos de elevación.',
    historial: [
      evento('creado', 'Creado por Administrador', 25, 8, 'Administrador'),
      evento('programado', 'Programado', 25, 8, 'Administrador'),
    ],
  },
  {
    id: 'MNT-2',
    cama: '102-B',
    ubicacion: 'Piso 1 · Sector A',
    piso: 'piso-1',
    sector: 'sector-a',
    sede: 'central',
    area: 'urgencias',
    tipo: 'correctivo',
    prioridad: 'alta',
    estado: 'en-proceso',
    fechaProgramada: fechaAgosto2026(26, 14, 0),
    responsable: 'María Gómez',
    descripcion: 'Reparación de freno de rueda delantera derecha, reportado por enfermería.',
    historial: [
      evento('creado', 'Creado por Administrador', 25, 11, 'Administrador'),
      evento('programado', 'Programado', 25, 11, 'Administrador'),
      evento('iniciado', 'Mantenimiento iniciado', 26, 14, 'María Gómez'),
    ],
  },
  {
    id: 'MNT-3',
    cama: '103-C',
    ubicacion: 'Piso 2 · Sector B',
    piso: 'piso-2',
    sector: 'sector-b',
    sede: 'central',
    area: 'uci',
    tipo: 'preventivo',
    prioridad: 'baja',
    estado: 'vencido',
    fechaProgramada: fechaAgosto2026(24, 9, 0),
    responsable: 'Carlos Ruiz',
    descripcion: 'Revisión periódica de barandas y sistema eléctrico de la cama.',
    historial: [
      evento('creado', 'Creado por Administrador', 22, 9, 'Administrador'),
      evento('programado', 'Programado', 22, 9, 'Administrador'),
    ],
  },
  {
    id: 'MNT-4',
    cama: '104-A',
    ubicacion: 'Piso 1 · Sector B',
    piso: 'piso-1',
    sector: 'sector-b',
    sede: 'norte',
    area: 'hospitalizacion',
    tipo: 'correctivo',
    prioridad: 'alta',
    estado: 'en-proceso',
    fechaProgramada: fechaAgosto2026(25, 16, 0),
    responsable: 'Luis Martínez',
    descripcion: 'Cambio de actuador eléctrico de la sección de respaldo.',
    historial: [
      evento('creado', 'Creado por Administrador', 24, 10, 'Administrador'),
      evento('programado', 'Programado', 24, 10, 'Administrador'),
      evento('iniciado', 'Mantenimiento iniciado', 25, 16, 'Luis Martínez'),
    ],
  },
  {
    id: 'MNT-5',
    cama: '105-B',
    ubicacion: 'Piso 2 · Sector A',
    piso: 'piso-2',
    sector: 'sector-a',
    sede: 'norte',
    area: 'uci',
    tipo: 'preventivo',
    prioridad: 'media',
    estado: 'programado',
    fechaProgramada: fechaAgosto2026(27, 8, 0),
    responsable: 'Ana Rodríguez',
    descripcion: 'Revisión general de estructura, ruedas y mecanismos de elevación.',
    historial: [
      evento('creado', 'Creado por Administrador', 26, 9, 'Administrador'),
      evento('programado', 'Programado', 26, 9, 'Administrador'),
    ],
  },
  {
    id: 'MNT-6',
    cama: '106-C',
    ubicacion: 'Piso 1 · Sector C',
    piso: 'piso-1',
    sector: 'sector-c',
    sede: 'sur',
    area: 'pediatria',
    tipo: 'correctivo',
    prioridad: 'alta',
    estado: 'vencido',
    fechaProgramada: fechaAgosto2026(24, 11, 0),
    responsable: 'Javier López',
    descripcion: 'Reparación de motor de elevación de cabecera, cama inmovilizada.',
    historial: [
      evento('creado', 'Creado por Administrador', 23, 9, 'Administrador'),
      evento('programado', 'Programado', 23, 9, 'Administrador'),
    ],
  },
  {
    id: 'MNT-7',
    cama: '107-A',
    ubicacion: 'Piso 1 · Sector B',
    piso: 'piso-1',
    sector: 'sector-b',
    sede: 'sur',
    area: 'hospitalizacion',
    tipo: 'preventivo',
    prioridad: 'baja',
    estado: 'programado',
    fechaProgramada: fechaAgosto2026(28, 10, 0),
    responsable: 'Pedro Silva',
    descripcion: 'Revisión periódica de barandas y sistema eléctrico de la cama.',
    historial: [
      evento('creado', 'Creado por Administrador', 26, 9, 'Administrador'),
      evento('programado', 'Programado', 26, 9, 'Administrador'),
    ],
  },
  {
    id: 'MNT-8',
    cama: '108-B',
    ubicacion: 'Piso 1 · Sector A',
    piso: 'piso-1',
    sector: 'sector-a',
    sede: 'central',
    area: 'urgencias',
    tipo: 'correctivo',
    prioridad: 'media',
    estado: 'finalizado',
    fechaProgramada: fechaAgosto2026(25, 9, 0),
    responsable: 'María Gómez',
    descripcion: 'Ajuste de rueda trasera izquierda, ruido al desplazar la cama.',
    historial: [
      evento('creado', 'Creado por Administrador', 24, 8, 'Administrador'),
      evento('programado', 'Programado', 24, 8, 'Administrador'),
      evento('iniciado', 'Mantenimiento iniciado', 25, 9, 'María Gómez'),
      evento('finalizado', 'Mantenimiento finalizado', 25, 10, 'María Gómez'),
    ],
  },
];

// KPIs = universo global (encargo sección 4), no el conteo de la tabla ya
// filtrada — mismo patrón OFFSETS que mockLimpiezaData.js: valor fijo,
// calculado una sola vez contra la semilla de arriba.
export const KPIS = {
  programados: 12, enProceso: 4, vencidos: 2, finalizados: 25,
};

const PROGRAMADOS_INICIALES = MANTENIMIENTOS_SEED.filter((m) => m.estado === 'programado').length;
const EN_PROCESO_INICIALES = MANTENIMIENTOS_SEED.filter((m) => m.estado === 'en-proceso').length;
const VENCIDOS_INICIALES = MANTENIMIENTOS_SEED.filter((m) => m.estado === 'vencido').length;
const FINALIZADOS_INICIALES = MANTENIMIENTOS_SEED.filter((m) => m.estado === 'finalizado').length;

export const OFFSETS = {
  programados: KPIS.programados - PROGRAMADOS_INICIALES,
  enProceso: KPIS.enProceso - EN_PROCESO_INICIALES,
  vencidos: KPIS.vencidos - VENCIDOS_INICIALES,
  finalizados: KPIS.finalizados - FINALIZADOS_INICIALES,
};

// Acciones del menú "⋯" por estado (encargo sección 9) — "ver-detalle" NO
// vive acá: es el botón-ícono 👁 aparte, mismo patrón que BedTable.jsx
// (Camas). "Cancelado" no está en el encargo original; se deja solo-lectura
// por consistencia con Finalizado.
export const MENU_ACCIONES = {
  programado: [
    { action: 'iniciar-mantenimiento', label: 'Iniciar mantenimiento' },
    { action: 'reprogramar', label: 'Reprogramar' },
    { action: 'cancelar', label: 'Cancelar' },
  ],
  'en-proceso': [
    { action: 'finalizar-mantenimiento', label: 'Finalizar mantenimiento' },
    { action: 'registrar-observacion', label: 'Registrar observación' },
  ],
  vencido: [
    { action: 'iniciar-mantenimiento', label: 'Iniciar mantenimiento' },
    { action: 'reprogramar', label: 'Reprogramar' },
    { action: 'cancelar', label: 'Cancelar' },
  ],
  finalizado: [
    { action: 'ver-historial', label: 'Ver historial' },
  ],
  cancelado: [],
};
