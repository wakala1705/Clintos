// Datos de ejemplo para "Centro de Alertas" (ver
// src/Components/GestionEnfermeria/AlertasEnfermeria/) — accesible desde el
// ítem "Centro de alertas" del sidebar interno y desde "Ver todas las
// alertas" en AlertsPanel.jsx (Panel general).
//
// IMPORTANTE — relación 1:1 con los pacientes reales del piso (encargo
// explícito): toda alerta con paciente referencia a uno de los 14 pacientes
// de PACIENTES_PISO (mockPanelGeneralData.js) — mismo `id`/`edad`/
// `diagnóstico`, nunca datos reinventados a mano (eso fue justo el bug que
// motivó esta reconstrucción: nombres reciclados con cama/edad/diagnóstico
// distintos a la persona real, y un "Piso 2" con pacientes que no existen en
// la tabla). `pacienteDe(cama)` los toma directo de PACIENTES_PISO — a
// diferencia de mockTareasData.js (que copia los valores a mano, incluso
// documentando la intención de que coincidan), acá se importa la lista real
// para que sea estructuralmente imposible que la cama/edad/diagnóstico de
// una alerta se desincronice de la tabla del Panel General. `area` usa
// sectorDeCama() (mismos sectores norte/104 y sur/105-107 que Tareas de
// enfermería) en vez de un "piso" inventado — este mock es UN solo piso.
// `enfermeraAsignada` reutiliza el mismo roster que TareasEnfermeria.jsx
// (Laura Gómez/Carlos Pérez), asignada por sector.
import { AREAS_OPERATIVAS, PACIENTES_PISO, sectorDeCama } from './mockPanelGeneralData';

const NURSE_POR_SECTOR = { norte: 'Laura Gómez', sur: 'Carlos Pérez' };

function pacienteDe(cama) {
  const p = PACIENTES_PISO.find((x) => x.cama === cama);
  return {
    cama,
    area: sectorDeCama(cama),
    paciente: p.paciente,
    pacienteId: p.id,
    edad: p.edad,
    sexo: p.genero === 'femenino' ? 'Femenino' : 'Masculino',
    diagnostico: p.diagnostico,
    enfermeraAsignada: NURSE_POR_SECTOR[sectorDeCama(cama)],
  };
}

// No toda alerta tiene paciente (habitación pendiente de limpieza post
// egreso) — no hay forma de darle un número de cama real: PACIENTES_PISO
// documenta las 14 camas OCUPADAS, y las 4 libres del piso (18 totales, ver
// CAMAS_POR_AREA en mockPanelGeneralData.js) no tienen número modelado. En
// vez de inventar uno que después choque con una cama real (o un texto tipo
// "Cama Libre" que se lee como si "Libre" fuera un número más), `cama`
// queda `null` — AlertTable/AlertDetailDrawer lo traducen a "Sin cama
// asignada" en vez de anteponer el prefijo "Cama ".
function camaLibre(area) {
  return {
    cama: null, area, paciente: null, pacienteId: null, edad: null, sexo: null, diagnostico: null, enfermeraAsignada: NURSE_POR_SECTOR[area],
  };
}

// "Ahora" fijo en 14:32 (mismo 14 Ago 2026 que el resto del módulo) — mismo
// criterio que AHORA_LABEL en mockTareasData.js: nunca Date.now() en vivo,
// así "Retraso"/"hace X min" quedan como texto ya calculado, no una cuenta
// regresiva real.
export const AHORA_LABEL = '14:32';
// Todas las alertas del mock ocurren el mismo día ficticio (14 Ago 2026,
// mismo "hoy" que mockPanelGeneralData.js/mockTareasData.js) — no hay un
// campo de fecha por alerta porque no hace falta modelar días distintos
// para esta pantalla; el filtro "Rango de fechas" compara este valor único
// contra desde/hasta (ver AlertListPanel.jsx).
export const FECHA_ALERTAS = '2026-08-14';

// `estado` de una alerta es un bucket único (nunca se derivan "vencidas"
// filtrando pendientes con retraso, a diferencia de Tareas): pendiente,
// vencida, resuelta y pospuesta son 4 grupos que no se solapan, así los
// conteos de las pestañas (ver TABS/matchesTab en AlertListPanel.jsx,
// siempre derivados de esta lista, nunca hardcodeados) sumen limpio: Todas =
// pendiente+vencida+pospuesta (resuelta queda fuera de "Todas", es el
// historial). Sin filtro "Estado" en la barra de filtros (encargo
// explícito): sería 100% redundante con esos mismos tabs.
export const PRIORIDADES_ALERTA = [
  { value: 'critica', label: 'Crítica' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
];

// Mismos 2 sectores (y mismas labels) que AREAS_OPERATIVAS en
// mockPanelGeneralData.js, sin la opción "Todo el área" (acá "Área" ya
// arranca sin filtrar, como el resto de los filtros de la barra) — una sola
// fuente de verdad para qué sectores existen en este piso.
export const AREAS_ALERTA = AREAS_OPERATIVAS.filter((a) => a.value !== 'todo');

// Catálogo de tipos de alerta operativa/clínica (encargo explícito: nunca
// alertas genéricas tipo "Error del sistema"). `accion` es la acción
// primaria del drawer (sección 11 del encargo) — null en los tipos que ya
// llegan resueltos en el mock (medicamento-tarde/signos-vitales-registrados,
// no tiene sentido ofrecer una acción de resolución sobre algo ya resuelto,
// ver regla "las alertas resueltas no muestran acciones de resolución").
export const TIPOS_ALERTA = [
  { value: 'medicamento-retrasado', label: 'Medicamento retrasado', icon: 'LuPill', accion: { label: 'Administrar medicamento', icon: 'LuSyringe' } },
  { value: 'dosis-pendiente', label: 'Dosis pendiente', icon: 'LuPill', accion: { label: 'Administrar medicamento', icon: 'LuSyringe' } },
  { value: 'signos-vitales-pendientes', label: 'Signos vitales pendientes', icon: 'LuActivity', accion: { label: 'Registrar signos vitales', icon: 'LuActivity' } },
  { value: 'orden-medica', label: 'Orden médica por revisar', icon: 'LuClipboardList', accion: { label: 'Revisar orden', icon: 'LuClipboardCheck' } },
  { value: 'limpieza', label: 'Habitación pendiente de limpieza', icon: 'LuSparkles', accion: { label: 'Confirmar limpieza', icon: 'LuSparkles' } },
  { value: 'traslado', label: 'Traslado pendiente', icon: 'LuArrowRightLeft', accion: { label: 'Confirmar traslado', icon: 'LuArrowRightLeft' } },
  { value: 'tarea-paciente', label: 'Paciente con tarea pendiente', icon: 'LuListChecks', accion: { label: 'Completar tarea', icon: 'LuCircleCheck' } },
  { value: 'alerta-clinica', label: 'Alerta clínica crítica', icon: 'LuOctagonAlert', accion: { label: 'Atender alerta clínica', icon: 'LuStethoscope' } },
  { value: 'medicamento-tarde', label: 'Medicamento administrado tarde', icon: 'LuPill', accion: null },
  { value: 'signos-vitales-registrados', label: 'Signos vitales registrados', icon: 'LuActivity', accion: null },
];
export const TIPO_ALERTA_CONFIG = Object.fromEntries(TIPOS_ALERTA.map((t) => [t.value, t]));

export const RESPONSABLES_ESCALAMIENTO = [
  { value: 'supervisora-turno', label: 'Supervisora de turno · Laura Méndez' },
  { value: 'medico-guardia', label: 'Médico de guardia · Dr. Esteban Rojas' },
  { value: 'jefatura-enfermeria', label: 'Jefatura de enfermería' },
  { value: 'farmacia', label: 'Farmacia central' },
  { value: 'mantenimiento', label: 'Mantenimiento / Servicios generales' },
];

function historial(...entradas) {
  return entradas.map(([hora, texto]) => ({ hora, texto }));
}

// ---------- Alertas activas (Todas = 12: 9 pendiente + 2 vencida + 1 pospuesta) ----------
// Solo los pacientes con estadoMedicacion 'pendiente'/'retrasada' en
// PACIENTES_PISO reciben una alerta de tipo medicamento/dosis (María
// González, Patricia López, Laura Sánchez, Elena Vargas) — así el Panel
// General y el Centro de Alertas nunca se contradicen (nadie aparece "Al
// día" en una tabla y con una dosis pendiente en la otra). El resto de los
// tipos (orden médica, signos vitales, traslado, tarea, alerta clínica) no
// dependen de ese campo, así que pueden tocar a cualquier paciente.
export const ALERTAS_ACTIVAS = [
  {
    id: 'ALT-000124', tipo: 'medicamento-retrasado',
    titulo: 'Medicamento retrasado', detalle: 'Ceftriaxona 1 g IV',
    ...pacienteDe('101-A'), // María González — Neumonía adquirida en comunidad
    prioridad: 'critica', estado: 'pendiente',
    hace: 'Hace 12 min', programadoPara: '14:00', retrasoMin: 32,
    historial: historial(['14:32', 'Alerta generada'], ['14:40', 'Revisada por Laura Gómez'], ['14:45', 'Pospuesta 15 minutos'], ['15:00', 'Pendiente nuevamente']),
    notas: [],
  },
  {
    id: 'ALT-000125', tipo: 'dosis-pendiente',
    titulo: 'Dosis pendiente', detalle: 'Prednisona 40 mg VO',
    ...pacienteDe('103-A'), // Patricia López — EPOC exacerbado (estancia prolongada, 13 días)
    prioridad: 'alta', estado: 'pendiente',
    hace: 'Hace 18 min', programadoPara: '14:00', retrasoMin: null,
    historial: historial(['14:14', 'Alerta generada']),
    notas: [],
  },
  {
    id: 'ALT-000126', tipo: 'signos-vitales-pendientes',
    titulo: 'Signos vitales pendientes', detalle: 'Control cada 4 horas',
    ...pacienteDe('102-A'), // Ana Martínez — Insuficiencia cardíaca
    prioridad: 'alta', estado: 'pendiente',
    hace: 'Hace 25 min', programadoPara: '13:30', retrasoMin: null,
    historial: historial(['14:07', 'Alerta generada']),
    notas: [],
  },
  {
    id: 'ALT-000127', tipo: 'orden-medica',
    titulo: 'Orden médica por revisar', detalle: 'Nueva orden de laboratorio',
    ...pacienteDe('102-B'), // Jorge Ramírez — Colecistitis aguda (medicación al día)
    prioridad: 'media', estado: 'pendiente',
    hace: 'Hace 28 min', programadoPara: null, retrasoMin: null,
    historial: historial(['14:04', 'Alerta generada']),
    notas: [],
  },
  {
    id: 'ALT-000128', tipo: 'limpieza',
    titulo: 'Habitación pendiente de limpieza', detalle: 'Post egreso',
    ...camaLibre('norte'),
    prioridad: 'media', estado: 'pendiente',
    hace: 'Hace 45 min', programadoPara: null, retrasoMin: null,
    historial: historial(['13:47', 'Alerta generada']),
    notas: [],
  },
  {
    id: 'ALT-000129', tipo: 'traslado',
    titulo: 'Traslado pendiente', detalle: 'A: Urgencias',
    ...pacienteDe('104-B'), // Andrés Castro — Hipertensión arterial (medicación al día)
    prioridad: 'baja', estado: 'pendiente',
    hace: 'Hace 50 min', programadoPara: null, retrasoMin: null,
    historial: historial(['13:42', 'Alerta generada']),
    notas: [],
  },
  {
    id: 'ALT-000130', tipo: 'alerta-clinica',
    titulo: 'Alerta clínica crítica', detalle: 'Saturación de oxígeno 88%',
    ...pacienteDe('107-A'), // Carmen Ruiz — Insuficiencia renal (estancia prolongada, 20 días)
    prioridad: 'critica', estado: 'pendiente',
    hace: 'Hace 6 min', programadoPara: null, retrasoMin: null,
    historial: historial(['14:26', 'Alerta generada'], ['14:28', 'Revisada por Carlos Pérez']),
    notas: [],
  },
  {
    id: 'ALT-000131', tipo: 'dosis-pendiente',
    titulo: 'Dosis pendiente', detalle: 'Claritromicina 500 mg VO',
    ...pacienteDe('106-A'), // Laura Sánchez — Neumonía
    prioridad: 'alta', estado: 'pendiente',
    hace: 'Hace 35 min', programadoPara: '14:10', retrasoMin: null,
    historial: historial(['13:57', 'Alerta generada']),
    notas: [],
  },
  {
    id: 'ALT-000132', tipo: 'tarea-paciente',
    titulo: 'Paciente con tarea pendiente', detalle: 'Cambio de posición programado',
    ...pacienteDe('107-B'), // Felipe Gómez — Postoperatorio de hernia (medicación al día)
    prioridad: 'baja', estado: 'pendiente',
    hace: 'Hace 40 min', programadoPara: null, retrasoMin: null,
    historial: historial(['13:52', 'Alerta generada']),
    notas: [],
  },
  {
    id: 'ALT-000133', tipo: 'medicamento-retrasado',
    titulo: 'Medicamento retrasado', detalle: 'Ácido acetilsalicílico 100 mg VO',
    ...pacienteDe('105-A'), // Elena Vargas — ACV (estancia prolongada, 17 días; ya figura "Retrasada" en el Panel General)
    prioridad: 'critica', estado: 'vencida',
    hace: 'Hace 1 h 12 min', programadoPara: '13:20', retrasoMin: 72,
    historial: historial(['13:20', 'Alerta generada'], ['13:50', 'Revisada por Carlos Pérez']),
    notas: [{ autor: 'Carlos Pérez', hora: '13:50', texto: 'Lote solicitado a farmacia, en camino.' }],
  },
  {
    id: 'ALT-000134', tipo: 'signos-vitales-pendientes',
    titulo: 'Signos vitales pendientes', detalle: 'Control post-operatorio',
    ...pacienteDe('105-B'), // Ricardo Moreno — Fractura de cadera (medicación al día)
    prioridad: 'alta', estado: 'vencida',
    hace: 'Hace 55 min', programadoPara: '13:35', retrasoMin: 45,
    historial: historial(['13:37', 'Alerta generada']),
    notas: [],
  },
  {
    id: 'ALT-000135', tipo: 'orden-medica',
    titulo: 'Orden médica por revisar', detalle: 'Ajuste de esquema analgésico',
    ...pacienteDe('106-B'), // Diego Pérez — Pancreatitis aguda (medicación no aplica)
    prioridad: 'media', estado: 'pospuesta',
    hace: 'Hace 2 h', programadoPara: null, retrasoMin: null,
    pospuestaHasta: '15:00',
    historial: historial(['12:32', 'Alerta generada'], ['12:40', 'Revisada por Carlos Pérez'], ['14:20', 'Pospuesta 40 minutos']),
    notas: [],
  },
];

// ---------- Historial de alertas resueltas (bucket aparte, no cuenta para "Todas") ----------
// Reutiliza varios de los mismos 14 pacientes de arriba — una persona puede
// perfectamente acumular más de un evento en el turno (ej. María González
// tuvo una hipotensión resuelta hace 4h y ahora, aparte, tiene el
// medicamento retrasado de ALT-000124) — y explica por qué algunos pacientes
// con estadoMedicacion 'al día' en el Panel General llegaron a estarlo (su
// alerta de medicación ya se resolvió).
export const ALERTAS_RESUELTAS = [
  {
    id: 'ALT-000110', tipo: 'medicamento-tarde',
    titulo: 'Medicamento administrado tarde', detalle: 'Ciprofloxacina 500 mg VO',
    ...pacienteDe('103-B'), // Luis Hernández — Infección urinaria
    prioridad: 'alta', estado: 'resuelta',
    hace: 'Hace 1 h', programadoPara: '13:15', retrasoMin: 15,
    historial: historial(['13:15', 'Alerta generada'], ['13:30', 'Administrado por Laura Gómez']),
    notas: [],
  },
  {
    id: 'ALT-000111', tipo: 'signos-vitales-registrados',
    titulo: 'Signos vitales registrados', detalle: 'Control de rutina completado',
    ...pacienteDe('104-A'), // Sofía Torres — Postoperatorio abdominal
    prioridad: 'baja', estado: 'resuelta',
    hace: 'Hace 1 h', programadoPara: '13:20', retrasoMin: null,
    historial: historial(['13:20', 'Alerta generada'], ['13:22', 'Completado por Laura Gómez']),
    notas: [],
  },
  {
    id: 'ALT-000112', tipo: 'dosis-pendiente',
    titulo: 'Dosis administrada', detalle: 'Insulina cristalina 6 UI SC',
    ...pacienteDe('101-B'), // Carlos Rodríguez — Diabetes mellitus tipo 2 descompensada
    prioridad: 'alta', estado: 'resuelta',
    hace: 'Hace 2 h', programadoPara: '12:30', retrasoMin: null,
    historial: historial(['12:30', 'Alerta generada'], ['12:34', 'Administrado por Laura Gómez']),
    notas: [],
  },
  {
    id: 'ALT-000113', tipo: 'traslado',
    titulo: 'Traslado completado', detalle: 'A: Imagenología',
    ...pacienteDe('102-A'), // Ana Martínez — Insuficiencia cardíaca
    prioridad: 'baja', estado: 'resuelta',
    hace: 'Hace 2 h', programadoPara: null, retrasoMin: null,
    historial: historial(['12:10', 'Alerta generada'], ['12:25', 'Traslado confirmado por Laura Gómez']),
    notas: [],
  },
  {
    id: 'ALT-000114', tipo: 'limpieza',
    titulo: 'Limpieza confirmada', detalle: 'Habitación lista para ingreso',
    ...camaLibre('sur'),
    prioridad: 'media', estado: 'resuelta',
    hace: 'Hace 3 h', programadoPara: null, retrasoMin: null,
    historial: historial(['11:40', 'Alerta generada'], ['11:58', 'Limpieza confirmada por Servicios generales']),
    notas: [],
  },
  {
    id: 'ALT-000115', tipo: 'orden-medica',
    titulo: 'Orden médica revisada', detalle: 'Esquema de antibióticos ajustado',
    ...pacienteDe('107-B'), // Felipe Gómez — Postoperatorio de hernia
    prioridad: 'media', estado: 'resuelta',
    hace: 'Hace 3 h', programadoPara: null, retrasoMin: null,
    historial: historial(['11:20', 'Alerta generada'], ['11:35', 'Revisada por Carlos Pérez']),
    notas: [],
  },
  {
    id: 'ALT-000116', tipo: 'alerta-clinica',
    titulo: 'Alerta clínica atendida', detalle: 'Episodio de hipotensión resuelto',
    ...pacienteDe('101-A'), // María González — Neumonía adquirida en comunidad
    prioridad: 'critica', estado: 'resuelta',
    hace: 'Hace 4 h', programadoPara: null, retrasoMin: null,
    historial: historial(['10:30', 'Alerta generada'], ['10:36', 'Revisada por médico de guardia'], ['10:50', 'Estabilizada, alerta resuelta']),
    notas: [],
  },
  {
    id: 'ALT-000117', tipo: 'signos-vitales-registrados',
    titulo: 'Signos vitales registrados', detalle: 'Control de rutina completado',
    ...pacienteDe('102-B'), // Jorge Ramírez — Colecistitis aguda
    prioridad: 'baja', estado: 'resuelta',
    hace: 'Hace 4 h', programadoPara: null, retrasoMin: null,
    historial: historial(['10:15', 'Alerta generada'], ['10:18', 'Completado por Laura Gómez']),
    notas: [],
  },
  {
    id: 'ALT-000118', tipo: 'dosis-pendiente',
    titulo: 'Dosis administrada', detalle: 'Paracetamol 1 g VO',
    ...pacienteDe('106-A'), // Laura Sánchez — Neumonía
    prioridad: 'media', estado: 'resuelta',
    hace: 'Hace 5 h', programadoPara: '09:30', retrasoMin: null,
    historial: historial(['09:30', 'Alerta generada'], ['09:36', 'Administrado por Carlos Pérez']),
    notas: [],
  },
  {
    id: 'ALT-000119', tipo: 'medicamento-tarde',
    titulo: 'Medicamento administrado tarde', detalle: 'Omeprazol 40 mg IV',
    ...pacienteDe('106-B'), // Diego Pérez — Pancreatitis aguda
    prioridad: 'alta', estado: 'resuelta',
    hace: 'Hace 5 h', programadoPara: '09:00', retrasoMin: 20,
    historial: historial(['09:00', 'Alerta generada'], ['09:20', 'Administrado por Carlos Pérez']),
    notas: [],
  },
];

export const TODAS_LAS_ALERTAS = [...ALERTAS_ACTIVAS, ...ALERTAS_RESUELTAS];

export function alertaPorId(id) {
  return TODAS_LAS_ALERTAS.find((a) => a.id === id) ?? null;
}

// "hace" siempre viene como texto ya calculado (ver historial() arriba,
// mismo criterio que el resto del mock: nunca Date.now() en vivo) — se
// parsea acá para ordenar por antigüedad en vez de duplicar un campo
// numérico en cada alerta. Compartido por AlertListPanel.jsx (orden "Más
// antiguas"/"Mayor tiempo pendiente") y alertasUrgentes() abajo (preview del
// dashboard) — una sola función, no una copia por consumidor.
export function minutosDesdeHace(hace) {
  const horas = /(\d+)\s*h/.exec(hace);
  const minutos = /(\d+)\s*min/.exec(hace);
  return (horas ? Number(horas[1]) * 60 : 0) + (minutos ? Number(minutos[1]) : 0);
}

const RANGO_PRIORIDAD = { critica: 0, alta: 1, media: 2, baja: 3 };
const RANGO_ESTADO_URGENCIA = { vencida: 0, pendiente: 1, pospuesta: 2 };

// Preview de "más urgentes" para AlertsPanel.jsx (Panel general) — mismas 12
// alertas activas que "Todas" en el Centro de Alertas (relación 1:1: cada
// fila que se muestra ahí es una de estas alertas reales, nunca texto
// aparte inventado para el dashboard), pero acotado a las `n` más urgentes
// en vez de listarlas todas — un widget lateral de dashboard es para un
// vistazo rápido, no para gestionar; el total real sigue siendo
// ALERTAS_ACTIVAS.length, mostrado en el badge. Orden: prioridad primero,
// vencida antes que pendiente/pospuesta dentro de la misma prioridad, y a
// igualdad de ambas, la que lleva más tiempo esperando.
export function alertasUrgentes(n = 5) {
  return [...ALERTAS_ACTIVAS]
    .sort((a, b) => (
      RANGO_PRIORIDAD[a.prioridad] - RANGO_PRIORIDAD[b.prioridad]
      || RANGO_ESTADO_URGENCIA[a.estado] - RANGO_ESTADO_URGENCIA[b.estado]
      || minutosDesdeHace(b.hace) - minutosDesdeHace(a.hace)
    ))
    .slice(0, n);
}
