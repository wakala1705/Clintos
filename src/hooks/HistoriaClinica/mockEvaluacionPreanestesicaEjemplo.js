// Evaluación preanestésica (EVAPRE) diligenciada de ejemplo -- mismo shape que
// el estado de PlantillaEvaluacionPreanestesica (`valores` indexado por `key`
// de evaluacionPreanestesicaCampos.js, más los `inicial` del aside), para que
// "Editar" abra la plantilla real ya diligenciada y "Ver detalle" la muestre
// en lectura (ver RegistroDetalleEvapre). Sin backend: es el único registro
// EVAPRE con `contenido`.
//
// Caso coherente con la paciente de la cama 101-A (María Fernanda González
// Restrepo, 67 años, neumonía adquirida en comunidad, ver
// mockIngresoHospitalizacionEjemplo.js): a los 4 días de antibiótico persiste
// la consolidación del lóbulo inferior derecho con fiebre intermitente, y
// neumología solicita fibrobroncoscopía con lavado broncoalveolar bajo
// sedación. La valoración recoge sus alergias (penicilina, ibuprofeno con
// broncoespasmo) y las suspensiones de metformina y losartán del ingreso.
// Los valores de `select` usan los mismos `value` que las opciones de cada
// FormSelect. Los textos libres van en mayúsculas sin tildes, como las
// plantillas del sistema legado.

export const EVAPRE_EJEMPLO = {
  valores: {
    procedimiento:
      'FIBROBRONCOSCOPIA DIAGNOSTICA CON LAVADO BRONCOALVEOLAR Y CEPILLADO PROTEGIDO EN LOBULO INFERIOR DERECHO, BAJO SEDACION.\n'
      + 'INDICACION: NEUMONIA ADQUIRIDA EN LA COMUNIDAD SIN RESOLUCION RADIOLOGICA, CON FIEBRE INTERMITENTE E HIPOXEMIA LEVE PERSISTENTE '
      + 'A LOS 4 DIAS DE CEFTRIAXONA + CLARITROMICINA.\n'
      + 'PROGRAMADA: 01.OCT.2026, SALA DE ENDOSCOPIA. SOLICITA: NEUMOLOGIA.',

    // Antecedentes
    patologicos:
      'HIPERTENSION ARTERIAL DESDE 2014. DIABETES MELLITUS TIPO 2 NO INSULINORREQUIRIENTE DESDE 2017, HBA1C 7,4 % (JUN 2026). '
      + 'SIN EPOC, ASMA NI APNEA DEL SUEÑO CONOCIDA. SIN CARDIOPATIA, ARRITMIAS, ACV NI ENFERMEDAD RENAL. '
      + 'NEUMONIA ADQUIRIDA EN LA COMUNIDAD EN MANEJO, HOSPITALIZADA DESDE 26.SEP.2026.',
    quirurgicos: 'COLECISTECTOMIA LAPAROSCOPICA (2015).',
    obstetricos: 'F.U.M.: MENOPAUSIA A LOS 51 AÑOS\nGESTACION: 3\nPARTO: 3\nABORTO: 0\nCESAREA: 0\nECTOPICO: 0',
    anestesicos:
      'ANESTESIA GENERAL PARA COLECISTECTOMIA LAPAROSCOPICA (2015), SIN COMPLICACIONES NI VIA AEREA DIFICIL DOCUMENTADA. '
      + 'REFIERE NAUSEAS POSTOPERATORIAS LEVES (RIESGO DE NVPO). SIN ANTECEDENTE PERSONAL NI FAMILIAR DE HIPERTERMIA MALIGNA.',
    toxicos: 'EXFUMADORA, 15 PAQUETES/AÑO, SUSPENDIO HACE 12 AÑOS. NIEGA ALCOHOL Y SUSTANCIAS PSICOACTIVAS.',
    alergicos:
      'PENICILINA: EXANTEMA MACULOPAPULAR MODERADO, SIN ANGIOEDEMA NI ANAFILAXIA.\n'
      + 'IBUPROFENO: BRONCOESPASMO LEVE. EVITAR AINES.\n'
      + 'LATEX, HUEVO Y SOYA: NIEGA.',
    farmacologicos:
      'HABITUALES: LOSARTAN 50 MG C/24 H (SUSPENDIDO AL INGRESO), METFORMINA 850 MG C/12 H (SUSPENDIDA), ATORVASTATINA 20 MG EN LA NOCHE.\n'
      + 'INTRAHOSPITALARIOS: CEFTRIAXONA 2 G IV C/24 H, CLARITROMICINA 500 MG VO C/12 H, ENOXAPARINA 40 MG SC C/24 H '
      + '(PROFILAXIS), INSULINA CRISTALINA CORRECTIVA, OXIGENO POR CANULA NASAL.',
    transfusional: 'NIEGA TRANSFUSIONES PREVIAS.',

    // Laboratorios (control del 30.SEP.2026)
    hb: '12,6 g/dL',
    hcto: '38 %',
    plaquetas: '312.000 /mm³',
    leucocitos: '12.400 /mm³ (NEUTROFILOS 74 %)',
    tp: '12,8 s (CONTROL 12,0)',
    ptt: '31 s (CONTROL 30)',
    inr: '1,05',
    glicemia: '142 mg/dL',
    hba1c: '7,4 % (JUN 2026)',
    bun: '16 mg/dL',
    creatinina: '0,9 mg/dL (TFG 68 mL/min)',
    ionograma: 'Na 138, K 4,0, Cl 102, Ca 9,0, Mg 1,9',
    albumina: '3,4 g/dL',
    parcialOrina: 'DENSIDAD 1.015, PH 6, SIN PROTEINAS, GLUCOSA NI CETONAS. LEUCOCITOS 2-3 X CAMPO, NITRITOS NEGATIVOS.',
    gasesArteriales: 'PH: 7,43\nPO2: 72 mmHg (CANULA NASAL 3 L/MIN, FIO2 ~0,32)\nPCO2: 35 mmHg\nBE: -1,2\nLACTATO: 1,1 mmol/L\nHCO3: 23 mEq/L',
    otrosQuimica: 'PCR 11,8 mg/dL (18,4 AL INGRESO). PROCALCITONINA 0,3 ng/mL. TGO 28 U/L, TGP 24 U/L.',
    ekg: 'RITMO SINUSAL A 84 LPM, EJE NORMAL, SIN ISQUEMIA, NI BLOQUEO DE RAMA. QTc 428 ms (CLARITROMICINA EN CURSO, VIGILAR).',
    rxTorax: 'CONSOLIDACION CON BRONCOGRAMA AEREO EN LOBULO INFERIOR DERECHO, SIN CAMBIOS SIGNIFICATIVOS RESPECTO AL INGRESO. SILUETA CARDIACA NORMAL.',
    otrosImagenes:
      'TAC DE TORAX CON CONTRASTE (29.SEP.2026): CONSOLIDACION EN LID SIN CAVITACION NI MASA ENDOBRONQUIAL. '
      + 'DERRAME PLEURAL DERECHO LAMINAR. ADENOPATIAS MEDIASTINALES REACTIVAS < 12 MM. SIN DEFECTOS DE LLENADO VASCULAR.',

    // Examen físico
    sensorio: 'ALERTA, ORIENTADA, GLASGOW 15/15',
    ta: '128/74',
    fc: '84',
    fr: '20',
    temperatura: '37,2',
    peso: '64',
    imc: '25,6',
    talla: '158',
    cabezaOrganos: 'PUPILAS ISOCORICAS, NORMOREACTIVAS. MUCOSAS ROSADAS, HUMEDAS, ANICTERICAS. DENTADURA NATURAL EN MAL ESTADO EN LA ARCADA INFERIOR.',
    protesisDental: 'si',
    tipoProtesis: 'parcial',
    lentes: 'gafas',
    aperturaOral: '>=3',
    dtm: '>6.5',
    distanciaExternomentoniana: '>=12',
    circunferenciaCuello: '<40',
    testMordida: 'I',
    distanciaInterincisivos: '>4',
    mallampaty: 'II',
    cuelloCabeza: 'CUELLO MOVIL, SIN LIMITACION A LA FLEXO-EXTENSION NI MASAS. TRAQUEA CENTRAL. SIN INGURGITACION YUGULAR. PROTESIS PARCIAL REMOVIBLE SUPERIOR (SE RETIRA ANTES DEL PROCEDIMIENTO).',
    cardiotoracico:
      'RUIDOS CARDIACOS RITMICOS, SIN SOPLOS.\n'
      + 'MURMULLO VESICULAR DISMINUIDO EN BASE DERECHA CON CREPITOS LOCALIZADOS, SIN SIBILANCIAS. SIN USO DE MUSCULOS ACCESORIOS.',
    abdomen: 'BLANDO, NO DOLOROSO A LA PALPACION, SIN MASAS NI MEGALIAS. PERISTATISMO POSITIVO',
    gu: 'SIN ALTERACIONES. PUÑO PERCUSION NEGATIVA BILATERAL.',
    extremidades: 'PULSOS DISTALES SIMETRICOS ++. LLENADO CAPILAR < 2 SEGUNDOS. SIN EDEMAS',
    neurologico: 'GLASGOW 15/15. SIN DEFICIT MOTOR NI SENSITIVO. PARES CRANEALES CONSERVADOS.',
    karnofsky: '80',
    estadoFisicoAsa: 'III',
    nyha: 'I',
    leeThrciFactores: [],
    leeThrciPuntos: '0',
    leeRevisadoFactores: [],
    leeRevisadoClase: 'I',
    capacidadFuncional: 'moderada',
    hemoderivados: 'NO REQUIERE RESERVA DE HEMODERIVADOS (PROCEDIMIENTO CON BAJO RIESGO DE SANGRADO). GRUPO Y RH EN HISTORIA: O POSITIVO.',
    uciPostquirurgica: 'no',
    tipoAnestesia: 'sedacion',
    opinionRecomendaciones:
      '1. AYUNO 8 HORAS SOLIDOS, 6 HORAS LIQUIDOS CLAROS\n'
      + '2. SE EXPLICAN RIESGOS Y BENEFICIOS DE LA SEDACION, SE RESUELVEN DUDAS Y SE FIRMA CONSENTIMIENTO INFORMADO\n'
      + '3. CONTINUAR OXIGENO SUPLEMENTARIO HASTA EL INGRESO A SALA. META SPO2 >= 92 %\n'
      + '4. MANTENER SUSPENDIDOS METFORMINA Y LOSARTAN. GLUCOMETRIA ANTES DEL PROCEDIMIENTO, META 100-180 MG/DL\n'
      + '5. ULTIMA DOSIS DE ENOXAPARINA 12 HORAS ANTES DEL PROCEDIMIENTO\n'
      + '6. ALERGIA A PENICILINA E IBUPROFENO: EVITAR AINES (KETOROLACO, DICLOFENACO) Y PENICILINAS. ANALGESIA CON ACETAMINOFEN\n'
      + '7. SALBUTAMOL 4 PUFF INHALADO 30 MINUTOS ANTES DEL PROCEDIMIENTO. PROFILAXIS DE NVPO: ONDANSETRON 4 MG IV (VIGILAR QTc)\n'
      + '8. RETIRAR PROTESIS DENTAL Y GAFAS ANTES DE INGRESAR A SALA\n\n'
      + 'ANALISIS: PACIENTE FEMENINA DE 67 AÑOS, ASA III (DM2, HTA, NEUMONIA ACTIVA CON HIPOXEMIA LEVE), PROGRAMADA PARA '
      + 'FIBROBRONCOSCOPIA CON LAVADO BRONCOALVEOLAR. RIESGO CARDIOVASCULAR BAJO (LEE REVISADO CLASE I, 0 PUNTOS; NYHA I; CAPACIDAD '
      + 'FUNCIONAL > 4 METS), SIN NECESIDAD DE ESTUDIOS CARDIOLOGICOS ADICIONALES. VIA AEREA SIN PREDICTORES DE DIFICULTAD '
      + '(MALLAMPATI II, APERTURA ORAL > 3 CM, DTM > 6,5 CM). RIESGO RESPIRATORIO ELEVADO POR NEUMONIA ACTIVA Y ANTECEDENTE DE '
      + 'BRONCOESPASMO CON AINES: SE PLANEA SEDACION PROFUNDA CON PROPOFOL + REMIFENTANILO, VIA AEREA COMPARTIDA CON CANULA NASAL DE '
      + 'ALTO FLUJO Y MONITORIA ESTANDAR ASA CON CAPNOGRAFIA. MASCARILLA LARINGEA E INTUBACION OROTRAQUEAL DE RESCATE DISPONIBLES. '
      + 'APTA PARA EL PROCEDIMIENTO CON LAS RECOMENDACIONES ANTERIORES; REEVALUAR EL DIA DEL PROCEDIMIENTO SI SPO2 < 90 % CON FIO2 > 40 %.',
  },

  // `inicial` del aside (mismo shape que en INGHOSP).
  signosVitales: {
    estatura: '158', peso: '64', temperatura: '37.2', frecuenciaCardiaca: '84', frecuenciaRespiratoria: '20', sistolica: '128', diastolica: '74',
  },
  diagnosticos: {
    cie10: 'J189 - NEUMONIA, NO ESPECIFICADA',
    cie11: 'CA40.Z - NEUMONIA, ORGANISMO NO ESPECIFICADO',
    tipoDx: 'confirmado-repetido',
  },
};

// Texto del botón "Resumen" de ese registro.
export const EVAPRE_EJEMPLO_RESUMEN =
  'Paciente femenina de 67 años, ASA III (HTA, DM2, neumonía activa con hipoxemia leve), alérgica a penicilina (exantema) e '
  + 'ibuprofeno (broncoespasmo), programada para fibrobroncoscopía con lavado broncoalveolar el 01.OCT.2026. Sin predictores de '
  + 'vía aérea difícil (Mallampati II, apertura oral > 3 cm, DTM > 6,5 cm); lleva prótesis parcial superior y gafas. Riesgo '
  + 'cardiovascular bajo (Lee revisado clase I, NYHA I, > 4 METs). Laboratorios del 30.SEP: Hb 12,6, plaquetas 312.000, INR 1,05, '
  + 'creatinina 0,9, PCR 11,8; gases con PaO2 72 mmHg con cánula a 3 L/min; ECG con QTc 428 ms. Plan: sedación profunda con '
  + 'propofol + remifentanilo, ayuno 8/6 h, salbutamol previo, sin AINES, última enoxaparina 12 h antes y metformina/losartán '
  + 'suspendidos. Apta para el procedimiento; reevaluar si SpO2 < 90 % con FiO2 > 40 %.';
