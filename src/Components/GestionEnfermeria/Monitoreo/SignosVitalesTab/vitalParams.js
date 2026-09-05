import {
  LuGauge, LuHeartPulse, LuWind, LuThermometer, LuDroplet,
} from 'react-icons/lu';

// Única fuente de verdad para label/unidad/color/ícono de los 7 parámetros
// de signos vitales — la usan VitalesChart (líneas + tooltip), vitalGroups.js
// (agrupación por gráfica), SignosVitalesResumen (tarjetas de último valor,
// ícono clínico) y SignosVitalesTab (encabezados de tabla), para que
// ninguno se desalinee.
// Orden fijo: coincide con el orden de columnas de la tabla clínica
// (Fecha y hora, T.A.S., T.A.D., T.A.M., Pulso, F.R., Temp., Sat. O2).
// Colores: tokens ya existentes en GestionEnfermeria/shared/shared.css,
// ninguno nuevo.
export const VITAL_PARAMS = [
  { key: 'tas', label: 'T.A.S.', fullLabel: 'T.A. Sistólica', unit: 'mmHg', color: 'var(--red)', icon: LuGauge },
  { key: 'tad', label: 'T.A.D.', fullLabel: 'T.A. Diastólica', unit: 'mmHg', color: 'var(--orange)', icon: LuGauge },
  { key: 'tam', label: 'T.A.M.', fullLabel: 'T.A. Media', unit: 'mmHg', color: 'var(--amber)', icon: LuGauge },
  { key: 'pulso', label: 'Pulso', fullLabel: 'Pulso', unit: 'lpm', color: 'var(--violet-fg)', icon: LuHeartPulse },
  { key: 'fr', label: 'F.R.', fullLabel: 'Frecuencia Respiratoria', unit: 'rpm', color: 'var(--blue)', icon: LuWind },
  { key: 'temp', label: 'Temp.', fullLabel: 'Temperatura', unit: '°C', color: 'var(--cyan)', icon: LuThermometer },
  { key: 'satO2', label: 'Sat. O2', fullLabel: 'Saturación de Oxígeno', unit: '%', color: 'var(--green)', icon: LuDroplet },
];
