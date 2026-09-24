// Datos de ejemplo para el Panel General de Enfermería (ver
// src/Components/GestionEnfermeria/PanelGeneral/) — dashboard operativo del
// piso de hospitalización, distinto de AtencionEnfermeria.jsx (atención a UN
// paciente). Todo el módulo es ficticio (nombres, diagnósticos, horas de
// actividad); "hoy" usa la fecha real del sistema (encargo explícito:
// "ajustar los calendarios a las fechas reales actuales" — antes era una
// fecha fija, 14 Ago 2026, mismo criterio que tenían SEMANA_ANCLA en
// mockProgramacionData.js y viewDate en asignacion-citas/page.jsx, también
// actualizados). La admisión de cada paciente se define RELATIVA a hoy
// ("ingresó hace N días", ver ingresoHace) — antes eran fechas fijas de
// Jul/Ago 2026 y la estancia crecía sola con el correr del calendario real
// (llegó a 40-60 días). Encargo explícito: estancias entre 1 y 30 días, más
// un ingreso de menos de 24 h (nuevo ingreso). El campo `prolongada` que
// alimenta el KPI "Estancias prolongadas" sigue siendo un booleano curado
// por paciente (no se recalcula desde `diasEstancia`).
const HOY = new Date();

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Campos de admisión de un paciente que ingresó hace `dias` días + `horas`
// horas: `ingreso` (Date real, con año correcto aunque cruce de año),
// `admision` ('12 Ago', formato corto que ya mostraban las tablas),
// `diasEstancia` y `horasDesdeIngreso`. `nuevoIngreso` (< 24 h) alimenta el
// badge "Nuevo ingreso" de HC Hospitalización.
function ingresoHace(dias, horas = 0) {
  const horasDesdeIngreso = dias * 24 + horas;
  const ingreso = new Date(HOY.getTime() - horasDesdeIngreso * 3600000);
  return {
    ingreso,
    admision: `${String(ingreso.getDate()).padStart(2, '0')} ${MESES_CORTOS[ingreso.getMonth()]}`,
    diasEstancia: dias,
    horasDesdeIngreso,
    nuevoIngreso: horasDesdeIngreso < 24,
  };
}

// Estancia para mostrar junto a la fecha de ingreso: "Hace 6 h" en un nuevo
// ingreso (< 24 h — "0 días" no le dice nada a médico/enfermera), "1 día" /
// "N días" después. Compartido por Enfermería y HC Hospitalización.
export function estanciaLabel(p) {
  if (p.nuevoIngreso) return `Hace ${Math.max(1, p.horasDesdeIngreso)} h`;
  return p.diasEstancia === 1 ? '1 día' : `${p.diasEstancia} días`;
}

const MESES_LARGOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// `ingreso` (Date) → '12.AGO.2026', el formato de fecha de los registros de
// Historia Clínica (ver mockHistoriaClinicaRecords.js). Toma el Date real (no
// el '12 Ago' corto de `admision`) para que el año sea el correcto. Lo usan
// la columna "Fecha de ingreso" (@/Components/IngresoCell) y el banner/detalle
// de HC Hospitalización.
export function fechaIngresoLarga(ingreso) {
  return `${String(ingreso.getDate()).padStart(2, '0')}.${MESES_LARGOS[ingreso.getMonth()]}.${ingreso.getFullYear()}`;
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
// de la lista (Carmen Ruiz 30d, Elena Vargas 26d, Patricia López 22d), no un
// simple ">N días" automático (con ">7 días" también calificarían Sofía
// Torres —14d— y Ana Martínez —12d—; en la práctica un jefe de enfermería
// cura cuáles casos se seleccionan para seguimiento activo). Jorge Ramírez
// (colecistitis aguda) es el nuevo ingreso: entró hace 6 h.
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
    id: 'HC-48291', cama: '101-A', ...ingresoHace(8),
    paciente: 'María González', diagnostico: 'Neumonía adquirida en comunidad', edad: 67, genero: 'femenino',
    estadoMedicacion: 'pendiente', prolongada: false,
  },
  {
    id: 'HC-48307', cama: '101-B', ...ingresoHace(5),
    paciente: 'Carlos Rodríguez', diagnostico: 'Diabetes mellitus tipo 2 descompensada', edad: 59, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
  {
    id: 'HC-48192', cama: '102-A', ...ingresoHace(12),
    paciente: 'Ana Martínez', diagnostico: 'Insuficiencia cardíaca', edad: 74, genero: 'femenino',
    estadoMedicacion: 'pendiente', prolongada: false,
  },
  {
    id: 'HC-48321', cama: '102-B', ...ingresoHace(0, 6),
    paciente: 'Jorge Ramírez', diagnostico: 'Colecistitis aguda', edad: 48, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
  {
    id: 'HC-47984', cama: '103-A', ...ingresoHace(22),
    paciente: 'Patricia López', diagnostico: 'EPOC exacerbado', edad: 71, genero: 'femenino',
    estadoMedicacion: 'pendiente', prolongada: true,
  },
  {
    id: 'HC-48266', cama: '103-B', ...ingresoHace(4),
    paciente: 'Luis Hernández', diagnostico: 'Infección urinaria', edad: 63, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
  {
    id: 'HC-48031', cama: '104-A', ...ingresoHace(14),
    paciente: 'Sofía Torres', diagnostico: 'Postoperatorio abdominal', edad: 52, genero: 'femenino',
    estadoMedicacion: 'pendiente', prolongada: false,
  },
  {
    id: 'HC-48345', cama: '104-B', ...ingresoHace(3),
    paciente: 'Andrés Castro', diagnostico: 'Hipertensión arterial', edad: 61, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
  {
    id: 'HC-47892', cama: '105-A', ...ingresoHace(26),
    paciente: 'Elena Vargas', diagnostico: 'Accidente cerebrovascular', edad: 79, genero: 'femenino',
    estadoMedicacion: 'retrasada', prolongada: true,
  },
  {
    id: 'HC-48215', cama: '105-B', ...ingresoHace(10),
    paciente: 'Ricardo Moreno', diagnostico: 'Fractura de cadera', edad: 82, genero: 'masculino',
    estadoMedicacion: 'al-dia', prolongada: false,
  },
  {
    id: 'HC-48176', cama: '106-A', ...ingresoHace(6),
    paciente: 'Laura Sánchez', diagnostico: 'Neumonía', edad: 68, genero: 'femenino',
    estadoMedicacion: 'pendiente', prolongada: false,
  },
  {
    id: 'HC-48302', cama: '106-B', ...ingresoHace(7),
    paciente: 'Diego Pérez', diagnostico: 'Pancreatitis aguda', edad: 45, genero: 'masculino',
    estadoMedicacion: 'no-aplica', prolongada: false,
  },
  {
    id: 'HC-47765', cama: '107-A', ...ingresoHace(30),
    paciente: 'Carmen Ruiz', diagnostico: 'Insuficiencia renal', edad: 76, genero: 'femenino',
    estadoMedicacion: 'al-dia', prolongada: true,
  },
  {
    id: 'HC-48254', cama: '107-B', ...ingresoHace(2),
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

// Nombre completo (2 nombres + 2 apellidos) por paciente — `paciente` de
// PACIENTES_PISO (compartido con Bed Board y Alertas) solo trae nombre +
// primer apellido y no se toca para no alterar esas pantallas. Lo consumen
// la tabla del Panel General de Enfermería y Historia Clínica de
// Hospitalización (mockHospitalizadosData.js), así ambas muestran el mismo
// nombre. El primer nombre y el primer apellido de cada entrada coinciden
// con los de PACIENTES_PISO.
export const NOMBRE_COMPLETO = {
  'HC-48291': 'María Fernanda González Restrepo',
  'HC-48307': 'Carlos Andrés Rodríguez Molina',
  'HC-48192': 'Ana Lucía Martínez Duque',
  'HC-48321': 'Jorge Iván Ramírez Ospina',
  'HC-47984': 'Patricia Elena López Cardona',
  'HC-48266': 'Luis Alberto Hernández Vélez',
  'HC-48031': 'Sofía Alejandra Torres Bedoya',
  'HC-48345': 'Andrés Felipe Castro Zapata',
  'HC-47892': 'Elena María Vargas Salazar',
  'HC-48215': 'Ricardo Antonio Moreno Giraldo',
  'HC-48176': 'Laura Camila Sánchez Arango',
  'HC-48302': 'Diego Armando Pérez Londoño',
  'HC-47765': 'Carmen Rosa Ruiz Henao',
  'HC-48254': 'Felipe Andrés Gómez Herrera',
};

// Documento (CC) ficticio derivado del id de historia — PACIENTES_PISO no
// trae documento real. Mismo valor en la tabla del Panel General y en el
// PatientBanner de Historia Clínica de Hospitalización.
export function documentoDe(id) {
  return `10${id.replace(/\D/g, '')}`;
}

// N° de admisión ficticio (10 dígitos como los de Admisiones), derivado del
// id de historia para que sea estable por paciente — mismo valor en
// Enfermería → Pacientes y en el PatientBanner de Historia Clínica de
// Hospitalización.
export function numeroAdmisionDe(id) {
  return `02012${id.replace(/\D/g, '')}`;
}

