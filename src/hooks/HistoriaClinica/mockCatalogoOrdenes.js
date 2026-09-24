// Catálogo mock para el formulario "Iniciar nueva orden" (ver
// OrdenesMedicasTab/NuevaOrdenForm) — solo LAYOUT, sin backend real (mismo
// criterio que mockOrdenesMedicas.js). Cada categoría del riel
// (ordenSecciones.js) trae una lista corta de ítems buscables; varios
// reutilizan las mismas descripciones que ya existen en mockOrdenesMedicas.js
// (LOSARTAN, DIPIRONA, HEMOGRAMA...) para que una orden armada acá luzca
// consistente con las órdenes de ejemplo ya guardadas. Cada ítem lleva
// `codigo` (línea secundaria del resultado de búsqueda, ver ItemFormPanel.jsx)
// y `servicioContratado` (contratado/no contratado — ambos estados alternan
// dentro de cada categoría a propósito, para que el banner de selección
// muestre las dos variantes sin tener que cambiar de categoría, encargo
// explícito).
let contadorCodigo = 0;
function nuevoCodigo() {
  contadorCodigo += 1;
  const interno = String(20000000 + contadorCodigo * 733).padStart(8, '0');
  const sufijo = String(contadorCodigo).padStart(2, '0');
  const externo = String(contadorCodigo).padStart(7, '0');
  return `${interno}-01-0${sufijo}PBS - MX${externo}PBS`;
}

function mkItem(id, nombre, extra = {}) {
  return {
    id,
    nombre,
    codigo: nuevoCodigo(),
    servicioContratado: contadorCodigo % 2 === 1,
    ...extra,
  };
}

const CATALOGO = {
  medicamentos: [
    mkItem('cat-med-1', 'LOSARTAN POTASICO 50 MG TABLETA', { dosis: '50', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL' }),
    mkItem('cat-med-2', 'DIPIRONA 1 G SOLUCION INYECTABLE', { dosis: '1', unidad: 'gramo(s)', presentacion: 'SOLUCION INYECTABLE', via: 'INTRAVENOSA' }),
    mkItem('cat-med-3', 'ACETAMINOFEN 500 MG TABLETA', { dosis: '500', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL' }),
    mkItem('cat-med-4', 'OMEPRAZOL 20 MG CAPSULA', { dosis: '20', unidad: 'miligramo(s)', presentacion: 'CAPSULA', via: 'ORAL' }),
    mkItem('cat-med-5', 'METOPROLOL 50 MG TABLETA', { dosis: '50', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL' }),
    mkItem('cat-med-6', 'FUROSEMIDA 40 MG TABLETA', { dosis: '40', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL' }),
    mkItem('cat-med-7', 'ACICLOVIR 200 MG TABLETA', { dosis: '200', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL' }),
    mkItem('cat-med-8', 'ACIDO VALPROICO 500 MG SOLUCION INYECTABLE', { dosis: '500', unidad: 'miligramo(s)', presentacion: 'SOLUCION INYECTABLE', via: 'INTRAVENOSA' }),
    mkItem('cat-med-9', 'ABCIXIMAB 10 MG SOLUCION INYECTABLE', { dosis: '10', unidad: 'miligramo(s)', presentacion: 'SOLUCION INYECTABLE', via: 'INTRAVENOSA' }),
  ],
  laboratorios: [
    mkItem('cat-lab-1', 'HEMOGRAMA IV AUTOMATIZADO'),
    mkItem('cat-lab-2', 'ACIDO HOMOGENTESICO EN ORINA'),
    mkItem('cat-lab-3', 'ACETILCOLINA RECEPTORES ANTICUERPOS'),
    mkItem('cat-lab-4', 'PARCIAL DE ORINA'),
    mkItem('cat-lab-5', 'GLICEMIA BASAL'),
  ],
  procedimientosQuimioterapias: [
    mkItem('cat-pq-1', 'APLICACION DE QUIMIOTERAPIA AMBULATORIA'),
    mkItem('cat-pq-2', 'PROCEDIMIENTO DE INFUSION CONTINUA'),
    mkItem('cat-pq-3', 'COLOCACION DE CATETER PARA QUIMIOTERAPIA'),
  ],
  imagenologias: [
    mkItem('cat-img-1', 'RADIOGRAFIA DE TORAX'),
    mkItem('cat-img-2', 'ECOGRAFIA ABDOMINAL TOTAL'),
    mkItem('cat-img-3', 'TOMOGRAFIA DE CRANEO SIMPLE'),
  ],
  cirugias: [
    mkItem('cat-cir-1', 'COLECISTECTOMIA LAPAROSCOPICA'),
    mkItem('cat-cir-2', 'APENDICECTOMIA'),
    mkItem('cat-cir-3', 'HERNIORRAFIA INGUINAL'),
  ],
  consultas: [
    mkItem('cat-con-1', 'INTERCONSULTA POR CIRUGIA DE LA MANO'),
    mkItem('cat-con-2', 'INTERCONSULTA POR CARDIOLOGIA'),
    mkItem('cat-con-3', 'INTERCONSULTA POR NUTRICION'),
  ],
  ordenesGenerales: [
    mkItem('cat-og-1', 'ORDEN GENERAL'),
    mkItem('cat-og-2', 'DIETA HOSPITALARIA'),
    mkItem('cat-og-3', 'CUIDADOS DE ENFERMERIA'),
  ],
  radioterapiaBraquiterapia: [
    mkItem('cat-rt-1', 'RADIOTERAPIA EXTERNA CONFORMADA'),
    mkItem('cat-rt-2', 'BRAQUITERAPIA DE ALTA TASA'),
  ],
  medicamentosInvestigacion: [
    mkItem('cat-mi-1', 'MEDICAMENTO EN FASE III - PROTOCOLO A', { dosis: '', unidad: '', presentacion: '', via: '' }),
    mkItem('cat-mi-2', 'MEDICAMENTO EN FASE II - PROTOCOLO B', { dosis: '', unidad: '', presentacion: '', via: '' }),
  ],
  medicinaNuclear: [
    mkItem('cat-mn-1', 'GAMMAGRAFIA OSEA'),
    mkItem('cat-mn-2', 'PET-CT DE CUERPO ENTERO'),
  ],
  oxigeno: [
    mkItem('cat-ox-1', 'OXIGENO POR CANULA NASAL'),
    mkItem('cat-ox-2', 'OXIGENO POR MASCARA VENTURI'),
    mkItem('cat-ox-3', 'OXIGENO POR MASCARA DE NO REINHALACION'),
  ],
  protocolosQuimioterapia: [
    mkItem('cat-pq-1', 'PROTOCOLO FOLFOX'),
    mkItem('cat-pq-2', 'PROTOCOLO R-CHOP'),
    mkItem('cat-pq-3', 'PROTOCOLO AC-T'),
  ],
};

export function getCatalogoCategoria(clave) {
  return CATALOGO[clave] ?? [];
}

export const UNIDADES_MEDIDA = [
  { value: 'miligramo(s)', label: 'Miligramo(s)' },
  { value: 'gramo(s)', label: 'Gramo(s)' },
  { value: 'mililitro(s)', label: 'Mililitro(s)' },
  { value: 'unidad(es)', label: 'Unidad(es)' },
];

export const PRESENTACIONES = [
  { value: 'TABLETA', label: 'Tableta' },
  { value: 'CAPSULA', label: 'Cápsula' },
  { value: 'SOLUCION INYECTABLE', label: 'Solución inyectable' },
  { value: 'JARABE', label: 'Jarabe' },
  { value: 'CREMA', label: 'Crema' },
];

export const VIAS_ADMINISTRACION = [
  { value: 'ORAL', label: 'Oral' },
  { value: 'INTRAVENOSA', label: 'Intravenosa' },
  { value: 'INTRAMUSCULAR', label: 'Intramuscular' },
  { value: 'SUBCUTANEA', label: 'Subcutánea' },
  { value: 'TOPICA', label: 'Tópica' },
];

export const UNIDADES_TIEMPO = [
  { value: 'horas', label: 'Horas' },
  { value: 'dias', label: 'Días' },
];
