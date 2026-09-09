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
// Bodega/Id.Sede de la referencia). V1 no tiene selector de bodega.
export const CONTEXTO_BODEGA = {
  anio: '2026',
  grupoBodega: '01',
  bodega: 'FARMACIA PISO 3',
  idSede: '01',
};

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
  { value: 'sin-confirmar', label: 'Sin Confirmar' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'todos', label: 'Todos' },
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

export const MOVIMIENTOS = [
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
