// Ingreso a hospitalización (INGHOSP) diligenciado de ejemplo — mismo shape
// que el estado de cada sección de PlantillaIngresoHospitalizacion (ver
// `inicial` en cada Step/Panel), para que "Ver detalle" del registro abra
// la plantilla real ya diligenciada (ver AtencionPaciente.jsx). Sin backend:
// es el único registro INGHOSP con `contenido`.
//
// Caso coherente con la paciente de la cama 101-A (María Fernanda González
// Restrepo, 67 años, "Neumonía adquirida en comunidad", ver
// mockPanelGeneralData.js) y con sus alergias registradas (penicilina —
// reacción cutánea moderada; ibuprofeno — broncoespasmo leve, ver
// ALERGIAS_POR_PACIENTE en mockHospitalizadosData.js): el plan evita
// penicilinas y AINES. Los valores de `select` usan los mismos `value` que
// las opciones de cada FormSelect.

export const INGHOSP_EJEMPLO = {
  informacionGeneral: {
    motivoConsulta: '"Tengo fiebre, tos con flema y me falta el aire desde hace 4 días."',
    enfermedadActual:
      'Paciente femenina de 67 años con antecedente de HTA y DM2, quien consulta por cuadro clínico de 4 días de evolución '
      + 'consistente en tos productiva con expectoración amarillo-verdosa, fiebre no cuantificada en casa con pico de 39,2 °C '
      + 'el día de hoy, escalofríos y disnea progresiva hasta presentarse con actividades de la vida diaria (mMRC 3). Refiere '
      + 'dolor torácico derecho de características pleuríticas, que aumenta con la inspiración profunda y la tos. Se asocia a '
      + 'astenia, adinamia e hiporexia. Se automedicó con acetaminofén 500 mg c/8 h con mejoría parcial de la fiebre. Niega '
      + 'hemoptisis, dolor torácico opresivo, síncope o alteración del estado de conciencia. Sin hospitalizaciones ni uso de '
      + 'antibióticos en los últimos 3 meses.\n\n'
      + 'En urgencias se documenta SpO2 88 % al aire ambiente (94 % con cánula nasal a 2 L/min), taquicardia, taquipnea y fiebre. '
      + 'Radiografía de tórax con consolidación en lóbulo inferior derecho. CURB-65: 2 puntos (edad ≥ 65 años, BUN 24 mg/dL). '
      + 'Se decide hospitalización en piso para manejo antibiótico endovenoso y oxigenoterapia.',
    revisionPorSistema:
      'General: astenia, adinamia, hiporexia. Niega pérdida de peso.\n'
      + 'Respiratorio: lo descrito en enfermedad actual.\n'
      + 'Cardiovascular: niega dolor torácico opresivo, palpitaciones, ortopnea o edemas.\n'
      + 'Gastrointestinal: náuseas ocasionales sin emesis. Deposiciones de características normales.\n'
      + 'Genitourinario: niega disuria, polaquiuria o hematuria.\n'
      + 'Neurológico: niega cefalea, confusión o focalización.\n'
      + 'Piel: niega lesiones o exantemas.',
    reingreso: 'no',
  },

  antecedentes: {
    booleanos: {
      toxicos: { valor: 'si', observaciones: 'Exfumadora, índice paquetes/año de 15; suspendió hace 12 años. Niega consumo de alcohol o sustancias psicoactivas.' },
      patologicos: { valor: 'si', observaciones: 'Hipertensión arterial (dx 2014). Diabetes mellitus tipo 2 no insulinorrequiriente (dx 2017), última HbA1c 7,4 % (junio 2026). Sin diagnóstico previo de EPOC ni asma.' },
      oncologicos: { valor: 'no', observaciones: '' },
      quirurgicos: { valor: 'si', observaciones: 'Colecistectomía laparoscópica (2015), sin complicaciones.' },
      farmacologicos: { valor: 'si', observaciones: 'Losartán 50 mg VO c/24 h. Metformina 850 mg VO c/12 h. Atorvastatina 20 mg VO en la noche.' },
      transfusionales: { valor: 'no', observaciones: '' },
      alergicos: { valor: 'si', observaciones: 'Penicilina: reacción cutánea moderada (exantema maculopapular, sin angioedema ni anafilaxia). Ibuprofeno: broncoespasmo leve. Evitar AINES.' },
      familiares: { valor: 'si', observaciones: '' },
    },
    ginecoObstetricos: 'G: 3  P: 3  A: 0  C: 0  V: 3  M: 0',
    menarquia: '12 años',
    fum: 'Menopausia a los 51 años',
    ciclos: 'No aplica (posmenopáusica)',
    urologicos: 'Niega síntomas urinarios bajos. Sin antecedente de infecciones urinarias recurrentes.',
    socialEconomico:
      'Docente pensionada. Vive con su esposo en casa propia, estrato 3, con todos los servicios públicos. Independiente para '
      + 'las actividades básicas de la vida diaria. Afiliada al régimen contributivo. Vacuna de influenza aplicada en 2025; '
      + 'sin vacunación antineumocócica.',
  },

  examenFisico: {
    inspeccionGeneral:
      'Paciente en regular estado general, alerta, orientada en tiempo, espacio y persona. Aspecto de enfermedad aguda, '
      + 'febril al tacto, taquipneica, sin uso de músculos accesorios, habla en frases completas. Mucosa oral semiseca. '
      + 'SpO2 88 % al aire ambiente, 94 % con cánula nasal a 2 L/min.',
    signosVitales: {
      frecuenciaCardiaca: '108', frecuenciaRespiratoria: '26', tensionArterial: '110/68', temperatura: '38.6', peso: '64', talla: '158',
    },
    sistemas: {
      cabezaOjosOrl: 'Normocéfala. Conjuntivas normocrómicas, escleras anictéricas. Mucosa oral semiseca. Orofaringe sin eritema ni exudados.',
      cuello: 'Móvil, sin adenopatías. Sin ingurgitación yugular. Tiroides no palpable.',
      torax:
        'Expansibilidad disminuida en hemitórax derecho. Frémito vocal aumentado y matidez a la percusión en base derecha. '
        + 'Estertores crepitantes y soplo tubárico en base derecha; murmullo vesicular conservado en el resto de campos. '
        + 'Ruidos cardiacos rítmicos, taquicárdicos, sin soplos.',
      abdomen: 'Blando, depresible, no doloroso a la palpación. Sin masas ni megalias. Cicatrices de laparoscopia. Ruidos intestinales presentes.',
      extremidades: 'Eutróficas, sin edemas. Pulsos distales simétricos. Llenado capilar menor de 2 segundos.',
      genitourinario: 'Puño percusión negativa bilateral.',
      neurologico: 'Glasgow 15/15. Sin déficit motor ni sensitivo. Pares craneales sin alteraciones. Sin signos meníngeos.',
      osteomuscular: 'Sin alteraciones.',
      tegumentario: 'Piel caliente, sin exantemas, petequias ni cianosis.',
      ayudasDiagnosticas:
        'Rx de tórax PA y lateral (urgencias): consolidación en lóbulo inferior derecho con broncograma aéreo. Sin derrame pleural.\n'
        + 'Hemograma: leucocitos 16.800/mm³ (neutrófilos 86 %), Hb 13,1 g/dL, plaquetas 245.000/mm³.\n'
        + 'PCR 18,4 mg/dL. BUN 24 mg/dL, creatinina 1,1 mg/dL. Na 136 mEq/L, K 4,1 mEq/L. Glucemia 168 mg/dL.\n'
        + 'Gases arteriales (aire ambiente): pH 7,46, PaCO2 32 mmHg, PaO2 56 mmHg, HCO3 22,5 mEq/L, lactato 1,6 mmol/L. PaO2/FiO2: 267.\n'
        + 'ECG: taquicardia sinusal a 108 lpm, sin alteraciones del segmento ST.',
    },
  },

  planTratamiento: {
    analisisClinico:
      'Paciente de 67 años con HTA y DM2 que cursa con neumonía adquirida en la comunidad de lóbulo inferior derecho, '
      + 'con síndrome de respuesta inflamatoria sistémica (fiebre, taquicardia, taquipnea, leucocitosis) e hipoxemia '
      + '(PaO2/FiO2 267). CURB-65 de 2 puntos, que indica manejo intrahospitalario. Cumple 1 criterio menor de severidad '
      + 'ATS/IDSA (BUN ≥ 20 mg/dL) y ningún criterio mayor, sin hipotensión ni lactato elevado, por lo que no requiere '
      + 'UCI en este momento.\n\n'
      + 'Alergia a penicilina con reacción cutánea no grave (sin anafilaxia): se indica cefalosporina de tercera generación, '
      + 'con bajo riesgo de reactividad cruzada, bajo vigilancia. Alergia a ibuprofeno con broncoespasmo: se contraindican AINES. '
      + 'Hiperglucemia de estrés en paciente con DM2: se suspende metformina por hipoxemia e infección aguda. BUN elevado con '
      + 'mucosas semisecas sugiere depleción de volumen: se suspende transitoriamente losartán.',
    opinionPlanTratamiento:
      '1. Hospitalizar en piso de medicina interna. Cabecera a 30–45°.\n'
      + '2. Oxígeno por cánula nasal a 2–4 L/min, meta SpO2 92–96 %.\n'
      + '3. Tomar hemocultivos ×2 y cultivo de esputo con Gram ANTES de la primera dosis de antibiótico. Antígenos urinarios de neumococo y Legionella. Panel viral (influenza/SARS-CoV-2).\n'
      + '4. Ceftriaxona 2 g IV c/24 h + claritromicina 500 mg VO c/12 h. Vigilar reacción cutánea en la primera dosis.\n'
      + '5. SSN 0,9 % a 80 mL/h. Balance hídrico estricto.\n'
      + '6. Acetaminofén 1 g VO c/8 h si hay fiebre o dolor (máximo 3 g/día). NO AINES.\n'
      + '7. Enoxaparina 40 mg SC c/24 h (profilaxis tromboembólica).\n'
      + '8. Suspender metformina y losartán. Glucometría preprandial y a las 22 h con esquema correctivo de insulina cristalina. Continuar atorvastatina.\n'
      + '9. Dieta para diabético, blanda y fraccionada.\n'
      + '10. Terapia respiratoria c/8 h. Control de signos vitales c/4 h.\n'
      + '11. Control de hemograma, PCR, BUN y creatinina en 48 h.\n'
      + '12. Revalorar a las 48–72 h para ajustar el antibiótico según cultivos y pasar a vía oral si está clínicamente estable. Duración estimada del tratamiento: 5–7 días.\n'
      + '13. Signos de alarma para escalar a UCI: SpO2 < 90 % con FiO2 > 40 %, FR > 30, PAS < 90 mmHg, alteración del estado de conciencia.\n\n'
      + 'Se explican a la paciente y a su esposo el diagnóstico, el plan y los signos de alarma; entienden y aceptan. Se diligencia el consentimiento informado.',
    perdidaPeso: 'no',
    cantidadPeso: '',
    comidoMenos: 'si',
  },

  signosVitales: {
    estatura: '158', peso: '64', temperatura: '38.6', frecuenciaCardiaca: '108', frecuenciaRespiratoria: '26', sistolica: '110', diastolica: '68',
  },

  diagnosticos: {
    cie10: 'J189 - NEUMONIA, NO ESPECIFICADA',
    cie11: 'CA40.Z - NEUMONIA, ORGANISMO NO ESPECIFICADO',
    tipoDx: 'confirmado-nuevo',
  },
};

// Texto del botón "Resumen" de ese registro (mismo criterio que `resumen`
// en HCURG/INGHOSP de mockHistoriaClinicaRecords.js).
export const INGHOSP_EJEMPLO_RESUMEN =
  'Paciente femenina de 67 años con HTA y DM2, exfumadora, alérgica a penicilina (reacción cutánea) e ibuprofeno '
  + '(broncoespasmo), que ingresa por 4 días de tos productiva, fiebre de hasta 39,2 °C, disnea y dolor pleurítico derecho. '
  + 'Al ingreso: T 38,6 °C, FC 108, FR 26, PA 110/68, SpO2 88 % al aire ambiente. Crépitos y soplo tubárico en base derecha. '
  + 'Rx de tórax con consolidación en lóbulo inferior derecho, leucocitosis de 16.800 con neutrofilia, PCR 18,4 y PaO2/FiO2 267. '
  + 'Diagnóstico: neumonía adquirida en la comunidad (J189), CURB-65 de 2, sin criterios de UCI. Plan: oxígeno, hemocultivos '
  + 'y cultivo de esputo antes del antibiótico, ceftriaxona + claritromicina, sin AINES, tromboprofilaxis, suspensión '
  + 'transitoria de metformina y losartán con esquema correctivo de insulina, y revaloración a las 48–72 h.';
