// Cálculos y rangos de referencia (adulto) del bloque de Signos vitales de
// la plantilla de Ingreso a hospitalización (ver SignosVitalesPanel.jsx).
// `evaluarRango` devuelve null (normal/vacío), 'warn' (alterado) o 'danger'
// (crítico) — la UI solo decide el color, no los umbrales.

// Umbrales: [crítico bajo, alterado bajo, alterado alto, crítico alto].
// Normal = (alterado bajo, alterado alto) inclusive en ambos extremos.
const RANGOS = {
  temperatura: { min: 36, max: 37.4, critMin: 35, critMax: 38 },
  frecuenciaCardiaca: { min: 60, max: 100, critMin: 50, critMax: 120 },
  frecuenciaRespiratoria: { min: 12, max: 20, critMin: 10, critMax: 24 },
  sistolica: { min: 90, max: 139, critMin: 90, critMax: 180 },
  diastolica: { min: 60, max: 89, critMin: 40, critMax: 110 },
};

function toNumber(value) {
  if (value === '' || value == null) return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

export function evaluarRango(key, value) {
  const rango = RANGOS[key];
  const n = toNumber(value);
  if (!rango || n == null) return null;
  if (n < rango.critMin || n >= rango.critMax) return 'danger';
  if (n < rango.min || n > rango.max) return 'warn';
  return null;
}

// "Valor alto"/"Valor bajo" para lectores de pantalla y tooltip del punto.
export function descripcionRango(key, value) {
  const rango = RANGOS[key];
  const n = toNumber(value);
  if (!rango || n == null || !evaluarRango(key, value)) return '';
  return n > rango.max ? 'Valor alto' : 'Valor bajo';
}

// IMC = kg/m², ISC por Mosteller = √(cm·kg/3600).
export function calcularDerivados({ estatura, peso }) {
  const cm = toNumber(estatura);
  const kg = toNumber(peso);
  if (!(cm > 0 && kg > 0)) return { imc: null, isc: null };
  const m = cm / 100;
  return {
    imc: kg / (m * m),
    isc: Math.sqrt((cm * kg) / 3600),
  };
}

// Categoría OMS del IMC, con el tono de <Badge> que le corresponde.
export function categoriaImc(imc) {
  if (imc == null) return null;
  if (imc < 18.5) return { label: 'Bajo peso', tone: 'warn' };
  if (imc < 25) return { label: 'Normal', tone: 'success' };
  if (imc < 30) return { label: 'Sobrepeso', tone: 'warn' };
  return { label: 'Obesidad', tone: 'danger' };
}
