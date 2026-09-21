// Mock de la pestaña "Cargos" del modal CargosModal (ver
// @/Components/Admisiones/CargosModal) — replica la referencia legacy
// "Catálogo de CARGOS" de la admisión 0200277681 (PRUEBAMIL MILITEMS): 13
// prestaciones, cada una con su propio detalle de ítems.
//
// Solo se declaran los ítems (código, descripción, cantidad, valor unitario);
// "Total Servicios", el "Valor total" de cada cargo y los totales generales se
// calculan acá — así los montos siempre cuadran entre las 3 tablas. Las
// prestaciones de Imagenología/Medicamentos del 14.09 (área 74) tienen valor
// unitario 0.00 (aún sin tarifar) pero sí "Valor Uni. + IVA" (5° elemento de
// la tupla), igual que la referencia.
//
// Formato de montos: miles con coma y 2 decimales con punto (como la
// referencia), fijo en en-US para que el render de servidor y cliente
// coincidan.

const USUARIO = 'CLINTOS';

export function formatMonto(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// [id servicio, descripción, cantidad, valor unitario, valor unit. + IVA (default = unitario)]
const PRESTACIONES = [
  {
    prefijo: '15', nombre: 'MEDICAMENTOS PBS', fecha: '15.09.2026', hora: '15:16', numero: '0201707926', area: '01',
    items: [
      ['MX0000371PBS', 'LOSARTAN POTASICO 50 MG TABLETA', 2, 826],
      ['MX0000005PBS', 'ACETAMINOFEN 500 MG TABLETA', 8, 125],
    ],
  },
  {
    prefijo: '40', nombre: 'GASTROENTEROLOGIA', fecha: '14.09.2026', hora: '16:42', numero: '0201707906', area: '07',
    items: [
      ['MX0000480PBS', 'OMEPRAZOL 20 MG CAPSULA', 4, 3176],
    ],
  },
  {
    prefijo: '10', nombre: 'OTROS PROCEDIMIENTOS NO QUIRURGICOS', fecha: '14.09.2026', hora: '16:35', numero: '0201707905', area: '07',
    items: [
      ['935306C', 'APLICACION O CAMBIO DE YESO ESPICA ANTEBRAQUIAL', 1, 146500],
      ['935307C', 'APLICACION O CAMBIO DE YESO PARA INMOVILIZACION DE MIEMBRO SUPERIOR', 1, 137500],
      ['935400C', 'APLICACIÓN DE FÉRULA SOD', 1, 24800],
      ['935305C', 'APLICACION O CAMBIO DE YESO EN PIE', 1, 74000],
      ['991501C', 'INFUSIÓN DE ALIMENTACIÓN PARENTERAL', 1, 6987],
      ['998204C', 'MONITOREO DE OXIGENACIÓN CEREBRAL', 1, 1088458],
      ['991501C', 'INFUSIÓN DE ALIMENTACIÓN PARENTERAL', 1, 6987],
    ],
  },
  {
    prefijo: '39', nombre: 'SOPORTE DE SEDACION', fecha: '14.09.2026', hora: '16:31', numero: '0201707904', area: '07',
    items: [
      ['998702C', 'SOPORTE DE SEDACIÓN PARA CONSULTA EXTERNA', 1, 350000],
    ],
  },
  {
    prefijo: '21', nombre: 'GASES MEDICINALES', fecha: '14.09.2026', hora: '16:25', numero: '0201707903', area: '07',
    items: [
      ['V03AN01', 'OXIGENO GAS', 1, 17],
      ['S55209', 'TUBO EN T', 1, 17],
      ['S55208', 'VENTILADOR MECANICO', 1, 17],
      ['S55207', 'CAMARA DE HOOD', 1, 17],
      ['S55206', 'VENTURY 40% 50%', 1, 17],
      ['S55205', 'VENTURY 31% 35%', 1, 17],
      ['S55204', 'VENTURY 24% 28%', 1, 17],
      ['S55202', 'MASCARA RESERVORIO', 1, 17],
      ['S55201', 'CATETER O CANULA NASAL', 1, 17],
      ['S55200', 'MASCARA SIMPLE DE OXIGENO', 1, 17],
    ],
  },
  {
    prefijo: '09', nombre: 'DIAGNOSTICO Y TRATAMIENTO EN SISTEMAS VISUAL Y AUDITIVO', fecha: '14.09.2026', hora: '16:21', numero: '0201707902', area: '07',
    items: [
      ['952302C', 'POTENCIALES VISUALES EVOCADOS MONOCULARES', 1, 332500],
      ['954626C', 'POTENCIALES EVOCADOS AUDITIVOS DE CORTA LATENCIA', 1, 350000],
    ],
  },
  {
    prefijo: '14', nombre: 'MATERIALES E INSUMOS', fecha: '14.09.2026', hora: '16:03', numero: '0201707901', area: '07',
    items: [
      ['DM000366', 'JERINGA 50 ML PUNTA CATETER', 5, 6716],
      ['DM000037', 'AGUJA ULTRACLIP 18G X 10CM REF.MN1810', 5, 214825],
      ['DM000492', 'PROLENE 7-0 60CM - REF. M8702 2BV-01', 1, 76159],
      ['DM000082', 'CABESTRILLO - M', 1, 22130],
      ['DM000425', 'MASCARA PARA VENTILACION NO INVASIVA', 1, 807116],
      ['MX0000169PBS', 'CLORURO DE SODIO X 500 ML 0.9 G SOLUCION INYECTABLE', 5, 4234],
    ],
  },
  {
    prefijo: '26', nombre: 'RESONANCIA', fecha: '14.09.2026', hora: '15:57', numero: '0201707900', area: '07',
    items: [
      ['883101C', 'RESONANCIA MAGNÉTICA DE CEREBRO', 1, 1323596],
      ['883102C', 'RESONANCIA MAGNÉTICA DE ÓRBITAS', 1, 1323596],
      ['883401C', 'RESONANCIA MAGNÉTICA DE ABDOMEN', 1, 609448],
      ['883430C', 'RESONANCIA MAGNÉTICA DE VÍAS BILIARES', 1, 456501],
      ['883435C', 'RESONANCIA MAGNÉTICA DE VÍA URINARIA', 1, 1864363],
      ['883545C', 'RESONANCIA MAGNÉTICA DE ARTICULACIONES DE MIEMBROS', 1, 647036],
      ['883231C', 'RESONANCIA MAGNÉTICA DE COLUMNA LUMBOSACRA', 1, 628390],
      ['883210C', 'RESONANCIA MAGNÉTICA DE COLUMNA CERVICAL', 1, 609448],
      ['883908C', 'RESONANCIA MAGNÉTICA DE VASOS', 1, 1668114],
      ['883901C', 'RESONANCIA MAGNÉTICA DE CUERPO ENTERO', 1, 1864363],
      ['883590C', 'RESONANCIA MAGNÉTICA DE SISTEMA MUSCULOESQUELÉTICO', 1, 609448],
    ],
  },
  {
    prefijo: '09', nombre: 'DIAGNOSTICO Y TRATAMIENTO EN SISTEMAS VISUAL Y AUDITIVO', fecha: '14.09.2026', hora: '15:56', numero: '0201707899', area: '07',
    items: [
      ['952302C', 'POTENCIALES VISUALES EVOCADOS MONOCULARES', 1, 332500],
      ['954626C', 'POTENCIALES EVOCADOS AUDITIVOS DE CORTA LATENCIA', 1, 350000],
    ],
  },
  {
    prefijo: '41', nombre: 'CARDIOLOGIA', fecha: '14.09.2026', hora: '15:52', numero: '0201707898', area: '07',
    items: [
      ['881202C', 'ECOCARDIOGRAMA TRANSTORÁCICO', 1, 275533],
      ['881205C', 'ECOCARDIOGRAMA TRANSESOFÁGICO', 1, 350249],
      ['881206C', 'ECOCARDIOGRAMA TRANSESOFÁGICO CON DOPPLER', 1, 530955],
      ['881210C', 'ECOCARDIOGRAMA DE STRESS CON PRUEBA FARMACOLÓGICA', 1, 515609],
      ['894102C', 'PRUEBA DE ESFUERZO CARDIOVASCULAR', 1, 127989],
      ['895001C', 'MONITOREO ELECTROCARDIOGRÁFICO CONTINUO', 1, 206527],
      ['895004C', 'MONITOREO AMBULATORIO DE PRESIÓN ARTERIAL', 1, 206527],
      ['895100C', 'ELECTROCARDIOGRAMA DE RITMO O DE SUPERFICIE', 1, 22702],
      ['895101C', 'ELECTROCARDIOGRAMA DE RITMO O DE SUPERFICIE CON REGISTRO PROLONGADO', 1, 256000],
    ],
  },
  {
    prefijo: '19', nombre: 'LABORATORIO CLINICO', fecha: '14.09.2026', hora: '15:36', numero: '0201707896', area: '07',
    items: [
      ['903801C', 'ÁCIDO ÚRICO', 1, 8912],
      ['903803C', 'ÁCIDO FÓLICO', 1, 42180],
      ['903804C', 'ÁCIDO LÁCTICO', 1, 27350],
      ['903807C', 'ÁCIDO VALPROICO', 1, 96300],
      ['903810C', 'ACTH (HORMONA ADRENOCORTICOTROPA)', 1, 188540],
      ['903811C', 'ADENOSINA DEAMINASA', 1, 54720],
      ['903812C', 'ADRENALINA (EPINEFRINA)', 1, 156900],
      ['903813C', 'ALANINA AMINOTRANSFERASA (TGP)', 1, 12458],
      ['903814C', 'ALBÚMINA', 1, 9870],
      ['903815C', 'ALDOLASA', 1, 61430],
      ['903816C', 'ALDOSTERONA', 1, 214600],
      ['903817C', 'ALFA FETOPROTEÍNA', 1, 132050],
      ['903818C', 'ALFA 1 ANTITRIPSINA', 1, 176200],
      ['903819C', 'ALFA 2 MACROGLOBULINA', 1, 143800],
      ['903820C', 'ALCOHOL ETÍLICO', 1, 38610],
      ['903821C', 'ALERGENOS ESPECÍFICOS (IGE)', 1, 312480],
      ['903822C', 'ALUMINIO EN ORINA', 1, 118900],
      ['903823C', 'ÁCIDO HIPÚRICO', 1, 47260],
      ['903824C', 'ÁCIDO VANILMANDÉLICO', 1, 236750],
      ['903825C', 'ÁCIDO 5-HIDROXIINDOLACÉTICO', 1, 268300],
      ['903826C', 'ÁCIDO DELTA AMINOLEVULÍNICO', 1, 198420],
      ['903827C', 'ÁCIDO METILMALÓNICO', 1, 344900],
      ['903829C', 'ÁCIDOS ORGÁNICOS CUANTITATIVOS EN ORINA', 1, 1170345],
      ['903611C', 'ALUMINIO EN SUERO', 1, 109748],
      ['903806C', 'AMILASA EN ORINA DE 24 HORAS', 1, 25846],
      ['903871C', 'AMILASA EN ORINA PARCIAL', 1, 10635],
      ['903805C', 'AMILASA EN SUERO U OTROS FLUIDOS', 1, 17697],
      ['908309C', 'AMINOÁCIDOS CUALITATIVOS', 1, 524120],
      ['908338C', 'AMINOÁCIDOS CUANTITATIVOS', 1, 1021989],
      ['908311C', 'AMINOÁCIDOS POR DINITROFENILHIDRACINA', 1, 226824],
      ['903602C', 'AMONIO', 1, 52014],
      ['904501C', 'ANDROSTENEDIONA', 1, 95539],
    ],
  },
  {
    prefijo: '02', nombre: 'IMAGENOLOGIA Y RADIOLOGIA', fecha: '14.09.2026', hora: '14:36', numero: '0201707894', area: '74',
    items: [
      ['871070C', 'RADIOGRAFÍA DINÁMICA DE COLUMNA VERTEBRAL', 1, 0, 132095],
      ['873123C', 'RADIOGRAFIAS COMPARATIVAS DE EXTREMIDADES', 1, 0, 14489],
      ['871019C', 'RADIOGRAFÍA DE COLUMNA UNIÓN CERVICODORSAL', 1, 0, 40052],
      ['873311C', 'RADIOGRAFÍA DE ANTEVERSIÓN FEMORAL', 1, 0, 39977],
      ['CT000868', 'EH1A03 PIN LISO CLAVO DE HUMERO OSTEOSINTESIS', 1, 0, 60651],
    ],
  },
  {
    prefijo: '15', nombre: 'MEDICAMENTOS PBS', fecha: '14.09.2026', hora: '08:44', numero: '0201707883', area: '74',
    items: [
      ['MX0000005PBS', 'ACETAMINOFEN 500 MG TABLETA', 4, 0, 125],
      ['MX0000026PBS', 'ACICLOVIR 250 MG SOLUCION INYECTABLE', 1, 0, 83765],
      ['MX0000951PBS', 'ONDANSETRON 4MG TABLETA', 1, 0, 16000],
      ['MX0000031PBS', 'ACIDO VALPROICO 250 MG TABLETA', 1, 0, 1295],
    ],
  },
];

const ZERO = formatMonto(0);

function totalPrestacion(p) {
  return p.items.reduce((sum, [, , cant, uni]) => sum + cant * uni, 0);
}

// Filas de la tabla de cargos, en el orden de CARGOS_COLUMNS (CargosModal.jsx):
// servicio, prefijo, nombre del prefijo, fecha y hora, N° de prestación, área,
// NA (vacío), valor total, copago, V. moderadora, P. comp., excedente, usuario.
export const CARGOS_ROWS = PRESTACIONES.map((p) => {
  const total = formatMonto(totalPrestacion(p));
  return [
    '01', p.prefijo, p.nombre, `${p.fecha} ${p.hora}`, p.numero, p.area, '',
    total, ZERO, ZERO, ZERO, total, USUARIO,
  ];
});

// Detalle de cada prestación, indexado por su N° de prestación (columna 5 de
// CARGOS_ROWS), en el orden de DETALLE_COLUMNS: item, id servicio,
// descripción, cantidad, valor uni., valor uni. IVA, valor uni. + IVA, total
// servicios, copago, V. moderadora.
export const DETALLE_BY_PRESTACION = Object.fromEntries(PRESTACIONES.map((p) => [
  p.numero,
  p.items.map(([id, desc, cant, uni, uniIva = uni], i) => [
    String(i + 1).padStart(3, '0'), id, desc, String(cant),
    formatMonto(uni), ZERO, formatMonto(uniIva), formatMonto(cant * uni), ZERO, ZERO,
  ]),
]));

const TOTAL_PRESTACIONES = PRESTACIONES.reduce((sum, p) => sum + totalPrestacion(p), 0);

// Resumen bajo la tabla de cargos: [etiqueta, valor].
export const CARGOS_TOTALS = [
  ['Vr. Prestaciones', formatMonto(TOTAL_PRESTACIONES)],
  ['Vr. Copago', ZERO],
  ['Vr. Pago Com:', ZERO],
  ['Vr. Administradora:', formatMonto(TOTAL_PRESTACIONES)],
];
