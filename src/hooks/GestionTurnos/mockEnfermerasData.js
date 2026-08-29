import { TURNO_ID, AREAS_SERVICIO } from './mockTurnosData';

// Reutiliza el área/servicio canónica de Gestión de turnos (ver
// mockTurnosData.js) en vez de una lista propia — encargo: "Programación de
// turnos esté 1:1 con las enfermeras registradas" implica que ambas pantallas
// recorten por exactamente las mismas 8 áreas, no dos taxonomías distintas.
export const AREAS_ENFERMERA = AREAS_SERVICIO;

// Único filtro de "estado" del listado: si la enfermera tiene turnos
// permitidos configurados o no (columna "Estado" de la tabla) — el encargo
// original nombra "Estado" y "Configuración" como dos filtros separados,
// pero la única señal de estado que modela V1 es esta; se deja un solo
// filtro para no inventar un segundo campo (ej. estado laboral) que no
// existe en ningún otro lugar del encargo.
export const ESTADO_CONFIG_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  { value: 'configurada', label: 'Configurada' },
  { value: 'pendiente', label: 'Pendiente' },
];

const AREA_LABEL = Object.fromEntries(
  AREAS_ENFERMERA.filter((a) => a.value !== 'todas').map((a) => [a.value, a.label]),
);

// Cargo por género + una porción de "Auxiliar de enfermería" (encargo: de
// los 42 registrados, agregar un cargo más además de Enfermera/Enfermero
// profesional). El cargo Auxiliar no varía por género (mismo criterio que
// el resto del proyecto: solo se distingue lo que el encargo pide).
const CARGO_POR_GENERO = { f: 'Enfermera profesional', m: 'Enfermero profesional' };
const CARGO_AUXILIAR = 'Auxiliar de enfermería';

// Única fuente de verdad de los 3 cargos del módulo — consumida tanto por el
// filtro de la tabla de Personal de enfermería (Enfermeras.jsx) como por el
// filtro de Cargo del wizard de Programación de turnos
// (SeleccionarPersonalStep.jsx), para no mantener la misma lista hardcodeada
// en dos lugares.
export const CARGO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: CARGO_POR_GENERO.f, label: CARGO_POR_GENERO.f },
  { value: CARGO_POR_GENERO.m, label: CARGO_POR_GENERO.m },
  { value: CARGO_AUXILIAR, label: CARGO_AUXILIAR },
];

// Estado de configuración SIEMPRE derivado de turnosPermitidos (nunca un
// campo independiente que pueda desincronizarse de la lista real) — mismo
// criterio que el resto del proyecto (ver AGENTS.md / mockPanelGeneralData.js).
export function estadoConfiguracion(turnosPermitidos) {
  return turnosPermitidos.length > 0 ? 'configurada' : 'pendiente';
}

// Las 5 enfermeras nombradas explícitamente en el encargo, con el área y
// los turnos permitidos tal cual se pidieron.
const NOMBRADAS = [
  {
    nombre: 'María González', genero: 'f', area: 'hosp-piso4-t1', turnos: [TURNO_ID.MANANA, TURNO_ID.TARDE],
  },
  {
    nombre: 'Ana Martínez', genero: 'f', area: 'hosp-piso4-t1', turnos: [TURNO_ID.MANANA, TURNO_ID.TARDE],
  },
  {
    nombre: 'Carlos Pérez', genero: 'm', area: 'uci', turnos: [TURNO_ID.NOCHE],
  },
  {
    nombre: 'Laura Rodríguez', genero: 'f', area: 'hosp-piso2-t1', turnos: [],
  },
  {
    nombre: 'Natalia Herrera', genero: 'f', area: 'uci', turnos: [],
  },
];

// Resto del listado hasta 42 (encargo: KPI "42 total / 38 configuradas / 4
// pendientes") generado deterministicamente combinando nombre+apellido+área+
// turnos por índice — nunca Math.random(), para que el dataset sea estable
// entre cargas (mismo criterio de estabilidad que el resto de mocks del
// proyecto). 35 configuradas + 2 pendientes acá, sumadas a las 3
// configuradas/2 pendientes ya nombradas arriba = 38/4 exacto.
const NOMBRES_F = [
  'Sofía', 'Valentina', 'Camila', 'Daniela', 'Isabella', 'Mariana', 'Paula', 'Andrea', 'Juliana', 'Gabriela',
  'Luisa', 'Carolina', 'Diana', 'Patricia', 'Adriana', 'Catalina', 'Alejandra', 'Verónica', 'Claudia', 'Silvia',
];
const NOMBRES_M = [
  'Diego', 'Andrés', 'Santiago', 'Miguel', 'Felipe', 'Javier', 'Ricardo', 'Fernando', 'Alejandro', 'Sebastián',
  'Julián', 'Nicolás', 'Esteban', 'David', 'Óscar', 'Jorge', 'Rodrigo',
];
const APELLIDOS = [
  'López', 'Gómez', 'Ramírez', 'Torres', 'Díaz', 'Vargas', 'Castro', 'Rojas', 'Ortiz', 'Silva',
  'Molina', 'Suárez', 'Reyes', 'Cárdenas', 'Salazar', 'Guerrero', 'Mendoza', 'Peña', 'Cruz', 'Aguilar',
  'Flores', 'Navarro', 'Delgado', 'Campos', 'Vega', 'Rivas', 'Pardo', 'Cortés', 'Duarte', 'Bermúdez',
  'Escobar', 'Chávez', 'Espinoza', 'Cabrera', 'Fuentes',
];
const AREAS_CICLO = [
  'urgencias', 'uci', 'hosp-general-p4-t1', 'hosp-piso2-t1', 'hosp-piso3-t1', 'hosp-piso4-t1', 'hosp-piso4-t2', 'hosp-piso5-t2',
];
const COMBOS_CONFIGURADAS = [
  [TURNO_ID.MANANA],
  [TURNO_ID.TARDE],
  [TURNO_ID.NOCHE],
  [TURNO_ID.MANANA, TURNO_ID.TARDE],
  [TURNO_ID.TARDE, TURNO_ID.NOCHE],
  [TURNO_ID.MANANA, TURNO_ID.NOCHE],
];

const GENERADAS = [];
for (let i = 0; i < 37; i += 1) {
  const esFem = i % 2 === 0;
  const nombrePool = esFem ? NOMBRES_F : NOMBRES_M;
  const pendiente = i === 35 || i === 36;
  // Cada 4to registro generado (nunca los 5 nombrados explícitamente arriba,
  // cuyo perfil ya viene fijo del encargo original) es Auxiliar en vez de
  // Enfermero/a profesional — determinístico, no Math.random(), para que el
  // dataset sea estable entre cargas.
  const esAuxiliar = i % 4 === 3;
  GENERADAS.push({
    nombre: `${nombrePool[i % nombrePool.length]} ${APELLIDOS[i % APELLIDOS.length]}`,
    genero: esFem ? 'f' : 'm',
    cargo: esAuxiliar ? CARGO_AUXILIAR : CARGO_POR_GENERO[esFem ? 'f' : 'm'],
    area: AREAS_CICLO[i % AREAS_CICLO.length],
    turnos: pendiente ? [] : COMBOS_CONFIGURADAS[i % COMBOS_CONFIGURADAS.length],
  });
}

export const ENFERMERAS_INICIALES = [...NOMBRADAS, ...GENERADAS].map((e, i) => ({
  id: `ENF-${String(i + 1).padStart(3, '0')}`,
  nombre: e.nombre,
  cargo: e.cargo ?? CARGO_POR_GENERO[e.genero],
  area: e.area,
  areaLabel: AREA_LABEL[e.area],
  turnosPermitidos: e.turnos,
  estado: estadoConfiguracion(e.turnos),
}));

// Personal que ya existe como registro de persona en el sistema pero todavía
// no fue incorporado a la configuración de turnos de este módulo (encargo
// "Agregar enfermera" — sección 2: seleccionar una enfermera EXISTENTE, sin
// crear un nuevo registro de persona). Nunca se cruza con ENFERMERAS_INICIALES
// (rango de id propio ENF-D0x) para que no haya IDs duplicados al agregar una
// desde el modal.
const DISPONIBLES = [
  { nombre: 'Renata Ibarra', genero: 'f', area: 'uci' },
  { nombre: 'Tomás Herrera', genero: 'm', area: 'urgencias' },
  { nombre: 'Camila Restrepo', genero: 'f', area: 'hosp-piso3-t1' },
  { nombre: 'Emilio Naranjo', genero: 'm', area: 'hosp-piso5-t2' },
  { nombre: 'Valeria Quintero', genero: 'f', area: 'hosp-general-p4-t1' },
  { nombre: 'Sebastián Duque', genero: 'm', area: 'uci' },
];

export const ENFERMERAS_DISPONIBLES = DISPONIBLES.map((e, i) => ({
  id: `ENF-D${String(i + 1).padStart(2, '0')}`,
  nombre: e.nombre,
  cargo: CARGO_POR_GENERO[e.genero],
  area: e.area,
  areaLabel: AREA_LABEL[e.area],
}));
