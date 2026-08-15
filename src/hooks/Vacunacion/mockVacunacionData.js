// Mock en memoria de la pantalla principal de Vacunación (PyMS) — sin
// backend, igual que el resto del aplicativo. `TOTAL_PACIENTES_SISTEMA`/
// `KPIS` representan el universo completo de un HIS real (contexto del
// encargo: "248 pacientes encontrados", KPIs de la institución); el arreglo
// `MOCK_PACIENTES` solo trae la página visible de ejemplo (10-15 filas,
// según el encargo) — ambos números son deliberadamente independientes, no
// hay una simulación de fetch/paginación real detrás como en
// ListaPacientes/mockPatientsData.js.
export const TOTAL_PACIENTES_SISTEMA = 248;

export const KPIS = {
  conEsquema: 248,
  pendientes: 36,
  proximas: 18,
  aplicadasMes: 124,
};

export const ESQUEMA_OPTIONS = [
  { value: 'infantil', label: 'Infantil' },
  { value: 'adulto', label: 'Adulto' },
  { value: 'gestante', label: 'Gestante' },
];

export const ESTADO_OPTIONS = [
  { value: 'al-dia', label: 'Al día' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'atrasado', label: 'Atrasado' },
  { value: 'completo', label: 'Completo' },
];

export const PROXIMA_OPTIONS = [
  { value: 'hoy', label: 'Hoy' },
  { value: '7d', label: 'Próximos 7 días' },
  { value: '30d', label: 'Próximos 30 días' },
];

// Segmented control de la barra de herramientas — "Próximos" es independiente
// del Estado clínico (una vacuna "Al día" puede igual tener su próxima dosis
// en los próximos días); Pendientes/Atrasados sí leen directamente el estado.
export const QUICK_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'atrasados', label: 'Atrasados' },
  { value: 'proximos', label: 'Próximos' },
];

export const ESTADO_LABEL = Object.fromEntries(ESTADO_OPTIONS.map((o) => [o.value, o.label]));
export const ESQUEMA_LABEL = Object.fromEntries(ESQUEMA_OPTIONS.map((o) => [o.value, o.label]));

// Orden de urgencia para el ordenamiento por defecto de la tabla (jerarquía
// visual del encargo: "1. Pacientes que requieren atención" primero) —
// Atrasado y Pendiente suben antes que Al día/Completo sin necesitar una
// columna de prioridad separada.
export const ESTADO_URGENCIA = { atrasado: 0, pendiente: 1, 'al-dia': 2, completo: 3 };

// `fechaProgramadaDias`: días desde "hoy" (2026-08-15 en este entorno) hasta
// la fecha programada — negativo = vencida (atrasada), null = sin próxima
// dosis (esquema completo). Único campo numérico real detrás de fechas
// mostradas como texto; evita parsear la fecha visible para filtrar/ordenar.
export const MOCK_PACIENTES = [
  {
    id: 'p1', nombre: 'Juan Pérez', documento: 'RC 1.098.765.432', edadLabel: '2 meses', edadOrdenMeses: 2,
    sexo: 'Masculino', eps: 'Nueva EPS',
    esquema: 'infantil', estado: 'al-dia',
    proximaVacuna: { nombre: 'Pentavalente', dosis: 'Dosis 2' },
    fechaProgramadaLabel: '25 ago 2026', fechaProgramadaDias: 10,
    ultimaAplicacionLabel: 'BCG · dosis única — 15 jun 2026',
    dosisPendientes: [
      { id: 'p1-d1', vacuna: 'Pentavalente', dosis: 'Dosis 2', fechaProgramadaLabel: '25 ago 2026', estado: 'proxima', ultimaDosisLabel: 'Pentavalente · dosis 1 — 20 jun 2026' },
      { id: 'p1-d2', vacuna: 'Rotavirus', dosis: 'Dosis 2', fechaProgramadaLabel: '25 ago 2026', estado: 'proxima', ultimaDosisLabel: 'Rotavirus · dosis 1 — 20 jun 2026' },
      { id: 'p1-d3', vacuna: 'B.C.G.', dosis: 'Dosis única', fechaProgramadaLabel: '15 jun 2026', estado: 'aplicada', ultimaDosisLabel: null },
    ],
  },
  {
    id: 'p2', nombre: 'María Gómez', documento: 'RC 1.098.221.109', edadLabel: '4 meses', edadOrdenMeses: 4,
    sexo: 'Femenino', eps: 'Sura EPS',
    esquema: 'infantil', estado: 'pendiente',
    proximaVacuna: { nombre: 'Neumococo', dosis: 'Dosis 2' },
    fechaProgramadaLabel: '18 ago 2026', fechaProgramadaDias: 3,
    ultimaAplicacionLabel: 'Pentavalente · dosis 1 — 20 jun 2026',
    dosisPendientes: [
      { id: 'p2-d1', vacuna: 'Neumococo', dosis: 'Dosis 2', fechaProgramadaLabel: '18 ago 2026', estado: 'pendiente', ultimaDosisLabel: 'Neumococo · dosis 1 — 20 jun 2026' },
      { id: 'p2-d2', vacuna: 'Pentavalente', dosis: 'Dosis 2', fechaProgramadaLabel: '18 ago 2026', estado: 'pendiente', ultimaDosisLabel: 'Pentavalente · dosis 1 — 20 jun 2026' },
    ],
  },
  {
    id: 'p3', nombre: 'Carlos Ruiz', documento: 'RC 1.097.884.221', edadLabel: '1 año', edadOrdenMeses: 12,
    sexo: 'Masculino', eps: 'Sanitas EPS',
    esquema: 'infantil', estado: 'atrasado',
    proximaVacuna: { nombre: 'Triple viral', dosis: 'Dosis 1' },
    fechaProgramadaLabel: '01 jul 2026', fechaProgramadaDias: -45,
    ultimaAplicacionLabel: 'Neumococo · dosis 3 — 15 may 2026',
    dosisPendientes: [
      { id: 'p3-d1', vacuna: 'Triple viral', dosis: 'Dosis 1', fechaProgramadaLabel: '01 jul 2026', estado: 'atrasada', diasAtraso: 45, ultimaDosisLabel: 'Neumococo · dosis 3 — 15 may 2026' },
      { id: 'p3-d2', vacuna: 'D.P.T.', dosis: 'Refuerzo', fechaProgramadaLabel: '01 ago 2026', estado: 'atrasada', diasAtraso: 14, ultimaDosisLabel: 'D.P.T. · dosis 3 — 15 may 2026' },
    ],
  },
  {
    id: 'p4', nombre: 'Ana Martínez', documento: 'CC 52.884.671', edadLabel: '28 años', edadOrdenMeses: 336,
    sexo: 'Femenino', eps: 'Compensar EPS',
    esquema: 'adulto', estado: 'completo',
    proximaVacuna: null,
    fechaProgramadaLabel: null, fechaProgramadaDias: null,
    ultimaAplicacionLabel: 'Refuerzo Td — 10 mar 2026',
    dosisPendientes: [],
  },
  {
    id: 'p5', nombre: 'Laura Torres', documento: 'CC 1.020.456.789', edadLabel: '27 años', edadOrdenMeses: 324,
    sexo: 'Femenino', eps: 'Famisanar EPS',
    esquema: 'gestante', estado: 'pendiente',
    proximaVacuna: { nombre: 'dTpa (tos ferina)', dosis: 'Dosis única' },
    fechaProgramadaLabel: '20 ago 2026', fechaProgramadaDias: 5,
    ultimaAplicacionLabel: 'Influenza gestante — 02 jun 2026',
    dosisPendientes: [
      { id: 'p5-d1', vacuna: 'dTpa (tos ferina)', dosis: 'Dosis única', fechaProgramadaLabel: '20 ago 2026', estado: 'pendiente', ultimaDosisLabel: 'Influenza gestante — 02 jun 2026' },
    ],
  },
  {
    id: 'p6', nombre: 'Pedro Rodríguez', documento: 'CC 79.335.610', edadLabel: '35 años', edadOrdenMeses: 420,
    sexo: 'Masculino', eps: 'Nueva EPS',
    esquema: 'adulto', estado: 'al-dia',
    proximaVacuna: { nombre: 'Refuerzo Td', dosis: 'Dosis única' },
    fechaProgramadaLabel: '15 nov 2026', fechaProgramadaDias: 92,
    ultimaAplicacionLabel: 'Hepatitis B · dosis 3 — 15 ago 2025',
    dosisPendientes: [
      { id: 'p6-d1', vacuna: 'Refuerzo Td', dosis: 'Dosis única', fechaProgramadaLabel: '15 nov 2026', estado: 'proxima', ultimaDosisLabel: 'Hepatitis B · dosis 3 — 15 ago 2025' },
    ],
  },
  {
    id: 'p7', nombre: 'Sofía Hernández', documento: 'RC 1.099.004.552', edadLabel: '6 meses', edadOrdenMeses: 6,
    sexo: 'Femenino', eps: 'Coosalud EPS',
    esquema: 'infantil', estado: 'al-dia',
    proximaVacuna: { nombre: 'Polio', dosis: 'Dosis 3' },
    fechaProgramadaLabel: '17 ago 2026', fechaProgramadaDias: 2,
    ultimaAplicacionLabel: 'Pentavalente · dosis 3 — 15 jun 2026',
    dosisPendientes: [
      { id: 'p7-d1', vacuna: 'Polio', dosis: 'Dosis 3', fechaProgramadaLabel: '17 ago 2026', estado: 'proxima', ultimaDosisLabel: 'Polio · dosis 2 — 15 jun 2026' },
    ],
  },
  {
    id: 'p8', nombre: 'Andrés López', documento: 'RC 1.096.773.204', edadLabel: '2 años', edadOrdenMeses: 24,
    sexo: 'Masculino', eps: 'Salud Total EPS',
    esquema: 'infantil', estado: 'atrasado',
    proximaVacuna: { nombre: 'Refuerzo DPT', dosis: 'Refuerzo' },
    fechaProgramadaLabel: '01 jun 2026', fechaProgramadaDias: -75,
    ultimaAplicacionLabel: 'Triple viral · dosis 1 — 01 mar 2025',
    dosisPendientes: [
      { id: 'p8-d1', vacuna: 'D.P.T.', dosis: 'Refuerzo', fechaProgramadaLabel: '01 jun 2026', estado: 'atrasada', diasAtraso: 75, ultimaDosisLabel: 'Triple viral · dosis 1 — 01 mar 2025' },
    ],
  },
  {
    id: 'p9', nombre: 'Camila Vargas', documento: 'CC 1.015.667.332', edadLabel: '24 años', edadOrdenMeses: 288,
    sexo: 'Femenino', eps: 'Sura EPS',
    esquema: 'adulto', estado: 'completo',
    proximaVacuna: null,
    fechaProgramadaLabel: null, fechaProgramadaDias: null,
    ultimaAplicacionLabel: 'VPH · dosis 3 — 05 ene 2026',
    dosisPendientes: [],
  },
  {
    id: 'p10', nombre: 'Daniel Castro', documento: 'RC 1.099.331.087', edadLabel: '3 meses', edadOrdenMeses: 3,
    sexo: 'Masculino', eps: 'Sanitas EPS',
    esquema: 'infantil', estado: 'al-dia',
    proximaVacuna: { nombre: 'Pentavalente', dosis: 'Dosis 1' },
    fechaProgramadaLabel: '22 ago 2026', fechaProgramadaDias: 7,
    ultimaAplicacionLabel: 'BCG · dosis única — 20 may 2026',
    dosisPendientes: [
      { id: 'p10-d1', vacuna: 'Pentavalente', dosis: 'Dosis 1', fechaProgramadaLabel: '22 ago 2026', estado: 'proxima', ultimaDosisLabel: null },
    ],
  },
  {
    id: 'p11', nombre: 'Valentina Ríos', documento: 'RC 1.094.552.918', edadLabel: '5 años', edadOrdenMeses: 60,
    sexo: 'Femenino', eps: 'Compensar EPS',
    esquema: 'infantil', estado: 'pendiente',
    proximaVacuna: { nombre: 'Refuerzo SRP', dosis: 'Refuerzo' },
    fechaProgramadaLabel: '19 ago 2026', fechaProgramadaDias: 4,
    ultimaAplicacionLabel: 'Varicela · dosis 1 — 19 ago 2025',
    dosisPendientes: [
      { id: 'p11-d1', vacuna: 'S.R.P. (Tripleviral)', dosis: 'Refuerzo', fechaProgramadaLabel: '19 ago 2026', estado: 'pendiente', ultimaDosisLabel: 'Varicela · dosis 1 — 19 ago 2025' },
    ],
  },
  {
    id: 'p12', nombre: 'Jorge Salazar', documento: 'CC 80.221.446', edadLabel: '45 años', edadOrdenMeses: 540,
    sexo: 'Masculino', eps: 'Famisanar EPS',
    esquema: 'adulto', estado: 'atrasado',
    proximaVacuna: { nombre: 'Refuerzo Td', dosis: 'Dosis única' },
    fechaProgramadaLabel: '01 may 2026', fechaProgramadaDias: -106,
    ultimaAplicacionLabel: 'Influenza — 01 may 2025',
    dosisPendientes: [
      { id: 'p12-d1', vacuna: 'Refuerzo Td', dosis: 'Dosis única', fechaProgramadaLabel: '01 may 2026', estado: 'atrasada', diasAtraso: 106, ultimaDosisLabel: 'Influenza — 01 may 2025' },
    ],
  },
  {
    // Único caso "sin esquema activo" del set — ver VacunaStep.jsx. Se
    // mantiene con esquema/estado válidos ('adulto'/'completo', igual que
    // p4/p9) para no romper el badge de la tabla principal; `sinEsquemaActivo`
    // es un flag propio, leído solo por el modal "Registrar vacunación".
    id: 'p13', nombre: 'Roberto Díaz', documento: 'CC 91.334.221', edadLabel: '52 años', edadOrdenMeses: 624,
    sexo: 'Masculino', eps: 'Salud Total EPS',
    esquema: 'adulto', estado: 'completo', sinEsquemaActivo: true,
    proximaVacuna: null,
    fechaProgramadaLabel: null, fechaProgramadaDias: null,
    ultimaAplicacionLabel: null,
    dosisPendientes: [],
  },
];

// Catálogo simplificado para "+ Registrar vacuna fuera del esquema" (Paso 2
// del modal "Registrar vacunación") — mismos biológicos que la matriz de
// EsquemaVacunacion.jsx, sin duplicar esa lista completa (acá solo hace
// falta el nombre para el selector).
export const VACUNAS_CATALOGO = [
  'B.C.G.', 'Polio', 'Antihepatitis B', 'Haemophilus I', 'D.P.T.', 'Antirotavirus',
  'Antineumococo', 'Influenza estacional', 'S.R.P. (Tripleviral)', 'Fiebre Amarilla',
  'Hepatitis A', 'Varicela', 'VPH', 'dTpa (tos ferina)', 'Refuerzo Td', 'COVID-19',
];

export const MOTIVOS_FUERA_ESQUEMA = [
  { value: 'indicada', label: 'Indicada por profesional' },
  { value: 'campana', label: 'Campaña' },
  { value: 'recuperacion', label: 'Recuperación de esquema' },
  { value: 'externa', label: 'Vacunación externa' },
  { value: 'otro', label: 'Otro' },
];

export const VIA_ADMINISTRACION_OPTIONS = ['Intramuscular', 'Subcutánea', 'Oral', 'Intradérmica'];

export const SITIO_APLICACION_OPTIONS = ['Brazo derecho', 'Brazo izquierdo', 'Muslo derecho', 'Muslo izquierdo', 'Otro'];

// Estado de una dosis puntual dentro del esquema de UN paciente (distinto del
// `estado` general del paciente en MOCK_PACIENTES, que resume TODO su
// esquema) — usado por VacunaStep.jsx al listar "Vacunas pendientes".
export const DOSIS_ESTADO_LABEL = {
  pendiente: 'Pendiente',
  proxima: 'Próxima',
  atrasada: 'Atrasada',
  aplicada: 'Aplicada',
};

export function normalize(str) {
  return (str || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// `proxima` es el value de PROXIMA_OPTIONS ('hoy'/'7d'/'30d'); usado tanto
// por el filtro dedicado como por el quick filter "Próximos" (ver
// QUICK_FILTERS), que internamente equivale a '7d'.
export function matchesProxima(dias, proxima) {
  if (dias === null || dias === undefined || dias < 0) return false;
  if (proxima === 'hoy') return dias === 0;
  if (proxima === '7d') return dias <= 7;
  if (proxima === '30d') return dias <= 30;
  return true;
}
