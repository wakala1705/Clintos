// Datos de ejemplo para "Programación de turnos" (ver
// src/Components/GestionTurnos/ProgramacionTurnos/) — programación semanal
// de turnos de enfermería. Ficticio, igual que el resto de los mocks del
// proyecto (ver mockPanelGeneralData.js/mockTareasData.js, GestionEnfermeria).
// Se mudó acá desde src/hooks/GestionEnfermeria/mockTurnosData.js junto con
// la pantalla (encargo: "pasemos la pantalla de turnos a la ruta de
// planificación/programación").

import { AREAS_SERVICIO, AREA_SERVICIO_LABEL, AREAS_SERVICIO_PROGRAMABLES } from './mockTurnosData';
import { ENFERMERAS_INICIALES } from './mockEnfermerasData';

// Área o servicio de Programación de turnos: la misma taxonomía que
// Enfermeras (ver mockTurnosData.js AREAS_SERVICIO) — encargo "Programación
// de turnos esté 1:1 con las enfermeras registradas" implica que el filtro
// de área acá tiene que ofrecer exactamente las mismas áreas en las que esas
// enfermeras están registradas, no una lista propia divergente.
export const AREAS_TURNOS = AREAS_SERVICIO;
// Lookup value->label (ej. mostrar "Área o servicio: UCI" a partir del
// `area` de una enfermera) — se deriva de AREAS_TURNOS en vez de duplicar
// los mismos pares a mano.
export const AREA_TURNO_LABEL = AREA_SERVICIO_LABEL;

// Subconjunto sin "Todas las áreas" — usado donde el área es un dato
// obligatorio de una entidad nueva (crear una programación, encargo sección
// 2: "No utilizar 'Todas las áreas' como valor para crear una
// programación"), a diferencia del filtro de header/calendario donde
// "Todas las áreas" sí es un valor válido.
export const AREAS_TURNOS_PROGRAMABLES = AREAS_SERVICIO_PROGRAMABLES;

// Etiquetas de columna del calendario semanal. Son posicionales (día 1 de la
// semana visible = "LUN", sin importar a qué día calendario real caiga esa
// columna) — la grilla es una plantilla "semana laboral tipo", no un
// calendario perpetuo, así que no hace falta resolver el nombre real del día
// de la semana a partir de la fecha.
export const DIAS_SEMANA = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

// Nombre completo del día (posicional, mismo criterio que DIAS_SEMANA) — solo
// para textos largos tipo "Lunes 18 de agosto" en los popovers/hover de
// celda (ver TurnosCalendar.jsx), la grilla en sí sigue usando DIAS_SEMANA.
const DIAS_SEMANA_LARGO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES_LARGO = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// "Lunes 18 de agosto" a partir de un día de `diasDeSemana()` + su índice de
// columna (0=LUN) — reutilizado por los hover/popover de celda y por los
// selects de fecha de los modales de turno.
export function diaLargoLabel(day, dayIdx) {
  return `${DIAS_SEMANA_LARGO[dayIdx]} ${day.dayNum} de ${MESES_LARGO[day.monthIdx]}`;
}

// Semana por defecto al entrar a la pantalla: el lunes de la semana que
// contiene la fecha real del sistema (encargo explícito: "ajustar los
// calendarios a las fechas reales actuales" — antes era una fecha fija,
// 18 Ago 2026, mismo criterio que tenían HOY en mockPanelGeneralData.js y
// viewDate en asignacion-citas/page.jsx, también actualizados). Reutiliza
// primerLunesVisibleDelMes (definida más abajo, misma cuenta lunes-de-la-
// semana-que-contiene-esta-fecha sin importar si la fecha es un día 1 de
// mes o cualquier otro día) en vez de duplicar esa aritmética acá. El
// horario se descarta (solo importa año/mes/día) para no arrastrar la hora
// exacta de carga de la página a comparaciones de fecha (periodKeyDeSemana,
// rangoSemanaLabel, etc.).
const HOY_SIN_HORA = (() => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
})();
export const SEMANA_ANCLA = primerLunesVisibleDelMes(HOY_SIN_HORA);

export function addDias(date, dias) {
  const d = new Date(date);
  d.setDate(d.getDate() + dias);
  return d;
}

// 7 columnas a partir de `weekStart` (lunes visible), emparejadas
// posicionalmente con DIAS_SEMANA. `isToday` compara contra la fecha real del
// sistema (a diferencia de la etiqueta de día, la marca de "hoy" sí debe ser
// real) para resaltar la columna correspondiente en el encabezado.
export function diasDeSemana(weekStart) {
  const hoy = new Date();
  return DIAS_SEMANA.map((label, i) => {
    const date = addDias(weekStart, i);
    return {
      label,
      dayNum: date.getDate(),
      monthLabel: MESES[date.getMonth()],
      monthIdx: date.getMonth(),
      isToday: date.toDateString() === hoy.toDateString(),
    };
  });
}

// "18 – 24 Ago 2026" / "11 – 17 Ago 2026" (cruce de mes: "28 Ago – 3 Sep
// 2026") — mismo formato que weekRangeLabel de ProgramarCita (agendaMockData.js),
// reimplementado acá en vez de importado: cada feature es dueña de sus
// propios helpers de fecha (ver AGENTS.md).
export function rangoSemanaLabel(weekStart) {
  const fin = addDias(weekStart, 6);
  const mesInicio = MESES[weekStart.getMonth()];
  const mesFin = MESES[fin.getMonth()];
  const inicio = mesInicio === mesFin
    ? `${weekStart.getDate()}`
    : `${weekStart.getDate()} ${mesInicio}`;
  return `${inicio} – ${fin.getDate()} ${mesFin} ${fin.getFullYear()}`;
}

// "María González" -> "MG" (primera letra de nombre + primera letra de
// apellido) — mismo criterio de avatar que ya usaban las 8 enfermeras a
// mano de acá, ahora derivado para poder cubrir a las 42 sin transcribirlas.
function inicialesDe(nombre) {
  const partes = nombre.trim().split(/\s+/);
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// 1:1 con el personal registrado en Enfermeras (ver mockEnfermerasData.js,
// encargo "Programación de turnos esté 1:1 con las enfermeras registradas")
// — antes esta pantalla tenía sus propias 8 enfermeras hardcodeadas, sin
// relación con las 42 de la tabla de Enfermeras.
export const NURSES = ENFERMERAS_INICIALES.map((e) => ({
  id: e.id, nombre: e.nombre, cargo: e.cargo, iniciales: inicialesDe(e.nombre), area: e.area,
}));

export const TIPO_TURNO_META = {
  manana: { label: 'Mañana', horario: '06:00 – 12:00' },
  tarde: { label: 'Tarde', horario: '12:00 – 18:00' },
  noche: { label: 'Noche', horario: '18:00 – 00:00' },
  madrugada: { label: 'Madrugada', horario: '00:00 – 06:00' },
};

// El horario queda "horneado" en cada celda (en vez de derivarse siempre de
// TIPO_TURNO_META[tipo] al vuelo) para poder editarlo por turno individual
// desde EditarTurnoModal (hora de inicio/fin custom) sin afectar el default
// del tipo — TIPO_TURNO_META sigue siendo la fuente de los valores por
// defecto al crear un turno nuevo o al cambiar de tipo en el formulario.
const T = (tipo, extra) => ({
  estado: 'turno', tipo, horario: TIPO_TURNO_META[tipo].horario, ...extra,
});
const D = { estado: 'descanso' };
const V = { estado: 'vacio' };

// Matriz enfermera x día (7 columnas, ver DIAS_SEMANA), generada para las 42
// enfermeras de NURSES (ver arriba) — patrón 5x2 realista (2 días de
// descanso consecutivos por enfermera) derivado del índice de cada una
// (nunca Math.random(), mismo criterio de estabilidad que
// mockEnfermerasData.js): el tipo de turno base rota entre
// mañana/tarde/noche/madrugada cada 4 enfermeras y el par de días de
// descanso rota entre las 7 columnas, para que la grilla se vea variada sin
// tener que transcribir 42 semanas a mano.
function patronSemana(i) {
  const tipo = ['manana', 'tarde', 'noche', 'madrugada'][i % 4];
  const descansoIni = i % 7;
  return DIAS_SEMANA.map((_, d) => {
    const enDescanso = d === descansoIni || d === (descansoIni + 1) % 7;
    return enDescanso ? D : T(tipo);
  });
}

export const SCHEDULE = Object.fromEntries(NURSES.map((n, i) => [n.id, patronSemana(i)]));

// Encima del patrón base, se fuerzan a mano 2 celdas "sin asignar" y 1
// "conflicto" (doble asignación que se solapa) para poder ejercitar los 4
// estados de celda que pide el diseño (turno/descanso/vacío/conflicto) sin
// depender de que el patrón generado los produzca por casualidad —
// `conflictoOtro` describe la OTRA asignación con la que se solapa
// (mostrada en el popover de conflicto, ver TurnoCellPopover.jsx). Busca el
// primer día "turno" desde `dayIdxPreferido` (en vez de un índice de día
// fijo) porque el día de descanso de cada enfermera rota con su índice —
// un día fijo puede caer justo en su descanso y no tener nada que sobrescribir.
function primerDiaTurno(nurseId, dayIdxPreferido) {
  const celdas = SCHEDULE[nurseId];
  for (let offset = 0; offset < 7; offset += 1) {
    const d = (dayIdxPreferido + offset) % 7;
    if (celdas[d].estado === 'turno') return d;
  }
  return null;
}

[[9, 2], [24, 1]].forEach(([nurseIdx, dayIdxPreferido]) => {
  const nurseId = NURSES[nurseIdx]?.id;
  if (!nurseId) return;
  const d = primerDiaTurno(nurseId, dayIdxPreferido);
  if (d !== null) SCHEDULE[nurseId][d] = V;
});

const conflictoNurseId = NURSES[7]?.id;
if (conflictoNurseId) {
  const d = primerDiaTurno(conflictoNurseId, 2);
  if (d !== null) {
    SCHEDULE[conflictoNurseId][d] = {
      ...SCHEDULE[conflictoNurseId][d],
      conflicto: true,
      conflictoNota: 'Existe una superposición con otra asignación.',
      conflictoOtro: { horario: '14:00 – 22:00', area: 'uci' },
    };
  }
}

// ---------- Modelo de "programación" (entidad con período/área/personal
// propio) — ver docs/superpowers/specs/2026-08-28-programacion-turnos-flujo-design.md.
// Reemplaza el criterio anterior de un único SCHEDULE/NURSES global fijo:
// ProgramacionTurnos.jsx pasa a guardar un mapa de programaciones keyed por
// período (`periodKeyDeSemana`/`periodKeyDeMes`), resuelto por
// `resolverProgramacion` según la semana visible.

function pad2(n) {
  return String(n).padStart(2, '0');
}

// "week:2026-08-18" — lunes ISO de la semana (weekStart YA es siempre lunes,
// ver diasDeSemana/SEMANA_ANCLA arriba).
export function periodKeyDeSemana(weekStart) {
  return `week:${weekStart.getFullYear()}-${pad2(weekStart.getMonth() + 1)}-${pad2(weekStart.getDate())}`;
}

// "month:2026-09" — admite tanto un weekStart (para resolver a qué mes
// pertenece la semana visible) como un monthStart de día 1 (para construir
// la clave de una programación de tipo mes en el wizard): en ambos casos
// solo importan año+mes.
export function periodKeyDeMes(date) {
  return `month:${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

// "Septiembre 2026" — paso 1 del wizard cuando tipo==='mes' (encargo,
// ejemplo literal "[ Septiembre 2026 ]").
export function mesLabel(date) {
  const m = MESES_LARGO[date.getMonth()];
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${date.getFullYear()}`;
}

// Navegación prev/siguiente mes del paso 1 del wizard — siempre normaliza al
// día 1 (monthStart nunca representa "un día" real, solo el mes).
export function addMeses(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

// Lunes de la semana que contiene la fecha dada (puede caer en el mes/año
// anterior) — pese al nombre (pensada originalmente solo para decidir a qué
// `weekStart` saltar el calendario al crear una programación de tipo mes,
// ya que la grilla sigue siendo semanal, encargo sección 9), la cuenta es
// genérica para cualquier fecha: también la reutiliza SEMANA_ANCLA arriba
// para anclar la semana por defecto a la fecha real del sistema.
export function primerLunesVisibleDelMes(monthStart) {
  const dow = monthStart.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDias(monthStart, diff);
}

// Resuelve qué programación aplica a la semana visible: match exacto de
// semana primero; si no existe, cae a una programación de tipo mes que
// contenga esa semana (mismo criterio de simplificación que ya tenía la
// navegación de semana antes de este cambio: no se modelan 4-5 semanas de
// datos reales distintos para un período mensual). Devuelve `null` si
// ninguna de las dos existe — dispara el estado vacío en ProgramacionTurnos.jsx.
export function resolverProgramacion(programaciones, weekStart) {
  const weekKey = periodKeyDeSemana(weekStart);
  if (programaciones[weekKey]) return { periodKey: weekKey, programacion: programaciones[weekKey] };
  const monthKey = periodKeyDeMes(weekStart);
  if (programaciones[monthKey]) return { periodKey: monthKey, programacion: programaciones[monthKey] };
  return null;
}

// Semilla inicial: solo la semana ancla (la que ya tenía datos completos)
// viene precargada, ya publicada, con las 42 NURSES/SCHEDULE de arriba —
// cualquier otro período arranca sin entrada (dispara el estado vacío de la
// sección 1 del encargo).
export const PROGRAMACIONES_SEED = {
  [periodKeyDeSemana(SEMANA_ANCLA)]: {
    id: 'prog-semana-ancla',
    tipo: 'semana',
    periodKey: periodKeyDeSemana(SEMANA_ANCLA),
    periodLabel: rangoSemanaLabel(SEMANA_ANCLA),
    area: 'todas',
    nurseIds: NURSES.map((n) => n.id),
    estado: 'publicada',
    schedule: SCHEDULE,
  },
};
