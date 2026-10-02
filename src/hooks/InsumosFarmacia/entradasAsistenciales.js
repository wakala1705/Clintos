// Lógica pura de "Entradas asistenciales" (módulo contable → Inventario): el
// registro de todas las devoluciones de insumos que vuelven a farmacia. Hoy hay
// dos orígenes: las devoluciones que genera Cirugía al registrar el consumo
// (en vivo, ver listarDevolucionesCirugia en mockCirugiaData.js) y un histórico
// de ejemplo de otras áreas. Sin React ni acceso al mock (ver __tests__/).

export const ESTADO_ENTRADA_OPTIONS = [
  { value: 'todos', label: 'Todas' },
  { value: 'confirmada', label: 'Confirmadas' },
  { value: 'anulada', label: 'Anuladas' },
];

export const ORIGEN_ENTRADA_OPTIONS = [
  { value: 'todos', label: 'Todos los orígenes' },
  { value: 'Cirugía', label: 'Cirugía' },
  { value: 'Hospitalización', label: 'Hospitalización' },
  { value: 'Urgencias', label: 'Urgencias' },
];

// Histórico de ejemplo (sin backend, mismo criterio que el resto de mocks): devoluciones
// de otras áreas, con consecutivos ENT-1xxxxx para no chocar con los de Cirugía (ENT-0000xx).
const item = (codigo, nombre, cantidad, noLote) => ({
  codigo, nombre, cantidad, noLote, manejaLote: true,
});
export const ENTRADAS_HISTORICAS = [
  {
    id: 'ENT-100412', consecutivo: 'ENT-100412', fecha: '2026-10-01', hora: '16:20', origen: 'Hospitalización',
    referencia: 'Admisión 0200277323', paciente: 'GARCIA GARCIA ANGELICA MARIA', documento: 'CC 52.123.456',
    ubicacion: 'Hospitalización Piso 2', usuario: 'Enf. García López Mónica', estado: 'confirmada',
    items: [item('MX0000169', 'Cloruro de sodio 0.9% x 500 ml solución inyectable', 2, 'L25B0412'), item('MX0000497', 'Cloruro de sodio 0.9% x 100 ml bolsa con adaptador', 1, 'L25C0877')],
  },
  {
    id: 'ENT-100411', consecutivo: 'ENT-100411', fecha: '2026-10-01', hora: '11:05', origen: 'Urgencias',
    referencia: 'Admisión 0200277262', paciente: 'UNICIA GOKU', documento: 'CC 79.456.123',
    ubicacion: 'Urgencias', usuario: 'Enf. Ramírez Castro Juan', estado: 'confirmada',
    items: [item('MX0000211', 'Dipirona 1 g solución inyectable', 3, 'L26A0231')],
  },
  {
    id: 'ENT-100409', consecutivo: 'ENT-100409', fecha: '2026-09-30', hora: '17:48', origen: 'Cirugía',
    referencia: 'Programación 12340', paciente: 'MARTINEZ SOTO LUCIA', documento: 'CC 41.220.318',
    ubicacion: 'Quirófano #2', usuario: 'Camilo Grondona', estado: 'confirmada',
    items: [item('DM000231', 'Gasas estériles', 5, 'L25D1190'), item('DM000518', 'Sutura Vicryl 2-0', 2, 'L26B0044'), item('DM000774', 'Guantes estériles talla 7', 4, 'L25A0903')],
  },
  {
    id: 'ENT-100405', consecutivo: 'ENT-100405', fecha: '2026-09-30', hora: '09:12', origen: 'Hospitalización',
    referencia: 'Admisión 0200277313', paciente: 'DE LA ESPRIELLA PARRA ALFONSO', documento: 'CC 12.998.440',
    ubicacion: 'Hospitalización Piso 3', usuario: 'Enf. García López Mónica', estado: 'anulada',
    items: [item('MX0000390', 'Metoclopramida 10 mg / 2 ml sol. inyectable', 4, 'L25E0655')],
  },
  {
    id: 'ENT-100398', consecutivo: 'ENT-100398', fecha: '2026-09-29', hora: '15:31', origen: 'Urgencias',
    referencia: 'Admisión 0200277321', paciente: 'CARPIO PITALUA ISA', documento: 'CC 1.045.220.334',
    ubicacion: 'Urgencias', usuario: 'Dr. Morales Peña Carlos', estado: 'confirmada',
    items: [item('MX0000005', 'Acetaminofén 500 mg tableta', 10, 'L26C0310'), item('MX0000434', 'Omeprazol sódico 40 mg solución inyectable', 1, 'L25F0128')],
  },
  {
    id: 'ENT-100391', consecutivo: 'ENT-100391', fecha: '2026-09-28', hora: '18:02', origen: 'Cirugía',
    referencia: 'Programación 12331', paciente: 'RAMIREZ ORTIZ PEDRO', documento: 'CC 80.115.902',
    ubicacion: 'Quirófano #1', usuario: 'Camilo Grondona', estado: 'confirmada',
    items: [item('DM000345', 'Trocar 5mm', 1, 'L26D0412'), item('DM000612', 'Clips de titanio', 3, 'L25G0221')],
  },
];

// Una entrada por cada devolución registrada desde Cirugía. `devoluciones` son las de
// listarDevolucionesCirugia(): { consecutivo, usuario, fecha ISO con hora, estado, items,
// cirugia: { id, sala, paciente, documento } }. El consecutivo se arma con el de la devolución.
export function entradasDesdeDevoluciones(devoluciones) {
  return devoluciones.map((d) => {
    const [fecha, hora] = d.fecha.split('T');
    const consecutivo = `ENT-${String(d.consecutivo).padStart(6, '0')}`;
    return {
      id: consecutivo,
      consecutivo,
      fecha,
      hora: hora.slice(0, 5),
      origen: 'Cirugía',
      referencia: `Programación ${d.cirugia.id}`,
      paciente: d.cirugia.paciente.toUpperCase(),
      documento: d.cirugia.documento,
      ubicacion: d.cirugia.sala,
      usuario: d.usuario,
      estado: d.estado === 'anulada' ? 'anulada' : 'confirmada',
      items: d.items.map((i) => ({
        codigo: i.codigo, nombre: i.nombre, cantidad: i.cantidad, noLote: i.noLote, manejaLote: Boolean(i.manejaLote),
      })),
    };
  });
}

// Más recientes primero (fecha y hora); a igual momento, el consecutivo mayor.
export function ordenarEntradas(entradas) {
  return [...entradas].sort((a, b) => (
    `${b.fecha}T${b.hora}`.localeCompare(`${a.fecha}T${a.hora}`) || b.consecutivo.localeCompare(a.consecutivo)
  ));
}

export function filtrarEntradas(entradas, { busqueda = '', estado = 'todos', origen = 'todos' } = {}) {
  const texto = busqueda.trim().toLowerCase();
  return entradas.filter((e) => {
    if (estado !== 'todos' && e.estado !== estado) return false;
    if (origen !== 'todos' && e.origen !== origen) return false;
    if (!texto) return true;
    return [e.consecutivo, e.referencia, e.paciente, e.documento]
      .some((v) => v.toLowerCase().includes(texto));
  });
}

export function conteosEstado(entradas) {
  const cuenta = (estado) => entradas.filter((e) => e.estado === estado).length;
  return { todos: entradas.length, confirmada: cuenta('confirmada'), anulada: cuenta('anulada') };
}

// Unidades devueltas por una entrada (suma de sus ítems).
export const unidadesEntrada = (entrada) => entrada.items.reduce((t, i) => t + i.cantidad, 0);

// Totales del conjunto visible; las anuladas no cuentan como devueltas.
export function totalesEntradas(entradas) {
  const vigentes = entradas.filter((e) => e.estado !== 'anulada');
  return {
    entradas: vigentes.length,
    insumos: vigentes.reduce((t, e) => t + e.items.length, 0),
    unidades: vigentes.reduce((t, e) => t + unidadesEntrada(e), 0),
  };
}
