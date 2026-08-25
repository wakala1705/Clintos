// Datos de ejemplo para "Resumen de Gestión de Camas" (ver
// src/Components/GestionCamas/GestionCamasResumen/) — la vista administrativa
// de supervisión del módulo, distinta del Bed Board operativo
// (GestionCamas.jsx, montado en /gestion-camas/tablero, sección "Camas" del
// sidebar). Cifras fijas
// tal como las entregó el encargo (512 camas totales, etc.) — un dataset de
// reporte administrativo aparte de las 199 camas de mockCamasData.js (Bed
// Board), no derivado de él: representan alcances distintos (todas las
// sedes/período vs. el inventario operativo de una sede).

export const PERIODOS = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
];

// KPIs administrativos (fila superior) — porcentajes ya calculados en el
// encargo, no derivados en runtime (evita que un redondeo distinto rompa
// los textos exactos pedidos, ej. "91.4% del total").
export const RESUMEN_KPIS = {
  total: 512,
  habilitadas: 468,
  habilitadasPct: 91.4,
  ocupadas: 421,
  ocupacionPct: 82.2,
  ocupacionTrendPct: 2.4,
  limpieza: 32,
  limpiezaPct: 6.3,
  mantenimiento: 12,
  mantenimientoPct: 2.3,
  fueraDeServicio: 32,
  fueraDeServicioPct: 6.3,
};

// Serie temporal de "Ocupación de camas" — 3 indicadores intercambiables
// (Ocupación/Disponibilidad/Utilización) para el selector de la card, mismos
// 7 puntos de fecha para los 3 así el eje X no cambia al alternar.
export const OCUPACION_META_PCT = 85;
export const TENDENCIA_SERIE = [
  {
    fecha: '15 may', ocupacion: 75, disponibilidad: 25, utilizacion: 68,
  },
  {
    fecha: '16 may', ocupacion: 78, disponibilidad: 22, utilizacion: 71,
  },
  {
    fecha: '17 may', ocupacion: 77, disponibilidad: 23, utilizacion: 70,
  },
  {
    fecha: '18 may', ocupacion: 82, disponibilidad: 18, utilizacion: 74,
  },
  {
    fecha: '19 may', ocupacion: 79, disponibilidad: 21, utilizacion: 72,
  },
  {
    fecha: '20 may', ocupacion: 83, disponibilidad: 17, utilizacion: 76,
  },
  {
    fecha: '21 may', ocupacion: 80, disponibilidad: 20, utilizacion: 73,
  },
];
export const TENDENCIA_INDICADORES = [
  { value: 'ocupacion', label: 'Ocupación' },
  { value: 'disponibilidad', label: 'Disponibilidad' },
  { value: 'utilizacion', label: 'Utilización' },
];

// Utilización por servicio — solo los principales (encargo: "mostrar
// únicamente los principales servicios"), no las 8 áreas completas de
// mockCamasData.js.
export const UTILIZACION_SERVICIOS = [
  { servicio: 'UCI Adultos', pct: 96 },
  { servicio: 'Hospitalización', pct: 88 },
  { servicio: 'UCI Neonatal', pct: 85 },
  { servicio: 'Ginecobstetricia', pct: 82 },
  { servicio: 'Pediatría', pct: 78 },
];

// Control de integridad — 2 inconsistencias de ejemplo del encargo.
// `severidad` decide el ícono/color (advertencia vs. alerta), nunca un
// tercer estado inventado.
export const INCONSISTENCIAS = [
  {
    id: 'INC-1',
    severidad: 'advertencia',
    titulo: 'Habitación sin camas asignadas',
    detalle: 'H-205 · Sede Centro',
    servicio: 'Medicina Interna',
  },
  {
    id: 'INC-2',
    severidad: 'alerta',
    titulo: 'Capacidad excedida',
    detalle: 'UCI Adultos · Sede Norte',
    servicio: 'Supera su capacidad máxima',
  },
];
export const ULTIMA_VERIFICACION_INTEGRIDAD = 'Hoy, 08:30 a. m.';

// Últimos movimientos (auditoría) — 5 filas de ejemplo del encargo.
export const MOVIMIENTOS_RECIENTES = [
  {
    id: 'MOV-1', fecha: 'Hoy, 10:24 a. m.', cama: 'C-101', servicio: 'UCI Adultos', movimiento: 'Ocupada', usuario: 'Laura Pérez',
  },
  {
    id: 'MOV-2', fecha: 'Hoy, 09:50 a. m.', cama: 'H-302', servicio: 'Hospitalización', movimiento: 'En limpieza', usuario: 'Jorge Ruiz',
  },
  {
    id: 'MOV-3', fecha: 'Hoy, 08:15 a. m.', cama: 'C-205', servicio: 'Medicina Interna', movimiento: 'En mantenimiento', usuario: 'Carlos Méndez',
  },
  {
    id: 'MOV-4', fecha: 'Ayer, 18:32 p. m.', cama: 'C-112', servicio: 'Urgencias', movimiento: 'Fuera de servicio', usuario: 'Laura Pérez',
  },
  {
    id: 'MOV-5', fecha: 'Ayer, 16:10 p. m.', cama: 'C-318', servicio: 'Pediatría', movimiento: 'Disponible', usuario: 'Ana Torres',
  },
];

// Tono del badge de movimiento en la tabla — mismo criterio de color que
// ESTADO_COLOR (mockCamasData.js) para no inventar un segundo lenguaje de
// color para el mismo concepto de estado.
export const MOVIMIENTO_COLOR = {
  Ocupada: 'red',
  'En limpieza': 'blue',
  'En mantenimiento': 'orange',
  'Fuera de servicio': 'gray',
  Disponible: 'green',
};
