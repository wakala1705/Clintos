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

// El picker de "Id. Tercero" de FacturaEditarModalClasico usa
// @/Components/CatalogoAseguradorasModal (componente app-wide, ver AGENTS.md
// "Component organization") con su propio catálogo en
// @/hooks/CatalogoAseguradorasModal/mockAseguradorasData.js -- no uno propio
// de esta feature (encargo explícito: "usa el mismo componente de
// programación de cirugía, en el de facturación").

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
  { value: 'masiva', label: 'Masiva' },
  { value: 'copago', label: 'Copago' },
  { value: 'moderadora', label: 'Moderadora' },
  { value: 'pago-compartido', label: 'Pago Compartido' },
];

export const SORT_OPTIONS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'antiguas', label: 'Más antiguas' },
  { value: 'valor-desc', label: 'Valor: mayor a menor' },
  { value: 'valor-asc', label: 'Valor: menor a mayor' },
];

// Exportado para CatalogoServiciosAreaModal (picker de "Código" de
// AgregarItemModal, encargo explícito -- reemplazó a CatalogoItemsModal, que
// usaba este mismo dataset) -- mismo dataset que ya usa buildItems() para
// poblar los ítems mock de cada factura, sin duplicar la lista.
export const ITEMS_CATALOGO = [
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

// Solo para facturas con estado 'anulada' -- bloque "Factura anulada" del
// modal de detalle (encargo explícito). `horaAnulacion` es un string literal
// (no un Date real) -- mismo criterio que `hora` en mockSolicitudesData.js,
// no hay lógica de negocio real todavía.
const MOTIVOS_ANULACION = [
  'Factura generada con información incorrecta del paciente.',
  'Duplicidad con otra factura ya generada para la misma admisión.',
  'Error en el valor facturado, se requiere regenerar la factura.',
  'Solicitud del área de auditoría por inconsistencia en los ítems facturados.',
];
const ANULADORES = ['María González', 'Carlos Ramírez', 'Laura Torres', 'Andrés Peña'];
const HORAS_ANULACION = ['8:15 a. m.', '10:42 a. m.', '1:30 p. m.', '3:05 p. m.', '4:50 p. m.'];

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

// Único valor visto en la imagen de referencia de FacturaItemsTable
// ("Tabla Origen", encargo explícito) -- constante en vez de un pick() sobre
// una lista, no hay otro valor documentado todavía.
const TABLA_ORIGEN_ITEM = 'HPRED';

function buildItems(rand, cantidad) {
  const items = [];
  for (let i = 0; i < cantidad; i++) {
    const base = pick(ITEMS_CATALOGO, rand);
    const valor = Math.round((500 + rand() * 30000) / 100) * 100;
    items.push({
      // Id estable dentro de la factura (único por posición, no por
      // referencia -- una misma referencia puede repetirse varias veces en
      // items, ver ITEMS_CATALOGO) -- lo usa la selección de fila en
      // FacturaItemsTable/FacturaDetalleModalClasico para sobrevivir al
      // buscador de ítems (que filtra el array, corriendo los índices).
      id: `item-${i}`,
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
      // Columnas "Tabla Origen"/"ID Item Prestación"/"FTRDID" de
      // FacturaItemsTable (encargo explícito, ver imagen de referencia) --
      // tablaOrigen es el único valor documentado (ver TABLA_ORIGEN_ITEM);
      // los otros dos son IDs internos sin lógica de negocio real, mock
      // como enteros en el mismo rango de magnitud que la referencia
      // (5.8M/2.7M) para que se vean creíbles en la grilla.
      tablaOrigen: TABLA_ORIGEN_ITEM,
      idItemPrestacion: 5800000 + Math.floor(rand() * 99999),
      ftrdid: 2700000 + Math.floor(rand() * 99999),
    });
  }
  return items;
}

// Réplica exacta de una factura de referencia (encargo explícito: "replica
// una factura con estos mismos items", ver imagen de la grilla de ítems del
// formulario legacy) -- 15 ítems con sus valores reales (Referencia/
// Descripción/Prefijo/Cantidad/Vlr.Unidad/CCosto/ID Item Prestación/FTRDID
// tal cual esa imagen), a diferencia del resto de FACTURAS que usa
// buildItems() con datos aleatorios. Las 5 referencias que ya existían en
// ITEMS_CATALOGO (903107C/DM000360/MX0000005PBS/MX0000158PBS/MX0000714PBS)
// reusan la misma descripción que ese catálogo, no un texto nuevo. `valor`
// = Vlr. Unidad × Cantidad (no solo Vlr. Unidad, a diferencia de
// buildItems() donde cantidad siempre es 1 y da lo mismo) para que "Vlr.
// Total" en la tabla coincida con "Vlr. Servicio" de la referencia en las
// filas con cantidad > 1 (Jeringa/Acetaminofén/Clopidogrel/Melfalán).
const ITEMS_FACTURA_REPLICADA = [
  {
    referencia: '870005C', descripcion: 'Radiografía de mastoides comparativas', prefijo: '02', cantidad: 1, vlrUnidad: 900000, idItemPrestacion: 5871820, ftrdid: 2779418,
  },
  {
    referencia: '870460C', descripcion: 'Radiografías intraorales coronales', prefijo: '02', cantidad: 1, vlrUnidad: 150000, idItemPrestacion: 5871817, ftrdid: 2779419,
  },
  {
    referencia: '872002C', descripcion: 'Radiografía de abdomen simple', prefijo: '02', cantidad: 1, vlrUnidad: 895000, idItemPrestacion: 5871818, ftrdid: 2779420,
  },
  {
    referencia: '873122C', descripcion: 'Radiografía de antebrazo', prefijo: '02', cantidad: 1, vlrUnidad: 159000, idItemPrestacion: 5871819, ftrdid: 2779421,
  },
  {
    referencia: '887001C', descripcion: 'Cineradiografía', prefijo: '02', cantidad: 1, vlrUnidad: 500, idItemPrestacion: 5871816, ftrdid: 2779422,
  },
  {
    referencia: '903102C', descripcion: 'Ácido cítrico en orina de 24 horas', prefijo: '19', cantidad: 1, vlrUnidad: 19700, idItemPrestacion: 5871812, ftrdid: 2779423,
  },
  {
    referencia: '903107C', descripcion: 'Ácido fórmico en orina', prefijo: '19', cantidad: 1, vlrUnidad: 26000, idItemPrestacion: 5871813, ftrdid: 2779424,
  },
  {
    referencia: '903610C', descripcion: 'Aluminio en orina parcial', prefijo: '19', cantidad: 1, vlrUnidad: 200000, idItemPrestacion: 5871814, ftrdid: 2779425,
  },
  {
    referencia: '903883C', descripcion: 'Glucosa semiautomatizada (glucometría)', prefijo: '19', cantidad: 1, vlrUnidad: 36000, idItemPrestacion: 5871815, ftrdid: 2779426,
  },
  {
    referencia: 'DM000258', descripcion: 'Equipo bomba infusión Baxter', prefijo: '14', cantidad: 1, vlrUnidad: 15000, idItemPrestacion: 5871821, ftrdid: 2779427,
  },
  {
    referencia: 'DM000360', descripcion: 'Jeringa 20 ml', prefijo: '14', cantidad: 5, vlrUnidad: 500, idItemPrestacion: 5871822, ftrdid: 2779428,
  },
  {
    referencia: 'MX0000005PBS', descripcion: 'Acetaminofén 500 mg tableta', prefijo: '15', cantidad: 5, vlrUnidad: 500, idItemPrestacion: 5871823, ftrdid: 2779429,
  },
  {
    referencia: 'MX0000158PBS', descripcion: 'Clopidogrel bisulfato 75 mg tableta', prefijo: '15', cantidad: 5, vlrUnidad: 1500, idItemPrestacion: 5871824, ftrdid: 2779430,
  },
  {
    referencia: 'MX0000377PBS', descripcion: 'Melfalán 50 mg solución inyectable', prefijo: '15', cantidad: 4, vlrUnidad: 1958, idItemPrestacion: 5871825, ftrdid: 2779431,
  },
  {
    referencia: 'MX0000714PBS', descripcion: 'Meperidina clorhidrato 100 mg / 2 ml sol. inyectable', prefijo: '15', cantidad: 1, vlrUnidad: 25000, idItemPrestacion: 5871826, ftrdid: 2779432,
  },
].map((it, i) => {
  const valor = it.vlrUnidad * it.cantidad;
  return {
    id: `item-${i}`,
    referencia: it.referencia,
    descripcion: it.descripcion,
    valor,
    prefijo: it.prefijo,
    cantidad: it.cantidad,
    vlrUnidad: it.vlrUnidad,
    vlrServicio: valor,
    vlrIVA: 0,
    vlrCopago: 0,
    vlrModerador: 0,
    vlrPagComp: 0,
    descuento: 0,
    ccosto: '07',
    tablaOrigen: TABLA_ORIGEN_ITEM,
    idItemPrestacion: it.idItemPrestacion,
    ftrdid: it.ftrdid,
  };
});

const FACTURA_REPLICADA = {
  id: 'ONCP6443',
  numero: 'ONCP6443',
  terceroId: '900156264',
  terceroRazonSocial: 'Nueva EPS',
  sede: 'Sede 01',
  clase: 'salud',
  tipo: 'individual',
  fecha: '2026-09-04',
  estado: null,
  valorTotal: ITEMS_FACTURA_REPLICADA.reduce((sum, it) => sum + it.valor, 0),
  noAdmision: '0200277600',
  nombreAfiliado: 'GUARIN BARBERO ERICK FERNANDO',
  administradora: 'Clintos',
  usuario: 'Clintos',
  procedencia: 'Salud',
  idAfiliado: '1270030900',
  items: ITEMS_FACTURA_REPLICADA,
  documento: '900156264',
  tipoContrato: 'Evento',
  fechaVencimiento: '2026-10-04',
  flagFE: 0,
  estadoPE: 'enviada',
  estadoFacturacion: 'facturada',
  sedeCodigo: '01',
  impreso: 0,
};

const rand = seededRandom(17);

export const FACTURAS = [FACTURA_REPLICADA, ...Array.from({ length: 60 }, (_, i) => {
  const numero = 6442 - i;
  const tercero = pick(TERCEROS, rand);
  const fecha = buildFecha(rand);
  const roll = rand();
  const estado = roll > 0.92 ? 'anulada' : (roll > 0.85 ? 'pendiente-electronica' : null);
  const peRoll = rand();
  const estadoPE = peRoll > 0.9 ? 'fe-pendiente' : (peRoll > 0.7 ? 'pendiente' : 'enviada');
  // Columna "Facturación" de la grilla densa (encargo: primera columna de la
  // tabla, antes "F" sin significado -- ver FacturasGridClasica.jsx) -- solo
  // 2 estados, sin relación con `estado`/`estadoPE` (son 3 conceptos
  // distintos del ciclo de una factura: anulación, envío electrónico, y
  // esto).
  const estadoFacturacion = rand() > 0.3 ? 'facturada' : 'pendiente';
  const cantidadItems = 1 + Math.floor(rand() * 16);
  const items = buildItems(rand, cantidadItems);
  const valorTotal = items.reduce((sum, it) => sum + it.valor, 0);
  const noAdmision = `020027${7500 + Math.floor(rand() * 200)}`;
  const sede = pick(SEDES, rand);
  const fechaFactura = fechaISO(fecha);
  const vencimiento = new Date(fecha);
  vencimiento.setMonth(vencimiento.getMonth() + 1);
  // Facturas "pendiente" (columna Facturación) todavía no tienen un No. de
  // factura definitivo asignado (encargo explícito) -- en vez del prefijo
  // "ONCP" (numeración ya asignada) muestran un código numérico de 10
  // dígitos que arranca en "0200" (encargo explícito), + 6 dígitos al azar.
  const noFactura = estadoFacturacion === 'pendiente'
    ? `0200${String(Math.floor(rand() * 1000000)).padStart(6, '0')}`
    : `ONCP${numero}`;

  return {
    id: noFactura,
    numero: noFactura,
    terceroId: tercero.id,
    terceroRazonSocial: tercero.razonSocial,
    sede,
    clase: 'salud',
    tipo: pick(['individual', 'individual', 'individual', 'masiva', 'copago', 'moderadora', 'pago-compartido'], rand),
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
    estadoFacturacion,
    sedeCodigo: SEDE_CODIGOS[sede],
    impreso: 0,
    ...(estado === 'anulada' ? {
      motivoAnulacion: pick(MOTIVOS_ANULACION, rand),
      anuladaPor: pick(ANULADORES, rand),
      fechaAnulacion: fechaFactura,
      horaAnulacion: pick(HORAS_ANULACION, rand),
    } : {}),
  };
})].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.numero.localeCompare(a.numero));

export function normalize(str) {
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
// FacturaVistaClasica -- mismo criterio de búsqueda en ambas vistas, incluye
// documento. No incluye noAdmision (encargo explícito, bug real encontrado):
// las 60 facturas del mock ya traían un noAdmision con formato "0200277xxx"
// -- desde que el número de factura de las "pendiente" (columna
// Facturación) también arranca en "0200" (encargo previo), buscar "0200"
// matcheaba por noAdmision en todas las filas por igual y el buscador
// "no filtraba" (siempre devolvía las 60). Placeholder de FacturaVistaClasica
// ajustado a juego ("Buscar por factura, NIT, tercero o afiliado...", sin
// "o admisión").
export function matchesQuery(f, q) {
  if (!q) return true;
  const norm = normalize(q);
  return normalize(f.numero).includes(norm)
    || normalize(f.terceroRazonSocial).includes(norm)
    || normalize(f.nombreAfiliado).includes(norm)
    || f.documento.includes(q);
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
