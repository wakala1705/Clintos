// Datos de ejemplo para el Panel General de Enfermería (ver
// src/Components/GestionEnfermeria/PanelGeneral/) — dashboard operativo del
// piso de hospitalización, distinto de AtencionEnfermeria.jsx (atención a UN
// paciente). Todo el módulo es ficticio (nombres, diagnósticos, horas de
// actividad); "hoy" se fija al 14 Ago para que `diasEstancia` (día de "hoy"
// menos admisión) tenga sentido sin depender de la fecha real del sistema.

const HOY = new Date(2026, 7, 14); // 14 Ago 2026 (mes 0-indexado)

function diasEstancia(diaAdmision, mesAdmisionIdx) {
  const admision = new Date(2026, mesAdmisionIdx, diaAdmision);
  return Math.round((HOY - admision) / 86400000);
}

// CAMAS_TOTALES fijo (piso de 18 camas) — CAMAS_OCUPADAS se deriva de
// PACIENTES_PISO.length más abajo, nunca un número aparte que pueda
// desincronizarse de la lista real de pacientes.
export const CAMAS_TOTALES = 18;

// dosisProgramadasHoy/ordenesPendientes son estadísticas independientes del
// piso (no hay un cronograma de dosis ni un listado de órdenes modelado por
// paciente en este mock) — valores fijos, igual que en AtencionEnfermeria.
export const DOSIS_PROGRAMADAS_HOY = 8;
export const ORDENES_PENDIENTES = 5;

// `prolongada` está curada para calzar exactamente con el KPI "Estancias
// prolongadas" (3) del encargo — los 3 pacientes con más días de estancia
// de la lista (Carmen Ruiz 20d, Elena Vargas 17d, Patricia López 13d), no un
// simple ">7 días" automático (con ese criterio puro también calificarían
// Sofía Torres —11d— y Ana Martínez —9d—; en la práctica un jefe de
// enfermería cura cuáles casos se seleccionan para seguimiento activo).
// `genero` alimenta el indicador rosa/azul de BedCard (encargo explícito,
// "Ajuste de cards — Bed Board", sección color por género) — inferido del
// nombre de pila de cada paciente ficticio (ningún documento fuente define
// este campo), 7 femenino / 7 masculino. Ninguno de los 14 es menor de edad
// en este mock (ver `categoriaPaciente`, bedContextFormat.js): la categoría
// "niño" queda implementada pero sin ejemplo real acá, mismo criterio que
// `aislamiento` en mockCamasData.js ("ninguna cama del inventario lo trae
// en true").
export const PACIENTES_PISO = [
  {
    id: 'HC-48291', cama: '101-A', admision: '12 Ago', diasEstancia: diasEstancia(12, 7),
    paciente: 'María González', diagnostico: 'Neumonía adquirida en comunidad', edad: 67, genero: 'femenino',
    estadoMedicacion: 'pendiente', prolongada: false,
  },
  {
    id: 'HC-48307', cama: '101-B', admision: '13 Ago', diasEstancia: diasEstancia(13, 7),
    paciente: 'Carlos Rodríguez', diagnostico: 'Diabetes mellitus tipo 2 descompensada', edad: 59, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
  {
    id: 'HC-48192', cama: '102-A', admision: '05 Ago', diasEstancia: diasEstancia(5, 7),
    paciente: 'Ana Martínez', diagnostico: 'Insuficiencia cardíaca', edad: 74, genero: 'femenino',
    estadoMedicacion: 'pendiente', prolongada: false,
  },
  {
    id: 'HC-48321', cama: '102-B', admision: '13 Ago', diasEstancia: diasEstancia(13, 7),
    paciente: 'Jorge Ramírez', diagnostico: 'Colecistitis aguda', edad: 48, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
  {
    id: 'HC-47984', cama: '103-A', admision: '01 Ago', diasEstancia: diasEstancia(1, 7),
    paciente: 'Patricia López', diagnostico: 'EPOC exacerbado', edad: 71, genero: 'femenino',
    estadoMedicacion: 'pendiente', prolongada: true,
  },
  {
    id: 'HC-48266', cama: '103-B', admision: '10 Ago', diasEstancia: diasEstancia(10, 7),
    paciente: 'Luis Hernández', diagnostico: 'Infección urinaria', edad: 63, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
  {
    id: 'HC-48031', cama: '104-A', admision: '03 Ago', diasEstancia: diasEstancia(3, 7),
    paciente: 'Sofía Torres', diagnostico: 'Postoperatorio abdominal', edad: 52, genero: 'femenino',
    estadoMedicacion: 'pendiente', prolongada: false,
  },
  {
    id: 'HC-48345', cama: '104-B', admision: '14 Ago', diasEstancia: diasEstancia(14, 7),
    paciente: 'Andrés Castro', diagnostico: 'Hipertensión arterial', edad: 61, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
  {
    id: 'HC-47892', cama: '105-A', admision: '28 Jul', diasEstancia: diasEstancia(28, 6),
    paciente: 'Elena Vargas', diagnostico: 'Accidente cerebrovascular', edad: 79, genero: 'femenino',
    estadoMedicacion: 'retrasada', prolongada: true,
  },
  {
    id: 'HC-48215', cama: '105-B', admision: '08 Ago', diasEstancia: diasEstancia(8, 7),
    paciente: 'Ricardo Moreno', diagnostico: 'Fractura de cadera', edad: 82, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
  {
    id: 'HC-48176', cama: '106-A', admision: '07 Ago', diasEstancia: diasEstancia(7, 7),
    paciente: 'Laura Sánchez', diagnostico: 'Neumonía', edad: 68, genero: 'femenino',
    estadoMedicacion: 'pendiente', prolongada: false,
  },
  {
    id: 'HC-48302', cama: '106-B', admision: '12 Ago', diasEstancia: diasEstancia(12, 7),
    paciente: 'Diego Pérez', diagnostico: 'Pancreatitis aguda', edad: 45, genero: 'masculino',
    estadoMedicacion: 'no-aplica', prolongada: false,
  },
  {
    id: 'HC-47765', cama: '107-A', admision: '25 Jul', diasEstancia: diasEstancia(25, 6),
    paciente: 'Carmen Ruiz', diagnostico: 'Insuficiencia renal', edad: 76, genero: 'femenino',
    estadoMedicacion: 'al-dia', prolongada: true,
  },
  {
    id: 'HC-48254', cama: '107-B', admision: '09 Ago', diasEstancia: diasEstancia(9, 7),
    paciente: 'Felipe Gómez', diagnostico: 'Postoperatorio de hernia', edad: 57, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
];

// ---------- Área operativa (Todo el área / Sector norte / Sector sur) ----------
// Encargo explícito: Sector norte = habitaciones 101-104, Sector sur =
// 105-107 — cubren exactamente las 7 habitaciones/14 camas ocupadas de
// PACIENTES_PISO (Norte 8 camas: 101 a 104; Sur 6 camas: 105 a 107), sin
// solapamiento ni huecos. `sectorDeCama` deriva el sector del número de
// habitación de `cama` ("101-A" -> 101) en vez de guardar un campo `sector`
// aparte en cada paciente — una sola fuente de verdad (el número de cama),
// nunca 2 campos que puedan desincronizarse entre sí.
export const AREAS_OPERATIVAS = [
  { value: 'todo', label: 'Todo el área' },
  { value: 'norte', label: 'Sector norte' },
  { value: 'sur', label: 'Sector sur' },
];

export function sectorDeCama(cama) {
  const numeroHabitacion = parseInt(cama, 10);
  if (numeroHabitacion >= 101 && numeroHabitacion <= 104) return 'norte';
  if (numeroHabitacion >= 105 && numeroHabitacion <= 107) return 'sur';
  return null;
}

// Camas TOTALES (ocupadas + libres) por sector, para el KPI "Ocupación" —
// fijo, igual que CAMAS_TOTALES, porque este mock no modela habitaciones ni
// camas vacías con su propio número real (las 4 camas libres de las 18 no
// tienen fila en PACIENTES_PISO, así que no hay de dónde derivar a qué
// sector pertenecen). Repartidas proporcional a la cantidad de habitaciones
// de cada sector (Norte 4 habitaciones, Sur 3): Norte 10 camas (8 ocupadas +
// 2 libres), Sur 8 camas (6 ocupadas + 2 libres) — suman los mismos 18 de
// CAMAS_TOTALES.
export const CAMAS_POR_AREA = {
  todo: CAMAS_TOTALES,
  norte: 10,
  sur: 8,
};

export const ESTADO_MEDICACION_LABEL = {
  'al-dia': 'Al día',
  pendiente: 'Pendiente',
  retrasada: 'Retrasada',
  'no-aplica': 'No aplica',
};

// El badge rojo del panel de alertas (7) es la suma de estos 2 grupos —
// nunca un número aparte, para que no se desincronice si se agrega/quita
// una alerta más adelante.
export const ALERTAS_MEDICACION = [
  {
    id: 'retrasados', severidad: 'critico', count: 2,
    titulo: '2 medicamentos retrasados', detalle: 'Última actualización: hace 12 min',
  },
  {
    id: 'pendiente-maria', severidad: 'advertencia', count: 1,
    titulo: '1 dosis pendiente', detalle: 'Paciente: María González · Cama 101-A',
  },
];

export const ACTIVIDAD_RECIENTE = [
  { id: 1, texto: 'Nueva orden médica', hace: 'hace 8 min', tipo: 'info' },
  { id: 2, texto: 'Signos vitales pendientes', hace: 'hace 15 min', tipo: 'advertencia' },
  { id: 3, texto: 'Cambio de medicación', hace: 'hace 24 min', tipo: 'info' },
  { id: 4, texto: 'Nota médica registrada', hace: 'hace 32 min', tipo: 'info' },
];

export const TOTAL_ALERTAS = ALERTAS_MEDICACION.reduce((sum, a) => sum + a.count, 0) + ACTIVIDAD_RECIENTE.length;
