// Agrupación clínica de VITAL_PARAMS para el modo Gráfica: nunca se mezclan
// unidades distintas en un mismo eje (ver AGENTS.md / encargo de rediseño de
// Signos Vitales). T.A.S./T.A.D./T.A.M. comparten mmHg y sí conviven en una
// misma gráfica; los otros 4 signos van cada uno en su propia gráfica.
import { VITAL_PARAMS } from './vitalParams';

const byKey = Object.fromEntries(VITAL_PARAMS.map((p) => [p.key, p]));

export const VITAL_GROUPS = [
  { key: 'presion', title: 'Presión arterial', unit: 'mmHg', params: [byKey.tas, byKey.tad, byKey.tam] },
  { key: 'pulso', title: 'Pulso', unit: 'lpm', params: [byKey.pulso] },
  { key: 'fr', title: 'Frecuencia respiratoria', unit: 'rpm', params: [byKey.fr] },
  { key: 'temp', title: 'Temperatura', unit: '°C', params: [byKey.temp] },
  { key: 'satO2', title: 'Saturación de oxígeno', unit: '%', params: [byKey.satO2] },
];
