// Órdenes médicas de ejemplo para la pestaña "Órdenes médicas" de
// AtencionPaciente — solo LAYOUT, sin backend real (mismo criterio que
// mockHistoriaClinicaRecords.js). Tomadas de la captura del sistema legado;
// las dos órdenes de GUSTAVO PETRO URREGO figuran a nombre de CAMILO
// GRONDONA (el usuario actual, ver DOCTOR en mockAgendaData.js) para que el
// filtro "Mis órdenes" tenga algo que mostrar.
//
// `medicamentos` alimenta la previsualización de la orden seleccionada
// (OrdenPreview): la de la orden 1859 replica la captura de referencia; las
// demás son datos de ejemplo. `fechaProgramada` ausente = "SIN FECHA".
const MEDICAMENTOS_1859 = [
  { id: 'm1', descripcion: 'LOSARTAN POTASICO 50 MG TABLETA', servicioContratado: true, dosis: '50', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL', frecuencia: 'Cada 8 horas', duracion: '24 horas', cantidad: '3', prioritario: false, observaciones: '' },
  { id: 'm2', descripcion: 'DIPIRONA 1 G SOLUCION INYECTABLE', servicioContratado: true, dosis: '1', unidad: 'gramo(s)', presentacion: 'SOLUCION INYECTABLE', via: 'INTRAVENOSA', frecuencia: 'Cada 12 horas', duracion: '24 horas', cantidad: '2', prioritario: false, observaciones: '' },
  { id: 'm3', descripcion: 'ACETAMINOFEN 500 MG TABLETA', servicioContratado: true, dosis: '500', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL', frecuencia: 'Cada 8 horas', duracion: '24 horas', cantidad: '3', prioritario: false, observaciones: '' },
];

const ORDENES = [
  { id: 'om-1859', numero: '1859', fecha: '21.SEP.2026', hora: '10:41', tituloNota: 'ORDEN MÉDICA', autor: 'CAMILO GRONDONA', especialidad: 'CARDIOLOGÍA', ambito: 'QX', medicamentos: MEDICAMENTOS_1859 },
  {
    id: 'om-1858', numero: '1858', fecha: '21.SEP.2026', hora: '10:21', tituloNota: 'ORDEN MÉDICA', autor: 'JOSE MARIO PORTO VALIENTE', especialidad: 'CARDIOLOGÍA', ambito: 'QX', fechaProgramada: '22.SEP.2026',
    // Orden con los tres tipos de servicio (medicamentos, consultas y
    // laboratorios) — replica la captura de referencia con varias secciones.
    // Consultas y laboratorios no llevan dosis/unidad/presentación/vía/
    // frecuencia/duración: esas celdas se muestran como "-" sombreado.
    medicamentos: [
      { id: 'm1', descripcion: 'ACETAMINOFEN 500 MG TABLETA', servicioContratado: true, dosis: '500', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL', frecuencia: 'Cada 8 horas', duracion: '5 dias', cantidad: '15', prioritario: false, observaciones: '' },
      { id: 'm2', descripcion: 'ACICLOVIR 200 MG TABLETA', servicioContratado: true, dosis: '200', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL', frecuencia: 'Cada 1 dias', duracion: '4 dias', cantidad: '5', prioritario: false, observaciones: '' },
    ],
    consultas: [
      { id: 'c1', descripcion: 'INTERCONSULTA POR CIRUGIA DE LA MANO', servicioContratado: false, cantidad: '1', prioritario: false, observaciones: '' },
    ],
    laboratorios: [
      { id: 'l1', descripcion: 'HEMOGRAMA IV (HEMOGLOBINA HEMATOCRITO RECUENTO DE ERITROCITOS ÍNDICES ERITROCITARIOS LEUCOGRAMA RECUENTO DE PLAQUETAS ÍNDICES PLAQUETARIOS Y MORFOLOGÍA ELECTRÓNICA E HISTOGRAMA) AUTOMATIZADO', servicioContratado: true, cantidad: '1', prioritario: false, observaciones: '' },
      { id: 'l2', descripcion: 'ACIDO HOMOGENTESICO EN ORINA', servicioContratado: false, cantidad: '1', prioritario: false, observaciones: '' },
      { id: 'l3', descripcion: 'ACETILCOLINA RECEPTORES ANTICUERPOS FIJADORES SEMIAUTOMATIZADO O AUTOMATIZADO', servicioContratado: true, cantidad: '1', prioritario: false, observaciones: '' },
    ],
  },
  {
    id: 'om-1840', numero: '1840', fecha: '18.SEP.2026', hora: '11:34', tituloNota: 'ORDEN MÉDICA', autor: 'CAMILO GRONDONA', especialidad: 'CARDIOLOGÍA', ambito: 'QX',
    medicamentos: [
      { id: 'm1', descripcion: 'FUROSEMIDA 40 MG TABLETA', servicioContratado: true, dosis: '40', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL', frecuencia: 'Cada 12 horas', duracion: '48 horas', cantidad: '4', prioritario: false, observaciones: '' },
    ],
  },
  {
    id: 'om-1839', numero: '1839', fecha: '18.SEP.2026', hora: '11:33', tituloNota: 'ORDEN MÉDICA', autor: 'JOSE MARIO PORTO VALIENTE', especialidad: 'CARDIOLOGÍA', ambito: 'QX',
    medicamentos: [
      { id: 'm1', descripcion: 'OMEPRAZOL 20 MG CAPSULA', servicioContratado: false, dosis: '20', unidad: 'miligramo(s)', presentacion: 'CAPSULA', via: 'ORAL', frecuencia: 'Cada 24 horas', duracion: '72 horas', cantidad: '3', prioritario: false, observaciones: 'En ayunas' },
      { id: 'm2', descripcion: 'METOPROLOL 50 MG TABLETA', servicioContratado: true, dosis: '50', unidad: 'miligramo(s)', presentacion: 'TABLETA', via: 'ORAL', frecuencia: 'Cada 12 horas', duracion: '72 horas', cantidad: '6', prioritario: false, observaciones: '' },
    ],
  },
];

// Orden de la cirugía de Claudia Patricia Ospina Henao (CC 31.902.576): es la
// orden que respalda su solicitud de Tiroidectomía total en Gestión de cirugías
// (paso 1 del chequeo, ver mockSolicitudes.js -- mismo N° y fecha de emisión).
// Sin `fechaProgramada`: la cirugía todavía no tiene fecha ("SIN FECHA" hasta
// que se programe).
const ORDEN_CIRUGIA_CLAUDIA = {
  id: 'om-1861', numero: '1861', fecha: '01.OCT.2026', hora: '10:15', tituloNota: 'ORDEN MÉDICA',
  autor: 'NATALIA ESCOBAR', especialidad: 'CABEZA Y CUELLO', ambito: 'QX',
  cirugias: [
    {
      id: 'ci1', descripcion: 'TIROIDECTOMIA TOTAL VIA ABIERTA', servicioContratado: true, cantidad: '1', prioritario: false,
      observaciones: 'Bocio multinodular con nódulo dominante TIRADS 4. Con neuromonitoreo del nervio laríngeo recurrente.',
    },
  ],
};

// Órdenes propias de un paciente, por número de documento (solo dígitos).
const ORDENES_POR_DOCUMENTO = {
  31902576: [ORDEN_CIRUGIA_CLAUDIA],
};

// Todas las órdenes del paciente, más recientes primero. Los pacientes con
// órdenes propias (ver ORDENES_POR_DOCUMENTO) ven solo las suyas; para el
// resto, igual que getRegistrosGruposHospitalizacion, se devuelve el mismo set
// de ejemplo hasta que haya órdenes reales.
export function getOrdenesMedicas(documento) {
  const propias = ORDENES_POR_DOCUMENTO[Number(String(documento ?? '').replace(/\D/g, ''))];
  return propias ?? ORDENES;
}
