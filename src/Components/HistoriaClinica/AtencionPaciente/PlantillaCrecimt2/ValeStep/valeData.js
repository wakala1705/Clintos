// Datos + cálculo puro del instrumento VALE (Valoración del desarrollo
// infantil) — paso "07 Desarrollo" del wizard CRECIMT2. Vive como módulo de
// datos plano (no como componente) por su tamaño: ~35 preguntas repartidas
// en 11 rangos de edad + 2 rangos vestibulares + listas perinatal/
// estructural, mucho más grande que cualquier `const` inline usada hasta
// ahora en este wizard (comparar con las 12 filas de BIOLOGICOS en
// VacunacionStep.jsx) — mismo criterio que mockAgendaData.js/
// mockPlantillas.js para datos de este tamaño.
//
// No existe un manual oficial de VALE disponible en este proyecto: el texto
// de las preguntas C/E/I (fuera del único ejemplo que trajo el encargo) y el
// texto de "Conducta recomendada" son contenido clínico plausible pero
// inventado — mismo criterio ya usado en RiesgoStep.jsx/AntecedentesStep.jsx
// para campos sin fuente real. Los campos, rangos de edad, categorías C/E/I,
// preguntas vestibulares y estructura de resultado SÍ vienen literalmente
// del encargo del usuario y no se resumieron ni modificaron.

// ---------- RANGOS DE EDAD (en meses) ----------
// El rango final del usuario dice "9 años–12 años" (sin "11 meses" como los
// demás) — se interpreta inclusivo hasta 144 meses. Existe un vacío real
// entre 71 y 108 meses sin cobertura C/E/I, tal como el usuario especificó
// los rangos — no se inventa un rango puente (ver evaluarDimension: una
// dimensión sin preguntas aplicables queda en estado "no aplica", no en
// aprobado/falla).
export const RANGOS_CEI = [
  { id: '4-6m', label: '4 – 6 meses', minMeses: 4, maxMeses: 6 },
  { id: '7-9m', label: '7 – 9 meses', minMeses: 7, maxMeses: 9 },
  { id: '10-12m', label: '10 – 12 meses', minMeses: 10, maxMeses: 12 },
  { id: '13-15m', label: '13 – 15 meses', minMeses: 13, maxMeses: 15 },
  { id: '16-18m', label: '16 – 18 meses', minMeses: 16, maxMeses: 18 },
  { id: '19-24m', label: '19 – 24 meses', minMeses: 19, maxMeses: 24 },
  { id: '25-35m', label: '25 – 35 meses', minMeses: 25, maxMeses: 35 },
  { id: '3a-3a11m', label: '3 años – 3 años 11 meses', minMeses: 36, maxMeses: 47 },
  { id: '4a-4a11m', label: '4 años – 4 años 11 meses', minMeses: 48, maxMeses: 59 },
  { id: '5a-5a11m', label: '5 años – 5 años 11 meses', minMeses: 60, maxMeses: 71 },
  { id: '9a-12a', label: '9 años – 12 años', minMeses: 108, maxMeses: 144 },
];

export const RANGOS_VESTIBULAR = [
  { id: '3a-5a', label: '3 – 5 años', minMeses: 36, maxMeses: 60 },
  { id: '5a1m-12a11m', label: '5 años 1 mes – 12 años 11 meses', minMeses: 61, maxMeses: 155 },
];

// ---------- PREGUNTAS COMPRENSIÓN (C) / EXPRESIÓN (E) / INTERACCIÓN (I) ----------
export const PREGUNTAS_CEI = [
  // 4-6 meses
  { id: 'cei-4-6m-c1', rango: '4-6m', categoria: 'C',
    texto: '¿Cuando se escucha una puerta, timbre u otro sonido familiar el bebé voltea la cabeza buscando de dónde proviene?' },
  { id: 'cei-4-6m-e1', rango: '4-6m', categoria: 'E',
    texto: '¿El bebé emite sonidos o balbuceos (como "ba", "ga") para llamar la atención de un adulto?' },
  { id: 'cei-4-6m-i1', rango: '4-6m', categoria: 'I',
    texto: '¿El bebé sonríe o se muestra contento cuando un familiar cercano se le acerca?' },
  // 7-9 meses
  { id: 'cei-7-9m-c1', rango: '7-9m', categoria: 'C',
    texto: '¿El bebé responde volteando o buscando cuando se le llama por su nombre?' },
  { id: 'cei-7-9m-e1', rango: '7-9m', categoria: 'E',
    texto: '¿El bebé balbucea combinando sílabas repetidas, como "ma-ma" o "pa-pa", aunque no tengan un significado claro todavía?' },
  { id: 'cei-7-9m-i1', rango: '7-9m', categoria: 'I',
    texto: '¿El bebé juega juegos sencillos de interacción con el adulto, como "escondidas" o "aplaudir"?' },
  // 10-12 meses
  { id: 'cei-10-12m-c1', rango: '10-12m', categoria: 'C',
    texto: '¿El bebé entiende y responde a órdenes sencillas como "dame" o "ven" acompañadas de un gesto?' },
  { id: 'cei-10-12m-e1', rango: '10-12m', categoria: 'E',
    texto: '¿El bebé dice al menos una palabra con significado claro, como "mamá" o "papá", dirigida a la persona correcta?' },
  { id: 'cei-10-12m-i1', rango: '10-12m', categoria: 'I',
    texto: '¿El bebé señala con el dedo índice objetos que le interesan o que quiere mostrar a un adulto?' },
  // 13-15 meses
  { id: 'cei-13-15m-c1', rango: '13-15m', categoria: 'C',
    texto: '¿El niño identifica y señala al menos una parte de su cuerpo cuando se le pregunta (ej. "¿dónde está tu nariz?")?' },
  { id: 'cei-13-15m-e1', rango: '13-15m', categoria: 'E',
    texto: '¿El niño usa entre 3 y 5 palabras con significado de forma espontánea?' },
  { id: 'cei-13-15m-i1', rango: '13-15m', categoria: 'I',
    texto: '¿El niño imita acciones sencillas que ve hacer a los adultos, como hablar por teléfono o barrer?' },
  // 16-18 meses
  { id: 'cei-16-18m-c1', rango: '16-18m', categoria: 'C',
    texto: '¿El niño sigue instrucciones sencillas de un solo paso sin necesidad de gestos, como "trae el balón"?' },
  { id: 'cei-16-18m-e1', rango: '16-18m', categoria: 'E',
    texto: '¿El niño combina un gesto con una palabra para comunicar lo que quiere, como señalar y decir "agua"?' },
  { id: 'cei-16-18m-i1', rango: '16-18m', categoria: 'I',
    texto: '¿El niño busca la compañía de otros niños o muestra interés en observarlos jugar?' },
  // 19-24 meses
  { id: 'cei-19-24m-c1', rango: '19-24m', categoria: 'C',
    texto: '¿El niño identifica y señala correctamente al menos 3 objetos o imágenes cuando se le nombran?' },
  { id: 'cei-19-24m-e1', rango: '19-24m', categoria: 'E',
    texto: '¿El niño combina dos palabras para formar frases cortas, como "quiero agua" o "más jugo"?' },
  { id: 'cei-19-24m-i1', rango: '19-24m', categoria: 'I',
    texto: '¿El niño juega al lado de otros niños (juego paralelo), aunque no interactúe directamente con ellos?' },
  // 25-35 meses
  { id: 'cei-25-35m-c1', rango: '25-35m', categoria: 'C',
    texto: '¿El niño comprende y sigue instrucciones de dos pasos, como "recoge el juguete y guárdalo en la caja"?' },
  { id: 'cei-25-35m-e1', rango: '25-35m', categoria: 'E',
    texto: '¿El niño forma frases de 3 o más palabras que otras personas fuera de la familia pueden entender?' },
  { id: 'cei-25-35m-i1', rango: '25-35m', categoria: 'I',
    texto: '¿El niño participa en juegos de rol sencillos, como darle de comer a un muñeco o simular hablar por teléfono?' },
  // 3 años - 3 años 11 meses
  { id: 'cei-3a-3a11m-c1', rango: '3a-3a11m', categoria: 'C',
    texto: '¿El niño comprende conceptos como "grande/pequeño" o "arriba/abajo" cuando se usan en instrucciones?' },
  { id: 'cei-3a-3a11m-e1', rango: '3a-3a11m', categoria: 'E',
    texto: '¿El niño cuenta con sus propias palabras qué hizo durante el día, de forma que un adulto pueda entenderlo?' },
  { id: 'cei-3a-3a11m-i1', rango: '3a-3a11m', categoria: 'I',
    texto: '¿El niño juega de forma cooperativa con otros niños, turnándose y compartiendo juguetes durante al menos unos minutos?' },
  // 4 años - 4 años 11 meses
  { id: 'cei-4a-4a11m-c1', rango: '4a-4a11m', categoria: 'C',
    texto: '¿El niño responde correctamente preguntas sencillas sobre una historia corta que se le acaba de contar?' },
  { id: 'cei-4a-4a11m-e1', rango: '4a-4a11m', categoria: 'E',
    texto: '¿El niño relata una experiencia reciente usando frases completas y en el orden en que ocurrió?' },
  { id: 'cei-4a-4a11m-i1', rango: '4a-4a11m', categoria: 'I',
    texto: '¿El niño sigue las reglas básicas de un juego grupal sencillo junto con otros niños?' },
  // 5 años - 5 años 11 meses
  { id: 'cei-5a-5a11m-c1', rango: '5a-5a11m', categoria: 'C',
    texto: '¿El niño comprende y responde correctamente a instrucciones de tres pasos dadas una sola vez?' },
  { id: 'cei-5a-5a11m-e1', rango: '5a-5a11m', categoria: 'E',
    texto: '¿El niño mantiene una conversación de varios turnos con un adulto sobre un tema de su interés?' },
  { id: 'cei-5a-5a11m-i1', rango: '5a-5a11m', categoria: 'I',
    texto: '¿El niño resuelve pequeños conflictos con otros niños (como turnos o reparto de juguetes) con apoyo mínimo de un adulto?' },
  // 9 años - 12 años
  { id: 'cei-9a-12a-c1', rango: '9a-12a', categoria: 'C',
    texto: '¿El niño comprende instrucciones verbales complejas de varios pasos sin necesidad de repetición?' },
  { id: 'cei-9a-12a-e1', rango: '9a-12a', categoria: 'E',
    texto: '¿El niño expresa ideas y opiniones propias de forma clara y organizada frente a otras personas?' },
  { id: 'cei-9a-12a-i1', rango: '9a-12a', categoria: 'I',
    texto: '¿El niño mantiene relaciones sociales estables con pares de su edad, incluyendo la resolución de desacuerdos?' },
];

// ---------- PREGUNTAS VESTIBULAR ----------
// No llevan código C/E/I por encargo del usuario — solo texto + respuesta +
// observación directa.
export const PREGUNTAS_VESTIBULAR = [
  { id: 'vest-3a-5a-1', rango: '3a-5a', texto: 'Actividades de movimiento corporal' },
  { id: 'vest-3a-5a-2', rango: '3a-5a', texto: 'Caminar recto sin inclinarse o caerse' },
  { id: 'vest-5a1m-12a11m-1', rango: '5a1m-12a11m', texto: 'Dar vueltas sobre sí mismo' },
  { id: 'vest-5a1m-12a11m-2', rango: '5a1m-12a11m', texto: 'Reacción ante tropiezos o sensación de caída' },
  { id: 'vest-5a1m-12a11m-3', rango: '5a1m-12a11m', texto: 'Movimiento en diferentes direcciones, velocidades y alturas' },
];

// ---------- CONDICIONES PERINATALES Y POSTNATALES ----------
// valor por condición: { valor: 'si'|'no'|null, descripcion: '' } — mismo
// shape que emptyCondiciones() en AntecedentesStep.jsx, reutiliza
// TriStateField directamente (Sí/No + "Describa" en progressive disclosure).
export const PERINATAL_MENOR_2_ANIOS = [
  { key: 'bajoPeso', label: 'Bajo peso al nacer (menor a 1500 g)' },
  { key: 'prematuroExtremo', label: 'Nació antes de 30 semanas (prematuro extremo)' },
  { key: 'uci30dias', label: 'Estancia superior a 30 días en UCI neonatal' },
];
export const PERINATAL_TODAS_EDADES = [
  { key: 'complicacionesNacimiento', label: 'Complicaciones durante o poco después del nacimiento' },
  { key: 'diagnosticoCondicionSalud', label: 'Diagnóstico de alguna condición de salud' },
  { key: 'condicionRiesgoSocial', label: 'Condición de riesgo social' },
  { key: 'dificultadesAprendizaje', label: 'Dificultades de aprendizaje, lectura o escritura' },
];

// ---------- CONDICIONES ESTRUCTURALES ----------
// valor por condición: { presencia: 'si'|'no'|null, integridad: 'si'|'no'|null }
export const CONDICIONES_ESTRUCTURALES = [
  { key: 'oidos', label: 'Oídos' },
  { key: 'nariz', label: 'Nariz' },
  { key: 'dientes', label: 'Dientes (según edad)' },
  { key: 'labios', label: 'Labios' },
  { key: 'paladar', label: 'Paladar' },
  { key: 'lengua', label: 'Lengua' },
  { key: 'ojos', label: 'Ojos' },
  { key: 'cuello', label: 'Cuello' },
  { key: 'hombros', label: 'Hombros' },
];

// ---------- CONDUCTA RECOMENDADA ----------
// Texto fijo mostrado cuando el resultado general es FALLA — representativo/
// placeholder (no proviene de un manual VALE real, no había fuente
// disponible en este proyecto).
export const CONDUCTA_RECOMENDADA_FALLA =
  'Remitir a valoración por el programa de desarrollo infantil para ampliar la evaluación y confirmar hallazgos. ' +
  'Brindar a la familia pautas de estimulación acordes a la edad del paciente. ' +
  'Programar control de seguimiento en un plazo no mayor a 30 días.';

// ---------- CÁLCULO ----------
function enRango(rangoId, edadMeses, tabla) {
  const r = tabla.find((x) => x.id === rangoId);
  return Boolean(r) && edadMeses != null && edadMeses >= r.minMeses && edadMeses <= r.maxMeses;
}

// Una dimensión sin preguntas aplicables a la edad dada queda en
// `aplica:false` en vez de forzarse a aprobado/falla — pasa, por ejemplo,
// con C/E/I entre 72 y 107 meses (vacío real entre los rangos "5 años–5
// años 11 meses" y "9 años–12 años" tal como los dio el usuario).
function evaluarDimension(categoria, preguntasAplicables, respuestas) {
  const delGrupo = categoria ? preguntasAplicables.filter((p) => p.categoria === categoria) : preguntasAplicables;
  if (delGrupo.length === 0) return { aplica: false, falla: false, negativas: 0 };
  const negativas = delGrupo.filter((p) => respuestas[p.id]?.valor === 'no').length;
  return { aplica: true, falla: negativas > 0, negativas };
}

export function getPreguntasCEIAplicables(edadMeses) {
  return PREGUNTAS_CEI.filter((p) => enRango(p.rango, edadMeses, RANGOS_CEI));
}
export function getPreguntasVestibularAplicables(edadMeses) {
  return PREGUNTAS_VESTIBULAR.filter((p) => enRango(p.rango, edadMeses, RANGOS_VESTIBULAR));
}

// El profesional ya no escribe una edad exacta: en "Comprensión, expresión e
// interacción" (ValeDesarrolloEtapa.jsx) elige directamente uno de los 11
// chips de RANGOS_CEI, y este helper filtra por coincidencia exacta de
// rango — sin pasar por enRango(), no aplica acá porque la selección ya ES
// el rango, no un número a ubicar dentro de una tabla.
export function getPreguntasCEIPorRango(rangoId) {
  return PREGUNTAS_CEI.filter((p) => p.rango === rangoId);
}

// Vestibular y computeValeResultado siguen trabajando con "edadMeses" (sus
// propios rangos, RANGOS_VESTIBULAR, no coinciden con los cortes de
// RANGOS_CEI). En vez de pedir una segunda edad, se deriva una edad
// representativa a partir del chip de RANGOS_CEI ya elegido (su minMeses,
// siempre cae dentro del propio rango por construcción) — la selección por
// rango sigue siendo, en el fondo, una forma de indicar la edad del
// paciente, solo que categórica en vez de exacta.
export function edadMesesDesdeRangoCEI(rangoId) {
  const r = RANGOS_CEI.find((x) => x.id === rangoId);
  return r ? r.minMeses : null;
}

// Comprensión/Expresión/Interacción/Vestibular son dimensiones de tamizaje
// reales: "Falla" si CUALQUIER pregunta aplicable se respondió "No".
// Perinatal/Estructural son listas de hallazgos/factores de riesgo, no
// pruebas de tamizaje — se resumen aparte como "con/sin hallazgos", nunca
// como aprobado/falla. El resultado general es FALLA EN EL TAMIZAJE si
// cualquiera de las 4 dimensiones de tamizaje que aplica a la edad falla.
// "Total de respuestas negativas" solo cuenta C/E/I/Vestibular.
export function computeValeResultado({ edadMeses, perinatal, estructural, respuestasCEI, respuestasVestibular }) {
  const ceiAplicables = getPreguntasCEIAplicables(edadMeses);
  const vestAplicables = getPreguntasVestibularAplicables(edadMeses);

  const comprension = evaluarDimension('C', ceiAplicables, respuestasCEI);
  const expresion = evaluarDimension('E', ceiAplicables, respuestasCEI);
  const interaccion = evaluarDimension('I', ceiAplicables, respuestasCEI);
  const vestibular = evaluarDimension(null, vestAplicables, respuestasVestibular);

  const dimensiones = [comprension, expresion, interaccion, vestibular];
  const totalNegativas = dimensiones.reduce((sum, d) => sum + d.negativas, 0);
  const fallaTamizaje = dimensiones.some((d) => d.aplica && d.falla);

  const perinatalConHallazgos = [...PERINATAL_MENOR_2_ANIOS, ...PERINATAL_TODAS_EDADES]
    .some((c) => perinatal[c.key]?.valor === 'si');
  const estructuralConHallazgos = CONDICIONES_ESTRUCTURALES
    .some((c) => estructural[c.key]?.presencia === 'no' || estructural[c.key]?.integridad === 'no');

  return {
    fallaTamizaje,
    totalNegativas,
    comprension,
    expresion,
    interaccion,
    vestibular,
    perinatal: { conHallazgos: perinatalConHallazgos },
    estructural: { conHallazgos: estructuralConHallazgos },
    conductaRecomendada: fallaTamizaje ? CONDUCTA_RECOMENDADA_FALLA : null,
  };
}
