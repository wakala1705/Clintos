// Datos simulados para el layout de agenda/calendario de Programar Cita (ver
// agendamiento_consulta_externa_v2.html — el mockup de referencia). Esta
// iteración es solo de LAYOUT: no hay backend, ni validación, ni creación
// real de citas — los helpers de aquí solo generan la grilla estática y las
// tarjetas de ejemplo. La lógica real (agendar, reprogramar, cancelar...)
// se conecta en una iteración aparte.

export const SPECIALTIES = [
  { id: 'medint', nombre: 'Medicina Interna' },
  { id: 'pedia', nombre: 'Pediatría' },
  { id: 'gineco', nombre: 'Ginecología' },
  { id: 'derma', nombre: 'Dermatología' },
];

export const DOCTORS = [
  { id: 'd1', nombre: 'Dra. Ana Ruiz', especialidadId: 'medint', consultorio: 'Consultorio 101' },
  { id: 'd2', nombre: 'Dr. Julián Torres', especialidadId: 'medint', consultorio: 'Consultorio 102' },
  { id: 'd3', nombre: 'Dr. Carlos Peña', especialidadId: 'pedia', consultorio: 'Consultorio 201' },
  { id: 'd4', nombre: 'Dra. Laura Gómez', especialidadId: 'gineco', consultorio: 'Consultorio 301' },
  { id: 'd5', nombre: 'Dra. Camila Torres', especialidadId: 'derma', consultorio: 'Consultorio 401' },
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
  { id: 1, doctorId: 'd1', day: 0, start: '08:00', duration: 1, patient: 'Esteban Zuluaga', doc: 'CC 8.887.334', eps: 'Sura', tipo: 'control', estado: 'confirmada', motivo: 'Control de hipertensión' },
  { id: 2, doctorId: 'd1', day: 1, start: '09:00', duration: 1, patient: 'Diana Osorio', doc: 'CC 43.556.221', eps: 'Compensar', tipo: 'primera', estado: 'confirmada', motivo: 'Chequeo general' },
  { id: 3, doctorId: 'd1', day: 2, start: '08:00', duration: 1, patient: 'María Fonseca', doc: 'CC 43.221.998', eps: 'Sura', tipo: 'control', estado: 'confirmada', motivo: 'Control de hipertensión' },
  { id: 4, doctorId: 'd1', day: 2, start: '09:00', duration: 1, patient: 'Jorge Salazar', doc: 'CC 71.556.204', eps: 'Nueva EPS', tipo: 'primera', estado: 'pendiente', motivo: 'Dolor abdominal recurrente' },
  { id: 5, doctorId: 'd1', day: 2, start: '11:00', duration: 1, patient: 'Lucía Herrera', doc: 'CC 52.884.117', eps: 'Sanitas', tipo: 'urgencia', estado: 'confirmada', motivo: 'Fiebre persistente 3 días' },
  { id: 6, doctorId: 'd1', day: 3, start: '10:00', duration: 1, patient: 'Fabián Castaño', doc: 'CC 71.223.887', eps: 'Nueva EPS', tipo: 'urgencia', estado: 'pendiente', motivo: 'Dolor torácico leve' },
  { id: 7, doctorId: 'd1', day: 4, start: '08:30', duration: 1, patient: 'Gloria Ceballos', doc: 'CC 32.667.119', eps: 'Sanitas', tipo: 'control', estado: 'reprogramada', motivo: 'Control de tiroides' },

  { id: 8, doctorId: 'd2', day: 2, start: '08:30', duration: 1, patient: 'Andrés Cifuentes', doc: 'CC 80.331.567', eps: 'Compensar', tipo: 'control', estado: 'no_asistio', motivo: 'Control post-quirúrgico' },
  { id: 9, doctorId: 'd2', day: 2, start: '10:00', duration: 1, patient: 'Paula Restrepo', doc: 'CC 1.020.445.982', eps: 'Sura', tipo: 'primera', estado: 'confirmada', motivo: 'Valoración general' },
  { id: 10, doctorId: 'd2', day: 2, start: '13:00', duration: 1, patient: 'Ricardo Mesa', doc: 'CC 19.887.302', eps: 'Nueva EPS', tipo: 'control', estado: 'cancelada', motivo: 'Control de diabetes' },

  { id: 11, doctorId: 'd3', day: 2, start: '08:00', duration: 1, patient: 'Samuel Ortiz (5a)', doc: 'RC 1.098.776.234', eps: 'Sanitas', tipo: 'control', estado: 'confirmada', motivo: 'Control de crecimiento' },
  { id: 12, doctorId: 'd3', day: 2, start: '09:30', duration: 1, patient: 'Isabella Marín (2a)', doc: 'RC 1.099.887.112', eps: 'Sura', tipo: 'urgencia', estado: 'pendiente', motivo: 'Tos y dificultad respiratoria' },
  { id: 13, doctorId: 'd3', day: 2, start: '14:00', duration: 1, patient: 'Tomás Vélez (7a)', doc: 'TI 1.098.223.456', eps: 'Compensar', tipo: 'primera', estado: 'reprogramada', motivo: 'Valoración por pediatría' },

  { id: 14, doctorId: 'd4', day: 2, start: '09:00', duration: 1, patient: 'Camila Duque', doc: 'CC 1.036.778.221', eps: 'Sanitas', tipo: 'control', estado: 'confirmada', motivo: 'Control prenatal' },
  { id: 15, doctorId: 'd4', day: 2, start: '12:00', duration: 1, patient: 'Natalia Correa', doc: 'CC 1.037.556.902', eps: 'Sura', tipo: 'primera', estado: 'pendiente', motivo: 'Consulta ginecológica general' },

  { id: 16, doctorId: 'd5', day: 2, start: '10:30', duration: 1, patient: 'Verónica Salazar', doc: 'CC 1.045.223.887', eps: 'Coomeva', tipo: 'primera', estado: 'confirmada', motivo: 'Valoración de lesión en piel' },
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
