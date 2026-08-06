// Datos simulados para el layout de agenda/calendario de Programar Cita (ver
// agendamiento_consulta_externa_v2.html — el mockup de referencia). Esta
// iteración es solo de LAYOUT: no hay backend, ni validación, ni creación
// real de citas — los helpers de aquí solo generan la grilla estática y las
// tarjetas de ejemplo. La lógica real (agendar, reprogramar, cancelar...)
// se conecta en una iteración aparte.

// Catálogo amplio de especialidades — la mayoría sin médicos activos
// todavía, a propósito: es el caso real (un catálogo institucional siempre
// tiene más especialidades que agendas ya configuradas) y es lo que ejercita
// el buscador del picker (ver SelectorModal). `codigo` es el ID que se
// muestra en la columna de la tabla; `id` sigue siendo la clave interna que
// referencia DOCTORS.especialidadId.
export const SPECIALTIES = [
  { id: 'medint', codigo: '300', nombre: 'Medicina Interna' },
  { id: 'pedia', codigo: '500', nombre: 'Pediatría' },
  { id: 'gineco', codigo: '210', nombre: 'Ginecología y Obstetricia' },
  { id: 'derma', codigo: '110', nombre: 'Dermatología' },
  { id: 'alergologia', codigo: '081', nombre: 'Alergología' },
  { id: 'anestesiologia', codigo: '005', nombre: 'Anestesiología' },
  { id: 'auxiliar-enfermeria', codigo: '003', nombre: 'Auxiliar de Enfermería' },
  { id: 'cardio-hemodinamica', codigo: '970', nombre: 'Cardiología Intervencionista y Hemodinámica' },
  { id: 'cardio-pediatrica', codigo: '361', nombre: 'Cardiología Pediátrica' },
  { id: 'cardiologia', codigo: '302', nombre: 'Cardiología' },
  { id: 'cardiologia-infantil', codigo: '021', nombre: 'Cardiología Infantil' },
  { id: 'cirugia-bariatrica', codigo: '960', nombre: 'Cirugía Bariátrica' },
  { id: 'cirugia-cardiovascular', codigo: '030', nombre: 'Cirugía Cardiovascular' },
  { id: 'cirugia-general', codigo: '031', nombre: 'Cirugía General' },
  { id: 'cirugia-plastica', codigo: '032', nombre: 'Cirugía Plástica y Reconstructiva' },
  { id: 'endocrinologia', codigo: '140', nombre: 'Endocrinología' },
  { id: 'gastroenterologia', codigo: '150', nombre: 'Gastroenterología' },
  { id: 'geriatria', codigo: '160', nombre: 'Geriatría' },
  { id: 'hematologia', codigo: '230', nombre: 'Hematología' },
  { id: 'infectologia', codigo: '250', nombre: 'Infectología' },
  { id: 'nefrologia', codigo: '340', nombre: 'Nefrología' },
  { id: 'neumologia', codigo: '350', nombre: 'Neumología' },
  { id: 'neurologia', codigo: '360', nombre: 'Neurología' },
  { id: 'nutricion', codigo: '400', nombre: 'Nutrición y Dietética' },
  { id: 'oftalmologia', codigo: '420', nombre: 'Oftalmología' },
  { id: 'oncologia', codigo: '450', nombre: 'Oncología Clínica' },
  { id: 'ortopedia', codigo: '470', nombre: 'Ortopedia y Traumatología' },
  { id: 'otorrino', codigo: '480', nombre: 'Otorrinolaringología' },
  { id: 'psiquiatria', codigo: '550', nombre: 'Psiquiatría' },
  { id: 'reumatologia', codigo: '600', nombre: 'Reumatología' },
  { id: 'urologia', codigo: '650', nombre: 'Urología' },
];

// `citasDisponibles` alimenta la columna "Citas disponibles" del picker de
// médico (ver SelectorModal) — cupos libres en la agenda del médico para el
// rango visible, no el total de citas que atiende.
export const DOCTORS = [
  { id: 'd1', codigo: '1002202039', nombre: 'Dra. Ana Ruiz', especialidadId: 'medint', consultorio: 'Consultorio 101', citasDisponibles: 8 },
  { id: 'd2', codigo: '6880184', nombre: 'Dr. Julián Torres', especialidadId: 'medint', consultorio: 'Consultorio 102', citasDisponibles: 12 },
  { id: 'd6', codigo: '1067900496', nombre: 'Dr. Andrés Mejía', especialidadId: 'medint', consultorio: 'Consultorio 103', citasDisponibles: 5 },
  { id: 'd3', codigo: '9309206', nombre: 'Dr. Carlos Peña', especialidadId: 'pedia', consultorio: 'Consultorio 201', citasDisponibles: 15 },
  { id: 'd7', codigo: '1067984564', nombre: 'Dra. Paola Rincón', especialidadId: 'pedia', consultorio: 'Consultorio 202', citasDisponibles: 9 },
  { id: 'd4', codigo: '78704473', nombre: 'Dra. Laura Gómez', especialidadId: 'gineco', consultorio: 'Consultorio 301', citasDisponibles: 6 },
  { id: 'd8', codigo: '8680569', nombre: 'Dr. Iván Salgado', especialidadId: 'gineco', consultorio: 'Consultorio 302', citasDisponibles: 11 },
  { id: 'd5', codigo: '52667334', nombre: 'Dra. Camila Torres', especialidadId: 'derma', consultorio: 'Consultorio 401', citasDisponibles: 4 },
  { id: 'd9', codigo: '79556223', nombre: 'Dra. Sofía Herrera', especialidadId: 'derma', consultorio: 'Consultorio 402', citasDisponibles: 13 },
];

export const STATE_LABEL = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
  no_asistio: 'No asistió',
  reprogramada: 'Reprogramada',
};

export const TIPO_LABEL = {
  primera: 'Primera vez',
  control: 'Control',
  urgencia: 'Urgencia',
};

// Valor de la consulta según tipo — mismos precios que SERVICES más abajo
// (consulta general/urgencias/especializada), para el detalle administrativo
// de la cita en DetalleCitaModal.
export const VALOR_BY_TIPO = {
  primera: 68000,
  control: 28500,
  urgencia: 42000,
};

// ---------- Semana visible (Lunes-Viernes de la semana actual) ----------
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_NAMES_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Dom
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function weekDays() {
  const monday = startOfWeekMonday(new Date());
  const days = [];
  for (let i = 0; i < 5; i++) {
    const f = new Date(monday);
    f.setDate(f.getDate() + i);
    days.push({
      id: i,
      nombre: DAY_NAMES_CORTOS[f.getDay()],
      fecha: `${f.getDate()} ${f.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}`,
      date: f,
    });
  }
  return days;
}

export function weekRangeLabel() {
  const days = weekDays();
  const first = days[0].date;
  const last = days[days.length - 1].date;
  const mes = last.toLocaleDateString('es-CO', { month: 'long' });
  return `${first.getDate()} - ${last.getDate()} de ${mes} de ${last.getFullYear()}`;
}

// Índice 0-4 (Lun-Vie) de "hoy" sobre weekDays(). Si hoy cae en fin de
// semana (la semana visible solo cubre Lun-Vie) se usa el lunes como
// referencia para la vista "Día", ya que no hay agenda de fin de semana.
export function todayDayIndex() {
  const jsDay = new Date().getDay(); // 0=Dom .. 6=Sáb
  if (jsDay === 0 || jsDay === 6) return 0;
  return jsDay - 1;
}

export function todayLabel() {
  const f = new Date();
  const dia = DAY_NAMES[f.getDay()];
  const mes = f.toLocaleDateString('es-CO', { month: 'long' });
  return `${dia}, ${f.getDate()} de ${mes} de ${f.getFullYear()}`;
}

// ---------- Horario (grilla de 30 min, 07:00-17:00) ----------
export const START_HOUR = 7;
export const END_HOUR = 17;
export const SLOTS = (END_HOUR - START_HOUR) * 2;
export const NOW_DEMO = '10:15'; // hora fija de demo para la línea "ahora"

export function slotIndex(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return (h - START_HOUR) * 2 + (m === 30 ? 1 : 0);
}
export function timeLabel(idx) {
  const totalMin = idx * 30;
  const h = START_HOUR + Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ---------- Citas de ejemplo ----------
// day: índice 0-4 sobre weekDays() (0=Lunes). duration: en franjas de 30 min
// — la duración de la cita está pre-configurada en 30 min (1 franja) para
// todo el consultorio, así que la tarjeta en ScheduleGrid siempre ocupa un
// solo bloque en la grilla sin importar este valor (ver ScheduleGrid.jsx).
export const APPOINTMENTS = [
  { id: 1, doctorId: 'd1', day: 0, start: '08:00', duration: 1, patient: 'Esteban Zuluaga', doc: 'CC 8.887.334', eps: 'Sura', tipo: 'control', estado: 'confirmada', motivo: 'Control de hipertensión', telefonoAviso: '3227999108', fechaSolicitud: '4/8/2026', consecutivo: '0201084072' },
  { id: 2, doctorId: 'd1', day: 1, start: '09:00', duration: 1, patient: 'Diana Osorio', doc: 'CC 43.556.221', eps: 'Compensar', tipo: 'primera', estado: 'confirmada', motivo: 'Chequeo general', telefonoAviso: '3023261760', fechaSolicitud: '4/8/2026', consecutivo: '0201084073' },
  { id: 3, doctorId: 'd1', day: 2, start: '08:00', duration: 1, patient: 'María Fonseca', doc: 'CC 43.221.998', eps: 'Sura', tipo: 'control', estado: 'confirmada', motivo: 'Control de hipertensión', telefonoAviso: '3117744582', fechaSolicitud: '5/8/2026', consecutivo: '0201084074' },
  { id: 4, doctorId: 'd1', day: 2, start: '09:00', duration: 1, patient: 'Jorge Salazar', doc: 'CC 71.556.204', eps: 'Nueva EPS', tipo: 'primera', estado: 'pendiente', motivo: 'Dolor abdominal recurrente', telefonoAviso: '3145589021', fechaSolicitud: '5/8/2026', consecutivo: '0201084075' },
  { id: 5, doctorId: 'd1', day: 2, start: '11:00', duration: 1, patient: 'Lucía Herrera', doc: 'CC 52.884.117', eps: 'Sanitas', tipo: 'urgencia', estado: 'confirmada', motivo: 'Fiebre persistente 3 días', telefonoAviso: '3012239876', fechaSolicitud: '5/8/2026', consecutivo: '0201084076' },
  { id: 6, doctorId: 'd1', day: 3, start: '10:00', duration: 1, patient: 'Fabián Castaño', doc: 'CC 71.223.887', eps: 'Nueva EPS', tipo: 'urgencia', estado: 'pendiente', motivo: 'Dolor torácico leve', telefonoAviso: '3204471123', fechaSolicitud: '6/8/2026', consecutivo: '0201084077' },
  { id: 7, doctorId: 'd1', day: 4, start: '08:30', duration: 1, patient: 'Gloria Ceballos', doc: 'CC 32.667.119', eps: 'Sanitas', tipo: 'control', estado: 'reprogramada', motivo: 'Control de tiroides', telefonoAviso: '3167783345', fechaSolicitud: '6/8/2026', consecutivo: '0201084078' },

  { id: 8, doctorId: 'd2', day: 2, start: '08:30', duration: 1, patient: 'Andrés Cifuentes', doc: 'CC 80.331.567', eps: 'Compensar', tipo: 'control', estado: 'no_asistio', motivo: 'Control post-quirúrgico', telefonoAviso: '3229981234', fechaSolicitud: '3/8/2026', consecutivo: '0201084079' },
  { id: 9, doctorId: 'd2', day: 2, start: '10:00', duration: 1, patient: 'Paula Restrepo', doc: 'CC 1.020.445.982', eps: 'Sura', tipo: 'primera', estado: 'confirmada', motivo: 'Valoración general', telefonoAviso: '3101122998', fechaSolicitud: '3/8/2026', consecutivo: '0201084080' },
  { id: 10, doctorId: 'd2', day: 2, start: '13:00', duration: 1, patient: 'Ricardo Mesa', doc: 'CC 19.887.302', eps: 'Nueva EPS', tipo: 'control', estado: 'cancelada', motivo: 'Control de diabetes', telefonoAviso: '3187765432', fechaSolicitud: '4/8/2026', consecutivo: '0201084081' },

  { id: 11, doctorId: 'd3', day: 2, start: '08:00', duration: 1, patient: 'Samuel Ortiz (5a)', doc: 'RC 1.098.776.234', eps: 'Sanitas', tipo: 'control', estado: 'confirmada', motivo: 'Control de crecimiento', telefonoAviso: '3056667788', fechaSolicitud: '4/8/2026', consecutivo: '0201084082' },
  { id: 12, doctorId: 'd3', day: 2, start: '09:30', duration: 1, patient: 'Isabella Marín (2a)', doc: 'RC 1.099.887.112', eps: 'Sura', tipo: 'urgencia', estado: 'pendiente', motivo: 'Tos y dificultad respiratoria', telefonoAviso: '3219988771', fechaSolicitud: '5/8/2026', consecutivo: '0201084083' },
  { id: 13, doctorId: 'd3', day: 2, start: '14:00', duration: 1, patient: 'Tomás Vélez (7a)', doc: 'TI 1.098.223.456', eps: 'Compensar', tipo: 'primera', estado: 'reprogramada', motivo: 'Valoración por pediatría', telefonoAviso: '3143322119', fechaSolicitud: '5/8/2026', consecutivo: '0201084084' },

  { id: 14, doctorId: 'd4', day: 2, start: '09:00', duration: 1, patient: 'Camila Duque', doc: 'CC 1.036.778.221', eps: 'Sanitas', tipo: 'control', estado: 'confirmada', motivo: 'Control prenatal', telefonoAviso: '3002211445', fechaSolicitud: '6/8/2026', consecutivo: '0201084085' },
  { id: 15, doctorId: 'd4', day: 2, start: '12:00', duration: 1, patient: 'Natalia Correa', doc: 'CC 1.037.556.902', eps: 'Sura', tipo: 'primera', estado: 'pendiente', motivo: 'Consulta ginecológica general', telefonoAviso: '3176654321', fechaSolicitud: '6/8/2026', consecutivo: '0201084086' },

  { id: 16, doctorId: 'd5', day: 2, start: '10:30', duration: 1, patient: 'Verónica Salazar', doc: 'CC 1.045.223.887', eps: 'Coomeva', tipo: 'primera', estado: 'confirmada', motivo: 'Valoración de lesión en piel', telefonoAviso: '3239987654', fechaSolicitud: '6/8/2026', consecutivo: '0201084087' },

  // Agenda casi completa (Dra. Ana Ruiz, Viernes) — caso de prueba para ver
  // cómo se ve la grilla con un médico saturado de citas y el color por
  // estado conviviendo en franjas contiguas. Quedan libres 10:30, 14:00 y
  // 15:30 a propósito, para que "+ Agendar" también sea visible.
  { id: 17, doctorId: 'd1', day: 4, start: '07:00', duration: 1, patient: 'Andrea Bermúdez', doc: 'CC 52.114.887', eps: 'Sura', tipo: 'control', estado: 'confirmada', motivo: 'Control de hipertensión', telefonoAviso: '3201122334', fechaSolicitud: '2/8/2026', consecutivo: '0201084088' },
  { id: 18, doctorId: 'd1', day: 4, start: '07:30', duration: 1, patient: 'Felipe Rojas Nieto', doc: 'CC 79.887.213', eps: 'Compensar', tipo: 'control', estado: 'confirmada', motivo: 'Control de diabetes', telefonoAviso: '3112233445', fechaSolicitud: '2/8/2026', consecutivo: '0201084089' },
  { id: 19, doctorId: 'd1', day: 4, start: '08:00', duration: 1, patient: 'Camilo Andrés Peña', doc: 'CC 1.019.887.334', eps: 'Nueva EPS', tipo: 'primera', estado: 'pendiente', motivo: 'Chequeo general', telefonoAviso: '3145566778', fechaSolicitud: '3/8/2026', consecutivo: '0201084090' },
  { id: 20, doctorId: 'd1', day: 4, start: '09:00', duration: 1, patient: 'Silvia Marcela Duarte', doc: 'CC 43.667.229', eps: 'Sanitas', tipo: 'control', estado: 'confirmada', motivo: 'Control de tiroides', telefonoAviso: '3167788990', fechaSolicitud: '3/8/2026', consecutivo: '0201084091' },
  { id: 21, doctorId: 'd1', day: 4, start: '09:30', duration: 1, patient: 'Julián Esteban Rico', doc: 'CC 80.223.115', eps: 'Sura', tipo: 'control', estado: 'no_asistio', motivo: 'Control post-quirúrgico', telefonoAviso: '3198899001', fechaSolicitud: '3/8/2026', consecutivo: '0201084092' },
  { id: 22, doctorId: 'd1', day: 4, start: '10:00', duration: 1, patient: 'Norma Patricia León', doc: 'CC 41.556.902', eps: 'Coomeva', tipo: 'urgencia', estado: 'confirmada', motivo: 'Dolor abdominal agudo', telefonoAviso: '3223344556', fechaSolicitud: '4/8/2026', consecutivo: '0201084093' },
  { id: 23, doctorId: 'd1', day: 4, start: '11:00', duration: 1, patient: 'Oscar Iván Castaño', doc: 'CC 19.334.771', eps: 'Nueva EPS', tipo: 'control', estado: 'confirmada', motivo: 'Control de hipertensión', telefonoAviso: '3134455667', fechaSolicitud: '4/8/2026', consecutivo: '0201084094' },
  { id: 24, doctorId: 'd1', day: 4, start: '11:30', duration: 1, patient: 'Diana Carolina Puentes', doc: 'CC 1.022.887.556', eps: 'Sanitas', tipo: 'primera', estado: 'pendiente', motivo: 'Valoración general', telefonoAviso: '3156677889', fechaSolicitud: '4/8/2026', consecutivo: '0201084095' },
  { id: 25, doctorId: 'd1', day: 4, start: '12:00', duration: 1, patient: 'Héctor Fabio Ramírez', doc: 'CC 8.334.221', eps: 'Compensar', tipo: 'control', estado: 'cancelada', motivo: 'Control de diabetes', telefonoAviso: '3178899002', fechaSolicitud: '5/8/2026', consecutivo: '0201084096' },
  { id: 26, doctorId: 'd1', day: 4, start: '12:30', duration: 1, patient: 'Adriana Lucía Bonilla', doc: 'CC 52.667.334', eps: 'Sura', tipo: 'control', estado: 'confirmada', motivo: 'Control de tiroides', telefonoAviso: '3189900113', fechaSolicitud: '5/8/2026', consecutivo: '0201084097' },
  { id: 27, doctorId: 'd1', day: 4, start: '13:00', duration: 1, patient: 'Wilson Alexander Prada', doc: 'CC 79.556.223', eps: 'Nueva EPS', tipo: 'control', estado: 'reprogramada', motivo: 'Control post-quirúrgico', telefonoAviso: '3201133445', fechaSolicitud: '5/8/2026', consecutivo: '0201084098' },
  { id: 28, doctorId: 'd1', day: 4, start: '13:30', duration: 1, patient: 'Martha Cecilia Nova', doc: 'CC 41.887.665', eps: 'Sanitas', tipo: 'primera', estado: 'confirmada', motivo: 'Chequeo general', telefonoAviso: '3212244556', fechaSolicitud: '6/8/2026', consecutivo: '0201084099' },
  { id: 29, doctorId: 'd1', day: 4, start: '14:30', duration: 1, patient: 'Iván Darío Suárez', doc: 'CC 19.887.334', eps: 'Coomeva', tipo: 'control', estado: 'confirmada', motivo: 'Control de hipertensión', telefonoAviso: '3223355667', fechaSolicitud: '6/8/2026', consecutivo: '0201084100' },
  { id: 30, doctorId: 'd1', day: 4, start: '15:00', duration: 1, patient: 'Claudia Patricia Rueda', doc: 'CC 43.221.556', eps: 'Sura', tipo: 'urgencia', estado: 'pendiente', motivo: 'Fiebre persistente 2 días', telefonoAviso: '3234466778', fechaSolicitud: '6/8/2026', consecutivo: '0201084101' },
  { id: 31, doctorId: 'd1', day: 4, start: '16:00', duration: 1, patient: 'Sergio Andrés Malaver', doc: 'CC 80.667.112', eps: 'Compensar', tipo: 'control', estado: 'confirmada', motivo: 'Control de diabetes', telefonoAviso: '3245577889', fechaSolicitud: '6/8/2026', consecutivo: '0201084102' },
  { id: 32, doctorId: 'd1', day: 4, start: '16:30', duration: 1, patient: 'Liliana Marcela Cortés', doc: 'CC 52.334.887', eps: 'Nueva EPS', tipo: 'primera', estado: 'confirmada', motivo: 'Valoración general', telefonoAviso: '3256688990', fechaSolicitud: '6/8/2026', consecutivo: '0201084103' },
];

// ---------- Mini-calendario (mes actual) ----------
const DOW_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export function monthLabel(date = new Date()) {
  const label = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Devuelve { dowLabels, days: [{ n, muted, today }] } — semanas completas
// (incluye días del mes anterior/siguiente para llenar la grilla de 7 columnas).
export function generateMonthGrid(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0=Lunes
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    days.push({ n: daysInPrevMonth - i, muted: true, today: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ n: d, muted: false, today: isCurrentMonth && d === today.getDate() });
  }
  let trailing = 1;
  while (days.length % 7 !== 0) {
    days.push({ n: trailing++, muted: true, today: false });
  }

  return { dowLabels: DOW_LABELS, days };
}

// ---------- Contrato + servicios contratados ----------
export const CONTRACT = { numero: 'CTR-2025-0842', tipo: 'Capitación' };

export const SERVICES = [
  { nombre: 'Consulta médica general', codigo: '890301', valor: 28500 },
  { nombre: 'Consulta de urgencias', codigo: '890302', valor: 42000 },
  { nombre: 'Consulta especializada', codigo: '890401', valor: 68000 },
  { nombre: 'Consulta especializada', codigo: '890402', valor: 71000 },
  { nombre: 'Consulta especializada', codigo: '890403', valor: 65000 },
  { nombre: 'Hemograma completo', codigo: '840001', valor: 18500 },
  { nombre: 'Glicemia en ayunas', codigo: '840101', valor: 8200 },
];

export function fmtCOP(n) {
  return '$ ' + n.toLocaleString('es-CO');
}
