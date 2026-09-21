// Mock del modal "Seleccionar Programación de Cirugía" (ver
// @/Components/Admisiones/CargosModal/SeleccionarProgramacionModal), que se
// abre desde "Traer de Prog." del panel "Programación Sala Cirugía" de la
// pestaña Cirugías de CargosModal — replica la referencia legacy. La
// programación 42803 es la de la captura; el resto completa la lista con
// los demás estados del filtro. Datos deterministas, sin backend.
//
// "Cirujano / Médico" y "Procedimiento / Servicio" guardan el documento del
// médico y el código CUPS, tal como los muestra la referencia.

export const ESTADO_PROGRAMACION_LABEL = {
  programada: 'Programada',
  urgencia: 'Urgencia',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  incumplida: 'Incumplida',
};

export const ESTADO_PROGRAMACION_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  ...Object.entries(ESTADO_PROGRAMACION_LABEL).map(([value, label]) => ({ value, label })),
];

// Campos por los que se puede buscar ("Buscar por:"): `field` es la clave del
// registro de PROGRAMACIONES sobre la que filtra.
export const BUSCAR_POR_OPTIONS = [
  { value: 'identificacion', label: 'Cédula / Identificación' },
  { value: 'numero', label: 'N° programación' },
  { value: 'paciente', label: 'Paciente' },
  { value: 'cirujano', label: 'Cirujano / Médico' },
];

export const PROGRAMACIONES = [
  {
    numero: '42803', fecha: '20.SEP.2026', horaInicio: '10:00', horaFin: '11:30', duracionMin: 90, estado: 'programada',
    identificacion: '32165145946591', paciente: 'SEGUNDO PRIMO', cirujano: '73133878', procedimiento: '282101C',
    sala: '01', dxIngreso: '—', asa: 'CLASE 1', clase: 'Quirófano', tipoAnestesia: 'General', complejidad: 'Media',
  },
  {
    numero: '42804', fecha: '21.SEP.2026', horaInicio: '07:30', horaFin: '09:00', duracionMin: 90, estado: 'programada',
    identificacion: '34983492', paciente: 'OCHOA MORELO STELLA DEL CARMEN', cirujano: '79845123', procedimiento: '541101C',
    sala: '02', dxIngreso: 'K359', asa: 'CLASE 2', clase: 'Quirófano', tipoAnestesia: 'Raquídea', complejidad: 'Alta',
  },
  {
    numero: '42805', fecha: '21.SEP.2026', horaInicio: '09:30', horaFin: '10:00', duracionMin: 30, estado: 'programada',
    identificacion: '1045678231', paciente: 'GARCIA LOPEZ MARIA', cirujano: '73133878', procedimiento: '862101C',
    sala: '06', dxIngreso: 'L089', asa: 'CLASE 1', clase: 'CE', tipoAnestesia: 'Local', complejidad: 'Baja',
  },
  {
    numero: '42806', fecha: '21.SEP.2026', horaInicio: '11:00', horaFin: '13:00', duracionMin: 120, estado: 'urgencia',
    identificacion: '1102345678', paciente: 'PEREZ RAMIREZ JUAN CARLOS', cirujano: '80234567', procedimiento: '470101C',
    sala: '03', dxIngreso: 'K358', asa: 'CLASE 3', clase: 'Quirófano', tipoAnestesia: 'General IV', complejidad: 'Alta',
  },
  {
    numero: '42807', fecha: '19.SEP.2026', horaInicio: '08:00', horaFin: '10:00', duracionMin: 120, estado: 'realizada',
    identificacion: '52987341', paciente: 'RODRIGUEZ MARTINEZ ANA LUCIA', cirujano: '79845123', procedimiento: '683201C',
    sala: '01', dxIngreso: 'N800', asa: 'CLASE 2', clase: 'Quirófano', tipoAnestesia: 'General', complejidad: 'Media',
  },
  {
    numero: '42808', fecha: '18.SEP.2026', horaInicio: '14:00', horaFin: '15:00', duracionMin: 60, estado: 'realizada',
    identificacion: '1098765432', paciente: 'TORRES GOMEZ LUIS FERNANDO', cirujano: '80234567', procedimiento: '811101C',
    sala: '05', dxIngreso: 'I250', asa: 'CLASE 3', clase: 'Quirófano', tipoAnestesia: 'Bloqueo', complejidad: 'Alta',
  },
  {
    numero: '42809', fecha: '20.SEP.2026', horaInicio: '15:30', horaFin: '16:30', duracionMin: 60, estado: 'cancelada',
    identificacion: '41236547', paciente: 'MORENO DIAZ CARMEN ROSA', cirujano: '73133878', procedimiento: '651201C',
    sala: '02', dxIngreso: 'M170', asa: 'CLASE 2', clase: 'Quirófano', tipoAnestesia: 'Peridural', complejidad: 'Media',
  },
  {
    numero: '42810', fecha: '17.SEP.2026', horaInicio: '16:00', horaFin: '16:30', duracionMin: 30, estado: 'incumplida',
    identificacion: '1067890123', paciente: 'SANCHEZ VARGAS PEDRO ANTONIO', cirujano: '79845123', procedimiento: '861101C',
    sala: '06', dxIngreso: 'L720', asa: 'CLASE 1', clase: 'CE', tipoAnestesia: 'Local asistida', complejidad: 'Baja',
  },
];

export function duracionLabel(min) {
  return `${min} min`;
}
