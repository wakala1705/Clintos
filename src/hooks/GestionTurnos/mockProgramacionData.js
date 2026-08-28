// Datos de ejemplo para "Programación de turnos" (ver
// src/Components/GestionTurnos/ProgramacionTurnos/) — programación semanal
// de turnos de enfermería. Ficticio, igual que el resto de los mocks del
// proyecto (ver mockPanelGeneralData.js/mockTareasData.js, GestionEnfermeria).
// Se mudó acá desde src/hooks/GestionEnfermeria/mockTurnosData.js junto con
// la pantalla (encargo: "pasemos la pantalla de turnos a la ruta de
// planificación/programación").

// Área o servicio propio de Programación de turnos (no reutiliza
// AREAS_OPERATIVAS de mockPanelGeneralData: acá el recorte es por
// servicio/unidad de internación real, no por sector norte/sur — encargo
// explícito, ver AreaSelector `label` en ProgramacionTurnos.jsx).
export const AREAS_TURNOS = [
  { value: 'todas', label: 'Todas las áreas' },
  { value: 'urgencias', label: 'Urgencias' },
  { value: 'uci', label: 'UCI' },
  { value: 'hosp-general-p4-t1', label: 'Hospitalización General P4 T1' },
  { value: 'hosp-piso2-t1', label: 'Hospitalización Piso 2 T1' },
  { value: 'hosp-piso3-t1', label: 'Hospitalización Piso 3 T1' },
  { value: 'hosp-piso4-t1', label: 'Hospitalización Piso 4 T1' },
  { value: 'hosp-piso4-t2', label: 'Hospitalización Piso 4 T2' },
  { value: 'hosp-piso5-t2', label: 'Hospitalización Piso 5 T2' },
];
// Lookup value->label (ej. mostrar "Área o servicio: UCI" a partir del
// `area` de una enfermera) — se deriva de AREAS_TURNOS en vez de duplicar
// los mismos pares a mano.
export const AREA_TURNO_LABEL = Object.fromEntries(AREAS_TURNOS.map((a) => [a.value, a.label]));

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

// Semana por defecto al entrar a la pantalla: Lun 18 – Dom 24 Ago 2026 (fija,
// no depende de la fecha real del sistema) — mismo criterio que HOY en
// mockPanelGeneralData.js.
export const SEMANA_ANCLA = new Date(2026, 7, 18);

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

export const NURSES = [
  { id: 'n1', nombre: 'María González', cargo: 'Enfermera profesional', iniciales: 'MG', area: 'hosp-piso4-t1' },
  { id: 'n2', nombre: 'Ana Martínez', cargo: 'Enfermera profesional', iniciales: 'AM', area: 'hosp-piso4-t1' },
  { id: 'n3', nombre: 'Carlos Pérez', cargo: 'Enfermero profesional', iniciales: 'CP', area: 'uci' },
  { id: 'n4', nombre: 'Laura Rodríguez', cargo: 'Enfermera profesional', iniciales: 'LR', area: 'hosp-piso2-t1' },
  { id: 'n5', nombre: 'Sofía Torres', cargo: 'Enfermera profesional', iniciales: 'ST', area: 'hosp-piso2-t1' },
  { id: 'n6', nombre: 'Daniel Ramírez', cargo: 'Enfermero profesional', iniciales: 'DR', area: 'urgencias' },
  { id: 'n7', nombre: 'Natalia Herrera', cargo: 'Enfermera profesional', iniciales: 'NH', area: 'uci' },
  { id: 'n8', nombre: 'Julián Castro', cargo: 'Enfermero profesional', iniciales: 'JC', area: 'urgencias' },
];

export const TIPO_TURNO_META = {
  manana: { label: 'Mañana', horario: '06:00 – 14:00' },
  tarde: { label: 'Tarde', horario: '14:00 – 22:00' },
  noche: { label: 'Noche', horario: '22:00 – 06:00' },
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

// Matriz enfermera x día (7 columnas, ver DIAS_SEMANA) — 2 días de descanso
// por enfermera (patrón 5x2 realista), 2 celdas sin asignar (Laura miércoles,
// Natalia martes) y 1 conflicto (Julián miércoles: doble asignación de
// mañana que se solapa con otra franja) para poder ejercitar los 4 estados
// de celda que pide el diseño (turno/descanso/vacío/conflicto) sin tener que
// inventar una semana completa distinta por caso. `conflictoOtro` describe
// la OTRA asignación con la que se solapa (mostrada en el popover de
// conflicto, ver TurnoCellPopover.jsx) — Julián también quedó de tarde ese
// mismo miércoles en otra área, de ahí el solapamiento.
export const SCHEDULE = {
  n1: [T('manana'), T('manana'), T('manana'), T('manana'), T('manana'), D, D],
  n2: [T('tarde'), T('tarde'), T('tarde'), T('tarde'), D, D, T('manana')],
  n3: [T('noche'), T('noche'), T('noche'), D, D, T('noche'), T('noche')],
  n4: [T('manana'), T('tarde'), V, T('manana'), T('tarde'), D, D],
  n5: [D, T('manana'), T('manana'), T('manana'), T('manana'), T('manana'), D],
  n6: [T('tarde'), T('tarde'), T('tarde'), T('tarde'), T('tarde'), D, D],
  n7: [T('noche'), V, T('noche'), T('noche'), D, D, T('noche')],
  n8: [
    T('manana'), T('manana'),
    T('manana', {
      conflicto: true,
      conflictoNota: 'Existe una superposición con otra asignación.',
      conflictoOtro: { horario: '14:00 – 22:00', area: 'uci' },
    }),
    T('tarde'), T('tarde'), D, D,
  ],
};

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

// Lunes de la semana que contiene el día 1 del mes elegido (puede caer en el
// mes anterior) — usado solo para decidir a qué `weekStart` saltar el
// calendario principal al crear una programación de tipo mes, ya que la
// grilla sigue siendo semanal (encargo sección 9: la vista mensual no es el
// foco de edición de V1).
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

// Semilla inicial: solo la semana 18–24 Ago 2026 (la que ya tenía datos
// completos) viene precargada, ya publicada, con las 8 NURSES/SCHEDULE de
// arriba — cualquier otro período arranca sin entrada (dispara el estado
// vacío de la sección 1 del encargo).
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
