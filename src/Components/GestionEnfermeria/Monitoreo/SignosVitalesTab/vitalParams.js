// Única fuente de verdad para label/unidad/color de los 7 parámetros de
// signos vitales — la usan VitalesChart (líneas + tooltip), vitalGroups.js
// (agrupación por gráfica), SignosVitalesResumen (tarjetas de último valor)
// y SignosVitalesTab (encabezados de tabla), para que ninguno se desalinee.
// Orden fijo: coincide con el orden de columnas de la tabla clínica
// (Fecha y hora, T.A.S., T.A.D., T.A.M., Pulso, F.R., Temp., Sat. O2).
// Colores: tokens ya existentes en GestionEnfermeria/shared/shared.css,
// ninguno nuevo.
export const VITAL_PARAMS = [
  { key: 'tas', label: 'T.A.S.', fullLabel: 'T.A. Sistólica', unit: 'mmHg', color: 'var(--red)' },
  { key: 'tad', label: 'T.A.D.', fullLabel: 'T.A. Diastólica', unit: 'mmHg', color: 'var(--orange)' },
  { key: 'tam', label: 'T.A.M.', fullLabel: 'T.A. Media', unit: 'mmHg', color: 'var(--amber)' },
  { key: 'pulso', label: 'Pulso', fullLabel: 'Pulso', unit: 'lpm', color: 'var(--violet-fg)' },
  { key: 'fr', label: 'F.R.', fullLabel: 'Frecuencia Respiratoria', unit: 'rpm', color: 'var(--blue)' },
  { key: 'temp', label: 'Temp.', fullLabel: 'Temperatura', unit: '°C', color: 'var(--cyan)' },
  { key: 'satO2', label: 'Sat. O2', fullLabel: 'Saturación de Oxígeno', unit: '%', color: 'var(--green)' },
];
