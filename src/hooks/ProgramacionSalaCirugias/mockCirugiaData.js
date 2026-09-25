// Mock data de "Programación de Sala de Cirugía" — sin backend, mismo
// criterio que mockAdmisionesData.js/mockProgramacionData.js: datos
// deterministas (nunca Math.random), estado mutable en memoria vía un
// array module-level + funciones que lo reemplazan (nunca mutado in
// place), se resetea al recargar la página.

export const SEDES = [
  { value: '02', label: '02 - Sede Norte' },
  { value: '01', label: '01 - Sede Central' },
];

// `idSala`/`descripcion`/`estado`/`complejidad` alimentan CatalogoSalasModal
// (ver FiltrosBar.jsx) — el `label` completo ("Sala 1 - Quirófano #1") se
// deriva de los dos primeros en vez de hardcodearse aparte, para que el
// trigger del filtro y el catálogo nunca queden desincronizados. Las 6 salas
// de sede '02' replican 1:1 el catálogo de referencia del encargo (mismos
// id/descripción/estado); 'qx-1-central' es la única sala de sede '01' y
// queda fuera del catálogo visible hoy porque la página fija sedeId a '02'
// (ver comentario en FiltrosBar.jsx).
export const SALAS = [
  {
    value: 'qx-1', idSala: '01', descripcion: 'Quirófano #1', estado: 'Mantenimiento', complejidad: 'M', sedeId: '02',
  },
  {
    value: 'qx-2', idSala: '02', descripcion: 'Quirófano #2', estado: 'Activo', complejidad: 'M', sedeId: '02',
  },
  {
    value: 'qx-3', idSala: '03', descripcion: 'Quirófano #3', estado: 'Activo', complejidad: 'M', sedeId: '02',
  },
  {
    value: 'gastroenterologia', idSala: '04', descripcion: 'Gastroenterología', estado: 'Activo', complejidad: 'M', sedeId: '02',
  },
  {
    value: 'hemodinamia', idSala: '05', descripcion: 'Hemodinamia', estado: 'Activo', complejidad: 'M', sedeId: '02',
  },
  {
    value: 'proc-menores', idSala: '06', descripcion: 'Proc. Menores', estado: 'Activo', complejidad: 'M', sedeId: '02',
  },
  {
    value: 'qx-1-central', idSala: '01', descripcion: 'Quirófano #1', estado: 'Activo', complejidad: 'M', sedeId: '01',
  },
].map((s) => ({ ...s, label: `Sala ${Number(s.idSala)} - ${s.descripcion}` }));

export const ESTADO_FILTRO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'programada', label: 'Programada' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'realizada', label: 'Realizada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'incumplida', label: 'Incumplida' },
];

// Estados terminales de una cirugía: ya no admiten Editar/Reprogramar/
// Cancelar/Marcar como realizada (encargo explícito, 2026-09-07: menú "..."
// de CirugiaCard con esas acciones) -- "realizada" se suma acá a las 2
// terminales que ya tenía DetalleCirugiaPanel.jsx (cancelada/incumplida, ver
// ESTADOS_TERMINALES ahí antes de este cambio). Vive en un solo lugar para
// que DetalleCirugiaPanel.jsx y CirugiaCardMenu.jsx compartan exactamente la
// misma regla en vez de 2 arrays duplicados que puedan divergir.
export const ESTADOS_TERMINALES_CIRUGIA = ['cancelada', 'incumplida', 'realizada'];

// Catálogo de procedimientos QX (CUPS) que alimenta CatalogoProcedimientosModal
// ("Listado de Procedimientos contratados para el Tercero (KCNT)", encargo
// explícito -- ver captura adjunta) para "Id. Cirugía" en
// AgregarProcedimientoModal. Transcripción literal de los códigos/
// descripciones visibles en esa captura (mismo criterio que
// DIAGNOSTICOS_CATALOGO: recorte representativo, no inventado) -- todos con
// `prefijo` '01' porque es el único prefijo que la captura muestra, no se
// inventan otros. Reemplaza al PROCEDIMIENTOS_CATALOGO plano (array de
// strings) que tenía antes: sin otro consumidor en el proyecto, no hace
// falta mantener las dos formas.
export const PROCEDIMIENTOS_QX_CATALOGO = [
  { prefijo: '01', idServicio: '010101C', descripcion: 'PUNCIÓN CISTERNAL VÍA LATERAL' },
  { prefijo: '01', idServicio: '010102C', descripcion: 'PUNCIÓN CISTERNAL VÍA MEDIAL' },
  { prefijo: '01', idServicio: '010103C', descripcion: 'PUNCIÓN CISTERNAL' },
  {
    prefijo: '01', idServicio: '010201C', descripcion: 'PUNCIÓN (ASPIRACIÓN DE LÍQUIDO) VENTRICULAR A TRAVÉS DE CATÉTER PREVIAMENTE IMPLANTADO',
  },
  {
    prefijo: '01', idServicio: '010202C', descripcion: 'PUNCIÓN (ASPIRACIÓN DE LÍQUIDO) VENTRICULAR POR TREPANACIÓN (SIN CATÉTER)',
  },
  {
    prefijo: '01', idServicio: '010203C', descripcion: 'PUNCIÓN (ASPIRACIÓN DE LÍQUIDO) VENTRICULAR A TRAVÉS DE UN RESERVORIO',
  },
  {
    prefijo: '01', idServicio: '010204C', descripcion: 'PUNCIÓN (ASPIRACIÓN DE LÍQUIDO) VENTRICULAR VÍA TRANSFONTANELAR',
  },
  { prefijo: '01', idServicio: '010205C', descripcion: 'PUNCIÓN (ASPIRACIÓN DE LÍQUIDO) VENTRICULAR' },
  { prefijo: '01', idServicio: '010901C', descripcion: 'PUNCIÓN SUBDURAL' },
  { prefijo: '01', idServicio: '011101C', descripcion: 'BIOPSIA ÓSEA EN CRÁNEO POR CRANEOTOMÍA' },
  { prefijo: '01', idServicio: '011102C', descripcion: 'BIOPSIA ÓSEA EN CRÁNEO POR CRANIECTOMÍA' },
  { prefijo: '01', idServicio: '011201C', descripcion: 'BIOPSIA DE MENINGE POR CRANEOTOMÍA' },
  { prefijo: '01', idServicio: '011202C', descripcion: 'BIOPSIA DE MENINGE CEREBRAL' },
  { prefijo: '01', idServicio: '011302C', descripcion: 'BIOPSIA ABIERTA (CRANEOTOMÍA) DE CEREBRO' },
  { prefijo: '01', idServicio: '011306C', descripcion: 'BIOPSIA DE CEREBRO SUPERFICIAL POR ESTEREOTAXIA' },
  { prefijo: '01', idServicio: '011307C', descripcion: 'BIOPSIA DE CEREBRO PROFUNDO POR ESTEREOTAXIA' },
  { prefijo: '01', idServicio: '012101C', descripcion: 'CRANEALIZACIÓN DE SENO FRONTAL' },
  { prefijo: '01', idServicio: '012102C', descripcion: 'INCISIÓN Y DRENAJE DE SENO FRONTAL' },
  { prefijo: '01', idServicio: '012103C', descripcion: 'DESFUNCIONALIZACIÓN DE SENO FRONTAL' },
];

// "Tipo Cirugía" del formulario "Adicionar procedimientos QX" (encargo
// explícito, ver captura adjunta) -- catálogo de clasificación de cobro del
// procedimiento (bilateral/mismo-diferente cirujano/paquete/única), NO el
// mismo concepto que TIPOS_CIRUGIA_CATALOGO de abajo (ese es el tipo general
// de la cirugía completa -- Programada/Ambulatoria/Urgencia, ya usado por
// `tipoCirugia` en los registros de CIRUGIAS). Aunque ambos campos se llamen
// "Tipo Cirugía" en sus respectivas pantallas de referencia, son catálogos
// distintos -- no reusar uno por el otro.
export const TIPOS_PROCEDIMIENTO_CATALOGO = [
  'BILATERAL',
  'DIFERENTE VIA DIFERENTE CIRUJANO',
  'DIFERENTE VIA IGUAL CIRUJANO',
  'PROCEDIMIENTOS INCRUENTOS',
  'IGUAL VIA DIFERENTE CIRUJANO',
  'MISMA VIA IGUAL CIRUJANO',
  'PAQUETE 50',
  'PAQUETE 30',
  'PAQUETE 65',
  'UNICA',
];

// Catálogo de causales de anulación/reprogramación ("Causales de anulación
// (CAU)", encargo explícito -- ver capturas adjuntas) que alimenta
// CatalogoCausalesModal para "Causal de reprogramación" en
// ReprogramarCirugiaModal. Transcripción literal de las filas visibles en
// esas 2 capturas (mismo criterio que PROCEDIMIENTOS_QX_CATALOGO/
// MEDICOS_CATALOGO: recorte representativo, no inventado), en el mismo
// orden alfabético por descripción que ya traía la referencia -- incluye
// 'NA' ("No Aplica") como único id no numérico, tal cual aparece ahí.
export const CAUSALES_REPROGRAMACION_CIRUGIA = [
  { idCausal: '01', descripcion: 'ACCIDENTE' },
  { idCausal: '17', descripcion: 'ADELANTO DE HORA' },
  { idCausal: '08', descripcion: 'BAJO STOCK' },
  { idCausal: '11', descripcion: 'CAMBIO DE ATENCION' },
  { idCausal: '19', descripcion: 'CANCELACION POR AGENDAMIENTO DE CITA PRIORITARIA' },
  { idCausal: '10', descripcion: 'EGRESO' },
  { idCausal: '14', descripcion: 'FALTA DE AUTORIZACION SERVICIO EPS' },
  { idCausal: '15', descripcion: 'FALTA DE EXAMENES MEDICOS' },
  { idCausal: '13', descripcion: 'FALTA RECURSO ECONOMICO' },
  { idCausal: '07', descripcion: 'HORARIO RESTRINGIDO' },
  { idCausal: '06', descripcion: 'INCAPACIDAD' },
  { idCausal: '20', descripcion: 'INCAPACIDAD MEDICA' },
  { idCausal: '09', descripcion: 'INGRESO' },
  { idCausal: '21', descripcion: 'LICENCIA DE LUTO' },
  { idCausal: 'NA', descripcion: 'No Aplica' },
  { idCausal: '22', descripcion: 'PACIENTE FALLECIDO' },
  { idCausal: '12', descripcion: 'PACIENTE HOSPITALIZADO' },
  { idCausal: '02', descripcion: 'PERDIDA' },
  { idCausal: '03', descripcion: 'PERMISO' },
  { idCausal: '24', descripcion: 'POR CAMBIO DE RAZON SOCIAL' },
  { idCausal: '04', descripcion: 'REUNION ADMINISTRATIVA' },
  { idCausal: '18', descripcion: 'SALIDA A CONGRESO' },
  { idCausal: '16', descripcion: 'SIN EXISTENCIAS' },
  { idCausal: '23', descripcion: 'SOLICITUD DE PACIENTE' },
  { idCausal: '05', descripcion: 'VACACIONES' },
];

// Catálogo de médicos ("Listado de médicos por tipo de Recurso Humano",
// encargo explícito -- ver capturas adjuntas) que alimenta
// CatalogoMedicosModal para Id. Cirujano/Id. Anestesiólogo en
// AgregarProcedimientoModal: mismo modal para ambos campos, filtrado por
// `tipo` -- la referencia es literalmente la misma pantalla abierta dos
// veces con un filtro de rol distinto, no dos pantallas separadas.
// Transcripción literal de las filas visibles en esas capturas (mismo
// criterio que PROCEDIMIENTOS_QX_CATALOGO/DIAGNOSTICOS_CATALOGO). Reemplaza
// a CIRUJANOS_CATALOGO/ANESTESIOLOGOS_CATALOGO (arrays de strings planos)
// que tenía antes: sin otro consumidor en el proyecto, no hace falta
// mantener las dos formas.
export const MEDICOS_CATALOGO = [
  {
    idMedico: '02757/98', nombre: 'ABRAHAM GANEM BECHARA', descripcion: 'Cirujano', sede: 'SEDE NORTE',
  },
  {
    idMedico: '6874047', nombre: 'AMAURY RAFAEL GARCIA BURGOS', descripcion: 'Cirujano', sede: 'SEDE NORTE',
  },
  {
    idMedico: '78714413', nombre: 'ANGEL MARIA PARRA LIÑAN', descripcion: 'Cirujano', sede: 'SEDE NORTE',
  },
  {
    idMedico: '94512888', nombre: 'ANIBAL ENRIQUE BADEL RODRIGUEZ', descripcion: 'Cirujano', sede: 'SEDE NORTE',
  },
  {
    idMedico: '78036459', nombre: 'ANTONIO CARLOS MIRANDA HOYOS', descripcion: 'Cirujano', sede: 'SEDE NORTE',
  },
  {
    idMedico: '1102812780', nombre: 'CARLOS ALBERTO VALLEJO BERTEL', descripcion: 'Cirujano', sede: 'SEDE NORTE',
  },
  {
    idMedico: '73133878', nombre: 'CARLOS MANUEL PEREIRA BETANCOURT', descripcion: 'Cirujano', sede: 'SEDE NORTE',
  },
  {
    idMedico: '2757886', nombre: 'CARLOS MAURICIO BURGOS DURANGO', descripcion: 'Cirujano', sede: 'SEDE NORTE',
  },
  {
    idMedico: '80092293', nombre: 'CESAR ALONSO RIOS NIETO', descripcion: 'Cirujano', sede: 'SEDE NORTE',
  },
  {
    idMedico: '1128270914', nombre: 'JOSE DARIO MERCADO GONZALEZ', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
  {
    idMedico: '15047319', nombre: 'ELIAS MANUEL ANAYA GONZALEZ', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
  {
    idMedico: '73147368', nombre: 'ARMANDO DE JESUS MARQUEZ ARIAS', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
  {
    idMedico: '50901284', nombre: 'LINA MARIA LOBATON RAMIREZ', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
  {
    idMedico: '78674025', nombre: 'JORGE CARLOS GONZALEZ NUÑEZ', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
  {
    idMedico: '10774651', nombre: 'JUAN CARLOS ACOSTA DIAZ', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
  {
    idMedico: '16274903', nombre: 'JUAN CARLOS GOMEZ DOMINGUEZ', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
  {
    idMedico: '1020761845', nombre: 'NATALIA ANDREA CABRERA OVIEDO', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
  {
    idMedico: '50910879', nombre: 'INDIRA GUARDO MARTINEZ', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
  {
    idMedico: '1067901228', nombre: 'ANA ISABEL TABOADA HOYOS', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
  {
    idMedico: '15050969', nombre: 'ELIAS MIGUEL NADER HOYOS', descripcion: 'Anestesiólogo', sede: 'SEDE NORTE',
  },
];

export const SERVICIOS_CATALOGO = ['Cirugía general', 'Ginecología', 'Ortopedia', 'Urología'];
export const TIPOS_CIRUGIA_CATALOGO = ['Programada', 'Ambulatoria', 'Urgencia'];
export const INSTRUMENTADORAS_CATALOGO = ['María Fernández', 'Laura Gómez'];
export const CIRCULANTES_CATALOGO = ['Luis Ramírez', 'Andrés Molina'];

// "Tipo Tercero" de NuevaUrgenciaModal (encargo explícito, ver captura de
// referencia "Incluir Procedimientos Urgentes en la Programación") --
// enum cerrado chico, mismo criterio que TIPOS_CIRUGIA_CATALOGO/
// TIPOS_ANESTESIA_CATALOGO (no exhaustivo real, solo las clasificaciones más
// comunes de tercero-pagador).
export const TIPOS_TERCERO_CATALOGO = [
  'EPS - Empresa Promotora de Salud Contributiva',
  'EPS - Empresa Promotora de Salud Subsidiada',
  'ARL - Administradora de Riesgos Laborales',
  'Medicina Prepagada',
  'Particular',
];

// "Id. Contrato" de NuevaUrgenciaModal -- concepto sin catálogo real en el
// proyecto todavía (vincula la cirugía a un contrato de la aseguradora, ej.
// "Contrato sanitas 2026-2027" en la captura de referencia). Mock chico y
// plano, no filtrado por aseguradora (no hay datos reales para cruzarlo
// todavía -- YAGNI, se cruza el día que haga falta).
export const CONTRATOS_CATALOGO = [
  { idContrato: '525', descripcion: 'Contrato Sanitas 2026-2027' },
  { idContrato: '318', descripcion: 'Contrato Nueva EPS 2025-2026' },
  { idContrato: '742', descripcion: 'Contrato Sura EPS 2026' },
  { idContrato: '156', descripcion: 'Contrato Salud Total 2025-2027' },
  { idContrato: '903', descripcion: 'Contrato Coomeva 2026' },
  { idContrato: '410', descripcion: 'Contrato Compensar 2025-2026' },
  { idContrato: '287', descripcion: 'Contrato Colsanitas Medicina Prepagada 2026' },
  { idContrato: '664', descripcion: 'Contrato Particular 2026' },
];

// Catálogos del paso "Información general" del wizard "Nueva cirugía" (ver
// NuevaCirugiaWizard/InformacionGeneralStep) -- valores calcados de los
// listbox del formulario de referencia (encargo explícito), no inventados.
// "Asa" es la única transcripción con un vacío real: la 1ª opción del
// listbox de referencia venía cortada en la captura ("PACIENTE SANO LISTO
// PARA CIRUGIA PR...", mientras que la 2ª/3ª sí se veían completas como
// "CLASE 2"/"CLASE 3") -- avisar si el texto completo no es este.
export const CLASE_CIRUGIA_CATALOGO = ['CE', 'Quirófano'];
export const TIPOS_ANESTESIA_CATALOGO = ['Local', 'General', 'Raquídea', 'Peridural', 'General IV', 'Local asistida', 'Bloqueo', 'No aplica'];
export const COMPLEJIDAD_CATALOGO = ['Alta', 'Baja', 'Media'];
export const ASA_CATALOGO = ['Paciente sano listo para cirugía programada', 'Clase 2', 'Clase 3'];

// Duraciones preestablecidas para Dur. estimada/postquirúrgica/recuperación
// (ver DuracionInput.jsx): atajos de un input numérico libre (`type=number`
// + `<datalist>`), no las únicas opciones válidas -- a diferencia del
// FormSelect que tenían antes estos campos (encargo explícito, 2026-09-07:
// "acortar las opciones" + "permitir que el campo también sea editable"),
// el datalist es solo autocompletado opcional, el valor final puede ser
// cualquier número tipeado a mano. Lista recortada a la mitad (12 -> 6
// valores, redondos) respecto de la anterior -- de sobra como atajos ahora
// que tipear un valor no listado también es válido.
export const DURACIONES_CIRUGIA_CATALOGO = [30, 60, 90, 120, 180, 240];

// DIAGNOSTICOS_CATALOGO se movió a
// @/hooks/CatalogoDiagnosticosModal/mockDiagnosticosData.js -- ese catálogo
// dejó de ser exclusivo de esta feature (encargo explícito: el buscador
// CIE-10 de Historia Clínica → Ingreso a hospitalización debe abrir "el
// modal de CIE-10 que ya tenemos diseñado", ver AGENTS.md "Component
// organization" sobre datos/componentes app-wide -- mismo criterio ya
// aplicado a ASEGURADORAS_CATALOGO abajo).
// Import: `import { DIAGNOSTICOS_CATALOGO } from '@/hooks/CatalogoDiagnosticosModal/mockDiagnosticosData';`

// ASEGURADORAS_CATALOGO se movió a
// @/hooks/CatalogoAseguradorasModal/mockAseguradorasData.js -- ese catálogo
// dejó de ser exclusivo de esta feature (encargo explícito: "usa el mismo
// componente de programación de cirugía, en el de facturación", ver
// AGENTS.md "Component organization" sobre datos/componentes app-wide).
// Import: `import { ASEGURADORAS_CATALOGO } from '@/hooks/CatalogoAseguradorasModal/mockAseguradorasData';`

export const EQUIPOS_CATALOGO = [
  'Torre de laparoscopia',
  'Cauterio',
  'Mesa quirúrgica eléctrica',
  'Monitor de signos vitales',
  'Máquina de anestesia',
];

export const CANASTAS_CATALOGO = [
  {
    nombre: 'Colecistectomía estándar',
    items: [
      { nombre: 'Trocar 5mm', cantidad: 2, estado: 'disponible' },
      { nombre: 'Trocar 10mm', cantidad: 2, estado: 'disponible' },
      { nombre: 'Pinza Maryland', cantidad: 1, estado: 'disponible' },
      { nombre: 'Gasas estériles', cantidad: 10, estado: 'disponible' },
      { nombre: 'Sutura Vicryl 2-0', cantidad: 3, estado: 'disponible' },
      { nombre: 'Clips de titanio', cantidad: 6, estado: 'disponible' },
      { nombre: 'Aguja de Veress', cantidad: 1, estado: 'disponible' },
      { nombre: 'Bolsa de extracción', cantidad: 1, estado: 'disponible' },
      { nombre: 'Solución salina 1000ml', cantidad: 2, estado: 'disponible' },
      { nombre: 'Campo quirúrgico', cantidad: 4, estado: 'disponible' },
      { nombre: 'Guantes estériles talla 7', cantidad: 4, estado: 'disponible' },
      { nombre: 'Hoja de bisturí #11', cantidad: 2, estado: 'disponible' },
    ],
  },
  {
    nombre: 'Apendicectomía estándar',
    items: [
      { nombre: 'Trocar 5mm', cantidad: 2, estado: 'disponible' },
      { nombre: 'Trocar 10mm', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sutura Vicryl 0', cantidad: 2, estado: 'disponible' },
      { nombre: 'Gasas estériles', cantidad: 8, estado: 'disponible' },
      { nombre: 'Bolsa de extracción', cantidad: 1, estado: 'faltante' },
    ],
  },
  {
    nombre: 'Hernia inguinal estándar',
    items: [
      { nombre: 'Malla de polipropileno', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sutura Prolene 2-0', cantidad: 2, estado: 'disponible' },
      { nombre: 'Gasas estériles', cantidad: 6, estado: 'disponible' },
      { nombre: 'Grapadora de malla', cantidad: 1, estado: 'disponible' },
    ],
  },
  {
    nombre: 'Ortopedia menor',
    items: [
      { nombre: 'Artroscopio 4mm', cantidad: 1, estado: 'disponible' },
      { nombre: 'Cánula de irrigación', cantidad: 2, estado: 'disponible' },
      { nombre: 'Sutura PDS 1', cantidad: 2, estado: 'disponible' },
      { nombre: 'Vendaje compresivo', cantidad: 2, estado: 'disponible' },
    ],
  },
  {
    nombre: 'Ginecología mayor',
    items: [
      { nombre: 'Separador de Balfour', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sutura Vicryl 0', cantidad: 4, estado: 'disponible' },
      { nombre: 'Compresas abdominales', cantidad: 6, estado: 'disponible' },
      { nombre: 'Electrobisturí monopolar', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sonda vesical', cantidad: 1, estado: 'faltante' },
    ],
  },
];

export const EQUIPO_ESTADO_LABEL = { disponible: 'Disponible', 'en-uso': 'En uso', mantenimiento: 'Mantenimiento' };
export const FARMACIA_ESTADO_LABEL = { 'en-preparacion': 'En preparación', listo: 'Listo', entregado: 'Entregado' };

// Canasta de insumos que se precarga al agregar un procedimiento QX
// (AgregarProcedimientoModal, Paso 2 del wizard "Nueva cirugía" -- encargo
// explícito, ver captura de referencia "Canasta de Insumos"). Todavía no hay
// un mapeo real procedimiento→insumos (sería distinto por CUPS); por ahora
// todo procedimiento agregado adjunta esta misma canasta base -- transcripción
// literal de los 11 ítems de la captura, no inventados.
export const INSUMOS_PRECARGA_CATALOGO = [
  { codigo: 'DM000031', nombre: 'AGUJA PUNCION LUMBAR N°27', cantidad: 1 },
  { codigo: 'DM000090', nombre: 'CANULA DE GUEDEL # 2', cantidad: 1 },
  { codigo: 'DM000091', nombre: 'CANULA DE GUEDEL # 3', cantidad: 1 },
  { codigo: 'DM000290', nombre: 'EXTENSION PARA ANESTESIA PEDIATRICA', cantidad: 1 },
  { codigo: 'DM000412', nombre: 'MASCARA LARINGEA DESECHABLE N 3', cantidad: 1 },
  { codigo: 'DM000416', nombre: 'MASCARA LARINGEA N° 2.5', cantidad: 1 },
  { codigo: 'DM000421', nombre: 'MASCARA PARA ANESTESIA # 2', cantidad: 1 },
  { codigo: 'DM000422', nombre: 'MASCARA PARA ANESTESIA # 3', cantidad: 1 },
  { codigo: 'DM000537', nombre: 'SENSOR QUATRO ELECTRODO PARA BIS MONITOREO INDIC', cantidad: 1 },
  { codigo: 'DM000597', nombre: 'SONDA NELATON N° 12', cantidad: 1 },
  { codigo: 'DM000669', nombre: 'TUBO ENDOTRAQUIAL N° 8.0 MM CON BALON', cantidad: 1 },
];

// Suma cantidades por código a través de los insumos precargados de cada
// procedimiento (ver INSUMOS_PRECARGA_CATALOGO/AgregarProcedimientoModal) --
// alimenta tanto el preview "Insumos precargados" de ProcedimientosStep
// (Paso 2) como el listado de InsumosStep (Paso 3), para que ambos muestren
// siempre el mismo total ya consolidado.
export function agregarInsumosPrecargados(procedimientos) {
  const porCodigo = new Map();
  procedimientos.forEach((p) => {
    (p.insumos ?? []).forEach((i) => {
      const acc = porCodigo.get(i.codigo);
      if (acc) acc.cantidad += i.cantidad;
      else porCodigo.set(i.codigo, { ...i });
    });
  });
  return Array.from(porCodigo.values());
}

// Catálogo de insumos que alimenta CatalogoInsumosModal ("Agregar insumo" en
// InsumosStep, Paso 3 del wizard "Nueva cirugía") -- superset de
// INSUMOS_PRECARGA_CATALOGO (mismos 11 códigos, sin `cantidad` porque acá es
// un catálogo de búsqueda, no una canasta) más otros insumos quirúrgicos
// comunes, para que la búsqueda tenga variedad más allá de la canasta que ya
// se precarga sola.
export const INSUMOS_CATALOGO = [
  ...INSUMOS_PRECARGA_CATALOGO.map(({ codigo, nombre }) => ({ codigo, nombre })),
  { codigo: 'DM000045', nombre: 'APOSITO TRANSPARENTE 10X12CM' },
  { codigo: 'DM000102', nombre: 'BATA QUIRURGICA DESECHABLE TALLA M' },
  { codigo: 'DM000103', nombre: 'BATA QUIRURGICA DESECHABLE TALLA L' },
  { codigo: 'DM000210', nombre: 'CATETER VENOSO CENTRAL 7FR' },
  { codigo: 'DM000225', nombre: 'COMPRESA DE CAMPO QUIRURGICO 45X45' },
  { codigo: 'DM000301', nombre: 'GASA ESTERIL 10X10CM PAQUETE X10' },
  { codigo: 'DM000318', nombre: 'GUANTE QUIRURGICO ESTERIL TALLA 7' },
  { codigo: 'DM000319', nombre: 'GUANTE QUIRURGICO ESTERIL TALLA 7.5' },
  { codigo: 'DM000340', nombre: 'HOJA DE BISTURI N 11' },
  { codigo: 'DM000341', nombre: 'HOJA DE BISTURI N 15' },
  { codigo: 'DM000355', nombre: 'JERINGA 3 ML' },
  { codigo: 'DM000400', nombre: 'LLAVE DE TRES VIAS' },
  { codigo: 'DM000450', nombre: 'SET DE VENOCLISIS MACROGOTERO' },
  { codigo: 'DM000470', nombre: 'SONDA VESICAL FOLEY N 16' },
  { codigo: 'DM000500', nombre: 'SUTURA VICRYL 2-0' },
  { codigo: 'DM000501', nombre: 'SUTURA NYLON 3-0' },
  { codigo: 'DM000610', nombre: 'TAPABOCAS QUIRURGICO' },
  { codigo: 'DM000650', nombre: 'TELA ADHESIVA MICROPORE 5CM' },
];

function pad2(n) { return String(n).padStart(2, '0'); }

export function fechaISO(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// Formato que espera <input type="datetime-local"> ("YYYY-MM-DDTHH:mm") --
// usado para precargar Fecha inicio con la fecha/hora del sistema al abrir
// el wizard "Nueva cirugía" (encargo explícito, ver datosIniciales en
// NuevaCirugiaWizard.jsx).
export function fechaHoraLocalISO(date) {
  return `${fechaISO(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// Formato que espera <input type="time"> ("HH:mm") -- usado para precargar
// Hora solicitud con la hora del sistema al abrir el wizard "Nueva cirugía"
// (mismo encargo que fechaHoraLocalISO arriba, ver datosIniciales en
// NuevaCirugiaWizard.jsx).
export function horaLocal(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function addDias(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function lunesDeSemana(date) {
  const dow = date.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDias(date, diff);
}

const DIA_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIA_LARGO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MES_LARGO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function diasDeSemana(weekStart) {
  const hoyISO = fechaISO(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDias(weekStart, i);
    return {
      fecha: fechaISO(d),
      label: DIA_LABEL[d.getDay()],
      dayNum: `${d.getDate()} ${MES_CORTO[d.getMonth()]}`,
      isToday: fechaISO(d) === hoyISO,
    };
  });
}

// Mismo shape que las entradas de diasDeSemana -- así AgendaSemana.jsx puede
// renderizar la vista Día pasándole un array de un solo elemento sin
// necesitar ninguna rama especial en su grilla.
export function diaUnico(date) {
  return {
    fecha: fechaISO(date),
    label: DIA_LABEL[date.getDay()],
    dayNum: `${date.getDate()} ${MES_CORTO[date.getMonth()]}`,
    isToday: fechaISO(date) === fechaISO(new Date()),
  };
}

export function diaLabel(date) {
  return `${DIA_LARGO[date.getDay()]} ${date.getDate()} de ${MES_LARGO[date.getMonth()]} ${date.getFullYear()}`;
}

// Algoritmo ISO 8601 estándar de número de semana (no se hardcodea a un
// valor fijo — cualquier semana navegada calcula el número real).
export function numeroSemanaISO(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function rangoSemanaLabel(weekStart) {
  const fin = addDias(weekStart, 6);
  const mismoMes = weekStart.getMonth() === fin.getMonth();
  const mesFin = mismoMes ? '' : ` - ${MES_LARGO[fin.getMonth()]}`;
  return `Semana ${numeroSemanaISO(weekStart)} - ${MES_LARGO[weekStart.getMonth()]}${mesFin} ${fin.getFullYear()}`;
}

// ---------- Mini-calendario (mes actual) ----------
// Mismo algoritmo que generateMonthGrid en hooks/ProgramarCita/agendaMockData.js
// (semanas completas, incluye días del mes anterior/siguiente para llenar la
// grilla de 7 columnas) — no se importa desde ahí porque cada feature es
// dueña de sus propios helpers de fecha (ver AGENTS.md "Component
// organization"), y acá las semanas arrancan en lunes igual que
// diasDeSemana/lunesDeSemana arriba.
const DOW_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export function addMeses(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function mesLabel(date = new Date()) {
  return `${MES_LARGO[date.getMonth()]} ${date.getFullYear()}`;
}

export function grillaMes(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === year && hoy.getMonth() === month;

  const primerDia = new Date(year, month, 1);
  const primerDow = (primerDia.getDay() + 6) % 7; // 0=Lunes
  const diasDelMes = new Date(year, month + 1, 0).getDate();
  const diasMesAnterior = new Date(year, month, 0).getDate();

  const days = [];
  for (let i = primerDow - 1; i >= 0; i--) {
    const n = diasMesAnterior - i;
    days.push({ n, date: new Date(year, month - 1, n), muted: true, today: false });
  }
  for (let d = 1; d <= diasDelMes; d++) {
    days.push({ n: d, date: new Date(year, month, d), muted: false, today: esMesActual && d === hoy.getDate() });
  }
  let trailing = 1;
  while (days.length % 7 !== 0) {
    days.push({ n: trailing, date: new Date(year, month + 1, trailing), muted: true, today: false });
    trailing += 1;
  }
  return { dowLabels: DOW_LABELS, days };
}

export function fechaLabel(fechaISOStr) {
  const [y, m, d] = fechaISOStr.split('-').map(Number);
  return `${pad2(d)}/${pad2(m)}/${y}`;
}

export function fechaHoraLabel(isoDateTimeStr) {
  const [fecha, hora] = isoDateTimeStr.split('T');
  return `${fechaLabel(fecha)} ${hora}`;
}

export function duracionLabel(horaInicio, horaFin) {
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

// "Edad: 71 años 03 meses 02 días" -- mismo nivel de detalle que trae el
// campo "Edad" del formulario legacy de referencia (Información del
// Procedimiento Quirúrgico, ver DetalleCirugiaPanel.jsx), en vez del "45
// años" plano que bastaba antes de ese encargo.
export function edadDetalleLabel({ edad, edadMeses = 0, edadDias = 0 }) {
  return `${edad} años ${pad2(edadMeses)} meses ${pad2(edadDias)} días`;
}

// Desglosa fechaNacimiento (paciente, ver PATIENTS en mockPatientsData.js)
// en {edad, edadMeses, edadDias} -- shape que espera edadDetalleLabel arriba.
// Los pacientes del mock solo traen fechaNacimiento, no esta terna ya
// calculada (a diferencia de los registros de CIRUGIAS, que sí la traen
// hardcodeada) -- necesario para armarCirugiaDesdeWizard más abajo.
export function calcularEdadDesglosada(fechaNacimientoISO, fechaReferencia = new Date()) {
  const nacimiento = new Date(fechaNacimientoISO);
  let anios = fechaReferencia.getFullYear() - nacimiento.getFullYear();
  let meses = fechaReferencia.getMonth() - nacimiento.getMonth();
  let dias = fechaReferencia.getDate() - nacimiento.getDate();
  if (dias < 0) {
    meses -= 1;
    dias += new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), 0).getDate();
  }
  if (meses < 0) {
    anios -= 1;
    meses += 12;
  }
  return { edad: anios, edadMeses: meses, edadDias: dias };
}

// idCirugia/idCirujano/idAnestesiologo de un procedimiento llegan como
// "id - nombre" (ver onSelect en CatalogoProcedimientosModal.jsx/
// CatalogoMedicosModal.jsx) -- acá solo interesa el nombre, el id es
// metadato del catálogo de origen. Extraído de ProcedimientosStep.jsx
// (Paso 2) porque ConfirmacionStep (Paso 4) también lo necesita para su
// resumen de personal/procedimientos.
export function soloNombre(valor) {
  const i = valor.indexOf(' - ');
  return i === -1 ? valor : valor.slice(i + 3);
}

// Tipo cirugía llega en mayúsculas del catálogo (mismo formato que
// idCirugia/idCirujano/idAnestesiologo) -- capitalizado (solo la primera
// letra) para mostrar. Mismo motivo de extracción que soloNombre arriba.
export function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Personal único (Cirujano/Anestesiólogo) a través de todos los
// procedimientos del wizard -- dedup por rol+nombre (2 procedimientos con el
// mismo cirujano no lo listan/guardan dos veces). Extraído de
// ConfirmacionStep.jsx (Paso 5) porque armarCirugiaDesdeWizard más abajo
// también lo necesita para construir `personal` al guardar. Instrumentadora/
// Circulante no se arman acá -- ningún paso del wizard los recolecta hoy.
export function personalDeProcedimientos(procedimientos) {
  const vistos = new Set();
  const personal = [];
  procedimientos.forEach((p) => {
    [
      { rol: 'Cirujano', nombre: soloNombre(p.idCirujano) },
      { rol: 'Anestesiólogo', nombre: soloNombre(p.idAnestesiologo) },
    ].forEach((item) => {
      const key = `${item.rol}:${item.nombre}`;
      if (!vistos.has(key)) {
        vistos.add(key);
        personal.push(item);
      }
    });
  });
  return personal;
}

export function periodKeyDeSemana(weekStart, salaId) {
  return `week:${fechaISO(weekStart)}:${salaId}`;
}

// Semilla: lunes 31 Ago 2026 (semana usada en la referencia visual del
// encargo). Solo sede '02' / sala 'qx-1' viene con datos completos —
// cualquier otra sala/semana arranca vacía (dispara el estado vacío de la
// agenda, ver spec).
export const SEMANA_ANCLA = new Date(2026, 7, 31);

let CIRUGIAS = [
  {
    id: '12345',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'María Pérez', documento: 'CC 52.123.456', edad: 45, edadMeses: 2, edadDias: 15, sexo: 'Femenino', aseguradora: 'Salud Total EPS',
      nivel: '1', tipoAfiliado: 'Cotizante', direccion: 'Cra 45 # 12-30, Bogotá', telAviso: '300 654 1122',
    },
    procedimientoPrincipal: 'Colecistectomía laparoscópica',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Juan García',
    fecha: '2026-08-31',
    horaInicio: '07:00',
    horaFin: '09:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Colecistectomía laparoscópica', tipo: 'principal', duracionMin: 120, notas: 'Sin complicaciones esperadas.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Juan García' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', tipo: 'Video/Imagen', identificacion: 'EQ-0412', estado: 'disponible' },
      { nombre: 'Cauterio', tipo: 'Energía quirúrgica', identificacion: 'EQ-0087', estado: 'disponible' },
      { nombre: 'Monitor de signos vitales', tipo: 'Monitoreo', identificacion: 'EQ-0231', estado: 'disponible' },
    ],
    canasta: { nombre: 'Colecistectomía estándar', items: CANASTAS_CATALOGO[0].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4582', estado: 'en-preparacion', fechaSolicitud: '2026-08-30T14:30',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Ondansetrón', dosis: '4mg IV' }],
    },
  },
  {
    id: '12346',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Juan Rodríguez', documento: 'CC 79.456.123', edad: 38, edadMeses: 7, edadDias: 3, sexo: 'Masculino', aseguradora: 'Nueva EPS',
      nivel: '2', tipoAfiliado: 'Beneficiario', direccion: 'Calle 80 # 34-12, Bogotá', telAviso: '301 789 4455',
    },
    procedimientoPrincipal: 'Hernia inguinal',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Andrés López',
    fecha: '2026-08-31',
    horaInicio: '09:30',
    horaFin: '11:30',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Hernia inguinal', tipo: 'principal', duracionMin: 90, notas: 'Abordaje abierto.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Andrés López' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Cauterio', tipo: 'Energía quirúrgica', identificacion: 'EQ-0087', estado: 'disponible' },
      { nombre: 'Mesa quirúrgica eléctrica', tipo: 'Soporte quirúrgico', identificacion: 'EQ-0560', estado: 'disponible' },
    ],
    canasta: { nombre: 'Hernia inguinal estándar', items: CANASTAS_CATALOGO[2].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4583', estado: 'listo', fechaSolicitud: '2026-08-30T09:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
  {
    id: '12347',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Ana Torres', documento: 'CC 41.789.456', edad: 52, edadMeses: 1, edadDias: 20, sexo: 'Femenino', aseguradora: 'Sura EPS',
      nivel: '1', tipoAfiliado: 'Cotizante', direccion: 'Av. Caracas # 55-20, Bogotá', telAviso: '310 456 7788',
    },
    procedimientoPrincipal: 'Artroscopia de rodilla',
    servicio: 'Ortopedia',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Carlos Martínez',
    fecha: '2026-08-31',
    horaInicio: '12:00',
    horaFin: '14:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Artroscopia de rodilla', tipo: 'principal', duracionMin: 110, notas: 'Reparación de menisco.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Carlos Martínez' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Mesa quirúrgica eléctrica', tipo: 'Soporte quirúrgico', identificacion: 'EQ-0560', estado: 'disponible' },
      { nombre: 'Monitor de signos vitales', tipo: 'Monitoreo', identificacion: 'EQ-0231', estado: 'disponible' },
    ],
    canasta: { nombre: 'Ortopedia menor', items: CANASTAS_CATALOGO[3].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4584', estado: 'entregado', fechaSolicitud: '2026-08-29T16:00',
      medicamentos: [{ nombre: 'Ketorolaco', dosis: '30mg IV' }],
    },
  },
  {
    id: '12348',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Carlos Gómez', documento: 'CC 11.222.333', edad: 60, edadMeses: 5, edadDias: 9, sexo: 'Masculino', aseguradora: 'Coomeva EPS',
      nivel: '3', tipoAfiliado: 'Beneficiario', direccion: 'Cra 15 # 100-45, Bogotá', telAviso: '320 998 1122',
    },
    procedimientoPrincipal: 'Apendicectomía',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Carlos Martínez',
    fecha: '2026-09-01',
    horaInicio: '08:00',
    horaFin: '10:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Apendicectomía', tipo: 'principal', duracionMin: 100, notas: 'Apendicitis no complicada.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Carlos Martínez' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', tipo: 'Video/Imagen', identificacion: 'EQ-0412', estado: 'disponible' },
      { nombre: 'Cauterio', tipo: 'Energía quirúrgica', identificacion: 'EQ-0087', estado: 'disponible' },
    ],
    canasta: { nombre: 'Apendicectomía estándar', items: CANASTAS_CATALOGO[1].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4585', estado: 'en-preparacion', fechaSolicitud: '2026-08-31T08:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Metronidazol', dosis: '500mg IV' }],
    },
  },
  {
    id: '12349',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Laura Sánchez', documento: 'CC 98.765.432', edad: 29, edadMeses: 9, edadDias: 27, sexo: 'Femenino', aseguradora: 'Sanitas EPS',
      nivel: '1', tipoAfiliado: 'Cotizante', direccion: 'Calle 26 # 68-12, Bogotá', telAviso: '315 223 6690',
    },
    procedimientoPrincipal: 'Laparoscopia diagnóstica',
    servicio: 'Ginecología',
    tipoCirugia: 'Urgencia',
    cirujano: 'Dra. Ana López',
    fecha: '2026-09-01',
    horaInicio: '11:00',
    horaFin: '13:00',
    estado: 'urgencia',
    procedimientos: [
      { nombre: 'Laparoscopia diagnóstica', tipo: 'principal', duracionMin: 110, notas: 'Dolor pélvico agudo, descartar embarazo ectópico.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dra. Ana López' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', tipo: 'Video/Imagen', identificacion: 'EQ-0412', estado: 'en-uso' },
      { nombre: 'Monitor de signos vitales', tipo: 'Monitoreo', identificacion: 'EQ-0231', estado: 'disponible' },
    ],
    canasta: { nombre: 'Ginecología mayor', items: CANASTAS_CATALOGO[4].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4586', estado: 'en-preparacion', fechaSolicitud: '2026-09-01T10:30',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
  {
    id: '12350',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Pedro Ramírez', documento: 'CC 33.444.555', edad: 47, edadMeses: 4, edadDias: 2, sexo: 'Masculino', aseguradora: 'Salud Total EPS',
      nivel: '2', tipoAfiliado: 'Cotizante', direccion: 'Cra 7 # 45-67, Bogotá', telAviso: '318 654 3321',
    },
    procedimientoPrincipal: 'Colecistectomía laparoscópica',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Juan García',
    fecha: '2026-09-02',
    horaInicio: '07:30',
    horaFin: '10:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Colecistectomía laparoscópica', tipo: 'principal', duracionMin: 130, notas: 'Colecistitis crónica.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Juan García' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', tipo: 'Video/Imagen', identificacion: 'EQ-0412', estado: 'disponible' },
      { nombre: 'Cauterio', tipo: 'Energía quirúrgica', identificacion: 'EQ-0087', estado: 'mantenimiento' },
    ],
    canasta: { nombre: 'Colecistectomía estándar', items: CANASTAS_CATALOGO[0].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4587', estado: 'listo', fechaSolicitud: '2026-09-01T15:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
  {
    id: '12351',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Marta Ruiz', documento: 'CC 22.333.444', edad: 41, edadMeses: 11, edadDias: 18, sexo: 'Femenino', aseguradora: 'Nueva EPS',
      nivel: '1', tipoAfiliado: 'Beneficiario', direccion: 'Calle 100 # 15-30, Bogotá', telAviso: '300 112 8899',
    },
    procedimientoPrincipal: 'Histerectomía',
    servicio: 'Ginecología',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Andrés López',
    fecha: '2026-09-03',
    horaInicio: '08:00',
    horaFin: '10:30',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Histerectomía', tipo: 'principal', duracionMin: 150, notas: 'Vía abdominal.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Andrés López' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Mesa quirúrgica eléctrica', tipo: 'Soporte quirúrgico', identificacion: 'EQ-0560', estado: 'disponible' },
      { nombre: 'Cauterio', tipo: 'Energía quirúrgica', identificacion: 'EQ-0087', estado: 'disponible' },
    ],
    canasta: { nombre: 'Ginecología mayor', items: CANASTAS_CATALOGO[4].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4588', estado: 'en-preparacion', fechaSolicitud: '2026-09-02T11:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Ondansetrón', dosis: '4mg IV' }],
    },
  },
  {
    id: '12352',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Andrés Molina', documento: 'CC 55.666.777', edad: 34, edadMeses: 0, edadDias: 6, sexo: 'Masculino', aseguradora: 'Sura EPS',
      nivel: '2', tipoAfiliado: 'Cotizante', direccion: 'Cra 30 # 22-14, Bogotá', telAviso: '311 445 2200',
    },
    procedimientoPrincipal: 'Hernia umbilical',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Carlos Martínez',
    fecha: '2026-09-04',
    horaInicio: '11:00',
    horaFin: '13:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Hernia umbilical', tipo: 'principal', duracionMin: 100, notas: 'Reparación con malla.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Carlos Martínez' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Cauterio', tipo: 'Energía quirúrgica', identificacion: 'EQ-0087', estado: 'disponible' },
      { nombre: 'Mesa quirúrgica eléctrica', tipo: 'Soporte quirúrgico', identificacion: 'EQ-0560', estado: 'disponible' },
    ],
    canasta: { nombre: 'Hernia inguinal estándar', items: CANASTAS_CATALOGO[2].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4589', estado: 'en-preparacion', fechaSolicitud: '2026-09-03T09:30',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
];

// Semilla de "Revisión de programaciones vencidas" (spec 2026-09-25):
// transcripción de la captura del sistema legado "Listado de Programaciones
// - Revisión" (mismos No. programación/consecutivo/sala/fecha/hora/duración/
// pedido/admisión/paciente), sin la fila "PACIENTE DE PRUEBAS". Todas quedan
// en 'programada' con fecha de 2022, así que fetchVencidas las devuelve.
// Tupla: [No. programación, consecutivo, salaId, fecha, hora inicio,
// duración (min), tiene pedido de inventario, No. admisión | null,
// Id. afiliado, "APELLIDOS, NOMBRES"].
const VENCIDAS_LEGACY = [
  [5584, '0200000009', 'gastroenterologia', '2022-09-01', '10:05', 20, false, '0200000005', '15042902', 'ALVARADO CARDOZO, NAUN DE JESUS'],
  [5591, '0200000016', 'gastroenterologia', '2022-09-01', '10:25', 20, false, '0200000006', '30563036', 'MONTES RIVERA, RUTH MARIA'],
  [5576, '0200000001', 'gastroenterologia', '2022-09-02', '07:00', 20, false, '0200000648', '30567236', 'JIMENEZ MARTINEZ, ARGELIA MARIA'],
  [5617, '0200000042', 'gastroenterologia', '2022-09-02', '07:20', 20, true, '0200000627', '98598507', 'HERNANDEZ MENDEZ, FILADELFO MIGUEL'],
  [5620, '0200000045', 'gastroenterologia', '2022-09-02', '07:40', 20, false, null, '45443416', 'COGOLLO PORTILLO, LUZ ESTER'],
  [5621, '0200000046', 'gastroenterologia', '2022-09-02', '08:00', 20, false, null, '15015206', 'TORDECILLA CORREA, JOSE MARIA'],
  [5624, '0200000049', 'gastroenterologia', '2022-09-02', '08:40', 20, true, '0200000601', '1007535893', 'PACHECO MESTRA, ANDREA CAROLINA'],
  [5577, '0200000002', 'gastroenterologia', '2022-09-02', '14:00', 20, true, '0200000858', '34956054', 'URANGO VILLALBA, CARMEN ALICIA'],
  [5579, '0200000004', 'gastroenterologia', '2022-09-02', '14:20', 20, true, '0200000881', '25988394', 'SEÑA RICARDO, CEVERINA SEGUNDA'],
  [5581, '0200000006', 'gastroenterologia', '2022-09-02', '14:40', 20, true, '0200000933', '30671061', 'PAYARES HERNANDEZ, GRISAIDA CARMEN'],
  [5582, '0200000007', 'gastroenterologia', '2022-09-02', '15:00', 20, true, '0200000877', '26039243', 'HERNANDEZ GOMEZ, LUCINA DEL SOCORRO'],
  [5583, '0200000008', 'gastroenterologia', '2022-09-02', '15:20', 20, true, '0200000872', '34959829', 'GARAVITO VARGAS, ANA FELISA'],
  [5640, '0200000064', 'gastroenterologia', '2022-09-02', '15:40', 20, false, null, '26037063', 'TABORDA GARAY, ADIS ESTHER'],
  [5641, '0200000065', 'gastroenterologia', '2022-09-02', '16:00', 20, false, null, '6884333', 'BUELVAS BERROCAL, JOSE LUIS'],
  [5642, '0200000066', 'gastroenterologia', '2022-09-02', '16:20', 20, false, '0200000848', '50892332', 'JIMENEZ CORREA, DAIRA ELENA'],
  [5644, '0200000068', 'gastroenterologia', '2022-09-02', '17:00', 20, false, null, '34991821', 'VERGARA SERPA, DIANA MARGARITA'],
  [5645, '0200000069', 'gastroenterologia', '2022-09-02', '17:20', 20, false, null, '34986661', 'WILCHEZ GALEANO, SARA REBECA'],
  [5585, '0200000010', 'gastroenterologia', '2022-09-03', '07:00', 20, false, null, '15041717', 'MONTALVO GUERRA, MANUEL FRANCISCO'],
  [5627, '0200000052', 'qx-1', '2022-09-03', '07:00', 60, false, null, '73078260', 'SANCHEZ CALVO, ALVARO ENRIQUE'],
  [5586, '0200000011', 'gastroenterologia', '2022-09-03', '07:20', 20, false, '0200000968', '10985069', 'NUÑEZ, MANUEL FELIPE'],
  [5587, '0200000012', 'gastroenterologia', '2022-09-03', '07:40', 20, false, null, '25762818', 'GALVAN LOPEZ, AMADA ROSA'],
  [5588, '0200000013', 'gastroenterologia', '2022-09-03', '08:00', 20, false, null, '1067938627', 'SUAREZ RUBIO, DANYS MAILER'],
  [5589, '0200000014', 'gastroenterologia', '2022-09-03', '08:20', 20, false, '0200000972', '25956001', 'MORATO SIERRA, GLADYS'],
  [5590, '0200000015', 'gastroenterologia', '2022-09-03', '08:40', 20, false, null, '1104258526', 'PATERNINA VERGARA, IVAN ANDRES'],
  [5592, '0200000017', 'gastroenterologia', '2022-09-03', '09:00', 20, false, null, '1067885903', 'LOPEZ MORON, YODIS'],
  [5593, '0200000018', 'gastroenterologia', '2022-09-03', '09:20', 20, false, null, '50880944', 'HERNANDEZ MEJIA, FANNY'],
  [5594, '0200000019', 'gastroenterologia', '2022-09-03', '09:40', 20, false, '0200000971', '15663747', 'ALVAREZ BELTRAN, SERVIO AUGUSTO'],
  [5648, '0200000072', 'gastroenterologia', '2022-09-03', '10:00', 20, false, null, '1072526353', 'CAICEDO JULIO, ESPERANZA EDITH'],
  [5649, '0200000073', 'gastroenterologia', '2022-09-03', '10:20', 20, false, '0200000973', '1137975838', 'VERGARA ESCUDERO, MARIA ELIZABETH'],
  [5736, '0200000160', 'qx-1', '2022-09-03', '18:00', 60, false, null, '1104256622', 'MONTERROSA PEREZ, MARIA ALEJANDRA'],
  [5744, '0200000168', 'qx-1', '2022-09-04', '07:00', 60, true, null, '7486686', 'ATENCIO ARRIETA, MIGUEL'],
  [5725, '0200000149', 'qx-1', '2022-09-05', '00:00', 60, false, null, '1579842', 'GUERRA MARTINEZ, MANUEL DEL CRISTO'],
  [5726, '0200000150', 'qx-1', '2022-09-05', '01:00', 60, false, null, '15072173', 'CORREA BABILONIA, GABRIEL'],
  [5727, '0200000151', 'qx-1', '2022-09-05', '02:00', 40, false, null, '2823314', 'VIDAL RODRIGUEZ, GUALBERTO JOSE'],
  [5728, '0200000152', 'qx-1', '2022-09-05', '02:40', 40, true, null, '1065380090', 'MORELO FERNANDEZ, SHAROL LUCIA'],
  [5729, '0200000153', 'qx-1', '2022-09-05', '03:20', 40, true, null, '1062538007', 'BERROCAL PAYARES, PAULINA'],
  [5730, '0200000154', 'qx-1', '2022-09-05', '04:00', 40, true, null, '1041271202', 'HERNANDEZ MARTINEZ, ALEXANDRA'],
  [5731, '0200000155', 'qx-1', '2022-09-05', '04:40', 40, true, null, '1064797597', 'SUAREZ HERNANDEZ, MARIA ALEJANDRA'],
  [5743, '0200000167', 'qx-2', '2022-09-05', '05:00', 60, true, null, '6878270', 'ARIZA MEZA, JAIME ALFONSO'],
  [5694, '0200000118', 'qx-1', '2022-09-05', '06:00', 60, true, null, '33173971', 'OTERO PADILLA, RUBBY ESTHER'],
  [5738, '0200000162', 'qx-2', '2022-09-05', '06:00', 120, false, null, '26057070', 'RIVERA DE PRADO, CLEOTILDE DEL CARMEN'],
  [5595, '0200000020', 'gastroenterologia', '2022-09-05', '07:00', 20, false, null, '11330499', 'NADER SIMONDS, ALBERTO AGUSTIN DEMETRIO'],
  [5706, '0200000130', 'qx-1', '2022-09-05', '07:00', 60, false, null, '50954877', 'CASTILLO IBARRA, LOURDES PETRONA'],
];

// Procedimiento/cirujano/medicamentos por sala: la captura legada no los
// muestra, se asigna uno representativo por sala para que el detalle de
// insumos y los modales de cancelar/reprogramar tengan datos.
const BASE_VENCIDA_POR_SALA = {
  gastroenterologia: {
    procedimiento: 'Esofagogastroduodenoscopia',
    servicio: 'Gastroenterología',
    cirujano: 'Dr. Andrés López',
    medicamentos: [{ nombre: 'Propofol', dosis: '200mg IV' }, { nombre: 'Lidocaína spray', dosis: '10%' }],
  },
  'qx-1': {
    procedimiento: 'Colecistectomía laparoscópica',
    servicio: 'Cirugía general',
    cirujano: 'Dr. Juan García',
    medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Ondansetrón', dosis: '4mg IV' }],
  },
  'qx-2': {
    procedimiento: 'Herniorrafia inguinal',
    servicio: 'Cirugía general',
    cirujano: 'Dr. Carlos Martínez',
    medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
  },
};

function vencidaLegacy([
  numeroProgramacion, consecutivo, salaId, fecha, horaInicio, duracionMin, conPedido, numeroAdmision, idAfiliado, nombre,
]) {
  const base = BASE_VENCIDA_POR_SALA[salaId];
  return {
    id: `v-${numeroProgramacion}`,
    sedeId: '02',
    salaId,
    numeroProgramacion: String(numeroProgramacion),
    consecutivo,
    paciente: { nombre, documento: `CC ${idAfiliado}` },
    procedimientoPrincipal: base.procedimiento,
    servicio: base.servicio,
    tipoCirugia: 'Programada',
    cirujano: base.cirujano,
    fecha,
    horaInicio,
    horaFin: calcularHoraFin(horaInicio, duracionMin),
    estado: 'programada',
    procedimientos: [{
      nombre: base.procedimiento, tipo: 'principal', duracionMin, notas: '',
    }],
    personal: [{ rol: 'Cirujano', nombre: base.cirujano }],
    equipos: [],
    canasta: { nombre: 'Sin canasta asignada', items: [] },
    farmacia: conPedido ? {
      numeroPedido: `PED-${consecutivo.slice(-4)}`,
      estado: 'listo',
      fechaSolicitud: `${fecha}T06:00`,
      medicamentos: base.medicamentos.map((med) => ({ ...med })),
    } : null,
    traslado: numeroAdmision ? { numeroAdmision } : null,
  };
}

CIRUGIAS = [...CIRUGIAS, ...VENCIDAS_LEGACY.map(vencidaLegacy)];

let nextIdSeq = 12353;

// Consecutivo de "No. Programación" de AgregarProcedimientoModal (encargo
// explícito: "debe ser un consecutivo... pon un número real" -- ya no un
// texto de ejemplo). Semilla 42766 = el número que traía la captura de
// referencia, ahora usado como punto de partida real del consecutivo en vez
// de ilustrativo. Mismo patrón que nextIdSeq/crearCirugia: contador
// module-level que se resetea al recargar la página.
let nextProgramacionSeq = 42766;

export function siguienteNumeroProgramacion() {
  const n = nextProgramacionSeq;
  nextProgramacionSeq += 1;
  return n;
}

// Reemplaza a fetchAgendaSemana: mismo filtro, pero `inicio`/`fin` (ISO
// yyyy-mm-dd) los calcula el orquestador según la vista activa (Día/Semana/
// Mes) en vez de asumir siempre una semana completa -- ver
// ProgramacionSalaCirugias.jsx.
export function fetchAgendaRango({
  sedeId, salaId, inicio, fin, estado = 'todos',
}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const items = CIRUGIAS.filter((c) => {
        if (c.sedeId !== sedeId || c.salaId !== salaId) return false;
        if (c.fecha < inicio || c.fecha > fin) return false;
        if (estado !== 'todos' && c.estado !== estado) return false;
        return true;
      });
      resolve(items);
    }, 250);
  });
}

function minutosCirugia(c) {
  const [h1, m1] = c.horaInicio.split(':').map(Number);
  const [h2, m2] = c.horaFin.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

function diasEnRango(inicio, fin) {
  const ms = new Date(`${fin}T00:00:00`) - new Date(`${inicio}T00:00:00`);
  return Math.floor(ms / 86400000) + 1;
}

// "18h 30m" -- formato propio del resumen de agenda (encargo explícito, ver
// "Resumen de agenda" en MiniCalendarCirugias.jsx), distinto del "18h 30min"
// de duracionLabel de arriba (esa es para la duración de 1 sola cirugía en
// el detalle, no para un agregado del panel lateral).
function resumenHorasLabel(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Jornada operativa asumida por sala para el % de "Ocupación" del resumen de
// agenda (07:00-19:00, mismo horario en que arrancan las cirugías del mock
// más temprano) -- no hay un dato real de "horario de quirófano" en este
// modelo, así que queda fijo acá en vez de inventar un campo nuevo en SALAS.
const JORNADA_OPERATIVA_MIN = 12 * 60;

// Resumen operativo para el bloque "Resumen de agenda" del panel lateral
// (ver MiniCalendarCirugias.jsx) -- combina `cirugias` (la misma lista ya
// cargada para la sala/estado/rango que se ve en la grilla principal, sin
// re-fetch) con un vistazo cross-sala (todas las salas ACTIVAS de la sede,
// no solo la seleccionada) para "Salas ocupadas": acotado a 1 sola sala ese
// indicador siempre sería 0/1 o 1/1 y no diría nada -- Cirugías/Horas/
// Ocupación/Urgencias sí quedan atadas a la sala seleccionada porque son
// exactamente lo que la grilla principal está mostrando en ese momento.
// Cancelada no cuenta como "ocupando" agenda en ninguno de los indicadores.
export function resumenAgenda({
  cirugias, sedeId, inicio, fin, estado = 'todos',
}) {
  const activas = cirugias.filter((c) => c.estado !== 'cancelada');
  const minutosOcupados = activas.reduce((acc, c) => acc + minutosCirugia(c), 0);
  const dias = diasEnRango(inicio, fin);

  const salasActivas = SALAS.filter((s) => s.sedeId === sedeId && s.estado === 'Activo');
  const salasOcupadas = salasActivas.filter((sala) => CIRUGIAS.some((c) => (
    c.sedeId === sedeId && c.salaId === sala.value
    && c.fecha >= inicio && c.fecha <= fin
    && c.estado !== 'cancelada'
    && (estado === 'todos' || c.estado === estado)
  ))).length;

  return {
    totalCirugias: activas.length,
    horasOcupadasLabel: resumenHorasLabel(minutosOcupados),
    urgencias: activas.filter((c) => c.estado === 'urgencia').length,
    salasOcupadas,
    salasTotal: salasActivas.length,
    ocupacionPct: dias > 0 ? Math.round((minutosOcupados / (dias * JORNADA_OPERATIVA_MIN)) * 100) : 0,
  };
}

// Catálogo de equipos que alimenta CatalogoEquiposModal ("Agregar equipo" en
// EquiposStep, Paso 4 del wizard "Nueva cirugía") -- mismo shape
// {nombre,tipo,identificacion} que ya consume EquiposTable
// (@/Components/EquiposTable), con los mismos nombres/tipos/identificación
// ya usados en los registros semilla de CIRUGIAS arriba (Torre de
// laparoscopia, Cauterio, Monitor de signos vitales, Mesa quirúrgica
// eléctrica) más variedad adicional para que la búsqueda tenga sentido.
export const EQUIPOS_QX_CATALOGO = [
  { nombre: 'Torre de laparoscopia', tipo: 'Video/Imagen', identificacion: 'EQ-0412' },
  { nombre: 'Cauterio', tipo: 'Energía quirúrgica', identificacion: 'EQ-0087' },
  { nombre: 'Monitor de signos vitales', tipo: 'Monitoreo', identificacion: 'EQ-0231' },
  { nombre: 'Mesa quirúrgica eléctrica', tipo: 'Soporte quirúrgico', identificacion: 'EQ-0560' },
  { nombre: 'Máquina de anestesia', tipo: 'Anestesia', identificacion: 'EQ-0198' },
  { nombre: 'Bisturí eléctrico', tipo: 'Energía quirúrgica', identificacion: 'EQ-0102' },
  { nombre: 'Lámpara quirúrgica', tipo: 'Iluminación', identificacion: 'EQ-0305' },
  { nombre: 'Aspirador quirúrgico', tipo: 'Soporte quirúrgico', identificacion: 'EQ-0447' },
  { nombre: 'Desfibrilador', tipo: 'Monitoreo', identificacion: 'EQ-0512' },
  { nombre: 'Torre de artroscopia', tipo: 'Video/Imagen', identificacion: 'EQ-0399' },
];

// Suma `duracionMin` a `horaInicio` ("HH:mm") y devuelve la hora de fin
// ("HH:mm") -- no rueda al día siguiente si se pasa de medianoche (queda en
// 00:xx), simplificación aceptable para el mock. Compartido por
// armarCirugiaDesdeWizard/armarCirugiaUrgencia más abajo y por el preview
// en vivo de "Finaliza" en NuevaUrgenciaModal.jsx (3 consumidores).
export function calcularHoraFin(horaInicio, duracionMin) {
  const [h, m] = horaInicio.split(':').map(Number);
  const total = (h * 60 + m + Number(duracionMin || 0)) % 1440;
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

// Traduce `datos` del wizard "Nueva cirugía" (NuevaCirugiaWizard.jsx) al
// shape de un registro de CIRUGIAS (ver fetchAgendaRango/CirugiaCard/
// DetalleCirugiaPanel) -- son 2 modelos distintos porque el wizard recolecta
// datos de admisión paso a paso, mientras que el registro final es lo que ya
// consumen calendario + detalle. Decisiones tomadas para las piezas sin
// origen real en el wizard hoy (encargo "qué necesitás para guardar",
// 2026-09-07): `tipoCirugia` a nivel de cirugía queda fijo en 'Programada'
// (ningún paso lo pregunta -- "Nueva urgencia" ya tiene su propio flujo
// corto, ver armarCirugiaUrgencia más abajo, así que este wizard siempre es
// el camino "no urgente"); `servicio` queda vacío (no leído por ninguna
// pantalla hoy); `aseguradora` usa `patient.eps` en vez de
// `datos.idAseguradora` del Paso 1 (decisión explícita: son 2 campos que
// pueden no coincidir); `nivel`/`tipoAfiliado`/`dirección` del paciente
// quedan vacíos (el detalle ya los muestra con fallback '—', ver
// DetalleCirugiaPanel.jsx); Instrumentadora/Circulante de `personal` y
// `farmacia.medicamentos` quedan vacíos (ningún paso los recolecta todavía).
// `duracionMin` se replica igual en todos los procedimientos (el wizard solo
// pide una duración total, no una por procedimiento).
// `wizardDatos` (encargo explícito, ver "Editar cirugía"): copia cruda del
// `datos` del wizard, para que reabrirlo desde un registro ya guardado
// (ver datosWizardDesdeCirugia más abajo) tenga fidelidad total en vez de
// tener que reconstruir campos que el registro final no guarda en ningún
// otro lado (dx. ingreso, autorización, ASA, clase, tipo anestesia,
// observaciones...). No afecta a ningún consumidor existente del registro:
// es un campo nuevo, nadie más lo lee todavía.
export function armarCirugiaDesdeWizard(datos, patient, salaId) {
  const sala = SALAS.find((s) => s.value === salaId);
  const { edad, edadMeses, edadDias } = calcularEdadDesglosada(patient.fechaNacimiento);
  const [fecha, horaInicio] = datos.fechaInicio.split('T');
  const duracionMin = Number(datos.duracionEstimada) || 0;
  const horaFin = calcularHoraFin(horaInicio, duracionMin);

  const insumos = datos.insumos ?? agregarInsumosPrecargados(datos.procedimientos);
  const primerProcedimiento = datos.procedimientos[0];

  return {
    sedeId: sala?.sedeId ?? '02',
    salaId,
    paciente: {
      nombre: patient.nombre,
      documento: patient.documento,
      edad,
      edadMeses,
      edadDias,
      sexo: patient.sexo,
      aseguradora: patient.eps,
      nivel: '',
      tipoAfiliado: '',
      direccion: '',
      telAviso: datos.telefonosAviso,
    },
    procedimientoPrincipal: primerProcedimiento ? soloNombre(primerProcedimiento.idCirugia) : '',
    servicio: '',
    tipoCirugia: 'Programada',
    cirujano: primerProcedimiento ? soloNombre(primerProcedimiento.idCirujano) : '',
    fecha,
    horaInicio,
    horaFin,
    procedimientos: datos.procedimientos.map((p, i) => ({
      nombre: soloNombre(p.idCirugia),
      tipo: i === 0 ? 'principal' : 'asociado',
      duracionMin,
      notas: '',
    })),
    personal: personalDeProcedimientos(datos.procedimientos),
    equipos: datos.equipos ?? [],
    canasta: {
      nombre: 'Canasta de la cirugía',
      items: insumos.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, estado: 'disponible' })),
    },
    farmacia: {
      numeroPedido: '—', estado: 'en-preparacion', fechaSolicitud: `${datos.fechaSolicitud}T${datos.horaSolicitud}`, medicamentos: [],
    },
    wizardDatos: datos,
  };
}

// Guarda una edición hecha desde el wizard "Nueva cirugía" reabierto en modo
// edición (ver datosWizardDesdeCirugia/NuevaCirugiaWizard.jsx `cirugiaId`) --
// a diferencia de armarCirugiaDesdeWizard+crearCirugia (que arman un registro
// nuevo de cero), acá el paciente/estado/farmacia/causal de reprogramación/
// motivo de cancelación del registro existente NO se tocan: solo se
// recalculan los campos que el wizard sí edita (sala, fecha/hora,
// procedimientos, personal, canasta, equipos), vía actualizarCirugia (merge
// superficial) en vez de reemplazar el registro entero como haría
// armarCirugiaDesdeWizard. El paciente no cambia en una edición -- por eso
// esta función no recibe `patient` (a diferencia de armarCirugiaDesdeWizard,
// que sí lo necesita para armar el registro desde cero); solo el teléfono de
// aviso (`datos.telefonosAviso`) se sincroniza de vuelta a `paciente.telAviso`
// porque es el único dato del paciente que el wizard edita.
export function editarCirugiaDesdeWizard(id, datos, salaId) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  if (!actual) return actual;

  const sala = SALAS.find((s) => s.value === salaId);
  const [fecha, horaInicio] = datos.fechaInicio.split('T');
  const duracionMin = Number(datos.duracionEstimada) || 0;
  const horaFin = calcularHoraFin(horaInicio, duracionMin);

  const insumos = datos.insumos ?? agregarInsumosPrecargados(datos.procedimientos);
  const primerProcedimiento = datos.procedimientos[0];

  return actualizarCirugia(id, {
    sedeId: sala?.sedeId ?? actual.sedeId,
    salaId,
    paciente: { ...actual.paciente, telAviso: datos.telefonosAviso },
    procedimientoPrincipal: primerProcedimiento ? soloNombre(primerProcedimiento.idCirugia) : '',
    cirujano: primerProcedimiento ? soloNombre(primerProcedimiento.idCirujano) : '',
    fecha,
    horaInicio,
    horaFin,
    procedimientos: datos.procedimientos.map((p, i) => ({
      nombre: soloNombre(p.idCirugia),
      tipo: i === 0 ? 'principal' : 'asociado',
      duracionMin,
      notas: '',
    })),
    personal: personalDeProcedimientos(datos.procedimientos),
    equipos: datos.equipos ?? [],
    canasta: {
      nombre: actual.canasta?.nombre ?? 'Canasta de la cirugía',
      items: insumos.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, estado: 'disponible' })),
    },
    wizardDatos: datos,
  });
}

// Reconstruye el `datos` del wizard a partir de una cirugía ya guardada, para
// que "Editar" reabra "Nueva cirugía" con los datos cargados (encargo
// explícito). Con `wizardDatos` (grabado la última vez que se creó/editó
// desde el wizard, ver armarCirugiaDesdeWizard/editarCirugiaDesdeWizard
// arriba) se usa tal cual -- fidelidad total -- salvo sala/fecha-hora, que
// siempre se toman del registro vivo por si se movieron después vía
// "Reprogramar" (que no pasa por el wizard y no actualiza el snapshot).
//
// Sin snapshot (datos semilla del mock, o creadas por "Nueva urgencia"): se
// arma un `datos` best-effort con solo lo recuperable de forma confiable del
// registro guardado. ~15 campos administrativos del Paso 1 (dx. ingreso,
// autorización, ASA, clase, tipo anestesia, observaciones...) nunca se
// guardaron en el registro final y quedan en blanco -- igual que un
// registro migrado de un sistema viejo sin esos datos (decisión explícita,
// no hay forma de recuperarlos). Procedimientos/insumos reconstruidos usan
// el nombre plano como id/código en vez de buscar el código real del
// catálogo (soloNombre() es un passthrough para strings sin "id - nombre":
// si el usuario no los toca en el wizard, se guardan de vuelta exactamente
// igual) -- solo se pierde el vínculo con el catálogo (tipoCirugia por
// procedimiento, insumos propios de un procedimiento), no el dato en sí.
export function datosWizardDesdeCirugia(cirugia) {
  const salaFecha = {
    salaId: cirugia.salaId,
    fechaInicio: `${cirugia.fecha}T${cirugia.horaInicio}`,
  };
  if (cirugia.wizardDatos) {
    return { ...cirugia.wizardDatos, ...salaFecha };
  }

  const anestesiologo = cirugia.personal?.find((p) => p.rol === 'Anestesiólogo')?.nombre ?? '';
  const [fechaSolicitud, horaSolicitud] = cirugia.farmacia?.fechaSolicitud?.split('T') ?? [];

  return {
    ...salaFecha,
    telefonosAviso: cirugia.paciente.telAviso ?? '',
    fechaSolicitud: fechaSolicitud ?? fechaISO(new Date()),
    horaSolicitud: horaSolicitud ?? horaLocal(new Date()),
    duracionEstimada: cirugia.procedimientos?.[0]?.duracionMin ? String(cirugia.procedimientos[0].duracionMin) : '',
    procedimientos: (cirugia.procedimientos ?? []).map((p) => ({
      idCirugia: p.nombre,
      idCirujano: cirugia.cirujano || '',
      idAnestesiologo: anestesiologo,
      tipoCirugia: '',
      insumos: [],
    })),
    insumos: (cirugia.canasta?.items ?? []).map((i) => ({ codigo: i.nombre, nombre: i.nombre, cantidad: i.cantidad })),
    equipos: cirugia.equipos ?? [],
  };
}

// Traduce el formulario de NuevaUrgenciaModal.jsx al shape de un registro de
// CIRUGIAS -- flujo corto de una sola pantalla (Validar/Cancelar, sin pasos),
// mismo espíritu que el formulario legacy de referencia "Incluir
// Procedimientos Urgentes en la Programación": se guarda de inmediato con
// procedimientos/insumos/equipos/personal vacíos, para completarse después
// abriendo el detalle de la cirugía ya creada (no encadena al wizard de
// "Nueva cirugía"). `idAseguradora`/`tipoTercero`/`idContrato` del
// formulario se guardan en `admisionUrgencia` -- son datos de admisión
// capturados en el formulario, no leídos por ninguna pantalla del detalle
// todavía (mismo criterio que `estado` sin consumir en
// ASEGURADORAS_CATALOGO: se conservan por si un futuro ajuste los necesita).
// `aseguradora` del paciente sigue usando `patient.eps`, igual que
// armarCirugiaDesdeWizard arriba (mismo criterio, misma decisión explícita).
export function armarCirugiaUrgencia(form, patient, salaId) {
  const sala = SALAS.find((s) => s.value === salaId);
  const { edad, edadMeses, edadDias } = calcularEdadDesglosada(patient.fechaNacimiento);
  const duracionMin = Number(form.duracionEstimada) || 0;
  const horaFin = calcularHoraFin(form.horaCirugia, duracionMin);

  return {
    sedeId: sala?.sedeId ?? '02',
    salaId,
    paciente: {
      nombre: patient.nombre,
      documento: patient.documento,
      edad,
      edadMeses,
      edadDias,
      sexo: patient.sexo,
      aseguradora: patient.eps,
      nivel: '',
      tipoAfiliado: '',
      direccion: '',
      telAviso: patient.celular ?? '',
    },
    procedimientoPrincipal: '',
    servicio: '',
    tipoCirugia: 'Urgencia',
    cirujano: '',
    fecha: form.fechaCirugia,
    horaInicio: form.horaCirugia,
    horaFin,
    procedimientos: [],
    personal: [],
    equipos: [],
    canasta: { nombre: 'Canasta de la cirugía', items: [] },
    farmacia: {
      numeroPedido: '—', estado: 'en-preparacion', fechaSolicitud: `${form.fechaCirugia}T${form.horaCirugia}`, medicamentos: [],
    },
    admisionUrgencia: {
      idAseguradora: form.idAseguradora, tipoTercero: form.tipoTercero, idContrato: form.idContrato,
    },
    urgencia: true,
  };
}

export function crearCirugia(datos) {
  const id = String(nextIdSeq);
  nextIdSeq += 1;
  const { urgencia, ...resto } = datos;
  const cirugia = { id, estado: urgencia ? 'urgencia' : 'programada', ...resto };
  CIRUGIAS = [...CIRUGIAS, cirugia];
  return cirugia;
}

export function actualizarCirugia(id, datos) {
  CIRUGIAS = CIRUGIAS.map((c) => (c.id === id ? { ...c, ...datos } : c));
  return CIRUGIAS.find((c) => c.id === id);
}

export function actualizarEstadoCirugia(id, nuevoEstado) {
  return actualizarCirugia(id, { estado: nuevoEstado });
}

export function reprogramarCirugia(id, {
  fecha, horaInicio, horaFin, salaId, cirujano, causal,
  duracionEstimadaMin, duracionPostquirurgicaMin, duracionRecuperacionMin,
}) {
  return actualizarCirugia(id, {
    fecha,
    horaInicio,
    horaFin,
    salaId,
    cirujano,
    causalReprogramacion: causal,
    duracionEstimadaMin,
    duracionPostquirurgicaMin,
    duracionRecuperacionMin,
  });
}

// ---------- Flujo de insumos: solicitud -> entrega -> devolución ----------
// (encargo explícito 2026-09-25). Cada insumo de la canasta guarda en
// `solicitudFarmacia` su paso del flujo: 'sin-solicitar' (o ausente) ->
// 'solicitado' ("Pedir insumos a farmacia") -> 'entregado' ("Registrar
// entrega"). Las devoluciones viven en `cirugia.devoluciones` y el estado
// devuelto/devuelto parcial se DERIVA de ellas (estadoInsumo), no se guarda:
// así anular o modificar una devolución no deja el insumo desincronizado.
// Sin integración real con farmacia (mock): la devolución queda confirmada
// por farmacia en el mismo momento de guardarse (decisión explícita).
export const SOLICITUD_FARMACIA_LABEL = {
  'sin-solicitar': 'Sin solicitar',
  solicitado: 'Solicitado',
  entregado: 'Entregado',
  'devuelto-parcial': 'Devuelto parcial',
  devuelto: 'Devuelto',
};

// Estados de una devolución -- mismos nombres que la leyenda de la ventana
// legada "Devoluciones en Cirugías". Hoy solo se usan confirmada (al
// guardar) y anulada (Eliminar); pendiente/no completada quedan para cuando
// farmacia confirme por separado.
export const DEVOLUCION_ESTADO_LABEL = {
  confirmada: 'Confirmada por farmacia',
  pendiente: 'Pendiente por entregar a farmacia',
  'no-completada': 'No completada por el usuario',
  anulada: 'Anulado en Farmacia',
};

let nextConsecutivoDevolucion = 1;

// Código de inventario y lote inventados (mock, encargo explícito): los
// insumos de las canastas de prueba no traen código ni lote. Se derivan de
// un hash del nombre en vez de Math.random() para que un mismo insumo
// muestre siempre el mismo código/lote entre renders y devoluciones.
function hashTexto(texto) {
  let h = 0;
  for (let i = 0; i < texto.length; i += 1) h = ((h * 31) + texto.charCodeAt(i)) >>> 0;
  return h;
}

export function codigoInsumo(item) {
  if (item.codigo) return item.codigo;
  return `DM${String(hashTexto(item.nombre) % 1000000).padStart(6, '0')}`;
}

export function datosLoteInsumo(item) {
  const h = hashTexto(`lote:${item.nombre}`);
  const anio = 25 + (h % 2);
  const letra = String.fromCharCode(65 + ((h >>> 3) % 26));
  return { manejaLote: true, noLote: `L${anio}${letra}${String((h >>> 8) % 10000).padStart(4, '0')}` };
}

// Cantidad ya devuelta de un insumo (suma de sus devoluciones no anuladas).
// `excepto`: consecutivo a ignorar -- al modificar una devolución, su propia
// cantidad anterior no cuenta contra el máximo.
export function cantidadDevuelta(cirugia, nombre, { excepto } = {}) {
  return (cirugia.devoluciones ?? [])
    .filter((d) => d.estado !== 'anulada' && d.consecutivo !== excepto)
    .reduce((total, d) => total + (d.items.find((i) => i.nombre === nombre)?.cantidad ?? 0), 0);
}

// Máximo que todavía se puede devolver de un insumo (0 si no fue entregado).
export function cantidadDevolvible(cirugia, item, { excepto } = {}) {
  if (item.solicitudFarmacia !== 'entregado') return 0;
  return item.cantidad - cantidadDevuelta(cirugia, item.nombre, { excepto });
}

export function estadoInsumo(cirugia, item) {
  const paso = item.solicitudFarmacia ?? 'sin-solicitar';
  if (paso !== 'entregado') return paso;
  const devuelta = cantidadDevuelta(cirugia, item.nombre);
  if (devuelta === 0) return 'entregado';
  return devuelta >= item.cantidad ? 'devuelto' : 'devuelto-parcial';
}

function avanzarCanasta(id, desde, hasta) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  return actualizarCirugia(id, {
    canasta: {
      ...actual.canasta,
      items: actual.canasta.items.map((i) => (
        (i.solicitudFarmacia ?? 'sin-solicitar') === desde ? { ...i, solicitudFarmacia: hasta } : i
      )),
    },
  });
}

// "Pedir insumos a farmacia": los insumos sin solicitar pasan a solicitados.
export function solicitarInsumosFarmacia(id) {
  return avanzarCanasta(id, 'sin-solicitar', 'solicitado');
}

// "Cancelar solicitud": deshace el pedido mientras farmacia no haya
// entregado -- los solicitados vuelven a "Sin solicitar". La causal de
// anulación y la observación (ventana "Causal de Cancelación de
// Programación") quedan en el historial `cancelacionesSolicitud`.
export function cancelarSolicitudInsumos(id, { causal, observacion = '', usuario = 'CLINTOS' }) {
  const actual = avanzarCanasta(id, 'solicitado', 'sin-solicitar');
  return actualizarCirugia(id, {
    cancelacionesSolicitud: [
      ...(actual.cancelacionesSolicitud ?? []),
      {
        idCausal: causal.idCausal, causal: causal.descripcion, observacion, usuario, fecha: fechaHoraLocalISO(new Date()),
      },
    ],
  });
}

// "Registrar entrega": farmacia entregó lo solicitado al quirófano.
export function registrarEntregaInsumos(id) {
  return avanzarCanasta(id, 'solicitado', 'entregado');
}

// Crea (sin `consecutivo`) o modifica (con `consecutivo`) una devolución.
// `lineas`: [{ nombre, cantidad }]; las de cantidad 0 se descartan. Lanza
// Error con un mensaje para el usuario si no hay nada que devolver o si
// alguna cantidad supera lo devolvible.
export function guardarDevolucion(id, { consecutivo, lineas, usuario = 'CLINTOS' }) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  const aDevolver = lineas.filter((l) => l.cantidad > 0);
  if (aDevolver.length === 0) throw new Error('Indica al menos una cantidad a devolver.');
  const items = aDevolver.map((l) => {
    const item = actual.canasta.items.find((i) => i.nombre === l.nombre);
    const maximo = item ? cantidadDevolvible(actual, item, { excepto: consecutivo }) : 0;
    if (!Number.isInteger(l.cantidad) || l.cantidad > maximo) {
      throw new Error(`${l.nombre}: se pueden devolver como máximo ${maximo}.`);
    }
    return {
      nombre: item.nombre, codigo: codigoInsumo(item), cantidad: l.cantidad, ...datosLoteInsumo(item),
    };
  });
  const fecha = fechaHoraLocalISO(new Date());
  const devoluciones = actual.devoluciones ?? [];
  const nuevas = consecutivo
    ? devoluciones.map((d) => (d.consecutivo === consecutivo ? { ...d, items, fecha } : d))
    : [...devoluciones, {
      consecutivo: nextConsecutivoDevolucion++, usuario, fecha, estado: 'confirmada', items,
    }];
  return actualizarCirugia(id, { devoluciones: nuevas });
}

// "Eliminar" de la ventana de devoluciones: la anula (queda en el listado en
// gris, como en la ventana legada) y deja de contar como devuelta.
export function anularDevolucion(id, consecutivo) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  return actualizarCirugia(id, {
    devoluciones: (actual.devoluciones ?? []).map((d) => (
      d.consecutivo === consecutivo ? { ...d, estado: 'anulada' } : d
    )),
  });
}

export function cancelarCirugia(id, motivo) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  return actualizarCirugia(id, {
    estado: 'cancelada',
    motivoCancelacion: motivo,
    farmacia: conResolucionInsumos(actual, 'devolucion'),
  });
}

// ---------- Revisión de programaciones vencidas (spec 2026-09-25) ----------

// Registros crudos: la clasificación por tipo la hace revisionVencidas.js en
// la pantalla, así el mock no depende de ella.
export function fetchVencidas({ hoy }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(CIRUGIAS.filter((c) => c.estado === 'programada' && c.fecha < hoy));
    }, 250);
  });
}

// Qué pasa con el pedido de insumos al cerrar la programación: realizada ->
// 'consumido'; incumplida/cancelada -> 'devolucion'. Solo una marca en el
// mock, sin integración real con inventario (fuera de alcance del spec).
function conResolucionInsumos(cirugia, resolucion) {
  if (!cirugia?.farmacia?.numeroPedido) return cirugia?.farmacia;
  return { ...cirugia.farmacia, resolucionInsumos: resolucion };
}

// Devuelve los registros tal como estaban antes del cambio: es el snapshot
// que usa "Deshacer" (ver deshacerResolucion).
function resolverVarias(ids, cambios) {
  const snapshot = CIRUGIAS.filter((c) => ids.includes(c.id));
  CIRUGIAS = CIRUGIAS.map((c) => (ids.includes(c.id) ? { ...c, ...cambios(c) } : c));
  return snapshot;
}

export function marcarRealizadas(ids) {
  return resolverVarias(ids, (c) => ({
    estado: 'realizada',
    farmacia: conResolucionInsumos(c, 'consumido'),
  }));
}

export function marcarIncumplidas(ids, { causal, observacion = '' }) {
  return resolverVarias(ids, (c) => ({
    estado: 'incumplida',
    causalIncumplimiento: causal,
    observacionIncumplimiento: observacion,
    farmacia: conResolucionInsumos(c, 'devolucion'),
  }));
}

export function deshacerResolucion(snapshot) {
  const previos = new Map(snapshot.map((c) => [c.id, c]));
  CIRUGIAS = CIRUGIAS.map((c) => previos.get(c.id) ?? c);
}
