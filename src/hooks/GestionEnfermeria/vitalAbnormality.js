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

export function isVitalAbnormal(paramKey, value, patientProfile) {
  void patientProfile; // no usado en el mock, reservado para la lógica real futura
  if (value == null || Number.isNaN(value)) return false;
  const range = ADULT_RANGES[paramKey];
  if (!range) return false;
  const [min, max] = range;
  return value < min || value > max;
}
