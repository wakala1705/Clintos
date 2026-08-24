// Mock del maestro ADMINISTRATIVO de camas ("Camas" dentro de Gestión de
// Camas) — deliberadamente separado de mockCamasData.js (Bed Board
// operativo: pacientes, asignaciones, actividad en tiempo real). Este
// archivo no modela nada operativo (sin pacientes/ocupación en vivo, ver
// encargo sección 16 "No mezclar ambos modelos") — solo el inventario/
// configuración de camas que un administrador consulta y edita.
//
// Estado ADMINISTRATIVO (4 valores, no los 6 operativos del Bed Board):
// Habilitada/En mantenimiento/Fuera de servicio/Bloqueada. Los conteos
// (468/12/32) sumados a Total dan exactamente 512 (encargo, sección 5) —
// por eso "Ocupada"/"En limpieza" no son valores de este campo: esos son
// estado OPERATIVO (ver EstadoCamaBadge en el Bed Board), y esta pantalla
// solo expone el estado administrativo de habilitación de la cama.

export function formatFechaHora(timestampMs) {
  const d = new Date(timestampMs);
  const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${fecha}, ${hora}`;
}
export function formatFecha(timestampMs) {
  return new Date(timestampMs).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const SEDES = [
  { value: 'todas', label: 'Todas las sedes' },
  { value: 'centro', label: 'Sede Centro' },
  { value: 'norte', label: 'Sede Norte' },
  { value: 'sur', label: 'Sede Sur' },
];
export const SEDE_LABEL = Object.fromEntries(SEDES.map((s) => [s.value, s.label]));

export const SERVICIOS = [
  { value: 'todos', label: 'Todos los servicios' },
  { value: 'uci-adultos', label: 'UCI Adultos' },
  { value: 'hospitalizacion-general', label: 'Hospitalización General' },
  { value: 'pediatria', label: 'Pediatría' },
  { value: 'cirugia', label: 'Cirugía' },
  { value: 'emergencias', label: 'Emergencias' },
];
export const SERVICIO_LABEL = Object.fromEntries(SERVICIOS.map((s) => [s.value, s.label]));

// Tipo de cama: taxonomía clínica propia, independiente del Servicio (a
// diferencia del modelo anterior de "1 tipo por servicio" — estos 7 valores
// no mapean 1:1 contra los 5 servicios de arriba, ej. una cama Bariátrica o
// Neonatal puede estar en cualquier servicio). Por eso se asigna por
// rotación en CAMAS (mismo criterio que Piso/Sector, ver *_ROTACION más
// abajo) y es un campo seleccionable en CamaFormModal, no derivado/solo
// lectura.
export const TIPOS_CAMA = [
  { value: 'todos', label: 'Todos los tipos' },
  { value: 'hospitalaria-estandar', label: 'Hospitalaria estándar' },
  { value: 'pediatrica', label: 'Pediátrica' },
  { value: 'bariatrica', label: 'Bariátrica' },
  { value: 'obstetrica', label: 'Obstétrica' },
  { value: 'cuidados-intensivos', label: 'Cuidados intensivos' },
  { value: 'cuidados-intermedios', label: 'Cuidados intermedios' },
  { value: 'neonatal', label: 'Neonatal' },
];
export const TIPO_LABEL = Object.fromEntries(TIPOS_CAMA.map((t) => [t.value, t.label]));

export const PISOS = [
  { value: 'todos', label: 'Todos los pisos' },
  { value: '1', label: 'Piso 1' },
  { value: '2', label: 'Piso 2' },
  { value: '3', label: 'Piso 3' },
  { value: '4', label: 'Piso 4' },
  { value: '5', label: 'Piso 5' },
];
export const PISO_LABEL = Object.fromEntries(PISOS.map((p) => [p.value, p.label]));

export const SECTORES = [
  { value: 'todos', label: 'Todos los sectores' },
  { value: 'norte', label: 'Ala Norte' },
  { value: 'sur', label: 'Ala Sur' },
  { value: 'este', label: 'Ala Este' },
  { value: 'oeste', label: 'Ala Oeste' },
];
export const SECTOR_LABEL = Object.fromEntries(SECTORES.map((s) => [s.value, s.label]));

export const ESTADOS = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'habilitada', label: 'Habilitada', color: 'green' },
  { value: 'mantenimiento', label: 'En mantenimiento', color: 'orange' },
  { value: 'fuera-servicio', label: 'Fuera de servicio', color: 'red' },
  { value: 'bloqueada', label: 'Bloqueada', color: 'gray' },
];
export const ESTADO_LABEL = Object.fromEntries(ESTADOS.map((e) => [e.value, e.label]));
export const ESTADO_COLOR = Object.fromEntries(ESTADOS.filter((e) => e.value !== 'todos').map((e) => [e.value, e.color]));

// Transiciones permitidas desde cada estado (stand-in local de "el backend
// dice qué transiciones son válidas", mismo criterio que
// TRANSICIONES_PERMITIDAS en mockCamasData.js) — cualquier estado puede
// volver a Habilitada o pasar a cualquier otro estado administrativo.
export const TRANSICIONES_PERMITIDAS = {
  habilitada: ['mantenimiento', 'fuera-servicio', 'bloqueada'],
  mantenimiento: ['habilitada', 'fuera-servicio', 'bloqueada'],
  'fuera-servicio': ['habilitada', 'mantenimiento', 'bloqueada'],
  bloqueada: ['habilitada', 'mantenimiento', 'fuera-servicio'],
};
// Motivo obligatorio al DESACTIVAR (salir de Habilitada) — volver a
// Habilitada nunca lo requiere (placeholder de regla de negocio, mismo
// criterio "pendiente de confirmación" que ESTADOS_CRITICOS en
// mockCamasData.js).
export const REQUIERE_MOTIVO = (estadoDestino) => estadoDestino !== 'habilitada';

const AHORA = Date.now();
const DIA_MS = 24 * 60 * 60 * 1000;
const USUARIOS = ['Camilo Grondona', 'Ana Torres', 'Luis Medina', 'Paula Ríos'];
const MOTIVOS_POR_ESTADO = {
  mantenimiento: ['Mantenimiento preventivo programado', 'Reparación de equipo biomédico', 'Revisión eléctrica'],
  'fuera-servicio': ['Daño estructural', 'Equipo dado de baja', 'Pendiente de reposición de mobiliario'],
  bloqueada: ['Bloqueada por brote de aislamiento', 'Bloqueada a solicitud de epidemiología'],
  habilitada: ['Revisión administrativa periódica', 'Alta inicial en el sistema'],
};

const SERVICIOS_ROTACION = SERVICIOS.filter((s) => s.value !== 'todos').map((s) => s.value);
const SEDES_ROTACION = SEDES.filter((s) => s.value !== 'todas').map((s) => s.value);
const PISOS_ROTACION = PISOS.filter((p) => p.value !== 'todos').map((p) => p.value);
const SECTORES_ROTACION = SECTORES.filter((s) => s.value !== 'todos').map((s) => s.value);
const TIPOS_ROTACION = TIPOS_CAMA.filter((t) => t.value !== 'todos').map((t) => t.value);

// 512 camas (encargo, sección 5/14) — 2 camas por habitación. El estado
// administrativo se asigna por bloque de índice, no al azar, para que los 3
// conteos SIN filtrar (Habilitadas 468 / Mantenimiento 12 / Fuera de
// servicio 32) den exactos. Con filtros activos, los 4 KPIs de
// GestionCamasCamas.jsx se recalculan sobre el subconjunto filtrado (ver
// `filterCamas` más abajo) — a diferencia de RESUMEN_KPIS en
// mockResumenData.js, que sí son números fijos de contexto.
const TOTAL = 512;
export const CAMAS = Array.from({ length: TOTAL }, (_, i) => {
  let estado = 'habilitada';
  if (i >= 468 && i < 500) estado = 'fuera-servicio';
  else if (i >= 500) estado = 'mantenimiento';

  const servicio = SERVICIOS_ROTACION[i % SERVICIOS_ROTACION.length];
  const sede = SEDES_ROTACION[i % SEDES_ROTACION.length];
  const piso = PISOS_ROTACION[i % PISOS_ROTACION.length];
  const sector = SECTORES_ROTACION[i % SECTORES_ROTACION.length];
  const tipo = TIPOS_ROTACION[i % TIPOS_ROTACION.length];
  const habitacionIndex = Math.floor(i / 2);
  const codigo = `C-${101 + i}`;
  const estadoDesdeDias = 1 + ((i * 7) % 120);
  const creacionDesdeDias = estadoDesdeDias + 30 + ((i * 3) % 200);

  return {
    id: `CAM-${String(i + 1).padStart(4, '0')}`,
    codigo,
    nombre: `Cama ${101 + i}`,
    habitacionCodigo: `H-${101 + habitacionIndex}`,
    habitacionNombre: `Habitación ${101 + habitacionIndex}`,
    servicio,
    sede,
    piso,
    sector,
    tipo,
    estado,
    estadoDesde: AHORA - estadoDesdeDias * DIA_MS,
    fechaCreacion: AHORA - creacionDesdeDias * DIA_MS,
  };
});

export function generarHistorial(cama) {
  const seed = Number(cama.id.replace(/\D/g, '')) || 0;
  const eventos = [
    {
      id: `${cama.id}-EV1`,
      tipo: 'creacion',
      titulo: 'Cama creada',
      usuario: USUARIOS[(seed + 1) % USUARIOS.length],
      fecha: cama.fechaCreacion,
      motivo: 'Alta inicial en el sistema',
    },
  ];
  if (cama.estado !== 'habilitada') {
    const motivos = MOTIVOS_POR_ESTADO[cama.estado];
    eventos.push({
      id: `${cama.id}-EV2`,
      tipo: 'cambio-estado',
      titulo: `Cambio a ${ESTADO_LABEL[cama.estado]}`,
      usuario: USUARIOS[seed % USUARIOS.length],
      fecha: cama.estadoDesde,
      motivo: motivos[seed % motivos.length],
    });
  } else if (cama.estadoDesde !== cama.fechaCreacion) {
    eventos.push({
      id: `${cama.id}-EV2`,
      tipo: 'cambio-estado',
      titulo: 'Habilitada para uso',
      usuario: USUARIOS[seed % USUARIOS.length],
      fecha: cama.estadoDesde,
      motivo: 'Revisión administrativa periódica',
    });
  }
  return eventos.sort((a, b) => b.fecha - a.fecha);
}

export const FECHA_ACTUALIZACION_OPTIONS = [
  { value: 'todas', label: 'Cualquier fecha' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
];

// Predicado de filtrado puro y síncrono — única fuente de verdad para "qué
// camas cumplen los filtros activos", compartida por `fetchCamas` (la
// tabla, que además simula latencia/fallo de red) y por los KPIs de
// GestionCamasCamas.jsx (que los recalculan en cada cambio de filtro sin
// pasar por esa simulación async, ver encargo "KPIs dinámicos" — a
// diferencia de los KPIs del Bed Board en GestionCamas.jsx, que sí quedan
// fijos sobre el inventario completo). Separado de `fetchCamas` para que
// ambos consumidores no puedan divergir en qué cuenta como "match".
export function filterCamas({
  dataset = CAMAS, query = '', sede = 'todas', servicio = 'todos', estado = 'todos', tipo = 'todos', habitacion = '', piso = 'todos', sector = 'todos', fechaActualizacion = 'todas',
} = {}) {
  const q = query.trim().toLowerCase();
  const habitacionQ = habitacion.trim().toLowerCase();
  const limiteFecha = fechaActualizacion === '7d' ? 7 : fechaActualizacion === '30d' ? 30 : fechaActualizacion === '90d' ? 90 : null;

  return dataset.filter((c) => {
    if (sede !== 'todas' && c.sede !== sede) return false;
    if (servicio !== 'todos' && c.servicio !== servicio) return false;
    if (estado !== 'todos' && c.estado !== estado) return false;
    if (tipo !== 'todos' && c.tipo !== tipo) return false;
    if (piso !== 'todos' && c.piso !== piso) return false;
    if (sector !== 'todos' && c.sector !== sector) return false;
    if (habitacionQ && !c.habitacionCodigo.toLowerCase().includes(habitacionQ) && !c.habitacionNombre.toLowerCase().includes(habitacionQ)) return false;
    if (limiteFecha !== null && (AHORA - c.estadoDesde) > limiteFecha * DIA_MS) return false;
    if (!q) return true;
    return (
      c.codigo.toLowerCase().includes(q)
      || c.nombre.toLowerCase().includes(q)
      || c.habitacionCodigo.toLowerCase().includes(q)
      || c.habitacionNombre.toLowerCase().includes(q)
      || SERVICIO_LABEL[c.servicio].toLowerCase().includes(q)
      || SEDE_LABEL[c.sede].toLowerCase().includes(q)
    );
  });
}

const FETCH_DELAY_MS = 450;

// Simula el fetch server-side (paginación + latencia/fallo de red) — mismo
// patrón que fetchAdmisiones (mockAdmisionesData.js): Promise + setTimeout,
// para poder tener un estado "loading" real entre cambios de filtro/página.
// ~1 de cada 14 llamadas falla a propósito (mismo criterio que
// handleRefresh en GestionCamas.jsx) para poder mostrar el estado de error
// del encargo sin depender de una falla de red real. El filtrado en sí vive
// en `filterCamas` (arriba) — acá solo se le agrega la paginación.
export function fetchCamas({
  dataset = CAMAS, query = '', sede = 'todas', servicio = 'todos', estado = 'todos', tipo = 'todos', habitacion = '', piso = 'todos', sector = 'todos', fechaActualizacion = 'todas', page = 1, pageSize = 10,
} = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.07) {
        reject(new Error('No pudimos cargar las camas.'));
        return;
      }
      const filtradas = filterCamas({
        dataset, query, sede, servicio, estado, tipo, habitacion, piso, sector, fechaActualizacion,
      });
      const total = filtradas.length;
      const start = (page - 1) * pageSize;
      const items = filtradas.slice(start, start + pageSize);
      resolve({ items, total });
    }, FETCH_DELAY_MS);
  });
}
