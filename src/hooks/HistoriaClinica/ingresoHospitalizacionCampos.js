// Campos y opciones de la plantilla "Ingreso a hospitalización" (INGHOSP)
// compartidos por el formulario (Steps/Panels de
// PlantillaIngresoHospitalizacion) y su vista de lectura (RegistroDetalle,
// "Ver detalle" de HistoriaClinicaTab) -- una sola fuente de etiquetas para
// que ambas vistas no diverjan.

export const SI_NO_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
];

// Antecedentes (AntecedentesStep): pares booleano (Sí/No) + observaciones.
export const CAMPOS_ANTECEDENTES = [
  { key: 'toxicos', label: 'Tóxicos', conObservaciones: true },
  { key: 'patologicos', label: 'Patológicos', conObservaciones: true },
  { key: 'oncologicos', label: 'Oncológicos', conObservaciones: true },
  { key: 'quirurgicos', label: 'Quirúrgicos', conObservaciones: true },
  { key: 'farmacologicos', label: 'Farmacológicos', conObservaciones: true },
  { key: 'transfusionales', label: 'Transfusionales', conObservaciones: true },
  { key: 'alergicos', label: 'Alérgicos', conObservaciones: true },
  { key: 'familiares', label: 'Antecedentes familiares' },
];

// Examen físico por sistemas (ExamenFisicoStep).
export const SISTEMAS_EXAMEN = [
  { key: 'cabezaOjosOrl', label: 'Cabeza / Ojos / ORL' },
  { key: 'cuello', label: 'Cuello' },
  { key: 'torax', label: 'Tórax' },
  { key: 'abdomen', label: 'Abdomen' },
  { key: 'extremidades', label: 'Extremidades' },
  { key: 'genitourinario', label: 'Genitourinario' },
  { key: 'neurologico', label: 'Neurológico' },
  { key: 'osteomuscular', label: 'Osteo-muscular / Tejidos blandos' },
  { key: 'tegumentario', label: 'Tegumentario' },
  { key: 'ayudasDiagnosticas', label: 'Ayudas diagnósticas / Paraclínicos' },
];

// Tamizaje nutricional (PlanTratamientoStep).
export const PERDIDA_PESO_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
  { value: 'no_estoy_seguro', label: 'No estoy seguro' },
];

export const CANTIDAD_PESO_OPTIONS = [
  { value: '1-5', label: '1-5 kg' },
  { value: '6-10', label: '6-10 kg' },
  { value: '11-15', label: '11-15 kg' },
  { value: '>15', label: '> 15 kg' },
];

// Diagnósticos (DiagnosticosPanel).
export const TIPO_DX_OPTIONS = [
  { value: 'presuntivo', label: 'Presuntivo' },
  { value: 'confirmado-nuevo', label: 'Confirmado nuevo' },
  { value: 'confirmado-repetido', label: 'Confirmado repetido' },
];

export function labelDeOpcion(options, value) {
  return options.find((o) => o.value === value)?.label ?? '';
}
