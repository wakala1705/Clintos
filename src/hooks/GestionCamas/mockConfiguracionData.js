// Mock de "Configuración" — administra los CATÁLOGOS y PARÁMETROS que
// gobiernan Camas/Integridad/Indicadores (encargo sección 22/23: "Camas =
// registros, Configuración = catálogos y reglas"; "Configuración define las
// reglas, Integridad detecta cuando los datos las incumplen"). Por eso este
// mock no modela camas individuales (eso vive en mockCamasAdminData.js) —
// solo el catálogo en sí (cantidad configurada + ejemplos) y su bitácora de
// cambios recientes, que a su vez es un subconjunto de lo que ya vive en
// Auditoría/Historial (ver mockAuditoriaData.js, módulo "configuracion").

export function formatFechaHora(timestampMs) {
  const d = new Date(timestampMs);
  const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${fecha} · ${hora}`;
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
  { value: 'hospitalizacion', label: 'Hospitalización' },
];
export const SERVICIO_LABEL = Object.fromEntries(SERVICIOS.map((s) => [s.value, s.label]));

// "Estado" del filtro rápido (encargo, sección 3) — se aplica sobre el
// RESULTADO del cambio en "Cambios recientes" (cada registro deja el
// catálogo tocado en Activo o Inactivo), no sobre las 8 cards del catálogo:
// esas son siempre las mismas 8 categorías, filtrarlas por "activo/inactivo"
// no tiene un dato real detrás (una card no "está inactiva").
export const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

const RANGO_OPTIONS_HORAS = { '7d': 24 * 7, '30d': 24 * 30 };
export const RANGO_CAMBIOS_OPTIONS = [
  { value: 'cualquiera', label: 'Cualquier fecha' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
];

// Permisos RBAC (encargo, sección 20/21) — stand-in local, mismo criterio
// que PUEDE_IGNORAR en mockIntegridadData.js: el usuario de este prototipo
// (Camilo Grondona, Administrador) siempre los tiene. Un rol de solo lectura
// cambiaría estas 5 constantes a false y las cards seguirían navegables
// (encargo explícito) pero sin CTAs de edición ni Acciones rápidas.
export const PUEDE_EDITAR = true;
export const PUEDE_IMPORTAR = true;
export const PUEDE_EXPORTAR = true;
export const PUEDE_DUPLICAR = true;
export const PUEDE_RESTABLECER = true;

// Los 8 catálogos del encargo (secciones 5-12) — "cantidad configurada" es
// estática (no se recalcula desde ningún listado real: ese listado no existe
// en este prototipo, mismo criterio de "no fabricar datos que el mock no
// modela" del resto del módulo). `id` de cada uno coincide con el que usa
// Auditoría para el campo Módulo/origen cuando el evento nace acá.
export const CATALOGOS = [
  {
    id: 'tipos-cama',
    nombre: 'Tipos de cama',
    descripcion: 'Define los tipos de cama disponibles en el hospital.',
    cantidad: 12,
    unidad: 'tipos configurados',
    icon: 'LuBedDouble',
    ejemplos: ['Estándar', 'UCI', 'Pediátrica', 'Obstétrica'],
  },
  {
    id: 'estados-cama',
    nombre: 'Estados de cama',
    descripcion: 'Estados que puede tener una cama durante su ciclo operativo.',
    cantidad: 8,
    unidad: 'estados configurados',
    icon: 'LuListChecks',
    ejemplos: ['Libre', 'Ocupada', 'Reservada', 'En limpieza', 'En mantenimiento', 'Fuera de servicio'],
    soloLectura: true, // "estados definidos por el sistema" (encargo, sección 6) — se administran, no se crean nuevos.
  },
  {
    id: 'motivos-cambio-estado',
    nombre: 'Motivos de cambio de estado',
    descripcion: 'Motivos utilizados al cambiar el estado de una cama.',
    cantidad: 16,
    unidad: 'motivos configurados',
    icon: 'LuClipboardList',
    ejemplos: ['Limpieza', 'Mantenimiento', 'Traslado', 'Daño', 'Bloqueo temporal'],
  },
  {
    id: 'motivos-fuera-servicio',
    nombre: 'Motivos de fuera de servicio',
    descripcion: 'Motivos por los cuales una cama queda fuera de servicio.',
    cantidad: 10,
    unidad: 'motivos configurados',
    icon: 'LuWrench',
    ejemplos: ['Daño', 'Mantenimiento', 'Adecuación', 'Reparación', 'Baja temporal'],
  },
  {
    id: 'reglas-validacion',
    nombre: 'Reglas de validación',
    descripcion: 'Reglas que aseguran la consistencia e integridad de los datos.',
    cantidad: 14,
    unidad: 'reglas activas',
    icon: 'LuShieldCheck',
    // A diferencia de los otros 7 catálogos (ejemplos = strings de solo
    // lectura en la card/modal), acá cada ejemplo es un objeto con estado
    // propio: son las 4 únicas reglas con activar/desactivar real (encargo,
    // sección 9) — `critico` decide si ese toggle exige confirmación inline
    // antes de aplicarse (ver CatalogoDetailModal.jsx).
    ejemplos: [
      { texto: 'Un paciente no puede tener dos camas activas.', activa: true, critico: true },
      { texto: 'Una cama ocupada debe tener un paciente asociado.', activa: true, critico: true },
      { texto: 'Una cama en mantenimiento no puede estar disponible.', activa: true, critico: false },
      { texto: 'Una reserva vencida no debe permanecer activa.', activa: true, critico: false },
    ],
  },
  {
    id: 'parametros-generales',
    nombre: 'Parámetros generales',
    descripcion: 'Parámetros que controlan el comportamiento del sistema.',
    cantidad: 9,
    unidad: 'parámetros configurados',
    icon: 'LuSettings2',
    ejemplos: ['Liberación automática', 'Bloqueo de reservas vencidas', 'Confirmación doble al dar de baja'],
  },
  {
    id: 'tiempos-estandar',
    nombre: 'Tiempos estándar',
    descripcion: 'Tiempos de referencia utilizados en los procesos de camas.',
    cantidad: 6,
    unidad: 'tiempos configurados',
    icon: 'LuTimer',
    ejemplos: ['Tiempo estándar de limpieza', 'Tiempo de liberación', 'Tiempo de mantenimiento'],
  },
  {
    id: 'notificaciones',
    nombre: 'Notificaciones',
    descripcion: 'Configuración de alertas y notificaciones relacionadas con camas.',
    cantidad: 7,
    unidad: 'notificaciones activas',
    icon: 'LuBell',
    ejemplos: ['Cama disponible', 'Reserva próxima a vencer', 'Inconsistencia detectada', 'Mantenimiento requerido'],
  },
];
export const CATALOGO_LABEL = Object.fromEntries(CATALOGOS.map((c) => [c.id, c.nombre]));

const AHORA = Date.now();
const HORA_MS = 60 * 60 * 1000;
const DIA_MS = 24 * HORA_MS;

// 5 registros EXACTOS del encargo (sección 13) — cada uno también existe
// como evento de Auditoría/Historial con módulo "configuracion" (encargo
// sección 14: "el usuario no debe tener que registrar manualmente el
// cambio"); acá solo se muestra el atajo de los más recientes, la
// trazabilidad completa vive en Auditoría.
export const CAMBIOS_RECIENTES_INICIALES = [
  {
    id: 'CFG-CH-001',
    fecha: AHORA - 22 * HORA_MS,
    usuario: 'Laura Pérez',
    catalogoId: 'estados-cama',
    configuracion: 'Estado de cama: "En limpieza"',
    accion: 'Modificado',
    sede: 'centro',
    estadoResultante: 'activo',
    valorAnterior: 'Tiempo de referencia: 20 min',
    valorNuevo: 'Tiempo de referencia: 25 min',
  },
  {
    id: 'CFG-CH-002',
    fecha: AHORA - 1 * DIA_MS - 4 * HORA_MS,
    usuario: 'Jorge Ruiz',
    catalogoId: 'motivos-fuera-servicio',
    configuracion: 'Motivo fuera de servicio: "Adecuación"',
    accion: 'Creado',
    sede: 'norte',
    estadoResultante: 'activo',
    valorNuevo: 'Motivo agregado al catálogo de fuera de servicio.',
  },
  {
    id: 'CFG-CH-003',
    fecha: AHORA - 2 * DIA_MS - 3 * HORA_MS,
    usuario: 'Camila Torres',
    catalogoId: 'reglas-validacion',
    configuracion: 'Regla: "Paciente con una sola cama activa"',
    accion: 'Modificado',
    sede: 'centro',
    estadoResultante: 'activo',
    valorAnterior: 'Regla desactivada',
    valorNuevo: 'Regla activada',
  },
  {
    id: 'CFG-CH-004',
    fecha: AHORA - 3 * DIA_MS - 5 * HORA_MS,
    usuario: 'Ana Torres',
    catalogoId: 'tiempos-estandar',
    configuracion: 'Tiempo estándar: "Limpieza"',
    accion: 'Modificado',
    sede: 'sur',
    estadoResultante: 'activo',
    valorAnterior: '25 min',
    valorNuevo: '20 min',
  },
  {
    id: 'CFG-CH-005',
    fecha: AHORA - 4 * DIA_MS - 6 * HORA_MS,
    usuario: 'Laura Pérez',
    catalogoId: 'parametros-generales',
    configuracion: 'Parámetro: "Liberación automática"',
    accion: 'Modificado',
    sede: 'centro',
    estadoResultante: 'inactivo',
    valorAnterior: 'Activado',
    valorNuevo: 'Desactivado',
  },
];

const FETCH_DELAY_MS = 400;

// Simula el fetch server-side de la pantalla completa (encargo, sección 21:
// loading cubre filtros/cards/cambios recientes a la vez) — mismo patrón
// Promise+setTimeout con falla ocasional que fetchCamas/fetchInconsistencias.
// La búsqueda filtra las 8 cards por nombre/descripción/ejemplos; Sede/
// Servicio/Estado/rango filtran la bitácora de cambios recientes (ver
// comentario de ESTADOS arriba sobre por qué no tocan las cards).
export function fetchConfiguracion({
  dataset, cambios, query = '', sede = 'todas', servicio = 'todos', estado = 'todos', rango = 'cualquiera',
} = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.06) {
        reject(new Error('No fue posible cargar la configuración.'));
        return;
      }
      const q = query.trim().toLowerCase();
      const catalogos = !q ? dataset : dataset.filter((c) => (
        c.nombre.toLowerCase().includes(q)
        || c.descripcion.toLowerCase().includes(q)
        || c.ejemplos.some((e) => (typeof e === 'string' ? e : e.texto).toLowerCase().includes(q))
      ));

      const limiteHoras = RANGO_OPTIONS_HORAS[rango] ?? null;
      const cambiosFiltrados = cambios.filter((c) => {
        if (sede !== 'todas' && c.sede !== sede) return false;
        if (estado !== 'todos' && c.estadoResultante !== estado) return false;
        if (limiteHoras !== null && (Date.now() - c.fecha) > limiteHoras * HORA_MS) return false;
        if (!q) return true;
        return c.configuracion.toLowerCase().includes(q) || c.usuario.toLowerCase().includes(q);
      });
      // "Servicio" no tiene un dato propio en cambios recientes (los catálogos
      // configurados acá no son por servicio, a diferencia de Integridad) —
      // se deja aplicado solo si distinto de "todos" para no fabricar un
      // cruce que el mock no modela: en ese caso no hay resultados de
      // cambios (estado "Sin resultados"), en vez de mostrar datos falsos.
      const cambiosFinal = servicio !== 'todos' ? [] : cambiosFiltrados;

      resolve({ catalogos, cambios: cambiosFinal });
    }, FETCH_DELAY_MS);
  });
}
