// Sin backend todavía: datos de ejemplo (mismo criterio que los mocks de otras
// features, ver hooks/HistoriaClinicaHospitalizacion/). Cada solicitud lleva
//   - la fila de la bandeja: { id, numero, paciente, documento, servicio,
//     especialidad, solicitante, fecha (ISO, la formatea formatearFecha),
//     dias, estado, asignacion, esHoy };
//   - el detalle del modal: { interconsultante, hc, prestacion, motivo,
//     examen, ayudas, hiekg, inicioSintomas (ISO | null), conducta };
//   - `respuesta` { concepto, resultado, observaciones } y `traza` (historial
//     de eventos), que arma conDetalle() más abajo a partir del estado.
// `estado` es un value de ESTADOS, `asignacion` 'nombre' | 'especialidad'
// (vista donde aparece) y `esHoy` marca la actividad del día para los KPIs
// "Respondidas/Facturadas hoy". Todo lo demás (KPIs, conteos, filtros) se
// deriva de esta lista. `documento` va como string (el buscador lo compara
// como texto).

export const VISTAS = [
  { value: 'nombre', label: 'Por nombre' },
  { value: 'especialidad', label: 'Por especialidad' },
];

// Subtítulo de la card según la vista activa.
export const VISTA_DESCRIPCION = {
  nombre: 'Asignadas al médico actual',
  especialidad: 'De la especialidad del médico actual',
};

export const ESTADOS = [
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'respondidas', label: 'Respondidas' },
  { value: 'sin-cargo', label: 'Sin cargo' },
  { value: 'facturadas', label: 'Facturadas' },
  { value: 'anuladas', label: 'Anuladas' },
  { value: 'todas', label: 'Todas' },
];

export const ESTADO_LABEL = Object.fromEntries(ESTADOS.map((e) => [e.value, e.label]));

// Tono de <Badge> por estado de la solicitud.
export const ESTADO_TONE = {
  pendientes: 'warn',
  respondidas: 'info',
  'sin-cargo': 'danger',
  facturadas: 'success',
  anuladas: 'neutral',
};

// Resultado de la interconsulta (select de "Respuesta Clínica" del modal).
export const RESULTADOS = [
  { value: 'SOLO RECOMENDACION', label: 'SOLO RECOMENDACION' },
  { value: 'ASUME MANEJO DEL PACIENTE', label: 'ASUME MANEJO DEL PACIENTE' },
  { value: 'REQUIERE TRASLADO', label: 'REQUIERE TRASLADO' },
];

// Conducta principal (dato de la solicitud, solo lectura en el modal).
export const CONDUCTAS = [
  { value: 'VALORACION', label: 'VALORACION' },
  { value: 'MANEJO CONJUNTO', label: 'MANEJO CONJUNTO' },
  { value: 'TRASLADO', label: 'TRASLADO' },
];

export const PAGE_SIZE = 10;

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// '2026-09-21T09:41:41' -> '21.SEP.2026 09:41:41' (formato de la bandeja).
export function formatearFecha(iso) {
  const [fecha, hora] = iso.split('T');
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}.${MESES[Number(mes) - 1]}.${anio} ${hora}`;
}

// Date -> '2026-09-21T09:41:41' en hora local (sin zona), el mismo shape que
// guarda `fecha` — así formatearFecha sirve igual para fechas del mock y para
// los eventos nuevos.
export function aISO(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

function sumarSegundos(iso, segundos) {
  return aISO(new Date(new Date(iso).getTime() + segundos * 1000));
}

// Completa cada solicitud con su respuesta y su historial según el estado en
// el que está: una solicitud ya respondida/facturada trae su respuesta y los
// eventos que la llevaron ahí.
function conDetalle(s) {
  const respondida = s.estado !== 'pendientes';
  const fechaRespuesta = s.esHoy ? '2026-09-25T10:15:00' : sumarSegundos(s.fecha, 7200);
  const resultado = RESULTADOS[0].value;
  const traza = [
    {
      estado: 'REGISTRADA', fecha: s.fecha, usuario: 'PRUEBAS', detalle: 'Interconsulta registrada (servicio 890426C).',
    },
    {
      estado: 'PENDIENTE_GESTIONAR', fecha: sumarSegundos(s.fecha, 1), usuario: 'PRUEBAS', detalle: `HC HIC creada: ${s.hc}.`,
    },
  ];
  if (respondida) {
    traza.push({
      estado: 'RESPONDIDA', fecha: fechaRespuesta, usuario: s.interconsultante, detalle: `Respuesta clínica registrada (${resultado}).`,
    });
  }
  if (s.estado === 'facturadas') {
    traza.push({
      estado: 'FACTURADA', fecha: sumarSegundos(fechaRespuesta, 60), usuario: s.interconsultante, detalle: 'Cargo confirmado y generado.',
    });
  }
  return {
    ...s,
    respuesta: {
      concepto: respondida ? 'Se valora al paciente y se emiten recomendaciones de manejo con seguimiento por la especialidad.' : '',
      resultado,
      observaciones: '',
    },
    traza,
  };
}

export const SOLICITUDES = [
  {
    id: 'IC-6',
    numero: 6,
    paciente: 'SEGUNDO PRIMO',
    documento: '32165145946591',
    servicio: 'INTERCONSULTA POR ESPECIALISTA EN ANESTESIOLOGÍA',
    especialidad: 'ONCOLOGIA CLINICA',
    solicitante: 'DANIEL ANTONIO MARTINEZ',
    interconsultante: 'DANIEL ANTONIO MARTINEZ',
    fecha: '2026-09-21T09:41:41',
    dias: 4,
    estado: 'pendientes',
    asignacion: 'nombre',
    esHoy: false,
    hc: '0201295573',
    prestacion: null,
    motivo: 'pruebas 3',
    examen: 'pruebas 4',
    ayudas: 'pruebas 5',
    hiekg: null,
    inicioSintomas: '2026-09-18T19:00:00',
    conducta: null,
  },
  {
    id: 'IC-9',
    numero: 9,
    paciente: 'MARIA FERNANDA LOPEZ RUIZ',
    documento: '1032456789',
    servicio: 'INTERCONSULTA POR ESPECIALISTA EN CARDIOLOGÍA',
    especialidad: 'CARDIOLOGIA',
    solicitante: 'LAURA PATRICIA GOMEZ',
    interconsultante: 'DANIEL ANTONIO MARTINEZ',
    fecha: '2026-09-24T14:05:12',
    dias: 1,
    estado: 'pendientes',
    asignacion: 'nombre',
    esHoy: false,
    hc: '0201296118',
    prestacion: null,
    motivo: 'Dolor torácico opresivo de 2 horas de evolución, con antecedente de hipertensión arterial.',
    examen: 'TA 150/95, FC 98 lpm. Ruidos cardíacos rítmicos, sin soplos. Sin edema periférico.',
    ayudas: 'ECG: ritmo sinusal, sin cambios agudos. Troponina pendiente.',
    hiekg: 'NORMAL',
    inicioSintomas: '2026-09-24T12:00:00',
    conducta: 'VALORACION',
  },
  {
    id: 'IC-7',
    numero: 7,
    paciente: 'JOSE LUIS RAMIREZ TORRES',
    documento: '79845123',
    servicio: 'INTERCONSULTA POR ESPECIALISTA EN NEUROLOGÍA',
    especialidad: 'NEUROLOGIA',
    solicitante: 'CARLOS ANDRES PEREZ',
    interconsultante: 'MARIA CLAUDIA VEGA',
    fecha: '2026-09-23T08:30:45',
    dias: 2,
    estado: 'pendientes',
    asignacion: 'especialidad',
    esHoy: false,
    hc: '0201295701',
    prestacion: null,
    motivo: 'Cefalea intensa de aparición súbita y alteración transitoria del habla.',
    examen: 'Glasgow 15/15. Pupilas isocóricas reactivas. Sin déficit motor evidente.',
    ayudas: 'TAC de cráneo simple sin hallazgos agudos.',
    hiekg: null,
    inicioSintomas: '2026-09-22T21:30:00',
    conducta: null,
  },
  {
    id: 'IC-8',
    numero: 8,
    paciente: 'ANA MARIA GUERRERO DIAZ',
    documento: '52987456',
    servicio: 'INTERCONSULTA POR ESPECIALISTA EN NEFROLOGÍA',
    especialidad: 'NEFROLOGIA',
    solicitante: 'SANDRA MILENA ORTIZ',
    interconsultante: 'RICARDO ANDRES SALAZAR',
    fecha: '2026-09-22T16:20:03',
    dias: 3,
    estado: 'pendientes',
    asignacion: 'especialidad',
    esHoy: false,
    hc: '0201295844',
    prestacion: null,
    motivo: 'Elevación de creatinina en control de laboratorio, con oliguria en las últimas 24 horas.',
    examen: 'Edema leve en miembros inferiores. Abdomen blando, sin dolor a la palpación.',
    ayudas: 'Creatinina 2,4 mg/dL (basal 1,0). Uroanálisis pendiente.',
    hiekg: null,
    inicioSintomas: '2026-09-21T08:00:00',
    conducta: null,
  },
  {
    id: 'IC-11',
    numero: 11,
    paciente: 'PEDRO NEL CASTILLO MORENO',
    documento: '91234567',
    servicio: 'INTERCONSULTA POR ESPECIALISTA EN ORTOPEDIA Y TRAUMATOLOGÍA',
    especialidad: 'ORTOPEDIA Y TRAUMATOLOGIA',
    solicitante: 'JUAN CAMILO RODRIGUEZ',
    interconsultante: 'DANIEL ANTONIO MARTINEZ',
    fecha: '2026-09-25T07:50:00',
    dias: 0,
    estado: 'respondidas',
    asignacion: 'nombre',
    esHoy: true,
    hc: '0201296302',
    prestacion: null,
    motivo: 'Dolor y limitación funcional de cadera derecha posterior a caída de su propia altura.',
    examen: 'Acortamiento y rotación externa del miembro inferior derecho.',
    ayudas: 'Radiografía de cadera: fractura subcapital.',
    hiekg: null,
    inicioSintomas: '2026-09-25T05:30:00',
    conducta: 'MANEJO CONJUNTO',
  },
  {
    id: 'IC-3',
    numero: 3,
    paciente: 'LUZ DARY MENDOZA VARGAS',
    documento: '41567890',
    servicio: 'INTERCONSULTA POR ESPECIALISTA EN ENDOCRINOLOGÍA',
    especialidad: 'ENDOCRINOLOGIA',
    solicitante: 'DANIEL ANTONIO MARTINEZ',
    interconsultante: 'PATRICIA ELENA CORTES',
    fecha: '2026-09-18T11:12:30',
    dias: 7,
    estado: 'sin-cargo',
    asignacion: 'nombre',
    esHoy: false,
    hc: '0201294977',
    prestacion: null,
    motivo: 'Descompensación glucémica en paciente con diabetes mellitus tipo 2.',
    examen: 'Deshidratación leve. Sin signos de cetoacidosis.',
    ayudas: 'Glucometría 342 mg/dL. HbA1c 10,2 %.',
    hiekg: null,
    inicioSintomas: '2026-09-16T09:00:00',
    conducta: 'MANEJO CONJUNTO',
  },
  {
    id: 'IC-4',
    numero: 4,
    paciente: 'HERNANDO BELTRAN SUAREZ',
    documento: '17654321',
    servicio: 'INTERCONSULTA POR ESPECIALISTA EN INFECTOLOGÍA',
    especialidad: 'INFECTOLOGIA',
    solicitante: 'LAURA PATRICIA GOMEZ',
    interconsultante: 'ANDRES FELIPE ROMERO',
    fecha: '2026-09-19T10:45:18',
    dias: 6,
    estado: 'sin-cargo',
    asignacion: 'nombre',
    esHoy: false,
    hc: '0201295012',
    prestacion: null,
    motivo: 'Fiebre persistente de 5 días sin foco claro, con leucocitosis.',
    examen: 'Temperatura 38,6 °C. Sin rigidez de nuca. Auscultación pulmonar limpia.',
    ayudas: 'Hemocultivos tomados. Radiografía de tórax sin infiltrados.',
    hiekg: null,
    inicioSintomas: '2026-09-14T18:00:00',
    conducta: 'VALORACION',
  },
  {
    id: 'IC-5',
    numero: 5,
    paciente: 'CARMEN ELISA ROJAS PINZON',
    documento: '23456781',
    servicio: 'INTERCONSULTA POR ESPECIALISTA EN GASTROENTEROLOGÍA',
    especialidad: 'GASTROENTEROLOGIA',
    solicitante: 'CARLOS ANDRES PEREZ',
    interconsultante: 'JORGE IVAN LONDOÑO',
    fecha: '2026-09-20T15:33:09',
    dias: 5,
    estado: 'sin-cargo',
    asignacion: 'especialidad',
    esHoy: false,
    hc: '0201295130',
    prestacion: null,
    motivo: 'Hematemesis en dos ocasiones y dolor epigástrico.',
    examen: 'Palidez mucocutánea. Dolor a la palpación en epigastrio, sin signos de irritación peritoneal.',
    ayudas: 'Hemoglobina 8,9 g/dL. Endoscopia de vías digestivas altas pendiente.',
    hiekg: null,
    inicioSintomas: '2026-09-20T06:00:00',
    conducta: 'TRASLADO',
  },
  {
    id: 'IC-2',
    numero: 2,
    paciente: 'JORGE ENRIQUE PARDO LEON',
    documento: '80123456',
    servicio: 'INTERCONSULTA POR ESPECIALISTA EN NEUMOLOGÍA',
    especialidad: 'NEUMOLOGIA',
    solicitante: 'SANDRA MILENA ORTIZ',
    interconsultante: 'DANIEL ANTONIO MARTINEZ',
    fecha: '2026-09-15T09:05:27',
    dias: 10,
    estado: 'facturadas',
    asignacion: 'nombre',
    esHoy: false,
    hc: '0201294655',
    prestacion: '4400172',
    motivo: 'Disnea progresiva y saturación baja en aire ambiente.',
    examen: 'Taquipnea, uso de músculos accesorios, sibilancias difusas.',
    ayudas: 'Gases arteriales con hipoxemia leve. Radiografía de tórax con hiperinsuflación.',
    hiekg: null,
    inicioSintomas: '2026-09-13T20:00:00',
    conducta: 'MANEJO CONJUNTO',
  },
  {
    id: 'IC-10',
    numero: 10,
    paciente: 'MARTHA LUCIA ACOSTA REYES',
    documento: '39876543',
    servicio: 'INTERCONSULTA POR ESPECIALISTA EN PSIQUIATRÍA',
    especialidad: 'PSIQUIATRIA',
    solicitante: 'JUAN CAMILO RODRIGUEZ',
    interconsultante: 'CLAUDIA MARCELA DUARTE',
    fecha: '2026-09-24T09:18:44',
    dias: 1,
    estado: 'facturadas',
    asignacion: 'especialidad',
    esHoy: true,
    hc: '0201296077',
    prestacion: '4400188',
    motivo: 'Agitación psicomotora y alteración del ciclo sueño-vigilia durante la hospitalización.',
    examen: 'Ansiosa, orientada en persona, discurso coherente. Sin ideación suicida.',
    ayudas: 'Sin ayudas diagnósticas adicionales.',
    hiekg: null,
    inicioSintomas: '2026-09-22T22:00:00',
    conducta: 'VALORACION',
  },
].map(conDetalle);
