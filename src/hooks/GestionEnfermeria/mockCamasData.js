// Datos de ejemplo para "Camas" / Bed Board (ver
// src/Components/GestionEnfermeria/CamasEnfermeria/) — inventario y estado
// operativo de las 199 camas del hospital (número real conocido de
// CWEB.HABCAMA, ver Bed_Management_Define.md). Ficticio, igual que el resto
// del módulo (ver mockPanelGeneralData.js/mockTurnosData.js).

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
  { value: 'uci', label: 'UCI' },
  { value: 'medicina-interna', label: 'Medicina Interna' },
  { value: 'cirugia', label: 'Cirugía' },
  { value: 'pediatria', label: 'Pediatría' },
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
  { value: 'todos', label: 'Todos los estados' },
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

// Lookups value->label (mismo patrón que AREA_TURNO_LABEL en
// mockTurnosData.js) para mostrar texto legible a partir del código guardado
// en cada cama, sin duplicar los mismos pares a mano en cada componente.
export const SEDE_LABEL = Object.fromEntries(SEDES.slice(1).map((s) => [s.value, s.label]));
export const AREA_LABEL = Object.fromEntries(AREAS.slice(1).map((a) => [a.value, a.label]));
export const PISO_LABEL = Object.fromEntries(PISOS.slice(1).map((p) => [p.value, p.label]));
export const SECTOR_LABEL = Object.fromEntries(SECTORES.slice(1).map((s) => [s.value, s.label]));
export const ESTADO_LABEL = Object.fromEntries(ESTADOS.slice(1).map((e) => [e.value, e.label]));

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
// para que los conteos del Bed Board no cambien entre recargas. Recorre
// Sede×Área×Piso×Sector generando hasta 3 camas por combinación (numeradas
// "<piso><secuencia>-<sector>", ej. "101-A" = piso 1, cama 01, sector A) y
// corta apenas se alcanzan las 199 — el mismo orden produce siempre el mismo
// inventario.
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
const CAMAS_CURADAS = [
  {
    sede: 'central', area: 'uci', piso: 'piso1', sector: 'A', estado: 'ocupada',
    paciente: { nombre: 'Marta Elena Ríos', hc: 'HC-10421', admision: '2026-08-17' },
  },
  {
    sede: 'central', area: 'medicina-interna', piso: 'piso2', sector: 'B', estado: 'ocupada',
    paciente: { nombre: 'Jorge Andrés Peña', hc: 'HC-10437', admision: '2026-08-18' },
  },
  {
    sede: 'norte', area: 'cirugia', piso: 'piso1', sector: 'C', estado: 'ocupada',
    paciente: { nombre: 'Lucía Fernanda Ortiz', hc: 'HC-10452', admision: '2026-08-19' },
  },
  {
    sede: 'norte', area: 'pediatria', piso: 'piso1', sector: 'A', estado: 'ocupada',
    paciente: { nombre: 'Samuel David Cabrera', hc: 'HC-10468', admision: '2026-08-20' },
  },
  {
    sede: 'central', area: 'cirugia', piso: 'piso1', sector: 'A', estado: 'limpieza',
    limpiezaDesde: '10:40 a. m.',
  },
];

// Combinaciones sede×área×piso×sector, cada una repetida CAMAS_POR_COMBINACION
// veces — se aplana y se corta a TOTAL_CAMAS en vez de un loop anidado con
// `break` etiquetado, mismo resultado determinístico sin depender de labels.
function combinacionesCama() {
  const combos = [];
  SEDES_VALUES.forEach((sede) => {
    AREAS_VALUES.forEach((area) => {
      PISOS_VALUES.forEach((piso) => {
        SECTORES_VALUES.forEach((sector) => {
          combos.push({ sede, area, piso, sector });
        });
      });
    });
  });
  return combos;
}

function generateCamas() {
  const slots = combinacionesCama()
    .flatMap((combo) => Array.from({ length: CAMAS_POR_COMBINACION }, (_, i) => ({ ...combo, seq: i + 1 })))
    .slice(0, TOTAL_CAMAS);

  const camas = slots.map((slot, i) => {
    const contador = i + 1;
    const pisoNum = slot.piso.slice(-1);
    const tipo = TIPOS_VALUES[contador % TIPOS_VALUES.length];
    return {
      id: `CAM-${String(contador).padStart(4, '0')}`,
      numero: `${pisoNum}${String(slot.seq).padStart(2, '0')}-${slot.sector}`,
      sede: slot.sede,
      area: slot.area,
      piso: slot.piso,
      sector: slot.sector,
      tipo,
      estado: 'libre',
      paciente: null,
      reserva: null,
      motivo: undefined,
      limpiezaDesde: undefined,
      mantenimientoTipo: undefined,
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

  CAMAS_CURADAS.forEach((cur) => {
    const cama = camas.find((c) => (
      c.sede === cur.sede && c.area === cur.area && c.piso === cur.piso && c.sector === cur.sector
    ));
    if (!cama) return;
    cama.estado = cur.estado;
    if (cur.paciente) cama.paciente = cur.paciente;
    if (cur.limpiezaDesde) cama.limpiezaDesde = cur.limpiezaDesde;
    if (cur.mantenimientoTipo) cama.mantenimientoTipo = cur.mantenimientoTipo;
  });

  return camas;
}

export const CAMAS = generateCamas();
