// Catálogo mock para el formulario "Iniciar nueva orden" (ver
// OrdenesMedicasTab/NuevaOrdenForm) — solo LAYOUT, sin backend real (mismo
// criterio que mockOrdenesMedicas.js). Cada categoría del riel
// (ordenSecciones.js) trae una lista corta de ítems buscables; varios
// reutilizan las mismas descripciones que ya existen en mockOrdenesMedicas.js
// (LOSARTAN, DIPIRONA, HEMOGRAMA...) para que una orden armada acá luzca
// consistente con las órdenes de ejemplo ya guardadas.
const CATALOGO = {
  medicamentos: [
    { id: 'cat-med-1', nombre: 'LOSARTAN POTASICO 50 MG TABLETA', dosis: '50', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL' },
    { id: 'cat-med-2', nombre: 'DIPIRONA 1 G SOLUCION INYECTABLE', dosis: '1', unidad: 'gramo(s)', presentacion: 'SOLUCION INYECTABLE', via: 'INTRAVENOSA' },
    { id: 'cat-med-3', nombre: 'ACETAMINOFEN 500 MG TABLETA', dosis: '500', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL' },
    { id: 'cat-med-4', nombre: 'OMEPRAZOL 20 MG CAPSULA', dosis: '20', unidad: 'miligramo(s)', presentacion: 'CAPSULA', via: 'ORAL' },
    { id: 'cat-med-5', nombre: 'METOPROLOL 50 MG TABLETA', dosis: '50', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL' },
    { id: 'cat-med-6', nombre: 'FUROSEMIDA 40 MG TABLETA', dosis: '40', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL' },
    { id: 'cat-med-7', nombre: 'ACICLOVIR 200 MG TABLETA', dosis: '200', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL' },
  ],
  laboratorios: [
    { id: 'cat-lab-1', nombre: 'HEMOGRAMA IV AUTOMATIZADO' },
    { id: 'cat-lab-2', nombre: 'ACIDO HOMOGENTESICO EN ORINA' },
    { id: 'cat-lab-3', nombre: 'ACETILCOLINA RECEPTORES ANTICUERPOS' },
    { id: 'cat-lab-4', nombre: 'PARCIAL DE ORINA' },
    { id: 'cat-lab-5', nombre: 'GLICEMIA BASAL' },
  ],
  procedimientosQuimioterapias: [
    { id: 'cat-pq-1', nombre: 'APLICACION DE QUIMIOTERAPIA AMBULATORIA' },
    { id: 'cat-pq-2', nombre: 'PROCEDIMIENTO DE INFUSION CONTINUA' },
    { id: 'cat-pq-3', nombre: 'COLOCACION DE CATETER PARA QUIMIOTERAPIA' },
  ],
  imagenologias: [
    { id: 'cat-img-1', nombre: 'RADIOGRAFIA DE TORAX' },
    { id: 'cat-img-2', nombre: 'ECOGRAFIA ABDOMINAL TOTAL' },
    { id: 'cat-img-3', nombre: 'TOMOGRAFIA DE CRANEO SIMPLE' },
  ],
  cirugias: [
    { id: 'cat-cir-1', nombre: 'COLECISTECTOMIA LAPAROSCOPICA' },
    { id: 'cat-cir-2', nombre: 'APENDICECTOMIA' },
    { id: 'cat-cir-3', nombre: 'HERNIORRAFIA INGUINAL' },
  ],
  consultas: [
    { id: 'cat-con-1', nombre: 'INTERCONSULTA POR CIRUGIA DE LA MANO' },
    { id: 'cat-con-2', nombre: 'INTERCONSULTA POR CARDIOLOGIA' },
    { id: 'cat-con-3', nombre: 'INTERCONSULTA POR NUTRICION' },
  ],
  ordenesGenerales: [
    { id: 'cat-og-1', nombre: 'ORDEN GENERAL' },
    { id: 'cat-og-2', nombre: 'DIETA HOSPITALARIA' },
    { id: 'cat-og-3', nombre: 'CUIDADOS DE ENFERMERIA' },
  ],
  radioterapiaBraquiterapia: [
    { id: 'cat-rt-1', nombre: 'RADIOTERAPIA EXTERNA CONFORMADA' },
    { id: 'cat-rt-2', nombre: 'BRAQUITERAPIA DE ALTA TASA' },
  ],
  medicamentosInvestigacion: [
    { id: 'cat-mi-1', nombre: 'MEDICAMENTO EN FASE III - PROTOCOLO A', dosis: '', unidad: '', presentacion: '', via: '' },
    { id: 'cat-mi-2', nombre: 'MEDICAMENTO EN FASE II - PROTOCOLO B', dosis: '', unidad: '', presentacion: '', via: '' },
  ],
  medicinaNuclear: [
    { id: 'cat-mn-1', nombre: 'GAMMAGRAFIA OSEA' },
    { id: 'cat-mn-2', nombre: 'PET-CT DE CUERPO ENTERO' },
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
