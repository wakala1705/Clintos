// Datos y lógica del paso "Crecimiento y APGAR familiar" (ver
// CrecimientoStep.jsx) — 2 instrumentos capturados en la misma pantalla del
// formulario legacy de CRECIMT2 (ver captura de referencia): verificación de
// indicadores de crecimiento (DE = desviación estándar respecto a la
// mediana OMS del indicador) + cuestionario APGAR familiar (escala de
// Smilkstein), sin relación clínica entre sí más allá de compartir pantalla.

// ---------- Verificar el crecimiento ----------
// Mismos 5 indicadores del legacy, agrupados en 2 bloques (encargo explícito
// — no es el agrupamiento visual de la captura de referencia, que los
// repartía en una grilla de 2 columnas sin agrupar por concepto clínico). El
// valor de cada indicador NO es un select manual: se deriva automáticamente
// del z-score real de Peso/Talla/PC/IMC ya diligenciados en "09 Examen
// físico" (ver opcionPorZ más abajo y calcularZ en growthChartData.js) — el
// usuario nunca vuelve a diligenciar este paso a mano (encargo explícito).
// Rangos y clasificaciones tomados 1:1 de capturas del legacy (Resolución
// 2465/2016 Colombia, indicadores antropométricos 0-5 años) — Peso/Talla DE
// es el único con el dropdown completo capturado abierto (7 opciones, orden
// real preservado); Perímetro Cefálico/Talla-Edad DE/IMC solo se capturaron
// opciones sueltas, sin el dropdown abierto, así que van en orden ascendente
// por rango (encargo explícito, sin evidencia del orden real del legacy para
// esos 3). Cada opción trae 2 datos numéricos, no solo el `label` visual:
// - `test(z)`: el predicado exacto del rango DE de esa opción (límites
//   tomados directamente del propio `label`, p. ej. ">=-1 A <=1 DE" →
//   z >= -1 && z <= 1) — es lo que opcionPorZ usa para elegir la opción.
// - `z`: el punto representativo del rango (su punto medio, o un valor
//   razonable dentro del tramo abierto para los extremos sin límite, p. ej.
//   "<-2 DE" → -2.5) — solo se usa para UBICAR el marcador de "medición
//   actual" en GrowthChartModal.jsx sobre las curvas de referencia, nunca
//   para clasificar (eso es trabajo exclusivo de `test`).
export const GRUPOS_INDICADORES = [
  {
    id: 'peso',
    label: 'Peso',
    indicadores: [
      {
        key: 'pesoEdadDE', label: 'Peso/Edad DE',
        opciones: [
          { label: '<-2 DE', clasificacion: 'Desnutrición global', z: -2.5, test: (z) => z < -2 },
          { label: '>1 DE', clasificacion: 'No Aplica (Verificar con IMC/E)', z: 1.5, test: (z) => z > 1 },
          { label: '>=-1 A <=1 DE', clasificacion: 'Peso adecuado para la edad', z: 0, test: (z) => z >= -1 && z <= 1 },
          { label: '>=-2 A <-1 DE', clasificacion: 'Riesgo de desnutrición global', z: -1.5, test: (z) => z >= -2 && z < -1 },
        ],
      },
      {
        key: 'pesoTallaDE', label: 'Peso/Talla DE',
        opciones: [
          { label: '< -2 a >= -3', clasificacion: 'Peso bajo para la talla o desnutrición aguda moderada', z: -2.5, test: (z) => z >= -3 && z < -2 },
          { label: '<-3', clasificacion: 'Peso muy bajo para la talla o desnutrición aguda severa', z: -3.5, test: (z) => z < -3 },
          { label: '> +1a <= +2', clasificacion: 'Riesgo de Sobrepeso', z: 1.5, test: (z) => z > 1 && z <= 2 },
          { label: '>+2 a <= +3', clasificacion: 'Sobrepeso', z: 2.5, test: (z) => z > 2 && z <= 3 },
          { label: '>+3', clasificacion: 'Obesidad', z: 3.5, test: (z) => z > 3 },
          { label: '>= -1 a <= +1', clasificacion: 'Peso adecuado para la talla', z: 0, test: (z) => z >= -1 && z <= 1 },
          { label: '>= -2 a <-1', clasificacion: 'Riesgo de peso bajo para la talla', z: -1.5, test: (z) => z >= -2 && z < -1 },
        ],
      },
      {
        key: 'perimetroCefalico', label: 'Perímetro Cefálico',
        opciones: [
          { label: '< -2', clasificacion: 'Factor de riesgo del neurodesarrollo', z: -2.5, test: (z) => z < -2 },
          { label: '>= -2 a <= +2', clasificacion: 'Adecuado', z: 0, test: (z) => z >= -2 && z <= 2 },
          { label: '> +2', clasificacion: 'Factor de riesgo del neurodesarrollo', z: 2.5, test: (z) => z > 2 },
        ],
      },
    ],
  },
  {
    id: 'talla',
    label: 'Talla y composición corporal',
    indicadores: [
      {
        key: 'tallaEdadDE', label: 'Talla/Edad DE',
        opciones: [
          { label: '< -2', clasificacion: 'Talla baja para la edad o retraso en talla', z: -2.5, test: (z) => z < -2 },
          { label: '>= -2 a < -1', clasificacion: 'Riesgo de talla baja', z: -1.5, test: (z) => z >= -2 && z < -1 },
          { label: '>= -1', clasificacion: 'Talla adecuada', z: 0, test: (z) => z >= -1 },
        ],
      },
      {
        key: 'imc', label: 'IMC',
        opciones: [
          { label: '<= +1', clasificacion: 'No Aplica (Verificar con P/T)', z: 0, test: (z) => z <= 1 },
          { label: '> +1 a <= +2', clasificacion: 'Riesgo de Sobrepeso', z: 1.5, test: (z) => z > 1 && z <= 2 },
          { label: '> +2 a <= +3', clasificacion: 'Sobrepeso', z: 2.5, test: (z) => z > 2 && z <= 3 },
          { label: '> +3', clasificacion: 'Obesidad', z: 3.5, test: (z) => z > 3 },
        ],
      },
    ],
  },
];

// Elige la opción cuyo `test(z)` matchea el z-score real (ver calcularZ en
// growthChartData.js) — null si falta algún dato de origen ("09 Examen
// físico" incompleto o edad no parseable) en vez de caer en una opción por
// defecto que podría leerse como un resultado clínico real.
export function opcionPorZ(indicadorKey, z) {
  if (z == null || Number.isNaN(z)) return null;
  const indicador = GRUPOS_INDICADORES.flatMap((g) => g.indicadores).find((i) => i.key === indicadorKey);
  return indicador?.opciones.find((o) => o.test(z)) ?? null;
}

// ---------- Síntesis de evaluaciones ----------
// Columnas exactas del legacy, agrupadas en 2 categorías con cabecera de 2
// filas (mismo patrón que AgendaTable.css, ver "group-divider").
export const COLUMNAS_AREAS = [
  { key: 'motricidadGruesa', label: 'Motricidad gruesa' },
  { key: 'motricidadFina', label: 'Motricidad fina' },
  { key: 'audicion', label: 'Audición' },
  { key: 'lenguaje', label: 'Lenguaje' },
  { key: 'personalSocial', label: 'Personal social' },
];
export const COLUMNAS_CRECIMIENTO = [
  { key: 'pesoEdad', label: 'Peso/Edad' },
  { key: 'tallaEdad', label: 'Talla/Edad' },
  { key: 'pesoTalla', label: 'Peso/Talla' },
  { key: 'imc', label: 'IMC' },
  { key: 'perimetroCefalico', label: 'Perímetro cefálico' },
];

// Histórico de ejemplo — mismo patrón que HISTORICO_ALIMENTACION
// (AlimentacionStep.jsx): 5 filas, solo la 2ª con valores diligenciados, así
// "Síntesis de evaluaciones" no se ve vacía en la demo sin inventar una
// tendencia clínica real para el paciente de prueba.
export const HISTORICO_EVALUACIONES = [
  { fecha: '10/08/2026', edad: '55,00' },
  {
    fecha: '10/08/2026', edad: '55,00',
    motricidadGruesa: 'Normal', motricidadFina: 'Normal', audicion: 'Normal',
    lenguaje: 'Normal', personalSocial: 'Normal',
    pesoEdad: 'Normal', tallaEdad: 'Normal', pesoTalla: 'Normal', imc: 'Normal', perimetroCefalico: 'Normal',
  },
  { fecha: '10/08/2026', edad: '55,00' },
  { fecha: '10/08/2026', edad: '55,00' },
  { fecha: '11/08/2026', edad: '55,00' },
];

// ---------- Clasificación APGAR Familiar (escala de Smilkstein) ----------
export const PREGUNTAS_APGAR = [
  { id: 'apgar-ayuda', texto: 'Cuando algo me preocupa, puedo pedir ayuda a mi familia' },
  { id: 'apgar-comparte-problemas', texto: 'Me gusta como mi familia habla y comparte los problemas conmigo' },
  { id: 'apgar-cosas-nuevas', texto: 'Me gusta como mi familia me permite hacer cosas nuevas que quiero hacer' },
  { id: 'apgar-emociones', texto: 'Me gusta lo que mi familia hace cuando estoy triste, feliz, molesto, etc' },
  { id: 'apgar-tiempo-juntos', texto: 'Me gusta como mi familia y yo compartimos tiempo juntos' },
];

export const OPCIONES_APGAR = [
  { value: 'casi_nunca', label: 'Casi nunca', puntos: 0 },
  { value: 'algunas_veces', label: 'Algunas veces', puntos: 1 },
  { value: 'casi_siempre', label: 'Casi siempre', puntos: 2 },
];

const PUNTOS_POR_OPCION = Object.fromEntries(OPCIONES_APGAR.map((o) => [o.value, o.puntos]));

// Puntaje (0-10) + clasificación estándar de la escala APGAR familiar de
// Smilkstein: 7-10 Funcional, 4-6 Disfunción moderada, 0-3 Disfunción
// severa. null mientras falte alguna respuesta — no se calcula (ni se
// muestra) un puntaje parcial que podría leerse como el resultado
// definitivo del cuestionario.
export function calcularApgar(respuestas) {
  const valores = PREGUNTAS_APGAR.map((p) => respuestas[p.id]);
  if (valores.some((v) => !v)) return { puntaje: null, clasificacion: '' };
  const puntaje = valores.reduce((sum, v) => sum + PUNTOS_POR_OPCION[v], 0);
  let clasificacion;
  if (puntaje >= 7) clasificacion = 'Funcional';
  else if (puntaje >= 4) clasificacion = 'Disfunción moderada';
  else clasificacion = 'Disfunción severa';
  return { puntaje, clasificacion };
}

// Tinte de la pill de Clasificación (ver .gc-apgar-class en
// CrecimientoStep.css) — mismo criterio semántico que el resto del wizard:
// verde = hallazgo/resultado favorable, ámbar = alerta intermedia, rojo =
// hallazgo que requiere atención.
export const CLASE_APGAR = {
  Funcional: 'green',
  'Disfunción moderada': 'amber',
  'Disfunción severa': 'red',
};
