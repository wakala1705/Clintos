// Datos y matemática de "Gráficas de crecimiento" (ver GrowthChartModal.jsx)
// — modal que reemplaza el botón "Ver evolución" (antes solo un toast) de
// cada fila de GrowthIndicatorRow.
//
// IMPORTANTE — curvas de referencia: los 8 puntos de anclaje por
// indicador/sexo de abajo son aproximaciones ilustrativas con la FORMA
// realista de una curva de crecimiento pediátrico (mismo criterio de
// "conjunto de prueba, no fuente clínica oficial" que CIE_MOCK en
// proximasCitasData.js) — NO son las tablas oficiales LMS de la OMS. Un
// sistema en producción debe reemplazar `ANCLAS_*`/`CV_INDICADOR` por las
// tablas reales (o un servicio que las sirva) antes de usarse en una
// atención real. La desviación estándar de cada curva se aproxima como un
// porcentaje constante de la mediana (`CV_INDICADOR`, coeficiente de
// variación) en vez de las tablas L-M-S reales — suficiente para una
// visualización de referencia, no para un cálculo percentil preciso (por
// eso la interpretación clínica de abajo muestra la Clasificación ya
// calculada en "Verificar el crecimiento", no un percentil derivado de
// estas curvas).

// ---------- Interpolación monótona (Fritsch–Carlson) ----------
// Los anclajes están espaciados de forma despareja (meses: 0,3,6,12,24,36,
// 48,60) — una spline cúbica monótona evita el "sobreimpulso" de una
// Catmull-Rom uniforme entre puntos tan distintos y respeta que IMC/Edad
// no es monótona (sube y baja) sin generar ondulaciones falsas en el resto
// de indicadores, que sí lo son.
function crearInterpolador(xs, ys) {
  const n = xs.length;
  const d = new Array(n - 1);
  for (let i = 0; i < n - 1; i += 1) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);

  const m = new Array(n);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i += 1) {
    m[i] = (d[i - 1] > 0) === (d[i] > 0) && d[i - 1] !== 0 && d[i] !== 0
      ? (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]) // media armónica — evita overshoot
      : 0;
  }

  return function interpolar(x) {
    const xc = Math.min(Math.max(x, xs[0]), xs[n - 1]);
    let i = 0;
    while (i < n - 2 && xc > xs[i + 1]) i += 1;
    const h = xs[i + 1] - xs[i];
    const t = (xc - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}

const MESES = [0, 3, 6, 12, 24, 36, 48, 60];
const TALLAS = [45, 55, 65, 75, 85, 95, 105, 115];

// Mediana aproximada por indicador/sexo (ver disclaimer arriba).
const ANCLAS = {
  pesoEdadDE: {
    x: MESES,
    Masculino: [3.3, 6.4, 7.9, 9.6, 12.2, 14.3, 16.3, 18.3],
    Femenino: [3.2, 5.8, 7.3, 8.9, 11.5, 13.9, 16.1, 18.2],
  },
  tallaEdadDE: {
    x: MESES,
    Masculino: [50, 61, 67.5, 76, 87, 96, 103, 110],
    Femenino: [49.5, 59.5, 65.5, 74, 85.5, 95, 102, 109],
  },
  perimetroCefalico: {
    x: MESES,
    Masculino: [34.5, 40.5, 43.5, 46, 48.5, 49.5, 50.2, 50.7],
    Femenino: [34, 39.5, 42.2, 44.9, 47.5, 48.5, 49.2, 49.7],
  },
  imc: {
    x: MESES,
    Masculino: [13.4, 17.0, 17.3, 16.5, 16.2, 15.9, 15.7, 15.5],
    Femenino: [13.3, 16.0, 16.5, 15.8, 15.8, 15.6, 15.4, 15.3],
  },
  pesoTallaDE: {
    x: TALLAS,
    Masculino: [2.4, 4.3, 7.0, 9.5, 12.0, 14.5, 17.0, 20.0],
    Femenino: [2.2, 4.0, 6.6, 9.0, 11.5, 14.0, 16.7, 19.8],
  },
};

// Coeficiente de variación (SD ≈ mediana × CV) — aproximación constante por
// indicador en vez de la SD real por edad (ver disclaimer arriba). Exportado
// (antes interno) porque calcularZ, más abajo, también lo necesita.
export const CV_INDICADOR = {
  pesoEdadDE: 0.13,
  tallaEdadDE: 0.045,
  perimetroCefalico: 0.04,
  imc: 0.09,
  pesoTallaDE: 0.11,
};

// z real (desviaciones estándar respecto a la mediana OMS aproximada, ver
// disclaimer arriba) de una medición cruda de "09 Examen físico" — usado
// para clasificar automáticamente "Verificar el crecimiento" (paso 10, ver
// opcionPorZ en crecimientoData.js) sin que el usuario vuelva a diligenciar
// nada (encargo explícito). `x` es edad en meses para todos los indicadores
// excepto pesoTallaDE, cuyo eje real es la talla en cm (ver `usaTalla` en
// INDICADORES_GRAFICA). null ante cualquier dato faltante — nunca se asume
// un 0 que produciría un z-score falso.
export function calcularZ(indicadorKey, sexo, x, valorReal) {
  if (valorReal == null || Number.isNaN(valorReal) || x == null || Number.isNaN(x)) return null;
  const mediana = medianaEnX(indicadorKey, sexo, x);
  const sd = mediana * CV_INDICADOR[indicadorKey];
  if (!sd) return null;
  return (valorReal - mediana) / sd;
}

// 5 gráficas seleccionables — mismo orden que "Verificar el crecimiento"
// (ver GRUPOS_INDICADORES en crecimientoData.js: Peso → Edad/Talla/
// Perímetro cefálico, luego Talla y composición corporal → Talla/IMC),
// encargo explícito de alinear el selector con el orden del formulario en
// vez del orden del selector legacy (distinto). `usaTalla` distingue "Peso
// para la talla" (único indicador cuyo eje X real es la talla, no la edad).
export const INDICADORES_GRAFICA = [
  {
    key: 'pesoEdadDE', label: 'Peso para la edad',
    ejeXLabel: 'Edad (meses)', ejeYLabel: 'Peso (kg)', usaTalla: false, dominioX: [0, 60], pasoX: 6,
  },
  {
    key: 'pesoTallaDE', label: 'Peso para la talla',
    ejeXLabel: 'Talla (cm)', ejeYLabel: 'Peso (kg)', usaTalla: true, dominioX: [45, 115], pasoX: 10,
  },
  {
    key: 'perimetroCefalico', label: 'Perímetro cefálico',
    ejeXLabel: 'Edad (meses)', ejeYLabel: 'Perímetro cefálico (cm)', usaTalla: false, dominioX: [0, 60], pasoX: 6,
  },
  {
    key: 'tallaEdadDE', label: 'Talla para la edad',
    ejeXLabel: 'Edad (meses)', ejeYLabel: 'Talla (cm)', usaTalla: false, dominioX: [0, 60], pasoX: 6,
  },
  {
    key: 'imc', label: 'IMC para la edad',
    ejeXLabel: 'Edad (meses)', ejeYLabel: 'IMC (kg/m²)', usaTalla: false, dominioX: [0, 60], pasoX: 6,
  },
];

const cacheInterpoladores = new Map();
function obtenerInterpolador(key, sexo) {
  const sexoValido = sexo === 'Femenino' ? 'Femenino' : 'Masculino'; // fallback: sexo no reconocido -> curva masculina
  const cacheKey = `${key}-${sexoValido}`;
  if (!cacheInterpoladores.has(cacheKey)) {
    const anclas = ANCLAS[key];
    cacheInterpoladores.set(cacheKey, crearInterpolador(anclas.x, anclas[sexoValido]));
  }
  return cacheInterpoladores.get(cacheKey);
}

// Mediana interpolada en `x` (clampeada al dominio del indicador).
export function medianaEnX(key, sexo, x) {
  return obtenerInterpolador(key, sexo)(x);
}

// Curvas de referencia muestreadas (mediana + ±1/±2/±3 DE) para dibujar —
// `nMuestras` puntos uniformes a lo largo del dominio de cada indicador.
export function muestrearCurvas(key, sexo, dominioX, nMuestras = 40) {
  const cv = CV_INDICADOR[key];
  const [x0, x1] = dominioX;
  const puntos = { p0: [], pMas1: [], pMenos1: [], pMas2: [], pMenos2: [], pMas3: [], pMenos3: [] };
  for (let i = 0; i <= nMuestras; i += 1) {
    const x = x0 + ((x1 - x0) * i) / nMuestras;
    const mediana = medianaEnX(key, sexo, x);
    const sd = mediana * cv;
    puntos.p0.push({ x, y: mediana });
    puntos.pMas1.push({ x, y: mediana + sd });
    puntos.pMenos1.push({ x, y: Math.max(0.1, mediana - sd) });
    puntos.pMas2.push({ x, y: mediana + 2 * sd });
    puntos.pMenos2.push({ x, y: Math.max(0.1, mediana - 2 * sd) });
    puntos.pMas3.push({ x, y: mediana + 3 * sd });
    puntos.pMenos3.push({ x, y: Math.max(0.1, mediana - 3 * sd) });
  }
  return puntos;
}

// Posición (en unidades de dato, no píxeles) del punto "medición actual" —
// deriva del `z` representativo de la opción YA seleccionada en "Verificar
// el crecimiento" (ver crecimientoData.js), nunca de un valor crudo
// inventado. Para "Peso para la talla" (eje X = talla, que este formulario
// no captura como número) la posición X se estima proyectando la edad real
// del paciente sobre la mediana de Talla/Edad — una estimación derivada,
// declarada como tal, no una talla medida.
export function posicionPuntoActual({ indicador, sexo, edadMeses, z }) {
  const xEnDominio = Math.min(Math.max(edadMeses, 0), 60);
  const x = indicador.usaTalla
    ? Math.min(Math.max(medianaEnX('tallaEdadDE', sexo, xEnDominio), indicador.dominioX[0]), indicador.dominioX[1])
    : xEnDominio;
  const mediana = medianaEnX(indicador.key, sexo, x);
  const sd = mediana * CV_INDICADOR[indicador.key];
  return { x, y: mediana + z * sd };
}

// Parsea el string de edad del paciente ("15 días", "2 meses", "1 año 3
// meses"...) a meses — mismo formato que `patient.edad` en
// getAtencionData() (mockAgendaData.js). Retorna null si no matchea nada
// reconocible (paciente sin edad pediátrica capturable en el gráfico).
export function parseEdadMeses(edadStr) {
  if (!edadStr) return null;
  const anios = /(\d+)\s*año/.exec(edadStr);
  const meses = /(\d+)\s*mes/.exec(edadStr);
  const dias = /(\d+)\s*d[ií]a/.exec(edadStr);
  if (!anios && !meses && !dias) return null;
  const totalMeses = (anios ? Number(anios[1]) * 12 : 0)
    + (meses ? Number(meses[1]) : 0)
    + (dias ? Number(dias[1]) / 30 : 0);
  return totalMeses;
}

// Clasifica el texto de Clasificación ya calculado (ver crecimientoData.js)
// en uno de 4 estados visuales — nunca decide a partir de un umbral propio,
// solo interpreta el texto clínico que el select ya produjo, para que el
// modal jamás pueda "contradecir" la Clasificación mostrada en "Verificar
// el crecimiento".
export function estadoDeClasificacion(texto) {
  if (!texto) return null;
  if (/no aplica/i.test(texto)) return 'no-aplica';
  if (/riesgo/i.test(texto)) return 'alerta';
  if (/adecuad/i.test(texto)) return 'esperado';
  return 'fuera-de-rango';
}

export const ESTADO_LABEL = {
  esperado: 'Esperado',
  alerta: 'Alerta',
  'fuera-de-rango': 'Fuera de rango',
  'no-aplica': 'No aplica',
};
