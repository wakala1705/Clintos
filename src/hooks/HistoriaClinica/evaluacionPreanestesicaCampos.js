// Campos y opciones de la plantilla "Evaluación preanestésica" (EVAPRE),
// transcritos de las capturas del sistema legado. Una sola fuente para el
// formulario (PlantillaEvaluacionPreanestesica) -- las secciones se pintan
// recorriendo estas listas con SeccionCampos, en vez de un bloque JSX por
// campo.
//
// Tipos de campo: 'text' (input de una línea), 'textarea', 'select'
// (FormSelect), 'checks' (grupo de checkboxes + "Todos", valor = array de ids)
// y 'karnofsky' (lista de selección de una opción). `defecto` es el texto con
// el que el legado precarga el campo (editable). Las capturas no muestran las
// opciones de los selects (solo "Seleccionar"), así que usan las escalas
// clínicas estándar de cada ítem.

const SI_NO = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
];

const romanos = (prefijo, n) => Array.from({ length: n }, (_, i) => {
  const r = ['I', 'II', 'III', 'IV', 'V', 'VI'][i];
  return { value: r, label: `${prefijo} ${r}` };
});

function texto(key, label) {
  return { key, label, type: 'text', placeholder: `Ingrese ${label.toLowerCase()}` };
}

function area(key, label, defecto = '') {
  return {
    key, label, type: 'textarea', defecto,
    placeholder: `Ingresa la informacion sobre ${label.toLowerCase()}...`,
  };
}

function seleccion(key, label, options) {
  return { key, label, type: 'select', options, placeholder: 'Seleccionar' };
}

export const KARNOFSKY_OPCIONES = [
  { value: '100', label: '100. No hay quejas: no hay evidencia de enfermedad' },
  { value: '90', label: '90. Capaz de mantener una actividad normal; mínimos síntomas o signos de enfermedad.' },
  { value: '80', label: '80. Actividad normal con algún esfuerzo: algunos signos o síntomas de enfermedad.' },
  { value: '70', label: '70. Cuida de sí mismo; incapaz de mantener una actividad normal o realizar tareas activas.' },
  { value: '60', label: '60. Requiere asistencia ocasional, pero es capaz de cuidar de la mayoría de sus necesidades.' },
  { value: '50', label: '50. Requiere asistencia considerable y cuidados médicos frecuentes.' },
  { value: '40', label: '40. Incapacitado; requiere cuidados y asistencia especiales.' },
  { value: '30', label: '30. Gravemente incapacitado; está indicada la hospitalización.' },
  { value: '20', label: '20. Muy enfermo; hospitalización necesaria; tratamiento de soporte activo.' },
  { value: '10', label: '10. Moribundo; el proceso fatal progresa rápidamente.' },
  { value: '0', label: '0. Fallecido.' },
];

export const LEE_THRCI_FACTORES = [
  { value: 'acv-tia', label: 'I - Historia ACV / TIA' },
  { value: 'cardiopatia-isquemica', label: 'II - Cardiopatía Isquemica' },
  { value: 'creatinina-tfg', label: 'III - Creatinina > 2mg ó TFG < 60' },
  { value: 'neumonectomia', label: 'IV - Neumonectomía' },
];

export const LEE_REVISADO_FACTORES = [
  { value: 'cirugia-alto-riesgo', label: 'I - Cirugía de alto riesgo' },
  { value: 'acv-tia', label: 'II - Historia de ACV / TIA' },
  { value: 'cardiopatia-isquemica', label: 'III - Cardiopatía isquemica (no revascularizada)' },
  { value: 'insulina', label: 'IV - Insulina preoperatoria' },
  { value: 'insuficiencia-cardiaca', label: 'V - Historia de insuficiencia cardiaca' },
  { value: 'creatinina', label: 'VI - Creatinina > 2 mg%' },
];

export const SECCIONES_EVAPRE = [
  {
    id: 'informacion-general',
    label: 'Información general',
    campos: [area('procedimiento', 'Procedimiento')],
  },
  {
    id: 'antecedentes',
    label: 'Antecedentes',
    campos: [
      area('patologicos', 'Patológicos'),
      area('quirurgicos', 'Quirúrgicos'),
      area('obstetricos', 'Obstetricos', 'F.U.M.:\nGESTACION:\nPARTO:\nABORTO:\nCESAREA:\nECTOPICO:'),
      area('anestesicos', 'Anestésicos', 'SIN COMPLICACIONES'),
      area('toxicos', 'Tóxicos'),
      area('alergicos', 'Alergicos'),
      area('farmacologicos', 'Farmacologicos'),
      area('transfusional', 'Transfusional'),
    ],
  },
  {
    id: 'laboratorios',
    label: 'Laboratorios',
    campos: [
      texto('hb', 'HB'),
      texto('hcto', 'HCTO'),
      texto('plaquetas', 'Plaquetas'),
      texto('leucocitos', 'Leucocitos'),
      texto('tp', 'TP'),
      texto('ptt', 'PTT'),
      texto('inr', 'INR'),
      texto('glicemia', 'Glicemia'),
      texto('hba1c', 'HbA1c'),
      texto('bun', 'BUN'),
      texto('creatinina', 'Creatinina'),
      texto('ionograma', 'Ionograma'),
      texto('albumina', 'Albúmina'),
      area('parcialOrina', 'Parcial de orina'),
      area('gasesArteriales', 'Gases arteriales', 'PH:\nPO2:\nPCO2:\nBE:\nLACTATO:\nHCO3:'),
      area('otrosQuimica', 'Otros (quimica sanguinea)'),
      area('ekg', 'EKG', 'RITMO SINUSAL, SIN ISQUEMIA, NI BLOQUEO DE RAMA'),
      area('rxTorax', 'RX Torax'),
      area('otrosImagenes', 'Otros (imagenes dx)'),
    ],
  },
  {
    id: 'examen-fisico',
    label: 'Examen físico',
    campos: [
      texto('sensorio', 'Sensorio'),
      texto('ta', 'TA mmhg'),
      texto('fc', 'FC'),
      texto('fr', 'FR'),
      texto('temperatura', 'To'),
      texto('peso', 'Peso Kg'),
      texto('imc', 'IMC'),
      texto('talla', 'Talla'),
      area('cabezaOrganos', 'Cabeza y O. de S.', 'PUPILAS ISOCORICAS, NORMOREACTIVAS. MUCOSAS ROSADAS, HUMEDAS, ANICTERICAS'),
      seleccion('protesisDental', 'Protesis dental', SI_NO),
      seleccion('tipoProtesis', 'Tipo protesis', [
        { value: 'fija', label: 'Fija' },
        { value: 'removible', label: 'Removible' },
        { value: 'parcial', label: 'Parcial' },
        { value: 'total', label: 'Total' },
      ]),
      seleccion('lentes', 'Lentes', [
        { value: 'no', label: 'No' },
        { value: 'gafas', label: 'Gafas' },
        { value: 'contacto', label: 'Lentes de contacto' },
      ]),
      seleccion('aperturaOral', 'Apertura oral', [
        { value: '>=3', label: '≥ 3 cm' },
        { value: '<3', label: '< 3 cm' },
      ]),
      seleccion('dtm', 'DTM', [
        { value: '>6.5', label: '> 6,5 cm' },
        { value: '6-6.5', label: '6 - 6,5 cm' },
        { value: '<6', label: '< 6 cm' },
      ]),
      seleccion('distanciaExternomentoniana', 'Distancia externomentoniana', [
        { value: '>=12', label: '≥ 12 cm' },
        { value: '<12', label: '< 12 cm' },
      ]),
      seleccion('circunferenciaCuello', 'Circunferencia de cuello', [
        { value: '<40', label: '< 40 cm' },
        { value: '>=40', label: '≥ 40 cm' },
      ]),
      seleccion('testMordida', 'Test de la mordida', [
        { value: 'I', label: 'Clase I' },
        { value: 'II', label: 'Clase II' },
        { value: 'III', label: 'Clase III' },
      ]),
      seleccion('distanciaInterincisivos', 'Distancia interincisivos', [
        { value: '>4', label: '> 4 cm' },
        { value: '3-4', label: '3 - 4 cm' },
        { value: '<3', label: '< 3 cm' },
      ]),
      seleccion('mallampaty', 'Mallampaty', romanos('Clase', 4)),
      area('cuelloCabeza', 'Cuello y cabeza'),
      area('cardiotoracico', 'Cardiotoracico', 'RUIDOS CARDIACOS RITMICOS, SIN SOPLOS.\nMURMULLO VESICULAR CONSERVADOS, SIN RUIDOS SOBREAGREGADOS'),
      area('abdomen', 'Abdomen', 'BLANDO, NO DOLOROSO A LA PALPACION, SIN MASAS NI MEGALIAS. PERISTATISMO POSITIVO'),
      area('gu', 'GU'),
      area('extremidades', 'Extremidades', 'PULSOS DISTALES SIMETRICOS ++. LLENADO CAPILAR < 2 SEGUNDOS. SIN EDEMAS'),
      area('neurologico', 'Neurologico'),
      { key: 'karnofsky', label: 'Indice de Karnofsky', type: 'karnofsky' },
      seleccion('estadoFisicoAsa', 'Estado fisico ASA', [
        { value: 'I', label: 'ASA I - Paciente sano' },
        { value: 'II', label: 'ASA II - Enfermedad sistémica leve' },
        { value: 'III', label: 'ASA III - Enfermedad sistémica severa' },
        { value: 'IV', label: 'ASA IV - Enfermedad sistémica severa con amenaza constante para la vida' },
        { value: 'V', label: 'ASA V - Moribundo, no se espera que sobreviva sin cirugía' },
        { value: 'VI', label: 'ASA VI - Donante de órganos (muerte cerebral)' },
      ]),
      seleccion('nyha', 'NYHA', romanos('Clase', 4)),
      {
        key: 'leeThrciFactores', label: 'LEE ThRCI (Factores de riesgo)', type: 'checks', options: LEE_THRCI_FACTORES, defecto: [],
      },
      seleccion('leeThrciPuntos', 'LEE ThRCI (Puntos)', [
        { value: '0', label: '0 puntos' },
        { value: '1', label: '1 punto' },
        { value: '2', label: '2 puntos' },
        { value: '3', label: '≥ 3 puntos' },
      ]),
      {
        key: 'leeRevisadoFactores', label: 'LEE Revisado (Factores de riesgo)', type: 'checks', options: LEE_REVISADO_FACTORES, defecto: [],
      },
      seleccion('leeRevisadoClase', 'LEE Revisado (Clase)', romanos('Clase', 4)),
      seleccion('capacidadFuncional', 'Capacidad funcional', [
        { value: 'pobre', label: 'Pobre (< 4 METs)' },
        { value: 'moderada', label: 'Moderada (4 - 10 METs)' },
        { value: 'excelente', label: 'Excelente (> 10 METs)' },
        { value: 'desconocida', label: 'Desconocida' },
      ]),
      area('hemoderivados', 'Hemoderivados', 'RESERVA DE   UGRE'),
      seleccion('uciPostquirurgica', 'UCI postquirúrgica', [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
        { value: 'por-definir', label: 'Por definir' },
      ]),
      seleccion('tipoAnestesia', 'Tipo de anestesia', [
        { value: 'general', label: 'General' },
        { value: 'regional', label: 'Regional' },
        { value: 'neuroaxial', label: 'Neuroaxial (raquídea / epidural)' },
        { value: 'sedacion', label: 'Sedación' },
        { value: 'local', label: 'Local' },
        { value: 'combinada', label: 'Combinada' },
      ]),
      area('opinionRecomendaciones', 'Opinión y recomendaciones', '1. AYUNO 8 HORAS SOLIDOS, 6 HORAS LIQUIDOS CLAROS\n2. SE FIRMA CONSENTIMIENTO INFORMADO\n\nANALISIS:'),
    ],
  },
];

// Etiqueta legible del `value` de un campo select (vista de lectura).
export function etiquetaOpcionEvapre(key, value) {
  for (const s of SECCIONES_EVAPRE) {
    const campo = s.campos.find((c) => c.key === key);
    if (campo) return campo.options?.find((o) => o.value === value)?.label ?? '';
  }
  return '';
}

export function estadoInicialEvapre() {
  const valores = {};
  SECCIONES_EVAPRE.forEach((s) => s.campos.forEach((c) => {
    valores[c.key] = c.defecto ?? '';
  }));
  return valores;
}
