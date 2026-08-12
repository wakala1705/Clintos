// Datos simulados para la agenda del día de Historia Clínica (Consulta
// Externa) — mismo criterio que agendaMockData.js (ProgramarCita) y
// mockPatientsData.js (ListaPacientes): esta iteración es solo de LAYOUT, no
// hay backend real. fetchAgenda() resuelve tras un pequeño delay para poder
// ejercitar el estado de carga (skeleton) al cambiar de día o de filtro KPI.

export const DOCTOR = { nombre: 'Manuel Hernández' };

const DOW_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Dom
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// referenceDate ancla la semana visible (L-D) sobre la que navega
// WeekDatePicker — no necesariamente contiene la fecha seleccionada, ya que
// se puede hojear semanas sin seleccionar un día todavía.
export function weekDays(referenceDate) {
  const monday = startOfWeekMonday(referenceDate);
  const todayIso = toISODate(new Date());
  const days = [];
  for (let i = 0; i < 7; i++) {
    const f = new Date(monday);
    f.setDate(f.getDate() + i);
    const iso = toISODate(f);
    days.push({ letter: DOW_LABELS[i], dayNumber: f.getDate(), iso, date: f, isToday: iso === todayIso });
  }
  return days;
}

// Mes mostrado en el header del selector — se toma del jueves de la semana
// visible (día central) para que una semana que cruza de mes no oscile entre
// dos etiquetas distintas mientras se hojea.
export function weekMonthLabel(referenceDate) {
  const mid = weekDays(referenceDate)[3].date;
  const label = mid.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function fullDateLabel(iso) {
  const d = new Date(`${iso}T00:00:00`);
  const label = d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function todayISO() {
  return toISODate(new Date());
}

// Citas de ejemplo fechadas sobre la semana actual del sistema (en vez de
// fechas fijas) para que "Hoy" siempre tenga datos representativos de los 3
// KPIs sin importar cuándo se abra la pantalla.
function isoOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export const TIPO_LABEL = { primera: 'Primera vez', control: 'Control', urgencia: 'Urgencia' };

export const APPOINTMENTS = [
  { id: 1, dateISO: isoOffset(0), citaHora: '08:00', llegadaHora: '07:52', inicioHora: '08:05', finalHora: null, idAfiliado: 'AF-10023', nombreAfiliado: 'Esteban Zuluaga', idServicio: '890301', descripcionServicio: 'Consulta médica general', primeraVez: null, tipoCita: 'control', edad: '45 años', sexo: 'Masculino', eps: 'Sura' },
  { id: 2, dateISO: isoOffset(0), citaHora: '08:30', llegadaHora: '08:20', inicioHora: null, finalHora: null, idAfiliado: 'AF-10088', nombreAfiliado: 'Diana Osorio', idServicio: '890401', descripcionServicio: 'Consulta especializada', primeraVez: { anio: 2026, ips: 'IPS Norte', medico: 'Dra. Ana Ruiz' }, tipoCita: 'primera', edad: '29 años', sexo: 'Femenino', eps: 'Compensar', allergies: [{ name: 'Penicilina', reaction: 'Reacción cutánea moderada' }] },
  { id: 3, dateISO: isoOffset(0), citaHora: '09:00', llegadaHora: '08:55', inicioHora: '09:02', finalHora: '09:18', idAfiliado: 'AF-10125', nombreAfiliado: 'María Fonseca', idServicio: '890301', descripcionServicio: 'Consulta médica general', primeraVez: null, tipoCita: 'control', edad: '52 años', sexo: 'Femenino', eps: 'Sura' },
  { id: 4, dateISO: isoOffset(0), citaHora: '09:30', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-10201', nombreAfiliado: 'Jorge Salazar', idServicio: '890302', descripcionServicio: 'Consulta de urgencias', primeraVez: null, tipoCita: 'urgencia', edad: '38 años', sexo: 'Masculino', eps: 'Nueva EPS' },
  { id: 5, dateISO: isoOffset(0), citaHora: '10:00', llegadaHora: '09:50', inicioHora: '10:03', finalHora: '10:20', idAfiliado: 'AF-10334', nombreAfiliado: 'Lucía Herrera', idServicio: '890401', descripcionServicio: 'Consulta especializada', primeraVez: { anio: 2025, ips: 'IPS Sur', medico: 'Dr. Julián Torres' }, tipoCita: 'primera', edad: '61 años', sexo: 'Femenino', eps: 'Sanitas' },
  { id: 6, dateISO: isoOffset(1), citaHora: '08:00', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-10456', nombreAfiliado: 'Fabián Castaño', idServicio: '890301', descripcionServicio: 'Consulta médica general', primeraVez: null, tipoCita: 'control', edad: '34 años', sexo: 'Masculino', eps: 'Nueva EPS' },
  { id: 7, dateISO: isoOffset(1), citaHora: '09:00', llegadaHora: '08:50', inicioHora: '09:05', finalHora: '09:22', idAfiliado: 'AF-10556', nombreAfiliado: 'Gloria Ceballos', idServicio: '890301', descripcionServicio: 'Consulta médica general', primeraVez: null, tipoCita: 'control', edad: '58 años', sexo: 'Femenino', eps: 'Sanitas' },
  // Mismo paciente demo que usa Gestión de Enfermería (mismo documento/edad/
  // alergias) — se agrega acá con cita de Consulta Externa para poder probar
  // el estado CON registros de la pestaña Historia clínica (ver
  // mockHistoriaClinicaRecords.js, que indexa por documento).
  { id: 8, dateISO: isoOffset(0), citaHora: '11:00', llegadaHora: '10:50', inicioHora: '11:05', finalHora: null, idAfiliado: '1234567890', nombreAfiliado: 'Isabella Daniela Rodríguez Paternina', idServicio: '890401', descripcionServicio: 'Consulta especializada', primeraVez: null, tipoCita: 'control', edad: '34 años 10 meses 14 días', sexo: 'Femenino', eps: 'Salud Total EPS', allergies: [{ name: 'Penicilina', reaction: 'Reacción cutánea moderada' }, { name: 'Mariscos', reaction: 'Anafilaxia leve' }] },
  // Pacientes pediátricos agregados para cubrir, uno a uno, los 12 rangos de
  // edad del instrumento EAD (ver RANGOS_EAD en eadData.js) — permiten probar
  // el paso "08 Desarrollo" (EadDomainEtapa.jsx) con un paciente real de cada
  // rango sin tener que editar la edad a mano.
  { id: 9, dateISO: isoOffset(0), citaHora: '11:30', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20001', nombreAfiliado: 'Samuel Rojas Mesa', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: { anio: 2026, ips: 'IPS Norte', medico: 'Dra. Ana Ruiz' }, tipoCita: 'primera', edad: '15 días', sexo: 'Masculino', eps: 'Sura' },
  { id: 10, dateISO: isoOffset(0), citaHora: '12:00', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20002', nombreAfiliado: 'Valentina Cárdenas', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '2 meses', sexo: 'Femenino', eps: 'Compensar' },
  { id: 11, dateISO: isoOffset(0), citaHora: '12:30', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20003', nombreAfiliado: 'Emiliano Torres', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '4 meses', sexo: 'Masculino', eps: 'Nueva EPS' },
  { id: 12, dateISO: isoOffset(0), citaHora: '13:00', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20004', nombreAfiliado: 'Mariana Gil', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '7 meses', sexo: 'Femenino', eps: 'Sanitas' },
  { id: 13, dateISO: isoOffset(0), citaHora: '13:30', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20005', nombreAfiliado: 'Thiago Vargas', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '10 meses', sexo: 'Masculino', eps: 'Salud Total EPS' },
  { id: 14, dateISO: isoOffset(0), citaHora: '14:00', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20006', nombreAfiliado: 'Sofía Ramírez', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '1 año 3 meses', sexo: 'Femenino', eps: 'Sura' },
  { id: 15, dateISO: isoOffset(0), citaHora: '14:30', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20007', nombreAfiliado: 'Martín Ocampo', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '1 año 9 meses', sexo: 'Masculino', eps: 'Compensar' },
  { id: 16, dateISO: isoOffset(0), citaHora: '15:00', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20008', nombreAfiliado: 'Isabella Duarte', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '2 años 6 meses', sexo: 'Femenino', eps: 'Nueva EPS' },
  { id: 17, dateISO: isoOffset(0), citaHora: '15:30', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20009', nombreAfiliado: 'Santiago Peña', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '3 años 6 meses', sexo: 'Masculino', eps: 'Sanitas' },
  { id: 18, dateISO: isoOffset(0), citaHora: '16:00', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20010', nombreAfiliado: 'Antonella Reyes', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '4 años 6 meses', sexo: 'Femenino', eps: 'Salud Total EPS' },
  { id: 19, dateISO: isoOffset(0), citaHora: '16:30', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20011', nombreAfiliado: 'Nicolás Mora', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '5 años 6 meses', sexo: 'Masculino', eps: 'Sura' },
  { id: 20, dateISO: isoOffset(0), citaHora: '17:00', llegadaHora: null, inicioHora: null, finalHora: null, idAfiliado: 'AF-20012', nombreAfiliado: 'Camila Suárez', idServicio: '890501', descripcionServicio: 'Atención integral a la primera infancia e infancia', primeraVez: null, tipoCita: 'control', edad: '6 años 6 meses', sexo: 'Femenino', eps: 'Compensar' },
];

function iniciales(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// pendiente: aún no llega. en-sala: llegó pero no ha terminado. atendido:
// finalizó la atención. Alimenta tanto los conteos KPI como el filtro toggle
// que las tarjetas KPI aplican sobre la tabla.
function estadoAtencion(appt) {
  if (appt.finalHora) return 'atendido';
  if (appt.llegadaHora) return 'en-sala';
  return 'pendiente';
}

export function fetchAgenda({ dateISO, kpiFilter }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dayItems = APPOINTMENTS
        .filter((a) => a.dateISO === dateISO)
        .map((a) => ({ ...a, estado: estadoAtencion(a) }));
      const counts = {
        enSala: dayItems.filter((a) => a.estado === 'en-sala').length,
        atendidos: dayItems.filter((a) => a.estado === 'atendido').length,
        delDia: dayItems.length,
      };
      const items = kpiFilter === 'dia' ? dayItems : dayItems.filter((a) => a.estado === kpiFilter);
      resolve({ items, counts });
    }, 350);
  });
}

// Datos para la pantalla de atención (doble clic en una fila de la agenda).
// Busca la cita por id y arma el shape que espera PatientBanner a partir de
// sus propios campos — igual que fetchAgenda/fetchPatients, resuelve como
// Promise aunque sea una búsqueda en memoria, para no diferenciar del resto
// de los "get by id" del proyecto (ver getPatientDetail en FichaPaciente).
export function getAtencionData(citaId) {
  const appt = APPOINTMENTS.find((a) => String(a.id) === String(citaId));
  if (!appt) return Promise.resolve(null);
  return Promise.resolve({
    cita: { ...appt, estado: estadoAtencion(appt) },
    patient: {
      iniciales: iniciales(appt.nombreAfiliado),
      nombre: appt.nombreAfiliado,
      documento: appt.idAfiliado,
      edad: appt.edad,
      sexo: appt.sexo,
      eps: appt.eps,
      allergies: appt.allergies,
    },
  });
}
