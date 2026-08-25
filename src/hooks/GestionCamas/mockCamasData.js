// Datos de ejemplo para "Gestión de Camas" / Bed Board (ver
// src/Components/GestionCamas/) — inventario y estado operativo de las 199
// camas del hospital (número real conocido de CWEB.HABCAMA, ver
// Bed_Management_Define.md). Ficticio, igual que el resto del módulo (ver
// mockPanelGeneralData.js/mockTurnosData.js en GestionEnfermeria).

// ---------- Filtros del Bed Board (Sede/Área/Piso/Sector/Estado/Tipo) ----------
// Cada lista arranca con la opción "todos/as" (mismo criterio que
// AREAS_TURNOS/ESTADO_OPTIONS en mockTurnosData.js) — el generador de camas
// más abajo usa `.slice(1)` para quedarse solo con los valores reales.
export const SEDES = [
  { value: 'todas', label: 'Todas las sedes' },
  { value: 'central', label: 'Sede Central' },
  { value: 'norte', label: 'Sede Norte' },
];
export const AREAS = [
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
export const PISOS = [
  { value: 'todos', label: 'Todos los pisos' },
  { value: 'piso1', label: 'Piso 1' },
  { value: 'piso2', label: 'Piso 2' },
  { value: 'piso3', label: 'Piso 3' },
];
export const SECTORES = [
  { value: 'todos', label: 'Todos los sectores' },
  { value: 'A', label: 'Sector A' },
  { value: 'B', label: 'Sector B' },
  { value: 'C', label: 'Sector C' },
];
// `group` (opcional, ignorado por ESTADO_LABEL/ESTADO_COLOR más abajo) — solo
// lo usa el <AreaSelector> "Estado" del filter-bar (GestionCamas.jsx) para
// separar la lista en 2 secciones con label+divider: mismo criterio
// clínicos/administrativos que CLINICAL_STATUS_GROUPS en bedContextFormat.js
// (Aislamiento se suma a clínicos, Inactiva a administrativos). Orden del
// array = orden de la lista, por eso van agrupados de forma contigua (no
// alfabético) — mezclarlos dejaría el label de grupo repitiéndose.
export const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  {
    value: 'libre', label: 'Libre', group: 'Clínicos',
  },
  {
    value: 'ocupada', label: 'Ocupada', group: 'Clínicos',
  },
  {
    value: 'reservada', label: 'Reservada', group: 'Clínicos',
  },
  {
    value: 'aislamiento', label: 'Aislamiento', group: 'Clínicos',
  },
  {
    value: 'limpieza', label: 'Limpieza', group: 'Administrativos',
  },
  {
    value: 'mantenimiento', label: 'Mantenimiento', group: 'Administrativos',
  },
  {
    value: 'bloqueada', label: 'Bloqueada', group: 'Administrativos',
  },
  {
    value: 'inactiva', label: 'Inactiva', group: 'Administrativos',
  },
];
// Códigos crudos de `TIPO` en CWEB.HABCAMA (01/02/03/04/10/11) — su
// significado clínico NO está confirmado por el documento fuente, así que se
// muestran tal cual el código, sin traducir a una etiqueta inventada.
export const TIPOS = [
  { value: 'todos', label: 'Todos los tipos' },
  { value: '01', label: '01' },
  { value: '02', label: '02' },
  { value: '03', label: '03' },
  { value: '04', label: '04' },
  { value: '10', label: '10' },
  { value: '11', label: '11' },
];

// Prioridad de una reserva de cama (formulario "Reservar cama", ver
// ReservarCamaModal.jsx) — escala de 3 niveles, sin "todos" al frente porque
// no es un filtro, es un campo de formulario con default "Normal".
export const PRIORIDADES_RESERVA = [
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

// ---------- Directorio buscable para "Reservar cama" ----------
// Pool ficticio de pacientes/admisiones para alimentar el typeahead de
// Paciente/Admisión (ver ReservarCamaModal.jsx/Typeahead.jsx) — el
// prototipo no tiene un directorio de pacientes real (mismo recorte de
// alcance que AsignarPacienteModal.jsx, "sin flujo de admisión completo"),
// así que esta lista es solo para esta búsqueda puntual, no un maestro de
// pacientes del sistema. Determinístico (sin Math.random en los datos en
// sí), mismo criterio que el resto del módulo.
export const PACIENTES_BUSCABLES = [
  { id: 'PAC-1', nombre: 'Marta Elena Ríos', hc: 'HC-10421' },
  { id: 'PAC-2', nombre: 'Camila Andrea Vargas', hc: 'HC-10480' },
  { id: 'PAC-3', nombre: 'Jorge Andrés Peña', hc: 'HC-10437' },
  { id: 'PAC-4', nombre: 'Lucía Fernanda Ortiz', hc: 'HC-10452' },
  { id: 'PAC-5', nombre: 'Andrés Felipe Cardona', hc: 'HC-10511' },
  { id: 'PAC-6', nombre: 'Valentina Gómez Castro', hc: 'HC-10534' },
  { id: 'PAC-7', nombre: 'Sebastián Molina Duarte', hc: 'HC-10549' },
  { id: 'PAC-8', nombre: 'Isabella Reyes Marín', hc: 'HC-10562' },
  { id: 'PAC-9', nombre: 'Mateo Salazar Uribe', hc: 'HC-10578' },
  { id: 'PAC-10', nombre: 'Daniela Restrepo Vélez', hc: 'HC-10593' },
];
// `pacienteId` referencia PACIENTES_BUSCABLES — cada admisión ya trae su
// paciente asociado (por eso seleccionar una admisión autocompleta Paciente
// en el formulario, encargo explícito: "evita inconsistencia de datos").
export const ADMISIONES_BUSCABLES = [
  {
    admisionId: '00010421', pacienteId: 'PAC-1', fecha: '2026-08-17', origen: 'Urgencias',
  },
  {
    admisionId: '00010480', pacienteId: 'PAC-2', fecha: '2026-08-20', origen: 'Urgencias',
  },
  {
    admisionId: '00010437', pacienteId: 'PAC-3', fecha: '2026-08-18', origen: 'Hospitalización Piso 2 T1',
  },
  {
    admisionId: '00010452', pacienteId: 'PAC-4', fecha: '2026-08-19', origen: 'Hospitalización Piso 3 T1',
  },
  {
    admisionId: '00010601', pacienteId: 'PAC-5', fecha: '2026-08-21', origen: 'Cirugía',
  },
  {
    admisionId: '00010612', pacienteId: 'PAC-6', fecha: '2026-08-21', origen: 'Urgencias',
  },
  {
    admisionId: '00010623', pacienteId: 'PAC-7', fecha: '2026-08-22', origen: 'Hospitalización Piso 4 T1',
  },
  {
    admisionId: '00010634', pacienteId: 'PAC-8', fecha: '2026-08-22', origen: 'UCI',
  },
];

function coincide(query, ...campos) {
  const q = query.trim().toLowerCase();
  return campos.some((c) => c && c.toLowerCase().includes(q));
}

// Simula el fetch server-side del typeahead — mismo patrón Promise+setTimeout
// que fetchCamas/fetchInconsistencias/fetchEventos/fetchConfiguracion, con
// una falla ocasional para poder ejercitar el estado de error del buscador
// sin depender de una falla de red real. El debounce (~300ms) es
// responsabilidad del componente que llama a esto (Typeahead.jsx); acá solo
// se simula la latencia de red en sí.
export function buscarPacientes(query) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.06) { reject(new Error('No fue posible buscar pacientes.')); return; }
      resolve(PACIENTES_BUSCABLES.filter((p) => coincide(query, p.nombre, p.hc)).slice(0, 6));
    }, 250);
  });
}

export function buscarAdmisiones(query) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.06) { reject(new Error('No fue posible buscar admisiones.')); return; }
      const resultados = ADMISIONES_BUSCABLES
        .map((a) => ({ ...a, paciente: PACIENTES_BUSCABLES.find((p) => p.id === a.pacienteId) }))
        .filter((a) => coincide(query, a.admisionId, a.paciente?.nombre, a.paciente?.hc));
      resolve(resultados.slice(0, 6));
    }, 250);
  });
}

// Simula la creación de la reserva en el backend (encargo: "cierra el modal
// solo tras respuesta exitosa" / "si falla, mantén el modal abierto") — la
// tasa de falla es más alta que las búsquedas de arriba a propósito, para
// que el estado de error del submit sea fácil de ejercitar en la demo sin
// tener que reintentar muchas veces.
export function crearReserva(payload) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.12) { reject(new Error('No fue posible crear la reserva. Intenta nuevamente.')); return; }
      resolve(payload);
    }, 500);
  });
}

// Clase/Nivel de cama (formulario "Nueva cama", ver NuevaCamaModal.jsx) —
// campos propios de este modelo OPERATIVO, no confundir con `tipo` (código
// crudo de CWEB.HABCAMA, arriba) ni con TIPOS_CAMA del modelo administrativo
// que tenía este módulo (eliminado — ver bitácora de "Camas" en el sidebar).
// Sin "todos" al frente, mismo criterio que PRIORIDADES_RESERVA: son campos
// de formulario, no filtros.
export const CLASES = [
  { value: 'estandar', label: 'Estándar' },
  { value: 'pediatrica', label: 'Pediátrica' },
  { value: 'bariatrica', label: 'Bariátrica' },
  { value: 'obstetrica', label: 'Obstétrica' },
  { value: 'cuidados-intensivos', label: 'Cuidados intensivos' },
  { value: 'cuidados-intermedios', label: 'Cuidados intermedios' },
  { value: 'neonatal', label: 'Neonatal' },
];
export const NIVELES = [
  { value: 'nivel-1', label: 'Nivel I — Baja complejidad' },
  { value: 'nivel-2', label: 'Nivel II — Mediana complejidad' },
  { value: 'nivel-3', label: 'Nivel III — Alta complejidad' },
];

// Catálogo semilla de Características/Restricciones (formulario "Nueva
// cama", ver TagChipField.jsx) — mismo caso que TIPOS más arriba: no hay un
// documento fuente que confirme una lista cerrada de atributos clínicos/
// operativos, así que esta selección parte de los ejemplos que el
// formulario ya traía como placeholder de texto libre antes de migrar a
// chips, pendiente de validación real con clínica/operaciones. El
// formulario permite agregar una etiqueta nueva sin pasar por acá — esta
// lista es solo el punto de partida, no un límite cerrado.
export const CARACTERISTICAS_CAMA = [
  'Cama articulada',
  'Colchón antiescaras',
  'Monitor integrado',
  'Barandas de seguridad',
  'Bomba de infusión incorporada',
];
export const RESTRICCIONES_CAMA = [
  'No apta para bariátricos',
  'Solo para aislamiento',
  'No trasladable',
  'Requiere mantenimiento previo',
];

// Lookups value->label (mismo patrón que AREA_TURNO_LABEL en
// mockTurnosData.js) para mostrar texto legible a partir del código guardado
// en cada cama, sin duplicar los mismos pares a mano en cada componente.
export const SEDE_LABEL = Object.fromEntries(SEDES.slice(1).map((s) => [s.value, s.label]));
export const AREA_LABEL = Object.fromEntries(AREAS.slice(1).map((a) => [a.value, a.label]));
export const PISO_LABEL = Object.fromEntries(PISOS.slice(1).map((p) => [p.value, p.label]));
export const SECTOR_LABEL = Object.fromEntries(SECTORES.slice(1).map((s) => [s.value, s.label]));
export const ESTADO_LABEL = Object.fromEntries(ESTADOS.slice(1).map((e) => [e.value, e.label]));
export const PRIORIDAD_LABEL = Object.fromEntries(PRIORIDADES_RESERVA.map((p) => [p.value, p.label]));

// ---------- Estado de cama: color de representación ----------
// Códigos frontend-only para pintar cada estado (verde/rojo/ámbar/azul/
// naranja/gris/morado/gris oscuro) — los códigos reales de estado y su
// semántica los define el backend; este mapeo es solo la representación
// visual del prototipo (ver EstadoCamaBadge.jsx para el ícono asociado a
// cada uno).
// reservada: 'amber' -> 'cyan' (encargo explícito, rediseño 2 paneles
// BedCard, sección "sistema de color por estado") — cambio de sistema de
// color, no solo de BedCard: se refleja en cualquier EstadoCamaBadge
// existente (tabla de camas, detalle, auditoría), a propósito, para que no
// quede un estado con 2 colores distintos según dónde se mire. Se mantiene
// así (no se revierte a amarillo) aunque el doc de "Estados visuales" pida
// amarillo para Reservada — discrepancia reportada, no aplicada, para no
// reintroducir esa inconsistencia ya resuelta.
// ocupada: 'red' -> 'accent' (encargo explícito: "ocupada es un estado
// normal de flujo, no requiere atención urgente — el rojo se reserva para
// estados que sí, ej. Bloqueada") — mismo criterio de reflejarse en TODO
// EstadoCamaBadge existente, no solo en el modal de detalle. No se tocó el
// color de ningún otro estado (Bloqueada sigue 'gray'): el encargo solo
// pedía este cambio puntual, no una reasignación general del sistema de
// color.
export const ESTADO_COLOR = {
  libre: 'green',
  ocupada: 'accent',
  reservada: 'cyan',
  limpieza: 'blue',
  mantenimiento: 'orange',
  bloqueada: 'gray',
  aislamiento: 'purple',
  inactiva: 'slate',
};

// ---------- Máquina de estados ----------
// Transiciones CONFIRMADAS por el documento fuente (Bed_Management_Maquina_
// Estados.md, sec. 12): libre→reservada→ocupada→limpieza→libre y
// libre→mantenimiento→limpieza→libre. libre→ocupada (asignación directa) y
// reservada→libre (cancelar/vencer) son INFERIDAS de otras secciones del
// mismo doc, confianza más baja. "Cualquier estado→bloqueada" está pedido
// por el doc pero sin especificar desde cuáles exactamente es válido — para
// este prototipo se permite desde cualquier estado; bloqueada→libre al
// desbloquear es un SUPUESTO propio de este prototipo, no una regla de
// negocio confirmada (el doc no especifica a qué estado vuelve una cama
// bloqueada). `libre→limpieza` (encargo: acción "Limpieza" en el menú "⋯")
// es otro SUPUESTO propio, mismo criterio que "Cualquier estado→bloqueada":
// el doc solo confirma limpieza llegando desde Ocupada/Mantenimiento, pero
// permitir marcar una cama libre para limpieza preventiva (sin pasar por
// Mantenimiento) es una operación administrativa razonable — no se extendió
// a Reservada/Bloqueada porque esos 2 estados ya resuelven sus transiciones
// secundarias solo vía "Cambiar estado" genérico, sin atajos directos (ver
// MENU_ACCIONES). Esta tabla es el stand-in local de "el frontend le
// pregunta al backend qué transiciones están permitidas desde el estado
// actual" (sec. 12) — el día que exista ese endpoint, reemplaza esta tabla,
// no la lógica que la consume.
export const TRANSICIONES_PERMITIDAS = {
  libre: ['reservada', 'ocupada', 'limpieza', 'mantenimiento', 'bloqueada'],
  reservada: ['ocupada', 'libre', 'bloqueada'],
  ocupada: ['limpieza', 'bloqueada'],
  limpieza: ['libre', 'bloqueada'],
  mantenimiento: ['limpieza', 'bloqueada'],
  bloqueada: ['libre'],
};

// Estados que exigen Motivo obligatorio antes de confirmar el cambio — el
// doc fuente deja esto explícitamente como gap abierto ("no especifica
// cuáles estados se consideran críticos... debe confirmarse con el
// stakeholder"), con Bloqueada/Mantenimiento/Aislamiento como candidatos
// razonables. Aislamiento no aplica acá porque no es un estado funcional en
// este prototipo (ver más abajo) — placeholder pendiente de confirmación de
// negocio, no una regla ya validada.
export const ESTADOS_CRITICOS = ['bloqueada', 'mantenimiento'];

// Aislamiento/Inactiva SÍ tienen color/label/ícono ahora (Estados visuales,
// encargo sección 6: "los colores son únicamente representación visual, los
// códigos reales vienen del backend") pero siguen deliberadamente FUERA de
// TRANSICIONES_PERMITIDAS/CTA_PRINCIPAL/MENU_ACCIONES/ESTADOS_CRITICOS —
// eso no cambió: el doc fuente sigue sin confirmar las reglas de negocio de
// estos 2 (relación de Aislamiento con Ocupada sin confirmar; Inactiva
// probablemente es un flag ACTIVA=0 aparte, no un estado operativo, ver
// máquina de estados). Mantenerlos fuera de esas 4 tablas es lo que impide
// que aparezcan como opción del selector "Cambiar estado" (BedActionsMenu
// hace fallback a `[]` cuando MENU_ACCIONES no trae el estado, ver
// BedActionsMenu.jsx) — solo se pintan si una cama ya trae ese `estado`
// (mock o, más adelante, backend), nunca se llega ahí manualmente desde la
// UI. "Aislamiento" SIGUE existiendo también como atributo booleano aparte
// (`aislamiento`, ver generateCamas más abajo) para el caso "coexiste con
// Ocupada" que el doc no resuelve — el nuevo `estado: 'aislamiento'` cubre
// el otro caso (cama en sí reservada/preparada para aislamiento, sin
// paciente), son 2 conceptos independientes a propósito, no un duplicado.

// ---------- Acción principal por estado (CTA contextual de cada tarjeta) ----------
// Reemplaza "Cambiar estado" como CTA universal (encargo explícito) — cada
// estado tiene UNA acción principal que resuelve la pregunta "¿qué puedo
// hacer ahora?" sin abrir el modal genérico. "Cambiar estado" sigue
// existiendo, pero se mueve al menú secundario `⋯` (ver MENU_ACCIONES).
export const CTA_PRINCIPAL = {
  libre: { action: 'asignar-paciente', label: 'Asignar paciente' },
  ocupada: { action: 'trasladar', label: 'Trasladar' },
  reservada: { action: 'utilizar-reserva', label: 'Utilizar reserva' },
  limpieza: { action: 'finalizar-limpieza', label: 'Finalizar limpieza' },
  mantenimiento: { action: 'ver-mantenimiento', label: 'Ver mantenimiento' },
  bloqueada: { action: 'desbloquear', label: 'Desbloquear' },
};

// ---------- Menú secundario "⋯" por estado ----------
// Solo acciones válidas para el estado actual (encargo explícito: "no
// mostrar acciones incompatibles con el estado") — "Editar"/"Cambiar
// estado"/"Historial" se repiten en los 6 porque siempre aplican (Editar es
// dato maestro de la cama, no depende del estado operativo); el resto
// varía. "Ver detalle"/"Ver paciente"/"Editar"/"Historial" no tienen
// pantalla propia todavía (fuera del alcance de este cambio) — disparan el
// mismo aviso "en desarrollo" que el resto del proyecto (ver
// CamasEnfermeria.jsx). "Limpieza" solo se agrega en Libre (encargo, ver
// TRANSICIONES_PERMITIDAS más arriba) — en Ocupada/Mantenimiento esa misma
// transición ya tiene su propio atajo más específico ("Liberar"/"Finalizar
// mantenimiento"), así que un "Limpieza" genérico ahí sería un botón
// duplicado con el mismo efecto.
export const MENU_ACCIONES = {
  libre: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'editar', label: 'Editar' },
    { action: 'reservar', label: 'Reservar' },
    { action: 'asignar-paciente', label: 'Asignar paciente' },
    { action: 'mantenimiento', label: 'Mantenimiento' },
    { action: 'limpieza', label: 'Limpieza' },
    { action: 'bloquear', label: 'Bloquear' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
  ocupada: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'editar', label: 'Editar' },
    { action: 'ver-paciente', label: 'Ver paciente' },
    { action: 'trasladar', label: 'Trasladar' },
    { action: 'liberar', label: 'Liberar' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
  reservada: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'editar', label: 'Editar' },
    { action: 'utilizar-reserva', label: 'Utilizar reserva' },
    { action: 'cancelar-reserva', label: 'Cancelar reserva' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
  limpieza: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'editar', label: 'Editar' },
    { action: 'finalizar-limpieza', label: 'Finalizar limpieza' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
  mantenimiento: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'editar', label: 'Editar' },
    { action: 'ver-mantenimiento', label: 'Ver mantenimiento' },
    { action: 'finalizar-mantenimiento', label: 'Finalizar mantenimiento' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
  bloqueada: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'editar', label: 'Editar' },
    { action: 'desbloquear', label: 'Desbloquear' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
};

// Fecha fija de "hoy" para admisiones nuevas creadas desde "Asignar
// paciente" — mismo criterio que HOY en mockPanelGeneralData.js (no depende
// del reloj real del sistema).
export const HOY_ADMISION = '2026-08-20';

// ---------- Generación del inventario (199 camas) ----------
// Determinística (sin Math.random, mismo criterio que mockPanelGeneralData.js)
// para que los conteos del Bed Board no cambien entre recargas. Por cada
// área, recorre Sede×Piso×Sector generando hasta 3 camas por combinación
// (numeradas "<piso><secuencia>-<sector>", ej. "101-A" = piso 1, cama 01,
// sector A) y corta apenas se alcanza el cupo de esa área (CAMAS_POR_AREA,
// ver abajo) — el mismo orden produce siempre el mismo inventario.
const SEDES_VALUES = SEDES.slice(1).map((s) => s.value);
const AREAS_VALUES = AREAS.slice(1).map((a) => a.value);
const PISOS_VALUES = PISOS.slice(1).map((p) => p.value);
const SECTORES_VALUES = SECTORES.slice(1).map((s) => s.value);
const TIPOS_VALUES = TIPOS.slice(1).map((t) => t.value);

const TOTAL_CAMAS = 199;
const CAMAS_POR_COMBINACION = 3;

// Camas curadas con un estado distinto de "libre" (199→189 libre, 4 ocupada,
// 1 limpieza, 1 reservada, 1 bloqueada, 1 mantenimiento, 1 aislamiento, 1
// inactiva — los 4 ocupada/1 limpieza son los números de ejemplo originales
// del encargo, el resto se sumó después para tener al menos 1 ejemplo real
// de cada estado visual) — se ubican por criterio sede/área/piso/sector en
// vez de por índice fijo del array, para que sigan encontrándose aunque cambie el orden de generación
// de arriba. `hc` seguí el mismo formato "HC-#####" que PatientsTable.jsx
// (mockPanelGeneralData.js) para no introducir una convención de
// identificador distinta dentro del mismo módulo de Enfermería.
// (sede, piso1, sector) combinaciones — a propósito siempre "piso1" (ver
// generateCamas: combo0/1/2 = central-piso1-{A,B,C}), la única garantizada
// para cualquier área sin importar cuántas camas le tocaron en
// CAMAS_POR_AREA (la más chica, UCI con 16, ya cubre de sobra piso1 A/B/C).
const CAMAS_CURADAS = [
  {
    sede: 'central', area: 'uci', piso: 'piso1', sector: 'A', estado: 'ocupada',
    paciente: {
      nombre: 'Marta Elena Ríos', hc: 'HC-10421', admisionId: '00010421', admision: '2026-08-17', horaIngreso: '08:40',
    },
  },
  {
    sede: 'central', area: 'urgencias', piso: 'piso1', sector: 'B', estado: 'ocupada',
    paciente: {
      nombre: 'Camila Andrea Vargas', hc: 'HC-10480', admisionId: '00010480', admision: '2026-08-20', horaIngreso: '07:15',
    },
  },
  {
    sede: 'central', area: 'hosp-piso2-t1', piso: 'piso1', sector: 'C', estado: 'ocupada',
    paciente: {
      nombre: 'Jorge Andrés Peña', hc: 'HC-10437', admisionId: '00010437', admision: '2026-08-18', horaIngreso: '11:15',
    },
  },
  {
    sede: 'central', area: 'hosp-piso3-t1', piso: 'piso1', sector: 'A', estado: 'ocupada',
    paciente: {
      nombre: 'Lucía Fernanda Ortiz', hc: 'HC-10452', admisionId: '00010452', admision: '2026-08-19', horaIngreso: '16:05',
    },
  },
  {
    sede: 'central', area: 'hosp-general-p4-t1', piso: 'piso1', sector: 'A', estado: 'limpieza',
    limpiezaDesde: '08:32',
  },
  // Reservada/bloqueada: el inventario original no traía ninguna (0 en el
  // encargo de la v1) — se agregan estas 2 para que la iteración "centro
  // operativo" tenga al menos un ejemplo real de cada estado que ilustrar
  // en las tarjetas (ver BedCard.jsx), no solo en el selector de estado.
  {
    sede: 'central', area: 'uci', piso: 'piso1', sector: 'B', estado: 'reservada',
    reserva: {
      motivo: 'Ingreso programado', fechaInicio: '2026-08-21', fechaVencimiento: '2026-08-22', prioridad: 'normal',
    },
  },
  {
    sede: 'central', area: 'hosp-piso4-t2', piso: 'piso1', sector: 'A', estado: 'bloqueada',
    motivo: 'Fuera de servicio',
  },
  // Aislamiento/Inactiva (Estados visuales, encargo sección 6): mismo motivo
  // que el bloque de arriba — sin al menos 1 ejemplo real, el badge/chip
  // nuevo nunca se ve pintado en la app, solo en el conteo (0). Áreas sin
  // otra cama curada (hosp-piso4-t1/hosp-piso5-t2) para no pisar los combos
  // ya usados arriba. BedCard (tarjeta 2 paneles) los pinta con el hue
  // "unknown" ya existente — fuera de alcance de este cambio, ver
  // cardHue/bedContextFormat.js.
  {
    sede: 'central', area: 'hosp-piso4-t1', piso: 'piso1', sector: 'A', estado: 'aislamiento',
  },
  {
    sede: 'central', area: 'hosp-piso5-t2', piso: 'piso1', sector: 'A', estado: 'inactiva',
  },
  // Mantenimiento: el inventario original no traía ninguna (0, mismo motivo
  // que Reservada/Bloqueada más arriba) — sector B de la misma área que
  // Aislamiento (hosp-piso4-t1), libre todavía.
  {
    sede: 'central', area: 'hosp-piso4-t1', piso: 'piso1', sector: 'B', estado: 'mantenimiento',
    mantenimientoTipo: 'Mantenimiento preventivo programado',
  },
];

// Franja de horas para "Última limpieza" de camas Libres (encargo: "¿está
// realmente lista para asignar?") — mismo criterio determinístico que `tipo`
// más abajo (índice % pool), nunca Math.random. Solo se muestra cuando
// `estado === 'libre'`, así que su valor en camas de otro estado es ignorado.
const TIEMPOS_ULTIMA_LIMPIEZA = ['06:15', '06:40', '07:05', '07:20', '07:42', '07:58'];

// Cuántas de las 199 camas le tocan a cada área (encargo: "las 199 camas
// deberían distribuirse en estas 8 áreas" — el número exacto por área no
// está confirmado por ningún documento fuente, así que queda a criterio de
// este prototipo: UCI/Urgencias más chicas que los pisos de Hospitalización
// general, suma exacta = TOTAL_CAMAS). Reemplaza el reparto parejo que
// resultaba antes de aplanar sede×área×piso×sector y cortar a 199 sin mirar
// cuántas le tocaban a cada área.
const CAMAS_POR_AREA = {
  urgencias: 20,
  uci: 16,
  'hosp-general-p4-t1': 30,
  'hosp-piso2-t1': 28,
  'hosp-piso3-t1': 28,
  'hosp-piso4-t1': 27,
  'hosp-piso4-t2': 25,
  'hosp-piso5-t2': 25,
};

// Guarda que la suma siga cuadrando con TOTAL_CAMAS si alguien edita el
// reparto de arriba sin actualizar las demás áreas a mano.
if (Object.values(CAMAS_POR_AREA).reduce((sum, n) => sum + n, 0) !== TOTAL_CAMAS) {
  throw new Error('CAMAS_POR_AREA no suma TOTAL_CAMAS (mockCamasData.js)');
}

// Combinaciones sede×piso×sector (ya sin área — cada área arma su propio
// inventario más abajo) — mismo orden central→norte / piso1→piso3 /
// sector A→C que antes, así que "central-piso1-sector A" (combo0) sigue
// siendo la primera de cualquier área sin importar su cupo en
// CAMAS_POR_AREA (ver CAMAS_CURADAS, todas usan piso1 a propósito).
function combinacionesSedePisoSector() {
  const combos = [];
  SEDES_VALUES.forEach((sede) => {
    PISOS_VALUES.forEach((piso) => {
      SECTORES_VALUES.forEach((sector) => {
        combos.push({ sede, piso, sector });
      });
    });
  });
  return combos;
}

function generateCamas() {
  const combosBase = combinacionesSedePisoSector();
  let contador = 0;

  const camas = AREAS_VALUES.flatMap((area) => {
    const cupo = CAMAS_POR_AREA[area];
    const slots = combosBase
      .flatMap((combo) => Array.from({ length: CAMAS_POR_COMBINACION }, (_, i) => ({ ...combo, seq: i + 1 })))
      .slice(0, cupo);

    return slots.map((slot) => {
      contador += 1;
      const pisoNum = slot.piso.slice(-1);
      const tipo = TIPOS_VALUES[contador % TIPOS_VALUES.length];
      return {
        id: `CAM-${String(contador).padStart(4, '0')}`,
        numero: `${pisoNum}${String(slot.seq).padStart(2, '0')}-${slot.sector}`,
        sede: slot.sede,
        area,
        piso: slot.piso,
        sector: slot.sector,
        tipo,
        estado: 'libre',
        paciente: null,
        reserva: null,
        motivo: undefined,
        limpiezaDesde: undefined,
        mantenimientoTipo: undefined,
        ultimaLimpieza: TIEMPOS_ULTIMA_LIMPIEZA[contador % TIEMPOS_ULTIMA_LIMPIEZA.length],
        // Filtro avanzado "Temporal" — el doc fuente no confirma el
        // significado de TIPO, así que se deriva de los 2 códigos más
        // recientes/atípicos (10/11) como aproximación razonable de "cama
        // temporal/adicional", NO una regla de negocio confirmada.
        temporal: tipo === '10' || tipo === '11',
        // Filtro avanzado "Aislamiento" — ver comentario junto a
        // TRANSICIONES_PERMITIDAS: atributo aparte, no un `estado`. Ninguna
        // cama del inventario de ejemplo lo trae en `true`.
        aislamiento: false,
      };
    });
  });

  CAMAS_CURADAS.forEach((cur) => {
    const cama = camas.find((c) => (
      c.sede === cur.sede && c.area === cur.area && c.piso === cur.piso && c.sector === cur.sector
    ));
    if (!cama) return;
    cama.estado = cur.estado;
    if (cur.paciente) cama.paciente = cur.paciente;
    if (cur.limpiezaDesde) cama.limpiezaDesde = cur.limpiezaDesde;
    if (cur.mantenimientoTipo) cama.mantenimientoTipo = cur.mantenimientoTipo;
    if (cur.reserva) cama.reserva = cur.reserva;
    if (cur.motivo) cama.motivo = cur.motivo;
  });

  return camas;
}

export const CAMAS = generateCamas();

// ---------- Próximos ingresos / traslados ----------
// Cola de movimientos entrantes que todavía no tienen (o ya tienen) cama
// asignada — alimenta el drawer "Próximos ingresos" del header (encargo:
// centro operativo, "¿qué pacientes están próximos a ingresar o
// trasladarse?"). `requerimiento` es el tipo de cama que ese movimiento
// necesita (null cuando no aplica, ej. un traslado a una cama ya reservada).
// CTA "Asignar cama" solo tiene sentido mientras `estado === 'pendiente'`.
export const TIPO_INGRESO_LABEL = {
  admision: 'Nueva admisión',
  traslado: 'Traslado',
  programado: 'Ingreso programado',
};
export const PROXIMOS_INGRESOS = [
  {
    id: 'PI-1',
    hora: '08:55',
    tipo: 'admision',
    origen: 'Urgencias',
    destino: 'UCI',
    requerimiento: null,
    estado: 'pendiente',
    detalle: 'Paciente pendiente de asignación',
  },
  {
    id: 'PI-2',
    hora: '09:10',
    tipo: 'traslado',
    origen: 'Hospitalización',
    destino: 'UCI',
    requerimiento: '03',
    estado: 'pendiente',
    detalle: 'Cama requerida: Tipo 03',
  },
  {
    id: 'PI-3',
    hora: '09:30',
    tipo: 'programado',
    origen: 'Cirugía',
    destino: 'Hospitalización',
    requerimiento: null,
    estado: 'asignada',
    detalle: 'Cama reservada',
  },
];

// ---------- Actividad reciente (seed) ----------
// 5 eventos de ejemplo del encargo — `haceMs` es un offset relativo (nunca un
// timestamp absoluto horneado acá): GestionCamas.jsx lo convierte a
// `timestamp` real recién al montar (`Date.now() - haceMs`), para que "hace 2
// min" sea correcto sin importar cuándo se cargó este módulo. `tipo` ya no
// mapea a un ícono por tipo de evento (BedDetailModal usa un único ícono
// neutro para todo el historial, ver GestionCamas.css) — se conserva por si
// un futuro filtro por tipo de evento lo necesita.
export const ACTIVIDAD_INICIAL = [
  {
    id: 'EV-1', tipo: 'cama-liberada', titulo: 'Cama 102-A liberada', detalle: 'La cama está disponible para asignación', haceMs: 2 * 60000,
  },
  {
    id: 'EV-2', tipo: 'paciente-trasladado', titulo: 'Paciente trasladado', detalle: 'Marta Elena Ríos → Cama 204-B', haceMs: 5 * 60000,
  },
  {
    id: 'EV-3', tipo: 'limpieza-iniciada', titulo: 'Cama 103-A en limpieza', detalle: 'Limpieza iniciada', haceMs: 8 * 60000,
  },
  {
    id: 'EV-4', tipo: 'nueva-admision', titulo: 'Nueva admisión', detalle: 'Paciente pendiente de asignación', haceMs: 12 * 60000,
  },
  {
    id: 'EV-5', tipo: 'cama-reservada', titulo: 'Cama 201-C reservada', detalle: 'Reserva para procedimiento', haceMs: 15 * 60000,
  },
];
