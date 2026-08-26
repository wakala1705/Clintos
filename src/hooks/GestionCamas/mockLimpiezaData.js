// Datos mock de "Limpieza" — cola operativa de camas pendientes/en proceso/
// finalizadas de limpieza (encargo: pantalla nueva dentro de Gestión de
// Camas, independiente del tablero de Estados visuales en GestionCamas.jsx).
// SEDES/AREAS propias (no se importan de mockCamasData.js) — mismo criterio
// de duplicación por pantalla que mockAuditoriaData.js/mockIntegridadData.js.
export const SEDES = [
  { value: 'todas', label: 'Todas las sedes' },
  { value: 'central', label: 'Sede Central' },
];

export const AREAS = [
  { value: 'todas', label: 'Todas las áreas' },
  { value: 'uci', label: 'UCI' },
  { value: 'urgencias', label: 'Urgencias' },
  { value: 'hospitalizacion', label: 'Hospitalización' },
];

// Únicos 3 estados operativos (encargo explícito: "No conviertas 'Fuera de
// SLA' en un estado" — el SLA es una condición independiente, ver TIEMPOS).
export const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en-proceso', label: 'En proceso' },
  { value: 'finalizada', label: 'Finalizada' },
];

export const TIEMPOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'en-tiempo', label: 'En tiempo' },
  { value: 'fuera-sla', label: 'Fuera de SLA' },
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
];

export const SEDE_LABEL = Object.fromEntries(SEDES.slice(1).map((s) => [s.value, s.label]));
export const AREA_LABEL = Object.fromEntries(AREAS.slice(1).map((a) => [a.value, a.label]));

export const SLA_MINUTOS = 30;

// Usuario actual — mismo literal que `user` en el `<Topbar>` de esta y el
// resto de pantallas de Gestión de Camas (no hay sesión real todavía). Se usa
// para autoasignar responsable al confirmar "Iniciar limpieza" (encargo: "el
// usuario que inicia la limpieza se convierte automáticamente en
// responsable", sin flujo de "Asignar responsable" en esta V1).
export const USUARIO_ACTUAL = { nombre: 'Camilo Grondona', rol: 'Administrador' };

export function calcularSlaInfo(elapsedMin) {
  if (elapsedMin > SLA_MINUTOS) return { estado: 'fuera-sla', excedidoMin: elapsedMin - SLA_MINUTOS };
  return { estado: 'en-tiempo' };
}

// KPIs = "resumen global de la operación del día" (encargo sección 1),
// independiente de los filtros/tabs que recorta la tabla — por eso Pendientes
// puede marcar 4 aunque la cola de abajo solo tenga 2 filas pendientes: hay
// 2 camas pendientes más en el hospital que no forman parte de esta muestra.
// OFFSETS captura exactamente esa diferencia (valor fijo, calculado una sola
// vez contra la semilla de abajo) — al sumarlo al conteo EN VIVO de `tareas`
// en GestionCamasLimpieza.jsx, el KPI queda sincronizado con cada Iniciar/
// Finalizar sin necesitar lógica de incremento manual repartida en cada
// handler.
export const KPIS = {
  pendientes: 4,
  enProceso: 2,
  finalizadas: 18,
  fueraSla: 1,
};

// Semilla de la cola visible — `tiempoInicialMin` (pendiente/en-proceso) se
// usa para reconstruir `inicioTs` de forma perezosa al montar el componente
// (Date.now() - tiempoInicialMin*60000, mismo patrón que ACTIVIDAD_INICIAL en
// mockCamasData.js) para que el minutaje inicial coincida con el ejemplo del
// encargo y a partir de ahí siga corriendo en tiempo real de verdad.
export const TAREAS_SEED = [
  {
    id: 'LMP-1',
    cama: '103-C',
    ubicacion: 'Piso 2 · Sector B',
    piso: 'piso-2',
    sector: 'sector-b',
    sede: 'central',
    area: 'uci',
    estado: 'pendiente',
    tiempoInicialMin: 44,
    responsable: null,
  },
  {
    id: 'LMP-2',
    cama: '101-A',
    ubicacion: 'Piso 1 · Sector A',
    piso: 'piso-1',
    sector: 'sector-a',
    sede: 'central',
    area: 'urgencias',
    estado: 'pendiente',
    tiempoInicialMin: 12,
    responsable: null,
  },
  {
    id: 'LMP-3',
    cama: '102-B',
    ubicacion: 'Piso 1 · Sector B',
    piso: 'piso-1',
    sector: 'sector-b',
    sede: 'central',
    area: 'urgencias',
    estado: 'en-proceso',
    tiempoInicialMin: 23,
    responsable: { nombre: 'Juan Pérez', rol: 'Aux. Servicios' },
  },
  {
    id: 'LMP-4',
    cama: '101-B',
    ubicacion: 'Piso 1 · Sector B',
    piso: 'piso-1',
    sector: 'sector-b',
    sede: 'central',
    area: 'hospitalizacion',
    estado: 'en-proceso',
    tiempoInicialMin: 8,
    responsable: { nombre: 'Laura Morales', rol: 'Aux. Servicios' },
  },
  {
    id: 'LMP-5',
    cama: '104-A',
    ubicacion: 'Piso 2 · Sector A',
    piso: 'piso-2',
    sector: 'sector-a',
    sede: 'central',
    area: 'uci',
    estado: 'finalizada',
    desdeFinalizada: '07:45',
    completadaHora: '08:05',
    tiempoTotalMin: 20,
    slaFinal: { estado: 'en-tiempo' },
    responsable: { nombre: 'Ana Castro', rol: 'Aux. Servicios' },
  },
  {
    id: 'LMP-6',
    cama: '105-A',
    ubicacion: 'Piso 2 · Sector A',
    piso: 'piso-2',
    sector: 'sector-a',
    sede: 'central',
    area: 'uci',
    estado: 'finalizada',
    desdeFinalizada: '07:30',
    completadaHora: '07:50',
    tiempoTotalMin: 20,
    slaFinal: { estado: 'en-tiempo' },
    responsable: { nombre: 'Ana Castro', rol: 'Aux. Servicios' },
  },
];

const PENDIENTES_INICIALES = TAREAS_SEED.filter((t) => t.estado === 'pendiente').length;
const EN_PROCESO_INICIALES = TAREAS_SEED.filter((t) => t.estado === 'en-proceso').length;
const FINALIZADAS_INICIALES = TAREAS_SEED.filter((t) => t.estado === 'finalizada').length;
// KPI "Fuera de SLA" = solo pendientes que superaron el SLA (encargo sección
// 1, literal) — más angosto que el tab/filtro "Fuera de SLA" de la tabla, que
// sí incluye en-proceso/finalizada (encargo sección 4: el SLA es una
// dimensión independiente del estado, aplica a cualquiera de los 3).
const FUERA_SLA_PENDIENTES_INICIALES = TAREAS_SEED
  .filter((t) => t.estado === 'pendiente' && t.tiempoInicialMin > SLA_MINUTOS).length;

export const OFFSETS = {
  pendientes: KPIS.pendientes - PENDIENTES_INICIALES,
  enProceso: KPIS.enProceso - EN_PROCESO_INICIALES,
  finalizadas: KPIS.finalizadas - FINALIZADAS_INICIALES,
  fueraSla: KPIS.fueraSla - FUERA_SLA_PENDIENTES_INICIALES,
};

// Acciones del menú "⋯" — solo secundarias de solo-lectura en esta V1
// (encargo sección 5: "no coloques acá Iniciar/Finalizar limpieza, deben
// permanecer como CTA principal"; tampoco eliminar/reasignar/cambiar estado
// a mano todavía). Los 3 estados comparten exactamente las mismas 2 acciones
// hoy — se mantiene como mapa por-estado (no un array plano) por consistencia
// con el resto de menús "⋯" del proyecto (ver MENU_ACCIONES en
// mockCamasData.js), pensando en que difieran a futuro.
export const MENU_ACCIONES = {
  pendiente: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'ver-historial', label: 'Ver historial' },
  ],
  'en-proceso': [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'ver-historial', label: 'Ver historial' },
  ],
  finalizada: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'ver-historial', label: 'Ver historial' },
  ],
};
