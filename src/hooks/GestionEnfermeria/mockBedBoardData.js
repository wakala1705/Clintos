// Datos de ejemplo para el "Mapa de camas" del Panel General de Enfermería
// (ver src/Components/GestionEnfermeria/PanelGeneral/BedBoardModal/) — mismo
// piso de 18 camas de mockPanelGeneralData.js (CAMAS_TOTALES/CAMAS_POR_AREA),
// pero con una fila por CADA cama (ocupada o libre) en vez de solo las 14
// ocupadas de PACIENTES_PISO, para poder pintar el tablero completo con
// BedCard (@/Components/GestionCamas/BedCard/BedCard, reusado tal cual).
//
// Las 14 camas ocupadas se derivan 1:1 de PACIENTES_PISO (misma fuente de
// verdad que la tabla "Pacientes en piso", nunca datos sueltos que puedan
// desincronizarse) — `paciente.admision/horaIngreso` se dejan sin definir
// porque ese mock no modela la hora real de ingreso; BedCard/InfoLine ya
// ocultan la fila "Ingreso" cuando no hay valor, así que el tablero solo
// muestra nombre + HC para estas camas, sin inventar una hora.
//
// Las 4 camas libres restantes (2 en Sector norte, 2 en Sector sur, ver
// comentario de CAMAS_POR_AREA en mockPanelGeneralData.js: Norte 8 ocupadas +
// 2 libres, Sur 6 ocupadas + 2 libres) no tienen habitación/letra propia en
// el mock de pacientes — se ubican en la letra "C" de las 2 primeras
// habitaciones de cada sector (101/102 norte, 105/106 sur) para quedar
// dentro del mismo rango de número de habitación que usa `sectorDeCama`
// (101-104 norte, 105-107 sur), sin tocar esa función.
import { PACIENTES_PISO } from './mockPanelGeneralData';

const CAMAS_OCUPADAS = PACIENTES_PISO.map((p) => ({
  id: p.cama,
  numero: p.cama,
  estado: 'ocupada',
  // genero/edad alimentan el indicador de BedCard (categoriaPaciente, ver
  // hooks/GestionCamas/bedContextFormat.js); diasEstancia alimenta la línea
  // "edad · días de estancia" (encargo explícito, formatEdadEstancia) —
  // misma fuente que la tabla "Pacientes en piso" en los 3 casos, nunca un
  // valor propio de este mock.
  paciente: {
    nombre: p.paciente, hc: p.id, genero: p.genero, edad: p.edad, diasEstancia: p.diasEstancia,
  },
}));

const CAMAS_LIBRES = [
  { id: '101-C', numero: '101-C', estado: 'libre', ultimaLimpieza: '06:40' },
  { id: '102-C', numero: '102-C', estado: 'libre', ultimaLimpieza: '07:05' },
  { id: '105-C', numero: '105-C', estado: 'libre', ultimaLimpieza: '06:15' },
  { id: '106-C', numero: '106-C', estado: 'libre', ultimaLimpieza: '07:20' },
];

export const CAMAS_PISO = [...CAMAS_OCUPADAS, ...CAMAS_LIBRES];
