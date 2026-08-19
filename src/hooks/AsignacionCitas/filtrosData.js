// Catálogo de especialidades/médicos para los pickers de filtrado del
// header de la agenda (ver page.jsx + FiltroPickerModal) — mismos valores
// que tenían los <select> nativos que reemplazan, solo con id/codigo propios
// para alimentar la tabla buscable. No comparte fuente con
// src/hooks/ProgramarCita/agendaMockData.js: mismo criterio de duplicación
// por feature que el resto del proyecto (ver AGENTS.md), evita acoplar dos
// features por un catálogo que cada una puede necesitar evolucionar distinto.
export const ESPECIALIDADES = [
  { id: 'general', codigo: '001', nombre: 'Medicina General' },
  { id: 'pediatria', codigo: '002', nombre: 'Pediatría' },
  { id: 'ginecologia', codigo: '003', nombre: 'Ginecología' },
];

export const MEDICOS = [
  { id: 'm1', codigo: '1001', nombre: 'Dr. Juan Carlos Pérez', especialidadId: 'general', citasDisponibles: 12 },
  { id: 'm2', codigo: '1002', nombre: 'Dra. Ana María Ruiz', especialidadId: 'pediatria', citasDisponibles: 9 },
];

/* ================= AGENDA DEL DÍA GENERADA POR MÉDICO =================
   Al elegir especialidad + médico en el toolbar (ver page.jsx,
   __setAsignacionCitasMedicoAgenda en legacy-app.js), la tabla "Agenda del
   día" arma una franja horaria de 7:00 a 18:00 cada 30 min para ESE médico
   en vez de la lista fija de 07:00-10:40/20min que había antes (sin
   relación real con qué médico estuviera elegido). Genérico para cualquier
   `medicoId` — no hay que autorar una agenda a mano por médico nuevo. */

const AGENDA_START_HOUR = 7;
const AGENDA_END_HOUR = 18;
const AGENDA_STEP_MIN = 30;

const AGENDA_PATIENT_POOL = [
  'Pedro Arango Ruiz', 'Camila Torres Mesa', 'Roberto Cárdenas', 'Ana Lucía Vargas',
  'Mario Pineda León', 'Gloria Estela Ríos', 'Diana Marcela Ortiz', 'Felipe Andrés Suárez',
  'Natalia Beltrán Rojas', 'Jorge Iván Castaño', 'Sandra Milena Duarte', 'Camilo Restrepo Vélez',
  'Paola Andrea Muñoz', 'Iván Darío Salazar', 'Lorena Patricia Gómez', 'Andrés Felipe Nieto',
];
const AGENDA_EPS_POOL = ['Sura', 'Nueva EPS', 'Compensar', 'Colsanitas', 'Famisanar'];
const AGENDA_TIPO_POOL = ['Consulta general', 'Control', 'Primera vez', 'Control crónico', 'Seguimiento'];

// Hash de string → semilla + PRNG mulberry32: mismo `medicoId` siempre arma
// la misma agenda (no "baraja" de nuevo en cada render ni al re-elegir el
// mismo médico), sin necesidad de guardar la agenda generada en ningún lado.
function seedFromString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(rng, pool) {
  return pool[Math.floor(rng() * pool.length)];
}
function randomTelefono(rng) {
  const prefix = 300 + Math.floor(rng() * 20);
  const rest = String(1000000 + Math.floor(rng() * 9000000));
  return `${prefix} ${rest.slice(0, 3)} ${rest.slice(3)}`;
}
function randomFechaSolicitud(rng) {
  const day = 1 + Math.floor(rng() * 28);
  const month = 1 + Math.floor(rng() * 7);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/2025`;
}
function randomLlegada(rng, hora) {
  const [h, m] = hora.split(':').map(Number);
  const totalMin = h * 60 + m - (3 + Math.floor(rng() * 8));
  return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
}

export function generarAgendaMedico(medicoId) {
  const rng = mulberry32(seedFromString(medicoId));
  const slots = ((AGENDA_END_HOUR - AGENDA_START_HOUR) * 60) / AGENDA_STEP_MIN;
  const filas = [];
  for (let i = 0; i < slots; i++) {
    const totalMin = i * AGENDA_STEP_MIN;
    const h = AGENDA_START_HOUR + Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    const roll = rng();
    let estado;
    if (roll < 0.4) estado = 'ocupado';
    else if (roll < 0.5) estado = 'expirado';
    else if (roll < 0.58) estado = 'bloqueado';
    else estado = 'disponible';

    if (estado === 'ocupado' || estado === 'expirado') {
      filas.push({
        hora,
        dur: '30min',
        paciente: pick(rng, AGENDA_PATIENT_POOL),
        tipo: pick(rng, AGENDA_TIPO_POOL),
        eps: pick(rng, AGENDA_EPS_POOL),
        valor: '$ 28.500',
        tel: randomTelefono(rng),
        fsol: randomFechaSolicitud(rng),
        estado,
        ...(estado === 'ocupado' && rng() < 0.35 ? { llegada: randomLlegada(rng, hora) } : {}),
      });
    } else {
      filas.push({ hora, dur: '30min', paciente: null, tipo: null, estado });
    }
  }
  return filas;
}
