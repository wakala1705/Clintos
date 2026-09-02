// Mock data de "Historial Quirúrgico del Paciente" — pantalla de solo
// consulta, sin backend. A diferencia de mockCirugiaData.js (agenda futura,
// mutable) esto es historial fijo: un único paciente de demo con 3
// intervenciones ya realizadas, sin funciones de mutación (nada se puede
// crear/editar/eliminar acá, ver spec).

// Forma completa de PatientBanner (ver PatientBanner.jsx) -- encargo
// explícito: el header propio (PacienteHeader, nombre+ID de afiliado) se
// reemplazó por el banner de identidad global que ya usan Asignación de
// Citas/Gestión de Enfermería/Historia Clínica, así que este paciente de
// demo necesita los mismos campos que esos mocks (documento/edad/sexo/eps),
// no solo nombre+idAfiliado.
export const PACIENTE_DEMO = {
  iniciales: 'BP',
  nombre: 'Berrocal Payares Yuri del Carmen',
  documento: '55.222.523',
  edad: '41 años',
  sexo: 'Femenino',
  eps: 'Nueva EPS',
  ciudad: 'Cartagena de Indias',
  direccion: 'Carrera 8 # 24-15',
  telefono: '300 812 4567',
  email: 'yuri.berrocal@example.com',
};

const MESES_ABREV = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function fechaCortaLabel(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return `${d} ${MESES_ABREV[m - 1]} ${y}`;
}

export function fechaHoraCortaLabel(fechaISO, hora) {
  return `${fechaCortaLabel(fechaISO)} · ${hora}`;
}

export const INTERVENCIONES = [
  {
    id: 'cirugia-0200018616',
    numeroProgramacion: '0300012458',
    codigoCirugia: '0200018616',
    fecha: '2023-10-25',
    horaInicio: '14:15',
    procedimientoPrincipal: 'Colecistectomía laparoscópica',
    idMedico: 'MED-1042',
    medico: 'Lorena Cecilia Arrieta Yanez',
    idServicio: '0231301',
    habitacion: '304-A',
    dias: 2,
    reservo: 'Camila Andrea Ríos Peña',
    sala: '01',
    quirofano: '#1',
    estado: 'realizada',
    procedimientos: [
      {
        id: 'proc-0200018616-1',
        nombre: 'Colecistectomía laparoscópica',
        codigo: '0231301',
        insumos: [
          { nombre: 'Trocar 5mm', cantidad: 2, unidad: 'unidades', codigo: 'INS-1001' },
          { nombre: 'Trocar 10mm', cantidad: 2, unidad: 'unidades', codigo: 'INS-1002' },
          { nombre: 'Pinza Maryland', cantidad: 1, unidad: 'unidad', codigo: 'INS-1003' },
          { nombre: 'Gasas estériles', cantidad: 10, unidad: 'unidades', codigo: 'INS-1004' },
          { nombre: 'Sutura Vicryl 2-0', cantidad: 3, unidad: 'unidades', codigo: 'INS-1005' },
        ],
        farmacia: [
          { medicamento: 'Cefazolina 1g', cantidad: 1, unidad: 'ampolla', estado: 'Entregado' },
          { medicamento: 'Ondansetrón 4mg', cantidad: 2, unidad: 'ampolla', estado: 'Entregado' },
        ],
        personal: [
          { nombre: 'Lorena Cecilia Arrieta Yanez', rol: 'Cirujano', tipoProfesional: 'Médico especialista' },
          { nombre: 'Ricardo Fabián Nieto Salcedo', rol: 'Anestesiólogo', tipoProfesional: 'Médico especialista' },
          { nombre: 'Marcela Isabel Duarte Peña', rol: 'Instrumentadora', tipoProfesional: 'Instrumentación quirúrgica' },
          { nombre: 'Jhon Édison Pabón Rico', rol: 'Circulante', tipoProfesional: 'Enfermería' },
        ],
        equipos: [
          { nombre: 'Torre de laparoscopia', tipo: 'Video/Imagen', identificacion: 'EQ-0412' },
          { nombre: 'Electrobisturí monopolar', tipo: 'Energía quirúrgica', identificacion: 'EQ-0087' },
          { nombre: 'Monitor multiparámetro', tipo: 'Monitoreo', identificacion: 'EQ-0231' },
        ],
      },
      // Segundo procedimiento de ejemplo -- encargo explícito para ejercitar
      // el selector de la izquierda de IntervencionDetalleModal (ProcedimientosList)
      // con más de una fila, algo que las otras 2 intervenciones no cubren.
      {
        id: 'proc-0200018616-2',
        nombre: 'Colonoscopia total',
        codigo: '0231302',
        insumos: [
          { nombre: 'Cánula nasal adulto', cantidad: 1, unidad: 'unidad', codigo: 'DM000120' },
          { nombre: 'Catéter heparinizado', cantidad: 1, unidad: 'unidad', codigo: 'DM000152' },
          { nombre: 'Catéter intravenoso 22G', cantidad: 1, unidad: 'unidad', codigo: 'DM000157' },
          { nombre: 'Catéter intravenoso 24G', cantidad: 1, unidad: 'unidad', codigo: 'DM000158' },
          { nombre: 'Compresa estéril 45 x 45', cantidad: 1, unidad: 'unidad', codigo: 'DM000195' },
          { nombre: 'Electrodos adultos', cantidad: 5, unidad: 'unidades', codigo: 'DM000252' },
          { nombre: 'Gasa estéril precortada 10x10cm', cantidad: 2, unidad: 'unidades', codigo: 'DM000306' },
          { nombre: 'Humidificador de oxígeno', cantidad: 1, unidad: 'unidad', codigo: 'DM000345' },
          { nombre: 'Jeringa 10 ml', cantidad: 5, unidad: 'unidades', codigo: 'DM000362' },
          { nombre: 'Jeringa 20 ml', cantidad: 1, unidad: 'unidad', codigo: 'DM000363' },
          { nombre: 'Jeringa 5 ml', cantidad: 3, unidad: 'unidades', codigo: 'DM000364' },
          { nombre: 'Jeringa 50 ml', cantidad: 1, unidad: 'unidad', codigo: 'DM000365' },
        ],
        // Vacío a propósito -- ejercita el empty state de FarmaciaTab (ver spec).
        farmacia: [],
        personal: [
          { nombre: 'Lorena Cecilia Arrieta Yanez', rol: 'Gastroenterólogo', tipoProfesional: 'Médico especialista' },
          { nombre: 'Jhon Édison Pabón Rico', rol: 'Circulante', tipoProfesional: 'Enfermería' },
        ],
        equipos: [
          { nombre: 'Videocolonoscopio', tipo: 'Video/Imagen', identificacion: 'EQ-0501' },
        ],
      },
    ],
  },
  {
    id: 'cirugia-0200019747',
    numeroProgramacion: '0300012604',
    codigoCirugia: '0200019747',
    fecha: '2023-11-21',
    horaInicio: '11:05',
    procedimientoPrincipal: 'Exploración y descompresión del canal raquídeo',
    idMedico: 'MED-1078',
    medico: 'Humberto Alfonso Aragón González',
    idServicio: '030208C',
    habitacion: '212-B',
    dias: 4,
    reservo: 'Daniel Esteban Coronado Ruiz',
    sala: '01',
    quirofano: '#1',
    estado: 'realizada',
    procedimientos: [
      {
        id: 'proc-0200019747-1',
        nombre: 'Exploración y descompresión del canal raquídeo',
        codigo: '030208C',
        insumos: [
          { nombre: 'Aguja para pistola Promag 18 x 20', cantidad: 2, unidad: 'unidades', codigo: 'INS-3001' },
          { nombre: 'Bata quirúrgica estéril', cantidad: 2, unidad: 'unidades', codigo: 'INS-3002' },
          { nombre: 'Bureta 150 ml', cantidad: 1, unidad: 'unidad', codigo: 'INS-3003' },
          { nombre: 'Cánula de Guedel #3', cantidad: 1, unidad: 'unidad', codigo: 'INS-3004' },
          { nombre: 'Cánula de Guedel #4', cantidad: 1, unidad: 'unidad', codigo: 'INS-3005' },
          { nombre: 'Cánula de Guedel #5', cantidad: 1, unidad: 'unidad', codigo: 'INS-3006' },
          { nombre: 'Cánula nasal adulto', cantidad: 1, unidad: 'unidad', codigo: 'INS-3007' },
          { nombre: 'Cartucho Kaolin', cantidad: 2, unidad: 'unidades', codigo: 'INS-3008' },
          { nombre: 'Catéter intravenoso #20G', cantidad: 1, unidad: 'unidad', codigo: 'INS-3009' },
        ],
        // Vacío a propósito -- ejercita el empty state de FarmaciaTab (ver spec).
        farmacia: [],
        personal: [
          { nombre: 'Humberto Alfonso Aragón González', rol: 'Cirujano', tipoProfesional: 'Médico especialista' },
          { nombre: 'Claudia Patricia Reyes Molano', rol: 'Anestesiólogo', tipoProfesional: 'Médico especialista' },
          { nombre: 'Wilmer Andrés Ospina Cuartas', rol: 'Circulante', tipoProfesional: 'Enfermería' },
        ],
        equipos: [
          { nombre: 'Neuronavegador', tipo: 'Neuronavegación', identificacion: 'EQ-0559' },
          { nombre: 'Microscopio quirúrgico', tipo: 'Visualización', identificacion: 'EQ-0163' },
          { nombre: 'Monitor de potenciales evocados', tipo: 'Neuromonitoreo', identificacion: 'EQ-0298' },
        ],
      },
    ],
  },
  {
    id: 'cirugia-0200019776',
    numeroProgramacion: '0300012605',
    codigoCirugia: '0200019776',
    fecha: '2023-11-21',
    horaInicio: '02:00',
    procedimientoPrincipal: 'Artroplastia total de cadera',
    idMedico: 'MED-1103',
    medico: 'Diego Alejandro Quintero Rueda',
    idServicio: '815200',
    habitacion: '108-A',
    dias: 5,
    reservo: 'Valentina Ospina Salgado',
    sala: '02',
    quirofano: '#1',
    estado: 'realizada',
    procedimientos: [
      {
        id: 'proc-0200019776-1',
        nombre: 'Artroplastia total de cadera',
        codigo: '815200',
        insumos: [
          { nombre: 'Prótesis de cadera no cementada', cantidad: 1, unidad: 'unidad', codigo: 'INS-2101' },
          { nombre: 'Cemento óseo con antibiótico', cantidad: 2, unidad: 'unidades', codigo: 'INS-2102' },
          { nombre: 'Sutura Vicryl 0', cantidad: 4, unidad: 'unidades', codigo: 'INS-2103' },
          { nombre: 'Compresas abdominales', cantidad: 6, unidad: 'unidades', codigo: 'INS-2104' },
        ],
        farmacia: [
          { medicamento: 'Ácido tranexámico 1g', cantidad: 2, unidad: 'ampolla', estado: 'Entregado' },
          { medicamento: 'Cefazolina 1g', cantidad: 1, unidad: 'ampolla', estado: 'En preparación' },
        ],
        personal: [
          { nombre: 'Diego Alejandro Quintero Rueda', rol: 'Cirujano', tipoProfesional: 'Médico especialista' },
          { nombre: 'Paola Andrea Villamizar Roa', rol: 'Anestesiólogo', tipoProfesional: 'Médico especialista' },
          { nombre: 'Fabián Camilo Torres Higuera', rol: 'Instrumentadora', tipoProfesional: 'Instrumentación quirúrgica' },
        ],
        // Vacío a propósito -- ejercita el empty state de EquiposTab (ver spec).
        equipos: [],
      },
    ],
  },
];
