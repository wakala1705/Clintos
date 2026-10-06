// Catálogos de ejemplo del flujo (pacientes, CUPS, diagnósticos, personal,
// equipos). Códigos CUPS/CIE-10, contratos e instituciones son placeholders.

export const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'PA', label: 'Pasaporte' },
];

export const PACIENTES_DIRECTORIO = [
  {
    tipoDocumento: 'CC', numeroDocumento: '1.020.445.318', nombre: 'Sandra Milena Rojas Pardo', edad: 41, sexo: 'Femenino',
    eps: 'Sanitas', regimen: 'Contributivo', contrato: '[N° contrato]', ordenesActivas: 0,
    historia: { valoracion: 'ok', laboratorios: 'ok', imagenes: 'pendiente' },
  },
  {
    tipoDocumento: 'CC', numeroDocumento: '79.812.604', nombre: 'Hernán Darío Acosta Lemus', edad: 58, sexo: 'Masculino',
    eps: 'Nueva EPS', regimen: 'Contributivo', contrato: '[N° contrato]', ordenesActivas: 1,
    historia: { valoracion: 'pendiente', laboratorios: 'ok', imagenes: 'pendiente' },
  },
  {
    tipoDocumento: 'CC', numeroDocumento: '52.390.177', nombre: 'Gloria Inés Beltrán Mora', edad: 66, sexo: 'Femenino',
    eps: 'Coosalud', regimen: 'Subsidiado', contrato: '[N° contrato]', ordenesActivas: 0,
    historia: { valoracion: 'pendiente', laboratorios: 'pendiente', imagenes: 'pendiente' },
  },
  {
    tipoDocumento: 'CC', numeroDocumento: '1.098.552.940', nombre: 'Juan Sebastián Cortés Ríos', edad: 29, sexo: 'Masculino',
    eps: 'Compensar', regimen: 'Contributivo', contrato: '[N° contrato]', ordenesActivas: 0,
    historia: {
      valoracion: 'ok', laboratorios: 'ok', imagenes: 'ok', autorizacion: 'ok',
    },
  },
];

export const INSTITUCIONES = [
  { value: '[Institución remitente 1]', label: '[Institución remitente 1]' },
  { value: '[Institución remitente 2]', label: '[Institución remitente 2]' },
  { value: '[Institución remitente 3]', label: '[Institución remitente 3]' },
];

export const DIAGNOSTICOS = [
  { value: 'd1', label: '[CIE-10] · Colelitiasis sintomática' },
  { value: 'd2', label: '[CIE-10] · Hernia inguinal unilateral' },
  { value: 'd3', label: '[CIE-10] · Gonartrosis primaria' },
  { value: 'd4', label: '[CIE-10] · Catarata senil' },
  { value: 'd5', label: '[CIE-10] · Bocio multinodular' },
  { value: 'd6', label: '[CIE-10] · Leiomioma uterino' },
];

// cobertura: cubierto | autorizacion | no-cubierto (indicador del contrato).
export const CATALOGO_CUPS = [
  {
    id: 'p1', cups: '[Código CUPS]', nombre: 'Colecistectomía laparoscópica', especialidad: 'Cirugía general',
    tiempo: 120, cobertura: 'cubierto', requiereImagenes: true, canasta: '[Código canasta]',
  },
  {
    id: 'p2', cups: '[Código CUPS]', nombre: 'Herniorrafia inguinal', especialidad: 'Cirugía general',
    tiempo: 90, cobertura: 'cubierto', requiereImagenes: false, canasta: '[Código canasta]',
  },
  {
    id: 'p3', cups: '[Código CUPS]', nombre: 'Reemplazo total de rodilla', especialidad: 'Ortopedia',
    tiempo: 180, cobertura: 'autorizacion', requiereImagenes: true, canasta: '[Código canasta]',
  },
  {
    id: 'p4', cups: '[Código CUPS]', nombre: 'Facoemulsificación de catarata', especialidad: 'Oftalmología',
    tiempo: 60, cobertura: 'cubierto', requiereImagenes: false, canasta: '[Código canasta]',
  },
  {
    id: 'p5', cups: '[Código CUPS]', nombre: 'Tiroidectomía total', especialidad: 'Cabeza y cuello',
    tiempo: 150, cobertura: 'autorizacion', requiereImagenes: true, canasta: '[Código canasta]',
  },
  {
    id: 'p6', cups: '[Código CUPS]', nombre: 'Histerectomía abdominal total', especialidad: 'Ginecología',
    tiempo: 150, cobertura: 'no-cubierto', requiereImagenes: true, canasta: '[Código canasta]',
  },
];

export const COBERTURA_LABEL = {
  cubierto: 'Cubierto por el contrato',
  autorizacion: 'Requiere autorización',
  'no-cubierto': 'No cubierto',
};
export const TONO_COBERTURA = { cubierto: 'complete', autorizacion: 'pending', 'no-cubierto': 'rejected' };

// ---------- Programación ----------
export const SALAS_PROG = [
  { id: 's1', nombre: 'Sala 1' },
  { id: 's2', nombre: 'Sala 2' },
  { id: 's3', nombre: 'Sala 3' },
];

// Personal: `ocupado` son rangos {inicio, dur} en franjas de 30 min desde las
// 07:00 (índice 0 = 07:00) en los que ya tiene otra cirugía.
export const PERSONAL = {
  cirujano: [
    { value: 'Dr. Andrés Villamizar', ocupado: [{ inicio: 2, dur: 4 }] },
    { value: 'Dra. Marcela Echeverri', ocupado: [{ inicio: 8, dur: 3 }] },
    { value: 'Dr. Mauricio Salamanca', ocupado: [{ inicio: 0, dur: 3 }] },
    { value: 'Dr. Ricardo Naranjo', ocupado: [{ inicio: 3, dur: 5 }] },
    { value: 'Dr. Héctor Lozano', ocupado: [] },
    { value: 'Dra. Natalia Escobar', ocupado: [] },
  ],
  anestesiologo: [
    { value: 'Dra. Paula Becerra', ocupado: [{ inicio: 2, dur: 4 }] },
    { value: 'Dr. Felipe Gaitán', ocupado: [] },
    { value: 'Dr. Julián Arango', ocupado: [{ inicio: 10, dur: 4 }] },
  ],
  ayudante: [
    { value: 'Dr. Camilo Prieto', ocupado: [] },
    { value: 'Dra. Laura Sarmiento', ocupado: [{ inicio: 0, dur: 6 }] },
  ],
  instrumentador: [
    { value: 'Inst. Diana Cañón', ocupado: [{ inicio: 8, dur: 3 }] },
    { value: 'Inst. Jhon Murcia', ocupado: [] },
  ],
  circulante: [
    { value: 'Enf. Martha Rincón', ocupado: [] },
    { value: 'Enf. Yesid Camargo', ocupado: [{ inicio: 3, dur: 5 }] },
  ],
};

export const ROLES_PERSONAL = [
  { key: 'cirujano', label: 'Cirujano' },
  { key: 'anestesiologo', label: 'Anestesiólogo' },
  { key: 'ayudante', label: 'Ayudante quirúrgico' },
  { key: 'instrumentador', label: 'Instrumentador quirúrgico' },
  { key: 'circulante', label: 'Enfermera circulante' },
];

export const EQUIPOS = [
  { id: 'e1', nombre: 'Torre de laparoscopia', ocupado: [{ inicio: 0, dur: 2 }] },
  { id: 'e2', nombre: 'Unidad de electrocirugía', ocupado: [] },
  { id: 'e3', nombre: 'Arco en C', ocupado: [{ inicio: 4, dur: 4 }] },
  { id: 'e4', nombre: 'Microscopio quirúrgico', ocupado: [{ inicio: 9, dur: 3 }] },
];
