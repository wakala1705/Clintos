// Mock de "Integridad" (requerimiento #32 — Control de inconsistencias) —
// separado de mockCamasAdminData.js: estas inconsistencias son problemas de
// CALIDAD/COHERENCIA de datos (camas/pacientes/reservas/mantenimiento vs. lo
// configurado), no el maestro de camas en sí ni nada clínico (ver encargo
// sección 16: "no debe usar el mismo tratamiento visual que una alerta
// clínica" — por eso los tokens acá son los administrativos rojo/ámbar/azul
// ya usados en el resto del módulo, nunca el lenguaje de TriageBadge).

export function formatFechaHora(timestampMs) {
  const d = new Date(timestampMs);
  const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${fecha}, ${hora}`;
}
export function formatFecha(timestampMs) {
  return new Date(timestampMs).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function formatHoraRelativa(timestampMs, nowMs = Date.now()) {
  const d = new Date(timestampMs);
  const hoy = new Date(nowMs);
  const esHoy = d.toDateString() === hoy.toDateString();
  const ayer = new Date(nowMs - 24 * 60 * 60 * 1000);
  const esAyer = d.toDateString() === ayer.toDateString();
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (esHoy) return `Hoy, ${hora}`;
  if (esAyer) return `Ayer, ${hora}`;
  return formatFechaHora(timestampMs);
}

export const TIPOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'ocupada-sin-paciente', label: 'Cama ocupada sin paciente' },
  { value: 'paciente-duplicado', label: 'Paciente con dos camas activas' },
  { value: 'mantenimiento-libre', label: 'Mantenimiento con estado libre' },
  { value: 'reserva-vencida', label: 'Reserva vencida' },
  { value: 'capacidad-no-configurada', label: 'Capacidad no configurada' },
];
export const TIPO_LABEL = Object.fromEntries(TIPOS.map((t) => [t.value, t.label]));

export const IMPACTOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'critico', label: 'Crítico', color: 'red' },
  { value: 'advertencia', label: 'Advertencia', color: 'orange' },
  { value: 'informativa', label: 'Informativa', color: 'blue' },
];
export const IMPACTO_LABEL = Object.fromEntries(IMPACTOS.map((i) => [i.value, i.label]));
export const IMPACTO_COLOR = Object.fromEntries(IMPACTOS.filter((i) => i.value !== 'todos').map((i) => [i.value, i.color]));

export const ESTADOS = [
  { value: 'activa', label: 'Activas' },
  { value: 'ignorada', label: 'Ignoradas' },
  { value: 'corregida', label: 'Corregidas' },
  { value: 'todas', label: 'Todas' },
];
export const ESTADO_LABEL = { activa: 'Activa', ignorada: 'Ignorada', corregida: 'Corregida' };

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
];
export const SERVICIO_LABEL = Object.fromEntries(SERVICIOS.map((s) => [s.value, s.label]));

const AHORA = Date.now();
const HORA_MS = 60 * 60 * 1000;

// Stand-in local de "el backend dice qué puede hacer este usuario" (mismo
// criterio que ESTADOS_CRITICOS/REQUIERE_MOTIVO en mockCamasAdminData.js) —
// Ignorar solo se ofrece si el usuario tiene el permiso (encargo, sección 7:
// "Solo mostrarla si el usuario tiene permisos suficientes"). El usuario de
// este prototipo (Camilo Grondona, Administrador) siempre lo tiene.
export const PUEDE_IGNORAR = true;

// 5 casos EXACTOS del requerimiento #32 (encargo, sección 6) + 2 adicionales
// ya corregida/ignorada (para poder mostrar esos 2 estados en la tabla sin
// depender de que el usuario resuelva algo primero) — total 7 activas, que
// es el número que pide la sección 4 (7/3/3/1).
export const INCONSISTENCIAS_INICIALES = [
  {
    id: 'INC-001',
    tipo: 'ocupada-sin-paciente',
    titulo: '2 camas ocupadas sin paciente',
    descripcion: 'Camas marcadas como ocupadas pero sin paciente asignado.',
    impacto: 'critico',
    estado: 'activa',
    sede: 'centro',
    servicio: 'uci-adultos',
    camas: ['C-101', 'C-102'],
    detectadoEn: AHORA - 45 * 60 * 1000,
  },
  {
    id: 'INC-002',
    tipo: 'paciente-duplicado',
    titulo: '1 paciente con dos camas activas',
    descripcion: 'El paciente Juan Pérez tiene dos camas activas simultáneamente.',
    impacto: 'critico',
    estado: 'activa',
    sede: 'norte',
    servicio: 'hospitalizacion',
    paciente: 'Juan Pérez',
    camas: ['H-118', 'H-121'],
    detectadoEn: AHORA - 5 * HORA_MS,
  },
  {
    id: 'INC-003',
    tipo: 'mantenimiento-libre',
    titulo: '3 camas con mantenimiento y estado libre',
    descripcion: 'Camas en mantenimiento que aparecen como disponibles.',
    impacto: 'advertencia',
    estado: 'activa',
    sede: 'centro',
    servicio: 'hospitalizacion',
    camas: ['H-201', 'H-202', 'H-203'],
    detectadoEn: AHORA - 22 * HORA_MS,
  },
  {
    id: 'INC-004',
    tipo: 'reserva-vencida',
    titulo: '1 reserva vencida',
    descripcion: 'Reserva expirada hace más de 24 horas.',
    impacto: 'advertencia',
    estado: 'activa',
    sede: 'sur',
    servicio: 'uci-adultos',
    camas: ['C-205'],
    detectadoEn: AHORA - 25 * HORA_MS,
  },
  {
    id: 'INC-005',
    tipo: 'capacidad-no-configurada',
    titulo: '2 habitaciones sin capacidad configurada',
    descripcion: 'Habitaciones sin número máximo de camas definido.',
    impacto: 'informativa',
    estado: 'activa',
    sede: 'centro',
    servicio: null,
    habitaciones: ['H-305', 'H-306'],
    detectadoEn: AHORA - 26 * 60 * 60 * 1000 - 40 * 60 * 1000,
  },
  {
    id: 'INC-006',
    tipo: 'ocupada-sin-paciente',
    titulo: '1 cama ocupada sin paciente',
    descripcion: 'Cama marcada como ocupada pero sin paciente asignado.',
    impacto: 'critico',
    estado: 'activa',
    sede: 'norte',
    servicio: 'hospitalizacion',
    camas: ['H-140'],
    detectadoEn: AHORA - 3 * 24 * HORA_MS,
  },
  {
    id: 'INC-007',
    tipo: 'reserva-vencida',
    titulo: '1 reserva vencida',
    descripcion: 'Reserva expirada hace más de 24 horas.',
    impacto: 'advertencia',
    estado: 'activa',
    sede: 'centro',
    servicio: 'uci-adultos',
    camas: ['C-310'],
    detectadoEn: AHORA - 4 * 24 * HORA_MS,
  },
  {
    id: 'INC-008',
    tipo: 'mantenimiento-libre',
    titulo: '1 cama con mantenimiento y estado libre',
    descripcion: 'Cama en mantenimiento que aparece como disponible.',
    impacto: 'advertencia',
    estado: 'corregida',
    sede: 'sur',
    servicio: 'hospitalizacion',
    camas: ['H-402'],
    detectadoEn: AHORA - 6 * 24 * HORA_MS,
    resueltoPor: 'Ana Torres',
    resueltoEn: AHORA - 5 * 24 * HORA_MS,
  },
  {
    id: 'INC-009',
    tipo: 'capacidad-no-configurada',
    titulo: '1 habitación sin capacidad configurada',
    descripcion: 'Habitación sin número máximo de camas definido.',
    impacto: 'informativa',
    estado: 'ignorada',
    sede: 'norte',
    servicio: null,
    habitaciones: ['H-410'],
    detectadoEn: AHORA - 9 * 24 * HORA_MS,
    resueltoPor: 'Luis Medina',
    resueltoEn: AHORA - 8 * 24 * HORA_MS,
    motivo: 'Habitación de uso administrativo, no aplica capacidad de camas.',
  },
];

// Historial de corridas de verificación (encargo, sección 13) — cada
// "Verificar ahora" agrega una entrada acá (ver GestionCamasIntegridad.jsx).
export const HISTORIAL_VERIFICACIONES_INICIAL = [
  {
    id: 'VER-003',
    fecha: AHORA - 45 * 60 * 1000,
    usuario: 'Camilo Grondona',
    encontradas: 7,
    corregidas: 0,
    resultado: 'Se detectaron 7 inconsistencias que requieren revisión.',
  },
  {
    id: 'VER-002',
    fecha: AHORA - 5 * 24 * HORA_MS,
    usuario: 'Ana Torres',
    encontradas: 8,
    corregidas: 1,
    resultado: 'Se detectaron 8 inconsistencias que requieren revisión.',
  },
  {
    id: 'VER-001',
    fecha: AHORA - 8 * 24 * HORA_MS,
    usuario: 'Proceso automático (diario)',
    encontradas: 9,
    corregidas: 1,
    resultado: 'Se detectaron 9 inconsistencias que requieren revisión.',
  },
];

export const ULTIMA_VERIFICACION_INICIAL = HISTORIAL_VERIFICACIONES_INICIAL[0].fecha;

const FETCH_DELAY_MS = 400;

// Simula el fetch server-side (búsqueda + filtros + paginación) — mismo
// patrón que fetchCamas (mockCamasAdminData.js): Promise + setTimeout, con
// una falla ocasional para poder mostrar el estado de error del encargo
// (sección 15) sin depender de una falla de red real.
export function fetchInconsistencias({
  dataset, query = '', tipo = 'todos', impacto = 'todos', estado = 'activa', sede = 'todas', servicio = 'todos', detectado = 'cualquiera', page = 1, pageSize = 5,
} = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.06) {
        reject(new Error('No fue posible completar la verificación.'));
        return;
      }
      const q = query.trim().toLowerCase();
      const limiteHoras = detectado === '24h' ? 24 : detectado === '7d' ? 24 * 7 : detectado === '30d' ? 24 * 30 : null;

      const filtradas = dataset.filter((i) => {
        if (estado !== 'todas' && i.estado !== estado) return false;
        if (tipo !== 'todos' && i.tipo !== tipo) return false;
        if (impacto !== 'todos' && i.impacto !== impacto) return false;
        if (sede !== 'todas' && i.sede !== sede) return false;
        if (servicio !== 'todos' && i.servicio !== servicio) return false;
        if (limiteHoras !== null && (Date.now() - i.detectadoEn) > limiteHoras * HORA_MS) return false;
        if (!q) return true;
        return (
          i.titulo.toLowerCase().includes(q)
          || i.descripcion.toLowerCase().includes(q)
          || (i.camas ?? []).some((c) => c.toLowerCase().includes(q))
          || (i.habitaciones ?? []).some((h) => h.toLowerCase().includes(q))
          || (i.paciente ?? '').toLowerCase().includes(q)
          || SERVICIO_LABEL[i.servicio]?.toLowerCase().includes(q)
          || SEDE_LABEL[i.sede].toLowerCase().includes(q)
        );
      });

      const total = filtradas.length;
      const start = (page - 1) * pageSize;
      const items = filtradas.slice(start, start + pageSize);
      resolve({ items, total });
    }, FETCH_DELAY_MS);
  });
}
