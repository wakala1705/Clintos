// Autorizaciones pendientes de facturar que alimentan
// @/Components/FacturacionAutorizaciones. Fechas ISO (YYYY-MM-DD).
//  - estado: 'sin-facturar' | 'parcial' | 'facturada'
//  - kcnt: ID del contrato (mismo id del catálogo de contratos, ver
//    @/hooks/CatalogoContratosTerceroModal).
//  - items[].n: naturaleza del servicio (C consulta, P procedimiento,
//    M medicamento/insumo).
//  - items[].noFactura: solo los ítems ya facturados (autorizaciones
//    parciales o facturadas).
// valorTotal / valorCopago se derivan de los ítems (ver totalesAutorizacion).

function item(n, servicio, cant, valor, copago = 0, noFactura = '') {
  return {
    n, servicio, cant, valor, copago, tercero: 'NUEVA EPS', noFactura,
  };
}

const RAW_AUTORIZACIONES = [
  {
    id: 1, fecha: '2026-10-02', noAutorizacion: '0100000287',
    idAfiliado: '1020304050', nombreAfiliado: 'LAURA GOMEZ RESTREPO',
    idAreaFuncional: 'CEX01', centroCosto: 'CONSULTA EXTERNA', idPlan: 'CONT01', kcnt: 340,
    estado: 'sin-facturar',
    items: [
      item('C', 'CONSULTA DE PRIMERA VEZ POR MEDICINA GENERAL', 1, 38500, 4600),
      item('P', 'HEMOGRAMA IV', 1, 21300),
    ],
  },
  {
    id: 2, fecha: '2026-10-03', noAutorizacion: '0100000291',
    idAfiliado: '71234567', nombreAfiliado: 'CARLOS ANDRES MEJIA PEREZ',
    idAreaFuncional: 'IMG02', centroCosto: 'IMAGENOLOGIA', idPlan: 'CONT01', kcnt: 340,
    estado: 'sin-facturar',
    items: [
      item('P', 'ECOGRAFIA DE ABDOMEN TOTAL', 1, 96800, 9100),
      item('P', 'RADIOGRAFIA DE TORAX (PA Y LATERAL)', 1, 54200),
    ],
  },
  {
    id: 3, fecha: '2026-10-05', noAutorizacion: '0100000304',
    idAfiliado: '43876512', nombreAfiliado: 'MARIA FERNANDA OSPINA LOPEZ',
    idAreaFuncional: 'CEX01', centroCosto: 'CONSULTA EXTERNA', idPlan: 'CONT01', kcnt: 340,
    estado: 'parcial',
    items: [
      item('C', 'CONSULTA DE CONTROL POR ORTOPEDIA Y TRAUMATOLOGIA', 1, 52000, 4600, 'FE-10234'),
      item('P', 'TERAPIA FISICA INTEGRAL', 6, 31400, 0),
      item('P', 'INFILTRACION ARTICULAR', 1, 148000),
    ],
  },
  {
    id: 4, fecha: '2026-10-06', noAutorizacion: '0100000312',
    idAfiliado: '1098765432', nombreAfiliado: 'JUAN SEBASTIAN TORRES VARGAS',
    idAreaFuncional: 'LAB03', centroCosto: 'LABORATORIO CLINICO', idPlan: 'CONT01', kcnt: 340,
    estado: 'sin-facturar',
    items: [
      item('P', 'GLICEMIA BASAL', 1, 9800),
      item('P', 'PERFIL LIPIDICO', 1, 42600),
      item('P', 'CREATININA EN SUERO', 1, 11200),
    ],
  },
  {
    id: 5, fecha: '2026-10-08', noAutorizacion: '0100000326',
    idAfiliado: '52987341', nombreAfiliado: 'ANA LUCIA RAMIREZ CASTRO',
    idAreaFuncional: 'URG01', centroCosto: 'URGENCIAS', idPlan: 'CONT01', kcnt: 340,
    estado: 'sin-facturar',
    items: [
      item('C', 'CONSULTA DE URGENCIAS POR MEDICINA GENERAL', 1, 61500, 0),
      item('M', 'ACETAMINOFEN 500 MG TABLETA', 10, 480),
      item('M', 'SOLUCION SALINA 0.9% X 500 ML', 2, 6900),
    ],
  },
  {
    id: 6, fecha: '2026-10-09', noAutorizacion: '0100000333',
    idAfiliado: '80123456', nombreAfiliado: 'PEDRO PABLO HERRERA DIAZ',
    idAreaFuncional: 'CEX01', centroCosto: 'CONSULTA EXTERNA', idPlan: 'CONT01', kcnt: 340,
    estado: 'facturada',
    items: [
      item('C', 'CONSULTA DE CONTROL POR MEDICINA INTERNA', 1, 58000, 4600, 'FE-10198'),
    ],
  },
  {
    id: 7, fecha: '2026-10-12', noAutorizacion: '0100000341',
    idAfiliado: '1017654321', nombreAfiliado: 'SOFIA VALENTINA MUNOZ AGUDELO',
    idAreaFuncional: 'CEX02', centroCosto: 'PEDIATRIA', idPlan: 'SUBS01', kcnt: 518,
    estado: 'sin-facturar',
    items: [
      item('C', 'CONSULTA DE PRIMERA VEZ POR PEDIATRIA', 1, 64200),
      item('P', 'VACUNACION ESQUEMA REGULAR', 1, 18900),
    ],
  },
  {
    id: 8, fecha: '2026-10-14', noAutorizacion: '0100000355',
    idAfiliado: '32456789', nombreAfiliado: 'LUZ MARINA CARDONA JARAMILLO',
    idAreaFuncional: 'IMG02', centroCosto: 'IMAGENOLOGIA', idPlan: 'SUBS01', kcnt: 518,
    estado: 'parcial',
    items: [
      item('P', 'MAMOGRAFIA BILATERAL', 1, 112000, 0, 'FE-10241'),
      item('P', 'ECOGRAFIA MAMARIA BILATERAL', 1, 89500),
    ],
  },
  {
    id: 9, fecha: '2026-10-16', noAutorizacion: '0100000367',
    idAfiliado: '98123456', nombreAfiliado: 'ANDRES FELIPE GIRALDO RUIZ',
    idAreaFuncional: 'HOS04', centroCosto: 'HOSPITALIZACION GENERAL', idPlan: 'SUBS01', kcnt: 518,
    estado: 'sin-facturar',
    items: [
      item('P', 'ESTANCIA HOSPITALIZACION HABITACION BIPERSONAL', 3, 215000),
      item('C', 'INTERCONSULTA POR CIRUGIA GENERAL', 1, 71000),
      item('M', 'CEFAZOLINA 1 G AMPOLLA', 6, 5400),
    ],
  },
  {
    id: 10, fecha: '2026-10-19', noAutorizacion: '0100000378',
    idAfiliado: '1036789012', nombreAfiliado: 'VALERIA ISABEL ARANGO MONSALVE',
    idAreaFuncional: 'CEX01', centroCosto: 'CONSULTA EXTERNA', idPlan: 'CONT01', kcnt: 340,
    estado: 'sin-facturar',
    items: [
      item('C', 'CONSULTA DE PRIMERA VEZ POR GINECOLOGIA', 1, 69800, 4600),
      item('P', 'CITOLOGIA CERVICO-UTERINA', 1, 23400),
    ],
  },
];

export function totalesAutorizacion(a) {
  return a.items.reduce(
    (t, it) => ({ valorTotal: t.valorTotal + it.cant * it.valor, valorCopago: t.valorCopago + it.copago }),
    { valorTotal: 0, valorCopago: 0 },
  );
}

export const AUTORIZACIONES = RAW_AUTORIZACIONES.map((a) => ({ ...a, ...totalesAutorizacion(a) }));

// Mismo catálogo que el filtro Estado de la pantalla.
export function coincideEstado(autorizacion, estado) {
  switch (estado) {
    case 'sin-facturar': return autorizacion.estado !== 'facturada'; // sin facturar y parciales
    case 'sin-facturar-solo': return autorizacion.estado === 'sin-facturar';
    case 'parciales': return autorizacion.estado === 'parcial';
    case 'facturadas': return autorizacion.estado === 'facturada';
    default: return true;
  }
}
