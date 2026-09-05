// Función inyectable (encargo explícito): hoy usa rangos fijos de
// referencia de adulto; la lógica clínica real (dependiente de
// patientProfile: edad, diagnóstico, etc.) se conecta después sin cambiar
// esta firma ni sus call sites — ver
// docs/superpowers/specs/2026-09-02-monitoreo-atencion-enfermeria-design.md.
const ADULT_RANGES = {
  tas: [90, 140],
  tad: [60, 90],
  tam: [70, 105],
  fr: [12, 20],
  pulso: [60, 100],
  temp: [36, 37.5],
  satO2: [95, 100],
};

// Concordancia de género del nombre clínico de cada signo (T.A. Sistólica,
// Temperatura, Frecuencia Respiratoria, Saturación... son femeninos; Pulso es
// masculino) — para que el estado textual ("Elevada"/"Elevado") lea natural,
// ver encargo de rediseño ("estado textual" como mecanismo principal, no solo
// color).
const MASCULINE_PARAMS = new Set(['pulso']);

export function isVitalAbnormal(paramKey, value, patientProfile) {
  void patientProfile; // no usado en el mock, reservado para la lógica real futura
  if (value == null || Number.isNaN(value)) return false;
  const range = ADULT_RANGES[paramKey];
  if (!range) return false;
  const [min, max] = range;
  return value < min || value > max;
}

// Estado clínico completo de una lectura: además del booleano de arriba,
// entrega la dirección (para el ícono de refuerzo) y la etiqueta textual —
// el mecanismo principal para detectar valores fuera de rango, con el color
// como refuerzo, no como único indicador.
export function getVitalStatus(paramKey, value, patientProfile) {
  void patientProfile;
  if (value == null || Number.isNaN(value)) {
    return { status: 'unknown', direction: null, label: 'No registrado' };
  }
  const range = ADULT_RANGES[paramKey];
  if (!range) return { status: 'normal', direction: null, label: 'Normal' };
  const [min, max] = range;
  const masc = MASCULINE_PARAMS.has(paramKey);
  if (value > max) return { status: 'high', direction: 'up', label: masc ? 'Elevado' : 'Elevada' };
  if (value < min) return { status: 'low', direction: 'down', label: masc ? 'Bajo' : 'Baja' };
  return { status: 'normal', direction: null, label: 'Normal' };
}
