// Dataset mock + simulación de un endpoint server-side, mismo criterio que
// mockPatientsData.js (ver AGENTS.md): fetchAdmisiones() ya tiene la forma
// (query/campo de búsqueda/estado → { items, total }) que tendría una
// llamada real, para que conectar el backend real más adelante sea solo
// cambiar el cuerpo de esta función, no la pantalla.
// TODO: reemplazar por la llamada real al backend.

const NOMBRES = ['Diomedes', 'Tony Carlo', 'Hector Luis', 'Angelica Maria', 'Zuly Marcela', 'Jorge Eliser', 'Fabrizio Seguundo', 'Lina Maria', 'River', 'Camila', 'Andrés Felipe', 'Sofía', 'Julián', 'Mariana', 'Esteban', 'Valentina', 'Ricardo', 'Catalina', 'David', 'Natalia'];
const APELLIDOS = ['Diaz', 'Pertuz Ramos', 'Amaris Bivanque', 'Maruy', 'Garcia Garcia', 'Jaramillo Villar', 'Martelo', 'Gomez Gomez', 'Aponte', 'Guarin Guarin', 'Montiel Montiel', 'Rodríguez Paternina', 'Zuluaga Restrepo', 'Cárdenas Ruiz', 'Bermúdez Cano'];
const ADMINISTRADORAS = ['NUEVA EPS', 'ENTIDAD PROMOTORA DE SALUD SANITAS S A S', 'SURA EPS', 'COMPENSAR EPS', 'SALUD TOTAL', 'FAMISANAR'];
const TIPO_CONTRATO_LIST = ['Capitado', 'Evento'];
const TIPO_ADMISION_LIST = ['URGENCIAS', 'AMBULATORIO', 'HOSPITALIZACIÓN'];

// Sin clasificar (dash gris) es, con diferencia, el resultado más común
// recién llegado el paciente — de ahí el peso 0.5 en TRIAGE_LEVELS.
const TRIAGE_LEVELS = [null, null, null, null, null, 1, 2, 2, 3, 3, 3, 4, 4, 5];

export const TRIAGE_LABEL = {
  1: 'Prioridad 1 · Resucitación (crítico)',
  2: 'Prioridad 2 · Emergencia',
  3: 'Prioridad 3 · Urgente',
  4: 'Prioridad 4 · Menos urgente',
  5: 'Prioridad 5 · No urgente',
  none: 'Sin clasificar',
};

export const ESTADO_LABEL = {
  admitido: 'Admitido',
  'pendiente-triage': 'Pendiente de triage',
  triage: 'Triage',
  'alta-medica': 'Alta médica',
  'alta-administrativa': 'Alta administrativa',
};

export const ESTADO_FILTER_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'admitido', label: 'Admitidos' },
  { value: 'pendiente-triage', label: 'Pendiente de triage' },
  { value: 'triage', label: 'Triage' },
  { value: 'alta-medica', label: 'Alta médica' },
  { value: 'alta-administrativa', label: 'Alta administrativa' },
];

export const SEARCH_FIELD_OPTIONS = [
  { value: 'numeroAdmision', label: 'N° de admisión' },
  { value: 'documento', label: 'Documento' },
  { value: 'nombreAfiliado', label: 'Nombre del afiliado' },
];

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

function buildDocumento(rand) {
  const digits = 7 + Math.floor(rand() * 3);
  let n = '';
  for (let i = 0; i < digits; i++) n += Math.floor(rand() * 10);
  return n;
}

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export function formatFechaCorta(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')}.${MESES[m - 1]}.${y}`;
}

const rand = seededRandom(7);

// Admisiones más recientes primero (mismo orden que la referencia): el
// consecutivo y la fecha bajan juntos a medida que se generan más filas.
let consecutivo = 277489;
let cursor = new Date(2026, 7, 18, 9, 20); // 18 ago 2026, 09:20

export const ADMISIONES = Array.from({ length: 60 }, (_, i) => {
  const nombre = `${pick(APELLIDOS, rand)} ${pick(NOMBRES, rand)}`.toUpperCase();
  const documento = buildDocumento(rand);
  const triage = pick(TRIAGE_LEVELS, rand);

  // Las primeras 5 filas quedan "Admitido" (recién llegadas, igual que la
  // referencia) — el resto ya salió del piso, con "Alta administrativa" como
  // desenlace más frecuente.
  let estado;
  if (i < 5) estado = 'admitido';
  else {
    const r = rand();
    if (r < 0.08) estado = 'pendiente-triage';
    else if (r < 0.14) estado = 'triage';
    else if (r < 0.30) estado = 'alta-medica';
    else estado = 'alta-administrativa';
  }

  const fechaISO = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
  const hora = `${String(cursor.getHours()).padStart(2, '0')}:${String(cursor.getMinutes()).padStart(2, '0')}`;

  const record = {
    id: `adm-${i + 1}`,
    numeroAdmision: String(consecutivo).padStart(10, '0'),
    fechaISO,
    fecha: formatFechaCorta(fechaISO),
    hora,
    triage: estado === 'pendiente-triage' ? null : triage,
    estado,
    documento,
    nombreAfiliado: nombre,
    atendido: estado === 'alta-medica' || estado === 'alta-administrativa',
    administradora: pick(ADMINISTRADORAS, rand),
    tipoContrato: pick(TIPO_CONTRATO_LIST, rand),
    tipoAdmision: pick(TIPO_ADMISION_LIST, rand),
  };

  consecutivo -= 1;
  // Salto de minutos/horas variable hacia atrás en el tiempo, con algún
  // salto de día para que la lista no quede toda en la misma fecha (ver
  // referencia: filas del 18, 14, 13 y 12 de agosto).
  cursor = new Date(cursor.getTime() - (8 + Math.floor(rand() * 180)) * 60000);

  return record;
});

const FETCH_DELAY_MS = 300;

export function fetchAdmisiones({ query = '', searchField = 'numeroAdmision', estado = 'admitido' } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.trim().toLowerCase();

      const items = ADMISIONES.filter((a) => {
        if (estado !== 'todos' && a.estado !== estado) return false;
        if (!q) return true;
        const value = String(a[searchField] ?? '').toLowerCase();
        return value.includes(q);
      });

      resolve({ items, total: items.length });
    }, FETCH_DELAY_MS);
  });
}
