// Dataset mock + simulación de un endpoint paginado en servidor (mismo
// criterio que mockPatientsData.js/mockCirugiaData.js): fetchFacturas() ya
// tiene la forma que tendría una llamada real (query/filtros/orden/página →
// { items, total }), para que conectar el backend real más adelante sea solo
// cambiar el cuerpo de esta función, no el resto de la pantalla. Sin lógica
// de negocio real todavía (encargo explícito: "solo pinta el front").

const TERCEROS = [
  { id: '900156264', razonSocial: 'Nueva EPS' },
  { id: '800251440', razonSocial: 'Entidad Promotora de Salud Sanitas S A S' },
  { id: '901543211', razonSocial: 'Cajacopi EPS S.A.S.' },
  { id: '890301620', razonSocial: 'Coosalud EPS-S' },
];

const SEDES = ['Sede 01', 'Sede 02', 'Sede 03'];
const SEDE_CODIGOS = { 'Sede 01': '01', 'Sede 02': '02', 'Sede 03': '03' };
const PREFIJOS_ITEM = ['15', '43', '07'];
const CCOSTOS = ['82', '07', '15'];

export const CLASE_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  { value: 'salud', label: 'Salud' },
  { value: 'particular', label: 'Particular' },
];

export const TIPO_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  { value: 'individual', label: 'Individual' },
  { value: 'capitada', label: 'Capitada' },
];

export const SORT_OPTIONS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'antiguas', label: 'Más antiguas' },
  { value: 'valor-desc', label: 'Valor: mayor a menor' },
  { value: 'valor-asc', label: 'Valor: menor a mayor' },
];

const ITEMS_CATALOGO = [
  { referencia: '903107C', descripcion: 'Ácido fórmico en orina' },
  { referencia: 'DM000360', descripcion: 'Jeringa 20 ml' },
  { referencia: 'MX0000005PBS', descripcion: 'Acetaminofén 500 mg tableta' },
  { referencia: 'MX0000042PBS', descripcion: 'Albúmina 20% solución inyectable' },
  { referencia: 'MX0000112PBS', descripcion: 'Carbamazepina 200 mg tableta' },
  { referencia: 'MX0000158PBS', descripcion: 'Clopidogrel bisulfato 75 mg tableta' },
  { referencia: 'MX0000371PBS', descripcion: 'Losartán potásico 50 mg tableta' },
  { referencia: 'MX0000390PBS', descripcion: 'Metoclopramida 10 mg / 2 ml sol. inyectable' },
  { referencia: 'MX0000435PBS', descripcion: 'Ondansetrón 8 mg / 4 ml sol. inyectable' },
  { referencia: 'MX0000525PBS', descripcion: 'Tramadol clorhidrato 50 mg sol. inyectable' },
  { referencia: 'MX0000714PBS', descripcion: 'Meperidina clorhidrato 100 mg / 2 ml sol. inyectable' },
];

const NOMBRES_AFILIADO = [
  'GUARIN BARBERO ERICK FERNANDO', 'RAMIREZ TORRES SANDRA MILENA', 'CORREA PATIÑO JORGE LUIS',
  'MARTINEZ GOMEZ LAURA SOFIA', 'HERRERA RINCON ANDRES FELIPE', 'PEDRAZA MORA VALENTINA',
  'OSPINA CASTAÑO CARLOS EDUARDO', 'VARGAS DIAZ CAMILA', 'TORRES MESA SANTIAGO', 'CARDENAS RUIZ DANIELA',
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

function buildFecha(rand) {
  // Rango fijo: 4 ago – 3 sep 2026, mismo período que muestra el chip
  // "Facturadas entre el / y el" por defecto.
  const start = new Date(2026, 7, 4);
  const days = Math.floor(rand() * 31);
  const date = new Date(start);
  date.setDate(date.getDate() + days);
  return date;
}

function fechaISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildItems(rand, cantidad) {
  const items = [];
  for (let i = 0; i < cantidad; i++) {
    const base = pick(ITEMS_CATALOGO, rand);
    const valor = Math.round((500 + rand() * 30000) / 100) * 100;
    items.push({
      referencia: base.referencia,
      descripcion: base.descripcion,
      valor,
      // Campos extra solo usados por la grilla densa de la vista clásica
      // (ver FacturaVistaClasica) -- vlrUnidad/vlrServicio/vlrTotal iguales
      // al valor base (mock sin IVA/copago/moderador real).
      prefijo: pick(PREFIJOS_ITEM, rand),
      cantidad: 1,
      vlrUnidad: valor,
      vlrServicio: valor,
      vlrIVA: 0,
      vlrCopago: 0,
      vlrModerador: 0,
      vlrPagComp: 0,
      descuento: 0,
      ccosto: pick(CCOSTOS, rand),
    });
  }
  return items;
}

const rand = seededRandom(17);

export const FACTURAS = Array.from({ length: 60 }, (_, i) => {
  const numero = 6442 - i;
  const tercero = pick(TERCEROS, rand);
  const fecha = buildFecha(rand);
  const roll = rand();
  const estado = roll > 0.92 ? 'anulada' : (roll > 0.85 ? 'pendiente-electronica' : null);
  const peRoll = rand();
  const estadoPE = peRoll > 0.9 ? 'fe-pendiente' : (peRoll > 0.7 ? 'pendiente' : 'enviada');
  const cantidadItems = 1 + Math.floor(rand() * 16);
  const items = buildItems(rand, cantidadItems);
  const valorTotal = items.reduce((sum, it) => sum + it.valor, 0);
  const noAdmision = `020027${7500 + Math.floor(rand() * 200)}`;
  const sede = pick(SEDES, rand);
  const fechaFactura = fechaISO(fecha);
  const vencimiento = new Date(fecha);
  vencimiento.setMonth(vencimiento.getMonth() + 1);

  return {
    id: `ONCP${numero}`,
    numero: `ONCP${numero}`,
    terceroId: tercero.id,
    terceroRazonSocial: tercero.razonSocial,
    sede,
    clase: 'salud',
    tipo: rand() > 0.15 ? 'individual' : 'capitada',
    fecha: fechaFactura,
    estado,
    valorTotal,
    noAdmision,
    nombreAfiliado: pick(NOMBRES_AFILIADO, rand),
    administradora: rand() > 0.5 ? 'Clintos' : 'Rafael',
    usuario: rand() > 0.5 ? 'Clintos' : 'Agilinb',
    procedencia: 'Salud',
    idAfiliado: String(Math.floor(1000000000 + rand() * 900000000)),
    items,
    // Campos extra solo usados por la grilla densa de la vista clásica (ver
    // FacturaVistaClasica) -- replican columnas del formulario legacy de
    // referencia (encargo explícito) que la vista nueva no necesita.
    documento: tercero.id,
    tipoContrato: 'Evento',
    fechaVencimiento: fechaISO(vencimiento),
    flagFE: rand() > 0.88 ? 1 : 0,
    estadoPE,
    sedeCodigo: SEDE_CODIGOS[sede],
    impreso: 0,
  };
}).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.numero.localeCompare(a.numero));

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const PAGE_DELAY_MS = 350;

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatCOP(valor) {
  return `$${valor.toLocaleString('es-CO')}`;
}

export function formatFecha(iso) {
  const [year, month, day] = iso.split('-');
  return `${Number(day)} ${MESES[Number(month) - 1]} ${year}`;
}

// "3.SEP.2026" -- formato compacto de la grilla densa (vista clásica),
// distinto del formatFecha() de arriba (usado por la vista nueva).
export function formatFechaClasica(iso) {
  const [year, month, day] = iso.split('-');
  return `${Number(day)}.${MESES[Number(month) - 1].toUpperCase()}.${year}`;
}

// Reutilizado por fetchFacturas() y por el filtro local (sin paginación) de
// FacturaVistaClasica -- mismo criterio de búsqueda en ambas vistas, ahora
// incluye documento/no. admisión (placeholder de esa vista: "Buscar por
// factura, NIT, tercero, afiliado o admisión...").
export function matchesQuery(f, q) {
  if (!q) return true;
  const norm = normalize(q);
  return normalize(f.numero).includes(norm)
    || normalize(f.terceroRazonSocial).includes(norm)
    || normalize(f.nombreAfiliado).includes(norm)
    || f.documento.includes(q)
    || f.noAdmision.includes(q);
}

// Simula un endpoint server-side: filtra, ordena y pagina — mismo contrato
// que fetchPatients()/fetchAgendaRango() (ver AGENTS.md, hooks organization).
export function fetchFacturas({
  query = '',
  filtros = {},
  sortBy = 'recientes',
  page = 1,
  pageSize = 15,
} = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = FACTURAS.filter((f) => {
        if (filtros.clase && filtros.clase !== 'todas' && f.clase !== filtros.clase) return false;
        if (filtros.tipo && filtros.tipo !== 'todas' && f.tipo !== filtros.tipo) return false;
        if (filtros.desde && f.fecha < filtros.desde) return false;
        if (filtros.hasta && f.fecha > filtros.hasta) return false;
        if (!matchesQuery(f, query.trim())) return false;
        return true;
      });

      list = [...list].sort((a, b) => {
        if (sortBy === 'antiguas') return a.fecha.localeCompare(b.fecha) || a.numero.localeCompare(b.numero);
        if (sortBy === 'valor-desc') return b.valorTotal - a.valorTotal;
        if (sortBy === 'valor-asc') return a.valorTotal - b.valorTotal;
        return b.fecha.localeCompare(a.fecha) || b.numero.localeCompare(a.numero);
      });

      const total = list.length;
      const start = (page - 1) * pageSize;
      const items = list.slice(start, start + pageSize);

      resolve({ items, total });
    }, PAGE_DELAY_MS);
  });
}
