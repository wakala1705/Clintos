// Mock data de "Solicitudes de Insumos Farmacia" (Módulo Contable → Insumos
// Farmacia → Solicitudes) -- réplica de la pantalla legacy "Catálogo
// Movimiento De Inventario Salidas Asistenciales". Sin backend real (encargo
// explícito: "solo pinta el front", mismo criterio que mockFacturasData.js).
// A diferencia de mockFacturasData.js (que además expone fetchFacturas()
// para la "vista nueva" de Facturación) esta pantalla es puramente una
// "vista clásica" -- se filtra el array de abajo directo con useMemo, igual
// que FacturaVistaClasica.jsx hace con FACTURAS -- así que no se agrega un
// fetchMovimientos() sin consumidor real (YAGNI).

// Contexto fijo de la página (bodega/año/sede activos) -- no son filtros de
// la tabla, son los campos de solo lectura del toolbar (Año/Grp Bdg./
// Bodega/Id.Sede de la referencia).
export const CONTEXTO_BODEGA = {
  anio: '2026',
  grupoBodega: '01',
  bodega: 'FARMACIA PISO 3',
  idSede: '01',
};

// BODEGAS_CATALOGO se movió a @/hooks/Bodega/bodega (ahora también lo usa
// el gate post-login de Home vía BodegaPickerButton, no solo esta pantalla).

export const TIPO_OPTIONS = [
  { value: 'debito', label: 'Debito' },
  { value: 'credito', label: 'Credito' },
];

export const TIPO_ARTICULO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'medicamento', label: 'Medicamento' },
  { value: 'insumo', label: 'Insumo' },
  { value: 'dispositivo', label: 'Dispositivo médico' },
];

export const PROCEDENCIA_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'salud', label: 'Salud' },
  { value: 'particular', label: 'Particular' },
];

export const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'sin-confirmar', label: 'Sin Confirmar' },
  { value: 'anulado', label: 'Anulados' },
];

export const TRNS_OPTIONS = [
  { value: 'sal', label: 'SAL' },
  { value: 'ent', label: 'ENT' },
];

// 'dd/mm/aaaa' -- distinto del formatFechaClasica de mockFacturasData.js
// ("3.SEP.2026", con puntos) porque la referencia de esta pantalla usa
// barras, no un criterio compartido entre ambas vistas clásicas.
export function formatFecha(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function formatMoneda(valor) {
  return valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function articulo(overrides) {
  return {
    marca: 'NA',
    bdg: '01',
    costoUnidad: { anterior: 0, unidad: 0, descuento: 0, neto: 0 },
    costoTotal: { unidad: 0, descuento: 0, neto: 0 },
    iva: { porcentaje: 0, unitario: 0, total: 0 },
    confirmado: false,
    ...overrides,
  };
}

const MOVIMIENTOS_BASE = [
  {
    id: '0200203069-2',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203069-2',
    noAdmision: '0200277323',
    noPrestacion: '0200000198',
    fecha: '2026-07-25',
    hora: '5:14 p. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'GARCIA GARCIA ANGELICA MARIA',
    ubicacion: 'Sede 01 · Área: Urgencias · C.Costo: URGENCIAS',
    idContrato: '900156264',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '2026-07-27',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      articulo({
        item: 1, codigo: 'MX0000005', descripcion: 'Acetaminofén 500 mg tableta',
        cantidadSolicitada: 3, cantidadEntregada: 3,
      }),
      articulo({
        item: 2, codigo: 'MX0000053', descripcion: 'Amikacina 500 mg solución inyectable',
        cantidadSolicitada: 6, cantidadEntregada: 6,
      }),
    ],
  },
  {
    id: '0200203068',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203068',
    noAdmision: '0200277262',
    noPrestacion: '0201706743',
    fecha: '2026-07-24',
    hora: '5:41 p. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'UNICIA GOKU',
    ubicacion: 'Sede 01 · Área: Consulta Externa · C.Costo: CONSULTA EXTERNA',
    idContrato: '900156264',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '2026-07-26',
    confirmo: '',
    permitirEditarCostos: false,
    // Único movimiento con costos/IVA reales y confirmado mixto (encargo del
    // plan) -- ejercita el particionamiento Confir./Sin Confir. del pie de
    // totales, que de otro modo daría 0.00 en las 5 tarjetas con el resto
    // del dataset (fiel a la referencia, que también muestra 0.00 porque su
    // único movimiento visible en el detalle no tiene costo cargado).
    articulos: [
      articulo({
        item: 1, codigo: 'MX0000112', descripcion: 'Carbamazepina 200 mg tableta',
        cantidadSolicitada: 10, cantidadEntregada: 10,
        costoUnidad: { anterior: 850, unidad: 850, descuento: 0, neto: 850 },
        costoTotal: { unidad: 8500, descuento: 0, neto: 8500 },
        confirmado: true,
      }),
      articulo({
        item: 2, codigo: 'MX0000371', descripcion: 'Losartán potásico 50 mg tableta',
        cantidadSolicitada: 20, cantidadEntregada: 18,
        costoUnidad: { anterior: 420, unidad: 420, descuento: 0, neto: 420 },
        costoTotal: { unidad: 7560, descuento: 0, neto: 7560 },
        iva: { porcentaje: 19, unitario: 79.8, total: 1436.4 },
        confirmado: false,
      }),
    ],
  },
  {
    id: '0200203066',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203066',
    noAdmision: '0200277321',
    noPrestacion: '0201706742',
    fecha: '2026-07-24',
    hora: '5:02 p. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'CARPIO PITALUA ISA',
    ubicacion: 'Sede 01 · Área: Consulta Externa · C.Costo: CONSULTA EXTERNA',
    idContrato: '900156264',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '2026-07-26',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      articulo({
        item: 1, codigo: 'MX0000005', descripcion: 'Acetaminofén 500 mg tableta',
        cantidadSolicitada: 1, cantidadEntregada: 1,
      }),
    ],
  },
  {
    id: '0200203065-1',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203065-1',
    noAdmision: '0200277320',
    noPrestacion: '0200000196',
    fecha: '2026-07-24',
    hora: '4:53 p. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'DIAZ GONZALEZ JOSE CARLOS',
    ubicacion: 'Sede 01 · Área: Hospitalización Piso 2 · C.Costo: HOSPITALIZACION',
    idContrato: '800251440',
    tipo: 'debito',
    tipoArticulo: 'insumo',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '2026-07-26',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      articulo({
        item: 1, codigo: 'DM000360', descripcion: 'Jeringa 20 ml',
        cantidadSolicitada: 5, cantidadEntregada: 5,
      }),
    ],
  },
  {
    id: '0200203064',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203064',
    noAdmision: '0200277305',
    noPrestacion: '0200000195',
    fecha: '2026-07-24',
    hora: '3:19 p. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'RODRIGUEZ JAMES',
    ubicacion: 'Sede 01 · Área: Ambulancia · C.Costo: AMBULANCIA',
    idContrato: '800251440',
    tipo: 'debito',
    tipoArticulo: 'dispositivo',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '2026-07-26',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      articulo({
        item: 1, codigo: 'DM000512', descripcion: 'Cánula nasal adulto',
        cantidadSolicitada: 1, cantidadEntregada: 1,
      }),
    ],
  },
  {
    id: '0200203063-1',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203063-1',
    noAdmision: '0200277225',
    noPrestacion: '0200000194',
    fecha: '2026-07-22',
    hora: '8:56 a. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'AGUSTU JULIO JULIO',
    ubicacion: 'Sede 01 · Área: Hospitalización Piso 2 · C.Costo: HOSPITALIZACION',
    idContrato: '800251440',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    // Único campo que se aparta del default ('sin-confirmar') -- a propósito
    // deja el resto (tipo/procedencia/trns) igual al default para que
    // cambiar SOLO "Estado" lo revele en aislamiento (ver Task 8 Step 4). No
    // sumar más variaciones a este registro sin actualizar ese checklist.
    estado: 'confirmado',
    trns: 'sal',
    fechaContable: '2026-07-23',
    confirmo: 'ROJAS MENDEZ PAOLA',
    permitirEditarCostos: true,
    articulos: [
      articulo({
        item: 1, codigo: 'MX0000158', descripcion: 'Clopidogrel bisulfato 75 mg tableta',
        cantidadSolicitada: 30, cantidadEntregada: 30,
        costoUnidad: { anterior: 610, unidad: 610, descuento: 0, neto: 610 },
        costoTotal: { unidad: 18300, descuento: 0, neto: 18300 },
        confirmado: true,
      }),
    ],
  },
  {
    id: '0200203056-2',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203056-2',
    noAdmision: '0200277313',
    noPrestacion: '0200000188',
    fecha: '2026-07-22',
    hora: '11:39 a. m.',
    procedencia: 'SALUD',
    movimiento: 'EN-Traslado Entre Bodegas',
    paciente: 'DE LA ESPRIELLA PARRA ALFONSO',
    ubicacion: 'Sede 01 · Área: Hospitalización Piso 2 · C.Costo: HOSPITALIZACION',
    idContrato: '800251440',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    // Trns distinto del default ('sal') a propósito -- ejercita el filtro
    // Trns. (con Trns.=SAL este movimiento queda oculto por defecto).
    estado: 'sin-confirmar',
    trns: 'ent',
    fechaContable: '2026-07-23',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      articulo({
        item: 1, codigo: 'MX0000390', descripcion: 'Metoclopramida 10 mg / 2 ml sol. inyectable',
        cantidadSolicitada: 4, cantidadEntregada: 4,
      }),
    ],
  },
];

// Generador determinístico (mismo patrón seededRandom/pick/Array.from que
// FACTURAS en mockFacturasData.js) para simular un escenario de 60
// movimientos visibles en la grilla en vez de los 6-7 de MOVIMIENTOS_BASE --
// encargo explícito para probar la tabla con volumen real entre los 3
// estados. Todos con trns:'sal'/tipo:'debito' (los únicos valores fijos que
// hoy filtra movimientoCoincide, ver Solicitudes.jsx) para que efectivamente
// aparezcan en "Todos".
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

function fechaISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function sumarDias(iso, dias) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + dias);
  return fechaISO(date);
}

const NOMBRES_PACIENTES_GEN = [
  'MORENO CASTILLO LUIS FERNANDO', 'RAMIREZ TORRES SANDRA MILENA', 'CORREA PATIÑO JORGE LUIS',
  'MARTINEZ GOMEZ LAURA SOFIA', 'HERRERA RINCON ANDRES FELIPE', 'PEDRAZA MORA VALENTINA',
  'OSPINA CASTAÑO CARLOS EDUARDO', 'VARGAS DIAZ CAMILA', 'TORRES MESA SANTIAGO', 'CARDENAS RUIZ DANIELA',
  'GUTIERREZ LEON MARIA JOSE', 'SALAZAR PEÑA JUAN DAVID', 'ROJAS ACOSTA NATALIA', 'MEDINA CORTES OSCAR IVAN',
  'BUSTAMANTE VEGA PAULA ANDREA',
];

const CONFIRMADORES_GEN = ['ROJAS MENDEZ PAOLA', 'GOMEZ TORRES LUIS', 'MARTINEZ RUIZ SANDRA', 'CASTRO LEON DIEGO'];

const UBICACIONES_GEN = [
  { area: 'Urgencias', costo: 'URGENCIAS' },
  { area: 'Consulta Externa', costo: 'CONSULTA EXTERNA' },
  { area: 'Hospitalización Piso 2', costo: 'HOSPITALIZACION' },
  { area: 'Hospitalización Piso 3', costo: 'HOSPITALIZACION PISO 3' },
  { area: 'Ambulancia', costo: 'AMBULANCIA' },
  { area: 'Cirugía', costo: 'CIRUGIA' },
  { area: 'UCI', costo: 'CUIDADO INTENSIVO' },
];

const IDCONTRATOS_GEN = ['900156264', '800251440', '900177531'];
const HORAS_GEN = ['8:12 a. m.', '9:45 a. m.', '10:30 a. m.', '11:05 a. m.', '1:20 p. m.', '2:40 p. m.', '3:55 p. m.', '4:30 p. m.', '5:15 p. m.', '6:02 p. m.'];

const ARTICULOS_POOL_GEN = [
  { codigo: 'MX0000005', descripcion: 'Acetaminofén 500 mg tableta', tipoArticulo: 'medicamento', precio: 320 },
  { codigo: 'MX0000053', descripcion: 'Amikacina 500 mg solución inyectable', tipoArticulo: 'medicamento', precio: 4100 },
  { codigo: 'MX0000112', descripcion: 'Carbamazepina 200 mg tableta', tipoArticulo: 'medicamento', precio: 850 },
  { codigo: 'MX0000371', descripcion: 'Losartán potásico 50 mg tableta', tipoArticulo: 'medicamento', precio: 420 },
  { codigo: 'MX0000158', descripcion: 'Clopidogrel bisulfato 75 mg tableta', tipoArticulo: 'medicamento', precio: 610 },
  { codigo: 'MX0000201', descripcion: 'Omeprazol 20 mg cápsula', tipoArticulo: 'medicamento', precio: 280 },
  { codigo: 'DM000360', descripcion: 'Jeringa 20 ml', tipoArticulo: 'insumo', precio: 650 },
  { codigo: 'DM000118', descripcion: 'Guante de nitrilo talla M', tipoArticulo: 'insumo', precio: 210 },
  { codigo: 'DM000275', descripcion: 'Gasa estéril 10x10 cm', tipoArticulo: 'insumo', precio: 190 },
  { codigo: 'DM000512', descripcion: 'Cánula nasal adulto', tipoArticulo: 'dispositivo', precio: 3200 },
  { codigo: 'DM000630', descripcion: 'Equipo de venoclisis', tipoArticulo: 'dispositivo', precio: 5400 },
];

// Distribución fija (no aleatoria) de estado para los 54 nuevos, sumada a la
// de MOVIMIENTOS_BASE (5 sin-confirmar/1 confirmado/0 anulado con trns:sal)
// da el total pedido: 24 Sin Confirmar, 20 Confirmados, 16 Anulados = 60.
const ESTADOS_GEN_ORDENADOS = [
  ...Array(19).fill('confirmado'),
  ...Array(19).fill('sin-confirmar'),
  ...Array(16).fill('anulado'),
];
const randEstado = seededRandom(42);
const ESTADOS_GEN = [...ESTADOS_GEN_ORDENADOS].sort(() => randEstado() - 0.5);

const rand = seededRandom(7);

const MOVIMIENTOS_GENERADOS = Array.from({ length: 54 }, (_, i) => {
  const numero = 203055 - i;
  const consecutivo = i % 5 === 4 ? `0200${numero}-1` : `0200${numero}`;
  const estado = ESTADOS_GEN[i];
  const esParticular = rand() < 0.15;
  const ubicacion = pick(UBICACIONES_GEN, rand);
  const fecha = sumarDias('2026-07-21', -Math.floor(i * 1.3) - Math.floor(rand() * 2));
  const cantidadArticulos = 1 + Math.floor(rand() * 2);
  const articulos = Array.from({ length: cantidadArticulos }, (_, j) => {
    const base = pick(ARTICULOS_POOL_GEN, rand);
    const cantidadSolicitada = 1 + Math.floor(rand() * 10);
    const cantidadEntregada = Math.max(1, cantidadSolicitada - Math.floor(rand() * 2));
    if (estado !== 'confirmado') {
      return articulo({
        item: j + 1, codigo: base.codigo, descripcion: base.descripcion, cantidadSolicitada, cantidadEntregada,
      });
    }
    const costoTotalNeto = base.precio * cantidadEntregada;
    return articulo({
      item: j + 1,
      codigo: base.codigo,
      descripcion: base.descripcion,
      cantidadSolicitada,
      cantidadEntregada,
      costoUnidad: { anterior: base.precio, unidad: base.precio, descuento: 0, neto: base.precio },
      costoTotal: { unidad: costoTotalNeto, descuento: 0, neto: costoTotalNeto },
      confirmado: true,
    });
  });

  return {
    id: consecutivo,
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo,
    noAdmision: `0200277${String(220 - i * 3).padStart(3, '0')}`,
    noPrestacion: i % 2 === 0 ? `0200000${String(193 - i).padStart(3, '0')}` : `0201706${String(740 - i).padStart(3, '0')}`,
    fecha,
    hora: pick(HORAS_GEN, rand),
    procedencia: esParticular ? 'PARTICULAR' : 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: pick(NOMBRES_PACIENTES_GEN, rand),
    ubicacion: `Sede 01 · Área: ${ubicacion.area} · C.Costo: ${ubicacion.costo}`,
    idContrato: pick(IDCONTRATOS_GEN, rand),
    tipo: 'debito',
    tipoArticulo: pick(TIPO_ARTICULO_OPTIONS.slice(1), rand).value,
    procedenciaTipo: esParticular ? 'particular' : 'salud',
    estado,
    trns: 'sal',
    fechaContable: sumarDias(fecha, 2),
    confirmo: estado === 'confirmado' ? pick(CONFIRMADORES_GEN, rand) : '',
    permitirEditarCostos: estado === 'confirmado',
    articulos,
  };
});

export const MOVIMIENTOS = [...MOVIMIENTOS_BASE, ...MOVIMIENTOS_GENERADOS];
