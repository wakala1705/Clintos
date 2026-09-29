// Mock de trazabilidad de trabajos de facturación (Finanzas) — capa de
// simulación de un endpoint paginado en servidor, mismo criterio que
// mockPatientsData.js/mockAdmisionesData.js (ver AGENTS.md): fetchTrazabilidad()
// resuelve tras un delay para poder ejercitar el estado de carga (skeleton).
// No existe backend real todavía.

export const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'completado', label: 'Completado' },
  { value: 'error', label: 'Error' },
  { value: 'en-proceso', label: 'En proceso' },
  { value: 'colgado', label: 'Colgado' },
];

export const TIPO_OPTIONS = [
  { value: 'todos', label: 'Todos (Facturar / Imputar)' },
  { value: 'facturar', label: 'Facturar' },
  { value: 'imputar', label: 'Imputar' },
];

export const ESTADO_LABEL = {
  completado: 'Completado',
  error: 'Error',
  'en-proceso': 'En proceso',
  colgado: 'Colgado',
};

// success/danger/warn/info -- tonos de @/Components/Badge/Badge (ver
// AGENTS.md "Badges"). colgado usa 'warn' (mismo criterio que el resto del
// proyecto: warn para estados que necesitan una acción/alerta, no solo un
// resultado negativo).
export const ESTADO_TONE = {
  completado: 'success',
  error: 'danger',
  'en-proceso': 'info',
  colgado: 'warn',
};

export const TIPO_LABEL = { facturar: 'Facturar', imputar: 'Imputar' };
export const TIPO_TONE = { facturar: 'neutral', imputar: 'info' };

const ETAPAS = ['Adjuntos-Correo', 'Validación-DIAN', 'Envío-EPS', 'Radicación', 'Generación-PDF'];
const USUARIOS = ['RAFAEL', 'MEDICOP', 'SISTEMA', 'CAROLINA', 'INTEGRACION'];

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}
function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}
function buildHex(rand, length) {
  let s = '';
  for (let i = 0; i < length; i++) s += Math.floor(rand() * 16).toString(16);
  return s.toUpperCase();
}

const rand = seededRandom(7);
let facturaCounter = 9000233;
let cnsCounter = 308105;

// 52 trabajos, más recientes primero -- mismo total que la referencia
// ("52 registros"), paginados de a 20 (ver PAGE_SIZE en Trazabilidad.jsx).
export const TRABAJOS = Array.from({ length: 52 }, (_, i) => {
  const tipo = rand() > 0.15 ? 'imputar' : 'facturar';
  const estadoRoll = rand();
  const estado = estadoRoll > 0.9 ? 'error' : estadoRoll > 0.82 ? 'colgado' : estadoRoll > 0.75 ? 'en-proceso' : 'completado';
  const intentos = estado === 'error' || estado === 'colgado' ? 1 + Math.floor(rand() * 3) : 0;

  facturaCounter -= 1 + Math.floor(rand() * 4);
  cnsCounter -= 1 + Math.floor(rand() * 2);

  const daysAgo = Math.floor(i / 4);
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - daysAgo);
  fechaInicio.setHours(5 + Math.floor(rand() * 14), Math.floor(rand() * 60), Math.floor(rand() * 60), 0);

  return {
    id: `job-${52 - i}`,
    jobId: buildHex(rand, 32),
    tipo,
    numeroFactura: `SETT${facturaCounter}`,
    referencia: `Cns: ${cnsCounter}`,
    usuario: pick(USUARIOS, rand),
    estado,
    etapa: pick(ETAPAS, rand),
    intentos,
    fechaInicio,
  };
});

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatFechaInicio(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${d}/${m}/${y}, ${hh}:${mm}:${ss}`;
}

function matchesQuery(t, query) {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return [t.jobId, t.numeroFactura, t.referencia, t.usuario].some((v) => v.toLowerCase().includes(needle));
}

export function fetchTrazabilidad({
  query = '', estado = 'todos', tipo = 'todos', desde = '', hasta = '', page = 1, pageSize = 20,
} = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = TRABAJOS.filter((t) => {
        if (estado !== 'todos' && t.estado !== estado) return false;
        if (tipo !== 'todos' && t.tipo !== tipo) return false;
        if (!matchesQuery(t, query)) return false;
        const fechaISO = toISODate(t.fechaInicio);
        if (desde && fechaISO < desde) return false;
        if (hasta && fechaISO > hasta) return false;
        return true;
      });
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);
      resolve({ items, total });
    }, 350);
  });
}
