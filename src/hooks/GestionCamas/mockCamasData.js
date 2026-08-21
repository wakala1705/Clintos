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
export const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'libre', label: 'Libre' },
  { value: 'ocupada', label: 'Ocupada' },
  { value: 'reservada', label: 'Reservada' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'bloqueada', label: 'Bloqueada' },
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
// naranja/gris) — los códigos reales de estado y su semántica los define el
// backend; este mapeo es solo la representación visual del prototipo (ver
// EstadoCamaBadge.jsx para el ícono asociado a cada uno).
export const ESTADO_COLOR = {
  libre: 'green',
  ocupada: 'red',
  reservada: 'amber',
  limpieza: 'blue',
  mantenimiento: 'orange',
  bloqueada: 'gray',
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
// bloqueada). Esta tabla es el stand-in local de "el frontend le pregunta al
// backend qué transiciones están permitidas desde el estado actual" (sec.
// 12) — el día que exista ese endpoint, reemplaza esta tabla, no la lógica
// que la consume.
export const TRANSICIONES_PERMITIDAS = {
  libre: ['reservada', 'ocupada', 'mantenimiento', 'bloqueada'],
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

// Aislamiento/Inactiva NO se modelan en ESTADO_COLOR/TRANSICIONES_PERMITIDAS
// a propósito: es la forma más simple de garantizar que nunca aparezcan como
// opción funcional del selector "Cambiar estado" (encargo explícito) — el
// doc fuente los deja como gaps sin resolver (relación de Aislamiento con
// Ocupada sin confirmar; Inactiva probablemente es un flag ACTIVA=0 aparte,
// no un estado operativo, ver máquina de estados). "Aislamiento" SÍ se
// modela como atributo booleano aparte (`aislamiento`, ver generateCamas más
// abajo) — el propio doc plantea que podría coexistir con Ocupada en vez de
// ser un estado exclusivo, así que como flag independiente del `estado`
// respeta esa ambigüedad en vez de resolverla a la fuerza (usado solo por el
// filtro avanzado "Aislamiento" del Bed Board, nunca por la máquina de
// estados).

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
// mostrar acciones incompatibles con el estado") — "Cambiar estado" y
// "Historial" se repiten en los 6 porque siempre aplican; el resto varía.
// "Ver detalle"/"Ver paciente"/"Historial" no tienen pantalla propia todavía
// (fuera del alcance de este cambio) — disparan el mismo aviso "en
// desarrollo" que el resto del proyecto (ver CamasEnfermeria.jsx).
export const MENU_ACCIONES = {
  libre: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'reservar', label: 'Reservar' },
    { action: 'asignar-paciente', label: 'Asignar paciente' },
    { action: 'mantenimiento', label: 'Mantenimiento' },
    { action: 'bloquear', label: 'Bloquear' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
  ocupada: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'ver-paciente', label: 'Ver paciente' },
    { action: 'trasladar', label: 'Trasladar' },
    { action: 'liberar', label: 'Liberar' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
  reservada: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'utilizar-reserva', label: 'Utilizar reserva' },
    { action: 'cancelar-reserva', label: 'Cancelar reserva' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
  limpieza: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'finalizar-limpieza', label: 'Finalizar limpieza' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
  mantenimiento: [
    { action: 'ver-detalle', label: 'Ver detalle' },
    { action: 'ver-mantenimiento', label: 'Ver mantenimiento' },
    { action: 'finalizar-mantenimiento', label: 'Finalizar mantenimiento' },
    { action: 'cambiar-estado', label: 'Cambiar estado' },
    { action: 'historial', label: 'Historial' },
  ],
  bloqueada: [
    { action: 'ver-detalle', label: 'Ver detalle' },
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

// Camas curadas con un estado distinto de "libre" (195→194 libre, 4 ocupada,
// 1 limpieza, 0 en el resto — mismos números de ejemplo del encargo) — se
// ubican por criterio sede/área/piso/sector en vez de por índice fijo del
// array, para que sigan encontrándose aunque cambie el orden de generación
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
// min" sea correcto sin importar cuándo se cargó este módulo. Íconos por
// `tipo` viven en ActivityPanel.jsx (mismo criterio que ESTADO_ICONO en
// EstadoCamaBadge.jsx: la data no importa react-icons).
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
