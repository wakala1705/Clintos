// Dataset mock + simulación de un endpoint server-side, mismo criterio que
// mockPatientsData.js (ver AGENTS.md): fetchAdmisiones() ya tiene la forma
// (query/campo de búsqueda/estado → { items, total }) que tendría una
// llamada real, para que conectar el backend real más adelante sea solo
// cambiar el cuerpo de esta función, no la pantalla.
// TODO: reemplazar por la llamada real al backend.

import { AREAS_FUNCIONALES, datosAdministrativos } from '@/hooks/DetalleAdmision/datosAdministrativos';

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

// Generador aparte para la cama: pedirle números a `rand` en medio de cada
// registro desplazaría toda la secuencia y cambiaría nombres/documentos/
// fechas ya conocidos del mock.
const randCama = seededRandom(23);

// Cama asignada según el tipo de admisión — Urgencias: camilla del servicio
// (URG-05); Hospitalización: habitación + letra de cama (302-B). Ambulatorio
// y "Pendiente de triage" todavía no ocupan cama, de ahí el null (la tabla
// muestra "—").
function buildCama(record) {
  if (record.estado === 'pendiente-triage') return null;
  if (record.tipoAdmision === 'URGENCIAS') {
    return `URG-${String(1 + Math.floor(randCama() * 20)).padStart(2, '0')}`;
  }
  if (record.tipoAdmision === 'HOSPITALIZACIÓN') {
    const piso = 2 + Math.floor(randCama() * 4);
    const habitacion = 1 + Math.floor(randCama() * 12);
    const letra = 'AB'[Math.floor(randCama() * 2)];
    return `${piso}${String(habitacion).padStart(2, '0')}-${letra}`;
  }
  return null;
}

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
    // "Admitido" ya implica que el paciente fue atendido (ingresó al
    // servicio), igual que quienes ya tienen alta.
    atendido: estado === 'admitido' || estado === 'alta-medica' || estado === 'alta-administrativa',
    administradora: pick(ADMINISTRADORAS, rand),
    tipoContrato: pick(TIPO_CONTRATO_LIST, rand),
    tipoAdmision: pick(TIPO_ADMISION_LIST, rand),
  };
  record.cama = buildCama(record);

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

// ---------- Detalle de admisión (modal "Detalles") ----------
// Registro de ADMISIONES → shape de @/Components/DetalleAdmisionModal
// (compartido con HC Hospitalización, ver getDetalleAdmision en
// mockHospitalizadosData.js). Lo que este mock no modela (acompañante,
// médico/usuario de ingreso, régimen) sale de datosAdministrativos, estable
// por N° de admisión. Sin diagnóstico/edad/sexo/estancia: este mock no los
// tiene, así que el modal no los pinta (campos `undefined`).
const ESTADO_TONE = {
  admitido: 'success',
  'pendiente-triage': 'warn',
  triage: 'warn',
  'alta-medica': 'neutral',
  'alta-administrativa': 'neutral',
};

const AREA_POR_TIPO = {
  URGENCIAS: AREAS_FUNCIONALES.urgencias,
  AMBULATORIO: AREAS_FUNCIONALES.ambulatorio,
  'HOSPITALIZACIÓN': AREAS_FUNCIONALES.hospitalizacion,
};

// El nombre del mock va apellidos primero: "PERTUZ RAMOS TONY CARLO" → "PT"
// (primer apellido + primer nombre, 1ª y 3ª palabra); con menos de 4
// palabras, 1ª + última ("DIAZ DIOMEDES" → "DD").
function inicialesAfiliado(nombre) {
  const partes = nombre.split(' ').filter(Boolean);
  const segunda = partes.length >= 4 ? partes[2] : partes[partes.length - 1];
  return `${partes[0][0]}${segunda[0]}`.toUpperCase();
}

export function detalleDesdeAdmision(a) {
  const admin = datosAdministrativos(Number(a.numeroAdmision));
  const area = AREA_POR_TIPO[a.tipoAdmision] ?? null;
  const conAlta = a.estado === 'alta-medica' || a.estado === 'alta-administrativa';
  return {
    id: a.id,
    iniciales: inicialesAfiliado(a.nombreAfiliado),
    nombre: a.nombreAfiliado,
    documento: a.documento,
    numeroAdmision: a.numeroAdmision,
    estado: { label: ESTADO_LABEL[a.estado], tone: ESTADO_TONE[a.estado] ?? 'neutral' },
    fechaIngreso: a.fecha,
    horaIngreso: a.hora,
    cama: a.cama ?? null,
    tipoAdmision: a.tipoAdmision,
    triage: TRIAGE_LABEL[a.triage ?? 'none'],
    areaIngreso: area,
    areaActual: area,
    contratante: a.administradora,
    tipoContrato: a.tipoContrato,
    regimen: admin.regimen,
    medicoIngreso: admin.medicoIngreso,
    acompanante: admin.acompanante,
    usuarioIngresa: admin.usuarioIngresa,
    usuarioAlta: conAlta ? admin.usuarioAlta : null,
  };
}
