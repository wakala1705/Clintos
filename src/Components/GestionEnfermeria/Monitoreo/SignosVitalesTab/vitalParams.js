// Única fuente de verdad para label/color de los 7 parámetros de signos
// vitales — la usan tanto VitalesChart (líneas) como SignosVitalesTab
// (chips selectores y encabezados de tabla), para que ninguno de los tres
// pueda desalinearse. Colores: tokens ya existentes en
// GestionEnfermeria/shared/shared.css:16-65, ninguno nuevo.
export const VITAL_PARAMS = [
  { key: 'tas', label: 'T.A.S.', color: 'var(--red)' },
  { key: 'tad', label: 'T.A.D.', color: 'var(--orange)' },
  { key: 'tam', label: 'T.A.M.', color: 'var(--amber)' },
  { key: 'fr', label: 'F.R.', color: 'var(--blue)' },
  { key: 'pulso', label: 'Pulso', color: 'var(--violet-fg)' },
  { key: 'temp', label: 'Temp.', color: 'var(--cyan)' },
  { key: 'satO2', label: 'Sat. O2', color: 'var(--green)' },
];
