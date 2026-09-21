// Catálogo de plantillas de historia clínica para el modal que abre "Nueva
// atención" — solo LAYOUT, sin backend real (ver AGENTS.md/prompt de esta
// pantalla). Códigos y descripciones tomados del catálogo de referencia
// (captura del sistema legado) que se pidió replicar.

export const PLANTILLAS = [
  { codigo: 'CRECIMT2', descripcion: 'Atención integral a la primera infancia e infancia (WEB)' },
  { codigo: 'CRECIMTO', descripcion: 'Atención integral a la primera infancia e infancia' },
  { codigo: 'EVALPREO', descripcion: 'Evaluación preanestésica' },
  { codigo: 'AIEP25CE', descripcion: 'Historia clínica AIEPI atención del niño de 2 meses a 5 años' },
  { codigo: 'HCEO', descripcion: 'Historia clínica de consulta externa oncológica' },
  { codigo: 'INFOQIX', descripcion: 'Informe quirúrgico' },
  { codigo: 'PLANIFIC', descripcion: 'Planificación familiar' },
  { codigo: 'VITRECA', descripcion: 'Valoración inicial en terapia de rehabilitación cardiaca CE' },
];

// Catálogo de Hospitalización (/hospitalizacion/historia-clinica/[id]) —
// distinto al de Consulta Externa: más plantillas y con columna "Sexo" (a
// quién aplica la plantilla). Transcrito de la captura del sistema legado;
// las descripciones que la captura mostraba truncadas con "…" están
// completadas por inferencia, revisar contra el catálogo real.
const AMBOS = 'Ambos';

export const PLANTILLAS_HOSPITALIZACION = [
  { codigo: 'EMEDNOT', descripcion: 'ACTA DE ENTREGA DE MATERIALES O MEDICAMENTOS', sexo: AMBOS },
  { codigo: 'HURGV3', descripcion: 'AIEPI ONCOLOGICO', sexo: AMBOS },
  { codigo: 'PROTQX', descripcion: 'APLICACION DE POLIQUIMIOTERAPIA', sexo: AMBOS },
  { codigo: 'BRAQUIQX', descripcion: 'BRAQUITERAPIA DE ALTA TASA PARA HOSPITALIZACION', sexo: AMBOS },
  { codigo: 'EPI', descripcion: 'EPICRISIS', sexo: AMBOS },
  { codigo: 'EPIUCI', descripcion: 'EPICRISIS EN UCI', sexo: AMBOS },
  { codigo: 'HCTRLQX', descripcion: 'EVALUACION DE MORBILIDAD DEL TRATAMIENTO', sexo: AMBOS },
  { codigo: 'EVAPRE', descripcion: 'EVALUACIÓN PREANESTESICA', sexo: AMBOS },
  { codigo: 'EVO', descripcion: 'EVOLUCION', sexo: AMBOS },
  { codigo: 'EVOCA', descripcion: 'EVOLUCION DE CARDIOLOGIA (AMBULATORIO)', sexo: AMBOS },
  { codigo: 'ECARHOS', descripcion: 'EVOLUCION DE CARDIOLOGIA (HOSPITALIZACION)', sexo: AMBOS },
  { codigo: 'EVOJUH', descripcion: 'EVOLUCION DE MEDICINA ESPECIALIZADA', sexo: AMBOS },
  { codigo: 'ETRECAHO', descripcion: 'EVOLUCION DE TERAPIA DE REHABILITACION', sexo: AMBOS },
  { codigo: 'EVONU', descripcion: 'EVOLUCION POR NUTRICION', sexo: AMBOS },
  { codigo: 'HISCAR', descripcion: 'HISTORIA CLINICA DE CARDIOLOGIA', sexo: AMBOS },
  { codigo: 'EVOHOSP', descripcion: 'HISTORIA CLINICA DE EVOLUCION DE HOSPITALIZACION', sexo: AMBOS },
  { codigo: 'HINGCX', descripcion: 'HISTORIA CLINICA DE INGRESO A CIRUGÍA', sexo: AMBOS },
  { codigo: 'HIC', descripcion: 'HISTORIA CLINICA DE INTERCONSULTA', sexo: AMBOS },
  { codigo: 'HURG', descripcion: 'HISTORIA CLINICA DE URGENCIAS', sexo: AMBOS },
  { codigo: 'HURGV2', descripcion: 'HISTORIA CLINICA DE URGENCIAS', sexo: AMBOS },
  { codigo: 'URG', descripcion: 'HISTORIA CLINICA DE URGENCIAS', sexo: AMBOS },
  { codigo: 'TRICHA', descripcion: 'HISTORIA CLINICA INICIAL DE TERAPIA RESPIRATORIA', sexo: AMBOS },
  { codigo: 'ERICK', descripcion: 'HISTORIA CLINICA-PRUEBAS', sexo: AMBOS },
  { codigo: 'INGHOSPV', descripcion: 'HISTORIA CLÍNICA DE INGRESO A HOSPITALIZACION', sexo: AMBOS },
  { codigo: 'HCEAQ', descripcion: 'HISTORIA DE ENFERMERIA APLICACION QUIMIOTERAPIA', sexo: AMBOS },
  { codigo: 'HIEVANU', descripcion: 'HISTORIA DE INGRESO DE EVALUACION NUTRICIONAL', sexo: AMBOS },
  { codigo: 'HISRADIQ', descripcion: 'HISTORIA INICIO DE TRATAMIENTO DE RADIOTERAPIA', sexo: AMBOS },
  { codigo: 'INFCOL', descripcion: 'INFORME DE COLONOSCOPIA', sexo: AMBOS },
  { codigo: 'INFEND', descripcion: 'INFORME DE ENDOSCOPIA', sexo: AMBOS },
  { codigo: 'IMGDX', descripcion: 'INFORME DE ESTUDIO DE IMÁGENES DIAGNOSTICAS', sexo: AMBOS },
  { codigo: 'IMGDXW', descripcion: 'INFORME ESTUDIO DE IMÁGENES DIAGNOSTICAS', sexo: AMBOS },
  { codigo: 'INFOQIX2', descripcion: 'INFORME QUIRURGICO', sexo: AMBOS },
  { codigo: 'INFOQX', descripcion: 'INFORME QUIRURGICO', sexo: AMBOS },
  { codigo: 'INGHOSP', descripcion: 'INGRESO A HOSPITALIZACION', sexo: AMBOS },
  { codigo: 'HCUAI', descripcion: 'INGRESO UCI ADULTOS', sexo: AMBOS },
  { codigo: 'JUNCOV', descripcion: 'JUNTA MÉDICA ESPECIALIZADA', sexo: AMBOS },
  { codigo: 'JUST', descripcion: 'JUSTIFICACION DE ESTANCIA HOSPITALARIA', sexo: AMBOS },
  { codigo: 'JUEST', descripcion: 'JUSTIFICACIÓN DE ESTANCIA PROLONGADA', sexo: AMBOS },
  { codigo: 'PMEDNOTA', descripcion: 'PROCEDIMIENTOS AMBULATORIOS Y/O INTERVENCIONISTAS', sexo: AMBOS },
  { codigo: 'PROME', descripcion: 'PROCEDIMIENTOS AMBULATORIOS Y/O INTERVENCIONISTAS', sexo: AMBOS },
  { codigo: 'QUIM', descripcion: 'QUIMIOTERAPIA AMBULATORIA', sexo: AMBOS },
  { codigo: 'REMI', descripcion: 'REFERENCIA Y CONTRAREFERENCIA', sexo: AMBOS },
  { codigo: 'MIELO', descripcion: 'REPORTE DE MIELOGRAMA', sexo: AMBOS },
  { codigo: 'REINTE', descripcion: 'RESPUESTA A INTERCONSULTA', sexo: AMBOS },
  { codigo: 'REF', descripcion: 'SISTEMA DE REFERENCIA Y CONTRAREFERENCIA', sexo: AMBOS },
  { codigo: 'SOESPAHO', descripcion: 'SOLICITUD DE ESTUDIOS PATOLOGIA', sexo: AMBOS },
  { codigo: 'INTERC', descripcion: 'SOLICITUD DE INTERCONSULTA', sexo: AMBOS },
  { codigo: 'TEFE', descripcion: 'TERAPIA FISICA EVOLUCION', sexo: AMBOS },
  { codigo: 'TEFIHI', descripcion: 'TERAPIA FISICA HISTORIA INICIAL', sexo: AMBOS },
  { codigo: 'TREVO', descripcion: 'TERAPIA RESPIRATORIA EVOLUCION', sexo: AMBOS },
  { codigo: 'TRIA', descripcion: 'TRIAGE', sexo: AMBOS },
  { codigo: 'VITRECAH', descripcion: 'VALORACION INICIAL EN TERAPIA DE REHABILITACION CARDIACA', sexo: AMBOS },
];
