// Datos del paso "Próximas citas" (ver ProximasCitasStep.jsx) — catálogos
// exactos del legacy (ver capturas de referencia), reordenados solo cuando
// el orden en sí no es información clínica (ver PROXIMA_CITA_OPCIONES) para
// que el select se lea de un vistazo; el resto conserva el orden y el texto
// tal cual aparecía, incluidas las abreviaturas de "Finalidad".

// Reordenado cronológicamente (el legacy lo mostraba con orden alfabético
// del texto — "1 mes" antes que "10 años" antes que "18 a 23 meses" —, que
// no se lee como una progresión real de edad). Mismos 18 valores, ninguno
// agregado ni quitado.
export const PROXIMA_CITA_OPCIONES = [
  '1 mes', '2 a 3 meses', '4 a 5 meses', '6 a 8 meses', '9 a 11 meses',
  '12 a 17 meses', '18 a 23 meses', '24 a 29 meses', '30 a 35 meses',
  '3 años', '4 años', '5 años', '6 años', '7 años', '8 años', '9 años', '10 años', '11 años',
];

export const PROFESIONAL_OPCIONES = ['Médico', 'Enfermería', 'Nutrición', 'Psicología', 'Odontología', 'Medicina familiar'];

export const TIPO_DIAGNOSTICO_OPCIONES = ['Confirmado Nuevo', 'Confirmado Repetido', 'Definitivo', 'Impresión Dx', 'Presuntivo'];

// Mismo orden del legacy (no alfabético) — catálogo estándar de "causa
// externa" de la consulta.
export const CAUSA_EXTERNA_OPCIONES = [
  'ACCIDENTE DE TRABAJO', 'ACCIDENTE DE TRÁNSITO', 'ACCIDENTE RÁBICO', 'ACCIDENTE OFÍDICO',
  'OTRO TIPO DE ACCIDENTE', 'EVENTO CATASTRÓFICO', 'LESIÓN POR AGRESIÓN', 'LESIÓN AUTO INFLIGIDA',
  'SOSPECHA DE MALTRATO FÍSICO', 'SOSPECHA DE ABUSO SEXUAL', 'SOSPECHA DE VIOLENCIA SEXUAL',
  'SOSPECHA DE MALTRATO EMOCIONAL', 'ENFERMEDAD GENERAL', 'ENFERMEDAD PROFESIONAL', 'OTRA',
];

// Catálogo estándar de "finalidad de la consulta" — mismas abreviaturas del
// legacy (ver captura de referencia), no se reescriben.
export const FINALIDAD_OPCIONES = [
  '01-ATENCION DEL PARTO (PUERPERIO)',
  '02-ATENCION DEL RECIEN NACIDO',
  '03-ATENCION EN PLANIFICACION FAMILIAR',
  '04-DETECCION DE ALTERAC DE CRECIM. Y DLLO < 10',
  '05-DETECCION DE ALTERACION DEL DESARROLLO JOVEN',
  '06-DETECCION DE ALTERACIONES DEL EMBARAZO',
  '07-DETECCION DE ALTERACIONES DEL ADULTO',
  '08-DETECCION DE ALTERACIONES DE AGUDEZA VISUAL',
  '09-DETECCION DE ENFERMEDAD PROFESIONAL',
  '10-NO APLICA',
];

export const ESPECIALIDAD_OPCIONES = [
  'Pediatría', 'Nutrición y Dietética', 'Psicología', 'Odontología', 'Oftalmología',
  'Fonoaudiología', 'Terapia física', 'Trabajo social', 'Medicina familiar', 'Otra',
];

// Mini catálogo CIE-10 de ejemplo para el autocomplete de diagnóstico — no
// es la base de datos real (no existe una en este proyecto de demo), solo
// suficientes entradas plausibles para que la búsqueda tenga varios
// resultados. El principal (Z939) es el valor de ejemplo exacto del
// encargo.
export const CIE_MOCK = [
  { codigo: 'Z939', texto: 'Abertura artificial, no especificada' },
  { codigo: 'J069', texto: 'Infección aguda de las vías respiratorias superiores, no especificada' },
  { codigo: 'A09X', texto: 'Diarrea y gastroenteritis de presunto origen infeccioso' },
  { codigo: 'R509', texto: 'Fiebre, no especificada' },
  { codigo: 'Z001', texto: 'Control de salud de rutina del niño' },
  { codigo: 'E559', texto: 'Deficiencia de vitamina D, no especificada' },
  { codigo: 'D509', texto: 'Anemia por deficiencia de hierro, sin otra especificación' },
];

// "Mostrar un contador de caracteres si existe un límite definido" — el
// legacy no traía uno, se define acá 500 (suficiente para una observación
// clínica de examen físico) para que el contador tenga sentido.
export const OBSERVACIONES_MAX_LENGTH = 500;
