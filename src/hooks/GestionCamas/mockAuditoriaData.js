// Mock de "Auditoría / Historial" — registro de TRAZABILIDAD (qué ocurrió,
// cuándo, sobre qué entidad, quién y qué cambió), separado de
// mockCamasAdminData.js/mockIntegridadData.js/mockIndicadoresData.js: acá
// no hay estado actual ni análisis, solo eventos históricos e INMUTABLES
// (encargo sección 18 — sin acciones de editar/eliminar en ningún
// componente de esta pantalla). También distinto de "Actividad reciente"
// del Bed Board (encargo sección 19): eso es operación en curso, esto es
// trazabilidad administrativa — por eso ninguno de estos eventos expira ni
// se "resuelve" solo.

export function formatFechaHora(timestampMs) {
  const d = new Date(timestampMs);
  const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${fecha} · ${hora}`;
}

export const PERIODOS = [
  { value: 'hoy', label: 'Hoy' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
  { value: 'personalizado', label: 'Personalizado' },
];

// Tono semántico por tipo de evento (encargo, sección 8) — "Eliminación" es
// el ÚNICO crítico (rojo): el resto usa informativo/positivo/advertencia/
// neutral aunque el evento "suene importante" (encargo explícito: "evitar
// usar rojo simplemente porque una acción sea importante"). Incluye los 4
// tipos de origen Integridad (sección 13): Detección/Corrección/
// Verificación/Ignorado.
export const TIPOS_EVENTO = [
  { value: 'todos', label: 'Todos' },
  { value: 'creacion', label: 'Creación', tono: 'info' },
  { value: 'modificacion', label: 'Modificación', tono: 'info' },
  { value: 'cambio-estado', label: 'Cambio de estado', tono: 'info' },
  { value: 'asignacion', label: 'Asignación', tono: 'success' },
  { value: 'traslado', label: 'Traslado', tono: 'info' },
  { value: 'mantenimiento', label: 'Mantenimiento', tono: 'warning' },
  { value: 'eliminacion', label: 'Eliminación', tono: 'danger' },
  { value: 'consulta', label: 'Consulta', tono: 'neutral' },
  { value: 'verificacion', label: 'Verificación', tono: 'info' },
  { value: 'deteccion', label: 'Detección', tono: 'warning' },
  { value: 'correccion', label: 'Corrección', tono: 'success' },
  { value: 'ignorado', label: 'Ignorado', tono: 'neutral' },
];
export const TIPO_LABEL = Object.fromEntries(TIPOS_EVENTO.map((t) => [t.value, t.label]));
export const TIPO_TONO = Object.fromEntries(TIPOS_EVENTO.filter((t) => t.value !== 'todos').map((t) => [t.value, t.tono]));

export const MODULOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'camas', label: 'Camas' },
  { value: 'bed-board', label: 'Bed Board' },
  { value: 'configuracion', label: 'Configuración' },
  { value: 'integridad', label: 'Integridad' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
];
export const MODULO_LABEL = Object.fromEntries(MODULOS.map((m) => [m.value, m.label]));

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
  { value: 'hospitalizacion', label: 'Hospitalización' },
  { value: 'pediatria', label: 'Pediatría' },
];
export const SERVICIO_LABEL = Object.fromEntries(SERVICIOS.map((s) => [s.value, s.label]));

const USUARIOS_BASE = [
  { nombre: 'Laura Pérez', email: 'lperez@clinic.com' },
  { nombre: 'Jorge Ruiz', email: 'jruiz@clinic.com' },
  { nombre: 'Camila Torres', email: 'ctorres@clinic.com' },
  { nombre: 'Carlos Méndez', email: 'cmendez@clinic.com' },
  { nombre: 'Ana Torres', email: 'atorres@clinic.com' },
];
export const USUARIOS = [
  { value: 'todos', label: 'Todos los usuarios' },
  ...USUARIOS_BASE.map((u) => ({ value: u.email, label: u.nombre })),
];
export const USUARIO_LABEL = Object.fromEntries(USUARIOS.map((u) => [u.value, u.label]));

// Indicadores de actividad (encargo, sección 5) — números fijos de contexto
// del período seleccionado, mismo criterio que KPI_PRINCIPALES en
// mockIndicadoresData.js: NO se recalculan a partir del dataset de eventos
// de abajo (ese es más chico a propósito, ver EVENTOS más abajo — mismo
// criterio de "no fabricar más mock del necesario" que el resto del
// proyecto). Son contexto de auditoría, no KPIs operativos.
export const INDICADORES_ACTIVIDAD = {
  total: 1248, camasAfectadas: 312, usuarios: 28, modificaciones: 856, eliminaciones: 28, consultas: 364,
};

const AHORA = Date.now();
const DIA_MS = 24 * 60 * 60 * 1000;
const MIN_MS = 60 * 1000;

// 8 eventos EXACTOS del encargo (sección 7) — primero en la lista (más
// recientes), con toda la info de detalle que pide la sección 9-12
// (valores antes/después, información adicional, ID). El resto del dataset
// (GENERADOS, más abajo) cicla estas mismas 8 "formas" con otros usuarios/
// camas/fechas para poblar la paginación sin inventar un volumen que el
// mock no necesita mostrar de a uno.
export const EVENTOS_EJEMPLO = [
  {
    id: 'EVT-20250521-0001248',
    fecha: AHORA - 45 * MIN_MS,
    tipo: 'modificacion',
    titulo: 'Cambio de estado',
    descripcion: 'La cama cambió de "Disponible" a "Ocupada".',
    entidadLabel: 'C-101 · Cama 101',
    modulo: 'camas',
    sede: 'centro',
    servicio: 'uci-adultos',
    usuario: 'lperez@clinic.com',
    valores: [{ campo: 'Estado', antes: 'Disponible', despues: 'Ocupada' }],
    ip: '190.25.45.12',
    dispositivo: 'Escritorio · Chrome',
  },
  {
    id: 'EVT-20250521-0001247',
    fecha: AHORA - 62 * MIN_MS,
    tipo: 'asignacion',
    titulo: 'Asignación de paciente',
    descripcion: 'Paciente asignado a la cama.',
    entidadLabel: 'C-103 · Cama 103',
    modulo: 'bed-board',
    sede: 'centro',
    servicio: 'uci-adultos',
    usuario: 'jruiz@clinic.com',
    ip: '190.25.45.30',
    dispositivo: 'Tablet · Safari',
  },
  {
    id: 'EVT-20250521-0001246',
    fecha: AHORA - 78 * MIN_MS,
    tipo: 'modificacion',
    titulo: 'Actualización de servicio',
    descripcion: 'Se actualizó el servicio asociado a la cama.',
    entidadLabel: 'C-201 · Cama 201',
    modulo: 'camas',
    sede: 'norte',
    servicio: 'hospitalizacion',
    usuario: 'ctorres@clinic.com',
    valores: [{ campo: 'Servicio', antes: 'Hospitalización', despues: 'UCI Adultos' }],
    ip: '190.25.45.18',
    dispositivo: 'Escritorio · Edge',
  },
  {
    id: 'EVT-20250520-0001245',
    fecha: AHORA - 1 * DIA_MS - 2 * 60 * MIN_MS,
    tipo: 'eliminacion',
    titulo: 'Eliminación de reserva',
    descripcion: 'Reserva eliminada manualmente.',
    entidadLabel: 'Reserva #R-4587 · Cama C-205',
    modulo: 'bed-board',
    sede: 'sur',
    servicio: 'uci-adultos',
    usuario: 'cmendez@clinic.com',
    ip: '190.25.45.44',
    dispositivo: 'Escritorio · Chrome',
  },
  {
    id: 'EVT-20250520-0001244',
    fecha: AHORA - 1 * DIA_MS - 3 * 60 * MIN_MS - 25 * MIN_MS,
    tipo: 'mantenimiento',
    titulo: 'Inicio de mantenimiento',
    descripcion: 'Se inició mantenimiento preventivo.',
    entidadLabel: 'H-202 · Habitación 202',
    modulo: 'mantenimiento',
    sede: 'centro',
    servicio: 'hospitalizacion',
    usuario: 'atorres@clinic.com',
    ip: '190.25.45.09',
    dispositivo: 'Escritorio · Chrome',
  },
  {
    id: 'EVT-20250520-0001243',
    fecha: AHORA - 1 * DIA_MS - 4 * 60 * MIN_MS,
    tipo: 'modificacion',
    titulo: 'Edición de configuración',
    descripcion: 'Se actualizó el tipo de cama.',
    entidadLabel: 'C-302 · Cama 302',
    modulo: 'configuracion',
    sede: 'norte',
    servicio: 'pediatria',
    usuario: 'lperez@clinic.com',
    valores: [{ campo: 'Tipo de cama', antes: 'Estándar', despues: 'UCI' }],
    ip: '190.25.45.12',
    dispositivo: 'Escritorio · Chrome',
  },
  {
    id: 'EVT-20250519-0001242',
    fecha: AHORA - 2 * DIA_MS + 3 * 60 * MIN_MS,
    tipo: 'consulta',
    titulo: 'Consulta de información',
    descripcion: 'Detalle de cama consultado.',
    entidadLabel: 'C-104 · Cama 104',
    modulo: 'camas',
    sede: 'centro',
    servicio: 'uci-adultos',
    usuario: 'jruiz@clinic.com',
    ip: '190.25.45.30',
    dispositivo: 'Tablet · Safari',
  },
  {
    id: 'EVT-20250519-0001241',
    fecha: AHORA - 2 * DIA_MS + 40 * MIN_MS,
    tipo: 'traslado',
    titulo: 'Traslado de paciente',
    descripcion: 'Paciente trasladado entre camas.',
    entidadLabel: 'C-105 → C-106',
    modulo: 'bed-board',
    sede: 'sur',
    servicio: 'hospitalizacion',
    usuario: 'ctorres@clinic.com',
    ip: '190.25.45.18',
    dispositivo: 'Escritorio · Edge',
  },
  // Trazabilidad Integridad → Corrección → Auditoría (encargo, sección 13):
  // los 4 tipos de evento de origen Integridad, incluyendo una
  // inconsistencia que YA fue corregida pero sigue viva acá (encargo:
  // "la auditoría debe conservar incluso las inconsistencias que
  // posteriormente fueron corregidas o ignoradas").
  {
    id: 'EVT-20250518-0001240',
    fecha: AHORA - 3 * DIA_MS,
    tipo: 'correccion',
    titulo: 'Inconsistencia corregida',
    descripcion: 'Se corrigió el estado de la cama C-205 de "Libre" a "En mantenimiento".',
    entidadLabel: 'C-205 · Inconsistencia INC-003',
    modulo: 'integridad',
    sede: 'sur',
    servicio: 'hospitalizacion',
    usuario: 'atorres@clinic.com',
    valores: [{ campo: 'Estado', antes: 'Libre', despues: 'En mantenimiento' }],
    ip: '190.25.45.09',
    dispositivo: 'Escritorio · Chrome',
  },
  {
    id: 'EVT-20250518-0001239',
    fecha: AHORA - 3 * DIA_MS - 20 * MIN_MS,
    tipo: 'deteccion',
    titulo: 'Inconsistencia detectada',
    descripcion: 'Cama ocupada sin paciente asignado.',
    entidadLabel: 'C-101 · Inconsistencia INC-001',
    modulo: 'integridad',
    sede: 'centro',
    servicio: 'uci-adultos',
    usuario: 'todos',
    usuarioLabel: 'Verificación del sistema',
    ip: null,
    dispositivo: null,
  },
  {
    id: 'EVT-20250517-0001238',
    fecha: AHORA - 4 * DIA_MS,
    tipo: 'ignorado',
    titulo: 'Inconsistencia ignorada',
    descripcion: 'Habitación de uso administrativo, no aplica capacidad de camas.',
    entidadLabel: 'H-410 · Inconsistencia INC-009',
    modulo: 'integridad',
    sede: 'norte',
    servicio: null,
    usuario: 'lperez@clinic.com',
    ip: '190.25.45.12',
    dispositivo: 'Escritorio · Chrome',
  },
  {
    id: 'EVT-20250517-0001237',
    fecha: AHORA - 4 * DIA_MS - 45 * MIN_MS,
    tipo: 'verificacion',
    titulo: 'Verificación ejecutada',
    descripcion: 'Verificación de integridad ejecutada — 7 inconsistencias detectadas.',
    entidadLabel: 'Verificación VER-003',
    modulo: 'integridad',
    sede: 'centro',
    servicio: null,
    usuario: 'todos',
    usuarioLabel: 'Camilo Grondona',
    ip: '190.25.45.02',
    dispositivo: 'Escritorio · Chrome',
  },
];

const CAMAS_CICLO = ['C-101', 'C-102', 'C-103', 'C-201', 'C-205', 'C-302', 'H-202', 'H-305'];
const SEDES_CICLO = ['centro', 'norte', 'sur'];
const SERVICIOS_CICLO = ['uci-adultos', 'hospitalizacion', 'pediatria'];

// Genera volumen adicional ciclando las mismas 8 formas de evento (sin
// duplicar el texto exacto de EVENTOS_EJEMPLO) para que la tabla/paginación
// tengan varias páginas que explorar — determinístico (sin Math.random),
// mismo criterio que CAMAS en mockCamasAdminData.js.
function generarEventosAdicionales(cantidad) {
  const plantillas = [
    { tipo: 'modificacion', titulo: 'Cambio de estado', descripcion: 'La cama cambió de estado.', modulo: 'camas' },
    { tipo: 'consulta', titulo: 'Consulta de información', descripcion: 'Detalle de cama consultado.', modulo: 'camas' },
    { tipo: 'asignacion', titulo: 'Asignación de paciente', descripcion: 'Paciente asignado a la cama.', modulo: 'bed-board' },
    { tipo: 'traslado', titulo: 'Traslado de paciente', descripcion: 'Paciente trasladado entre camas.', modulo: 'bed-board' },
    { tipo: 'mantenimiento', titulo: 'Fin de mantenimiento', descripcion: 'Se finalizó mantenimiento preventivo.', modulo: 'mantenimiento' },
    { tipo: 'creacion', titulo: 'Cama creada', descripcion: 'Se registró una nueva cama en el sistema.', modulo: 'camas' },
    { tipo: 'modificacion', titulo: 'Edición de configuración', descripcion: 'Se actualizó la habitación asociada a la cama.', modulo: 'configuracion' },
    { tipo: 'eliminacion', titulo: 'Eliminación de reserva', descripcion: 'Reserva eliminada manualmente.', modulo: 'bed-board' },
  ];
  return Array.from({ length: cantidad }, (_, i) => {
    const plantilla = plantillas[i % plantillas.length];
    const cama = CAMAS_CICLO[i % CAMAS_CICLO.length];
    const usuario = USUARIOS_BASE[i % USUARIOS_BASE.length];
    return {
      id: `EVT-${String(20250101 + i)}-${String(1229 - i).padStart(7, '0')}`,
      fecha: AHORA - (5 * DIA_MS) - i * 5 * 60 * MIN_MS,
      tipo: plantilla.tipo,
      titulo: plantilla.titulo,
      descripcion: plantilla.descripcion,
      entidadLabel: `${cama} · Cama ${cama.replace(/\D/g, '')}`,
      modulo: plantilla.modulo,
      sede: SEDES_CICLO[i % SEDES_CICLO.length],
      servicio: SERVICIOS_CICLO[i % SERVICIOS_CICLO.length],
      usuario: usuario.email,
      ip: `190.25.45.${10 + (i % 80)}`,
      dispositivo: i % 3 === 0 ? 'Tablet · Safari' : 'Escritorio · Chrome',
    };
  });
}

export const EVENTOS = [...EVENTOS_EJEMPLO, ...generarEventosAdicionales(52)];

const FETCH_DELAY_MS = 400;

// Simula el fetch server-side (búsqueda + filtros + orden + paginación) —
// mismo patrón que fetchCamas/fetchInconsistencias.
export function fetchEventos({
  dataset = EVENTOS, query = '', tipo = 'todos', modulo = 'todos', usuario = 'todos', sede = 'todas', servicio = 'todos', habitacion = '',
  sortKey = 'fecha', sortDir = 'desc', page = 1, pageSize = 10,
} = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.06) {
        reject(new Error('No pudimos cargar el historial.'));
        return;
      }
      const q = query.trim().toLowerCase();
      const habitacionQ = habitacion.trim().toLowerCase();

      const filtrados = dataset.filter((e) => {
        if (tipo !== 'todos' && e.tipo !== tipo) return false;
        if (modulo !== 'todos' && e.modulo !== modulo) return false;
        if (usuario !== 'todos' && e.usuario !== usuario) return false;
        if (sede !== 'todas' && e.sede !== sede) return false;
        if (servicio !== 'todos' && e.servicio !== servicio) return false;
        if (habitacionQ && !e.entidadLabel.toLowerCase().includes(habitacionQ)) return false;
        if (!q) return true;
        return (
          e.id.toLowerCase().includes(q)
          || e.titulo.toLowerCase().includes(q)
          || e.descripcion.toLowerCase().includes(q)
          || e.entidadLabel.toLowerCase().includes(q)
          || (USUARIO_LABEL[e.usuario] ?? e.usuarioLabel ?? '').toLowerCase().includes(q)
        );
      });

      const ordenados = [...filtrados].sort((a, b) => {
        let diff;
        if (sortKey === 'fecha') diff = a.fecha - b.fecha;
        else if (sortKey === 'tipo') diff = TIPO_LABEL[a.tipo].localeCompare(TIPO_LABEL[b.tipo]);
        else if (sortKey === 'usuario') diff = (USUARIO_LABEL[a.usuario] ?? a.usuarioLabel ?? '').localeCompare(USUARIO_LABEL[b.usuario] ?? b.usuarioLabel ?? '');
        else if (sortKey === 'modulo') diff = MODULO_LABEL[a.modulo].localeCompare(MODULO_LABEL[b.modulo]);
        else diff = 0;
        return sortDir === 'asc' ? diff : -diff;
      });

      const total = ordenados.length;
      const start = (page - 1) * pageSize;
      const items = ordenados.slice(start, start + pageSize);
      resolve({ items, total });
    }, FETCH_DELAY_MS);
  });
}
