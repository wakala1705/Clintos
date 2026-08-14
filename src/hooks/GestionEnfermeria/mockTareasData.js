// Datos de ejemplo para "Tareas de enfermería" (ver
// src/Components/GestionEnfermeria/TareasEnfermeria/) — bandeja central de
// tareas del turno, accesible desde el botón "Tareas" del Panel General
// (antes solo un toast "en desarrollo", ver PanelGeneral.jsx). Todo el
// módulo es ficticio; reutiliza los MISMOS pacientes/camas/sectores de
// mockPanelGeneralData.js (María González en 101-A, etc.) para que ambas
// pantallas del piso se lean como el mismo piso real, no dos mocks sueltos.
// "Ahora" se fija a las 14:15 del 14 Ago 2026 (mismo "HOY" que
// mockPanelGeneralData.js) — dentro de la ventana del turno mañana
// (07:00-15:00), para que los ejemplos "Vence en 15 min"/"Vencida · 14:00"
// del encargo tengan sentido sin depender de la hora real del sistema.
//
// IMPORTANTE — conteos: el encargo da cifras de ejemplo (Todas 35, Mis
// tareas 12, Pendientes 12, Completadas 18...) pensadas para una bandeja de
// turno completa, pero también pide explícitamente "no usar empty state,
// mostrar ~12-15 tareas realistas". Ambas cosas no son compatibles a la
// vez (35 tareas en las pestañas contradice un dataset de 12-15 filas), así
// que se prioriza el criterio ya aplicado en todo el proyecto: los
// contadores (KPIs, pestañas) SIEMPRE se derivan de la lista real (ver
// TareasEnfermeria.jsx), nunca un número aparte que pueda desincronizarse —
// con 16 tareas reales, "Vencen pronto"/"Vencidas"/"Sin asignar" sí calzan
// exacto con el ejemplo (3/2/2); "Pendientes"/"Completadas"/"Todas" quedan
// más bajos que el ejemplo (proporcional a un dataset más chico), lo cual es
// coherente con el propio encargo de no inflar la demo con filas de relleno.

// Usuario "actual" de esta pantalla (para la pestaña "Mis tareas") — el
// resto de la app (Topbar) siempre muestra un login fijo de demo ("Camilo
// Grondona", Administrador) sin relación con el personal de enfermería que
// ejecuta estas tareas; igual que AtencionEnfermeria.jsx ya asume una
// perspectiva de enfermería pese a ese login fijo, esta pantalla simula
// estar autenticada como la enfermera responsable del turno.
export const USUARIO_ACTUAL = 'Laura Gómez';

export const TURNO_ACTUAL = { label: 'Turno mañana', rango: '07:00–15:00' };

// "Ahora" fijo (14:15) — mismo criterio que el resto del mock: nunca
// Date.now() en vivo, así que "Iniciar tarea" (ver TareasEnfermeria.jsx)
// puede mostrar una hora de inicio realista sin depender del reloj real.
export const AHORA_LABEL = '14:15';

export const TIPOS_TAREA = [
  { value: 'cuidado-enfermeria', label: 'Cuidado de enfermería' },
  { value: 'signos-vitales', label: 'Signos vitales' },
  { value: 'curacion', label: 'Curación' },
  { value: 'balance-liquidos', label: 'Balance de líquidos' },
  { value: 'medicacion', label: 'Medicación' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'operativa', label: 'Tarea operativa' },
  { value: 'otra', label: 'Otra' },
];

export const PRIORIDADES = [
  { value: 'critica', label: 'Crítica' },
  { value: 'alta', label: 'Alta' },
  { value: 'normal', label: 'Normal' },
  { value: 'baja', label: 'Baja' },
];

export const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en-curso', label: 'En curso' },
  { value: 'vencida', label: 'Vencida' },
  { value: 'completada', label: 'Completada' },
  { value: 'reprogramada', label: 'Reprogramada' },
  { value: 'no-realizada', label: 'No realizada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'sin-asignar', label: 'Sin asignar' },
];

export const TURNOS = [
  { value: 'manana', label: 'Turno mañana' },
  { value: 'tarde', label: 'Turno tarde' },
  { value: 'noche', label: 'Turno noche' },
];

export const RESPONSABLES = ['Laura Gómez', 'Carlos Pérez', 'Sofía Ramírez', 'Equipo de enfermería'];

// Opciones de la asignación rápida en fila (encargo explícito: "Enfermero/a,
// Auxiliar, Equipo de enfermería, Responsable del turno") — deliberadamente
// distintas de RESPONSABLES (personas reales): son roles genéricos para
// triage rápido sin salir de la bandeja; la asignación a una persona
// concreta sigue disponible vía "Reasignar" (ReassignModal, ⋯ del menú).
export const ASIGNACION_RAPIDA_OPCIONES = ['Enfermero/a', 'Auxiliar', 'Equipo de enfermería', 'Responsable del turno'];

export const TURNO_LABEL = Object.fromEntries(TURNOS.map((t) => [t.value, t.label]));

// ---------- Tareas ----------
// `categoria` distingue asistenciales (ligadas a un paciente real, con
// `paciente`/`cama`) de operativas (ligadas solo al área operativa, sin
// paciente — `paciente`/`cama` quedan null) — encargo explícito: "no
// convertir las tareas operativas en registros clínicos". `programacion`
// trae el texto YA formateado para lectura rápida (mismo criterio que
// `admision`/`diasEstancia` en mockPanelGeneralData.js: precalculado contra
// el "ahora" fijo de este mock, no una cuenta regresiva en vivo) + `tono`,
// que decide el color/ícono de esa celda (ver TaskProgramacion en
// TaskTable.jsx): 'vence-pronto'/'vencida' alimentan directamente los KPIs
// homónimos.
export const TAREAS = [
  {
    id: 'T-2401', tipo: 'balance-liquidos', categoria: 'asistencial',
    nombre: 'Balance de líquidos',
    paciente: 'María González', cama: '101-A', areaOperativa: 'norte',
    prioridad: 'alta', estado: 'pendiente', responsable: 'Laura Gómez', turno: 'manana',
    programacion: { label: 'Vence en 15 min', tono: 'vence-pronto' },
    ventana: '14:00–15:00', horaLimite: '14:30',
    instrucciones: 'Registrar ingresos y egresos correspondientes al turno.',
  },
  {
    id: 'T-2402', tipo: 'signos-vitales', categoria: 'asistencial',
    nombre: 'Toma de signos vitales',
    paciente: 'Carlos Rodríguez', cama: '101-B', areaOperativa: 'norte',
    prioridad: 'normal', estado: 'pendiente', responsable: 'Laura Gómez', turno: 'manana',
    programacion: { label: 'Programada · 15:30', tono: 'proxima' },
    ventana: '15:30', horaLimite: '15:45',
    instrucciones: 'Tomar frecuencia cardíaca, frecuencia respiratoria, presión arterial y temperatura.',
  },
  {
    id: 'T-2403', tipo: 'medicacion', categoria: 'asistencial',
    nombre: 'Administración de medicamento',
    paciente: 'Ana Martínez', cama: '102-A', areaOperativa: 'norte',
    prioridad: 'alta', estado: 'vencida', responsable: 'Carlos Pérez', turno: 'manana',
    programacion: { label: 'Vencida · 14:00', tono: 'vencida' },
    ventana: '14:00', horaLimite: '14:00',
    instrucciones: 'Furosemida 40mg IV según orden médica vigente.',
  },
  {
    id: 'T-2404', tipo: 'curacion', categoria: 'asistencial',
    nombre: 'Curación de herida',
    paciente: 'Patricia López', cama: '103-A', areaOperativa: 'norte',
    prioridad: 'normal', estado: 'sin-asignar', responsable: null, turno: 'manana',
    programacion: { label: 'Programada · 16:00', tono: 'proxima' },
    ventana: '16:00', horaLimite: '16:30',
    instrucciones: 'Curación de herida quirúrgica abdominal, técnica estéril.',
  },
  {
    id: 'T-2405', tipo: 'operativa', categoria: 'operativa',
    nombre: 'Verificar carro de paro',
    paciente: null, cama: null, ubicacion: 'Estación de enfermería', areaOperativa: 'norte',
    prioridad: 'normal', estado: 'pendiente', responsable: 'Equipo de enfermería', turno: 'manana',
    programacion: { label: 'Hoy · 14:30', tono: 'vence-pronto' },
    ventana: '14:30', horaLimite: '14:30',
    instrucciones: 'Verificar sellos, fecha de vencimiento de medicamentos y carga de batería del desfibrilador.',
  },
  {
    id: 'T-2406', tipo: 'signos-vitales', categoria: 'asistencial',
    nombre: 'Toma de signos vitales',
    paciente: 'Jorge Ramírez', cama: '102-B', areaOperativa: 'norte',
    prioridad: 'normal', estado: 'completada', responsable: 'Laura Gómez', turno: 'manana',
    programacion: { label: 'Completada · 08:15', tono: 'completada' },
    ventana: '08:00', horaLimite: '08:15',
    instrucciones: 'Control post-colecistectomía, cada 6 horas.',
  },
  {
    id: 'T-2407', tipo: 'cuidado-enfermeria', categoria: 'asistencial',
    nombre: 'Higiene y confort',
    paciente: 'Sofía Torres', cama: '104-A', areaOperativa: 'norte',
    prioridad: 'baja', estado: 'en-curso', responsable: 'Carlos Pérez', turno: 'manana',
    programacion: { label: 'En curso · desde 14:10', tono: 'en-curso' },
    ventana: '14:00–14:30', horaLimite: '14:30',
    instrucciones: 'Aseo en cama, cambio de ropa de cama y reposicionamiento postoperatorio.',
  },
  {
    id: 'T-2408', tipo: 'medicacion', categoria: 'asistencial',
    nombre: 'Administración de antibiótico IV',
    paciente: 'Andrés Castro', cama: '104-B', areaOperativa: 'norte',
    prioridad: 'critica', estado: 'pendiente', responsable: 'Laura Gómez', turno: 'manana',
    programacion: { label: 'Vence en 5 min', tono: 'vence-pronto' },
    ventana: '14:10–14:20', horaLimite: '14:20',
    instrucciones: 'Piperacilina/tazobactam 4.5g IV en 100ml SSN a pasar en 30 min.',
  },
  {
    id: 'T-2409', tipo: 'seguimiento', categoria: 'asistencial',
    nombre: 'Seguimiento postoperatorio',
    paciente: 'Elena Vargas', cama: '105-A', areaOperativa: 'sur',
    prioridad: 'alta', estado: 'reprogramada', responsable: 'Sofía Ramírez', turno: 'manana',
    programacion: { label: 'Reprogramada · mañana 08:00', tono: 'neutral' },
    ventana: '15 Ago · 08:00', horaLimite: '15 Ago · 08:30',
    instrucciones: 'Evaluar evolución neurológica y escala NIHSS, coordinar con neurología.',
  },
  {
    id: 'T-2410', tipo: 'curacion', categoria: 'asistencial',
    nombre: 'Curación',
    paciente: 'Ricardo Moreno', cama: '105-B', areaOperativa: 'sur',
    prioridad: 'normal', estado: 'completada', responsable: 'Sofía Ramírez', turno: 'manana',
    programacion: { label: 'Completada · 09:40', tono: 'completada' },
    ventana: '09:30', horaLimite: '10:00',
    instrucciones: 'Curación de herida quirúrgica de cadera, retiro de drenaje si procede.',
  },
  {
    id: 'T-2411', tipo: 'signos-vitales', categoria: 'asistencial',
    nombre: 'Toma de signos vitales',
    paciente: 'Laura Sánchez', cama: '106-A', areaOperativa: 'sur',
    prioridad: 'normal', estado: 'pendiente', responsable: 'Sofía Ramírez', turno: 'manana',
    programacion: { label: 'Programada · 15:00', tono: 'proxima' },
    ventana: '15:00', horaLimite: '15:15',
    instrucciones: 'Control cada 6 horas, vigilar signos de respuesta inflamatoria sistémica.',
  },
  {
    id: 'T-2412', tipo: 'balance-liquidos', categoria: 'asistencial',
    nombre: 'Balance de líquidos',
    paciente: 'Diego Pérez', cama: '106-B', areaOperativa: 'sur',
    prioridad: 'alta', estado: 'no-realizada', responsable: 'Carlos Pérez', turno: 'manana',
    programacion: { label: 'No realizada · 14:00', tono: 'neutral' },
    ventana: '14:00', horaLimite: '14:15',
    instrucciones: 'Paciente en procedimiento de imagenología durante la ventana programada.',
  },
  {
    id: 'T-2413', tipo: 'curacion', categoria: 'asistencial',
    nombre: 'Curación de úlcera por presión',
    paciente: 'Carmen Ruiz', cama: '107-A', areaOperativa: 'sur',
    prioridad: 'alta', estado: 'cancelada', responsable: 'Carlos Pérez', turno: 'manana',
    programacion: { label: 'Cancelada', tono: 'neutral' },
    ventana: '13:00', horaLimite: '13:30',
    instrucciones: 'Paciente trasladado a la unidad de cuidados intensivos.',
  },
  {
    id: 'T-2414', tipo: 'medicacion', categoria: 'asistencial',
    nombre: 'Registro de diuresis horaria',
    paciente: 'Ana Martínez', cama: '102-A', areaOperativa: 'norte',
    prioridad: 'normal', estado: 'vencida', responsable: 'Carlos Pérez', turno: 'manana',
    programacion: { label: 'Vencida · 13:30', tono: 'vencida' },
    ventana: '13:30', horaLimite: '13:30',
    instrucciones: 'Registrar diuresis horaria en hoja de balance hídrico.',
  },
  // ---------- Cambio de turno: pendientes del turno noche (esDelTurnoAnterior) ----------
  {
    id: 'T-2390', tipo: 'seguimiento', categoria: 'asistencial',
    nombre: 'Registro de ingresos y egresos',
    paciente: 'Felipe Gómez', cama: '107-B', areaOperativa: 'sur',
    prioridad: 'normal', estado: 'sin-asignar', responsable: null, turno: 'noche',
    programacion: { label: 'Pendiente desde 06:45', tono: 'neutral' },
    ventana: '06:00–07:00', horaLimite: '07:00',
    instrucciones: 'Consolidar el registro de ingresos y egresos del turno noche.',
    esDelTurnoAnterior: true, motivoPendiente: 'Cambio de turno antes de completar el registro',
    responsableAnterior: 'Diego Fernández (turno noche)', horaOriginal: '06:45',
  },
  {
    id: 'T-2391', tipo: 'operativa', categoria: 'operativa',
    nombre: 'Verificar equipo de succión',
    paciente: null, cama: null, ubicacion: 'Estación de enfermería', areaOperativa: 'norte',
    prioridad: 'normal', estado: 'sin-asignar', responsable: null, turno: 'noche',
    programacion: { label: 'Pendiente desde 06:30', tono: 'neutral' },
    ventana: '06:30', horaLimite: '07:00',
    instrucciones: 'Revisar presión de succión y limpieza de los equipos portátiles.',
    esDelTurnoAnterior: true, motivoPendiente: 'Quedó pendiente por atención de una urgencia en sector norte',
    responsableAnterior: 'Turno noche', horaOriginal: '06:30',
  },
];

// ---------- Helpers ----------
// Filtro "Fecha" de la barra de herramientas — se deriva de `ventana` en vez
// de guardar un campo `fecha` aparte en cada tarea (una sola fuente de
// verdad, mismo criterio que `sectorDeCama` en mockPanelGeneralData.js):
// hoy 14 Ago es el día por defecto de todo el mock, así que solo la única
// tarea reprogramada para el 15 Ago (T-2409) cae en 'manana'.
export function fechaDeTarea(t) {
  return t.ventana?.startsWith('15 Ago') ? 'manana' : 'hoy';
}

export function ubicacionDeTarea(t) {
  return t.categoria === 'asistencial' ? `${t.paciente} · Hab. ${t.cama}` : `${AREA_LABEL[t.areaOperativa]} · ${t.ubicacion}`;
}

export const AREA_LABEL = { norte: 'Sector norte', sur: 'Sector sur' };

// Timeline de trazabilidad — se deriva de los campos de la tarea (creación
// fija a las 07:00 de inicio de turno, salvo `esDelTurnoAnterior`) en vez de
// escribir 16 timelines a mano; cubre igual los 4 pasos del ejemplo del
// encargo para "Balance de líquidos" (T-2401).
export function timelineDeTarea(t) {
  const pasos = [];
  if (t.esDelTurnoAnterior) {
    pasos.push({ label: `Creada durante turno noche · ${t.horaOriginal}`, hora: t.horaOriginal });
    pasos.push({ label: `Quedó pendiente: ${t.motivoPendiente}`, hora: t.horaOriginal });
    pasos.push({ label: 'Recibida en cambio de turno · 07:00', hora: '07:00' });
  } else {
    pasos.push({ label: 'Creada · 07:00', hora: '07:00' });
    if (t.responsable) pasos.push({ label: `Asignada a ${t.responsable} · 07:05`, hora: '07:05' });
    pasos.push({ label: `Programada para ${t.ventana}`, hora: t.ventana });
  }

  const ESTADO_PASO = {
    'en-curso': 'En curso',
    completada: 'Completada',
    vencida: 'Vencida',
    reprogramada: 'Reprogramada',
    'no-realizada': 'No realizada',
    cancelada: 'Cancelada',
    'sin-asignar': 'Sin asignar',
    pendiente: 'Pendiente',
  };
  pasos.push({ label: `${ESTADO_PASO[t.estado]} · Actualmente`, hora: null, actual: true });
  return pasos;
}
