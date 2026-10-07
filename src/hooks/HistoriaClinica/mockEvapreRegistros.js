// Registros EVAPRE (evaluación preanestésica) de ejemplo por paciente, para
// "Vincular evaluación" del paso 3 del chequeo de Gestión de cirugías (ver
// VincularEvapreModal). Mismo shape que un registro de HC con `contenido` (ver
// mockHistoriaClinicaRecords.js), de modo que la misma EVAPRE se puede abrir
// en Historia clínica. Sin backend: el mapa es fijo y se busca por número de
// documento (solo dígitos).

import {
  EVAPRE_EJEMPLO, EVAPRE_EJEMPLO_RESUMEN,
} from './mockEvaluacionPreanestesicaEjemplo';

// María Fernanda González Restrepo (cama 101-A): ver el caso en
// mockEvaluacionPreanestesicaEjemplo.js. Es el mismo registro que muestra el
// agrupador EVAPRE de HC Hospitalización.
export const EVAPRE_REGISTRO_MARIA_FERNANDA = {
  id: 'evapre-ejemplo', fecha: '30.SEP.2026', hora: '04:15 PM', numero: '0201295631', tituloNota: 'EVALUACIÓN PREANESTESICA',
  autor: 'VARGAS LOZANO JUAN PABLO', rol: 'Médico', especialidad: 'ANESTESIOLOGÍA', ambito: 'QX', plantilla: 'EVAPRE',
  contenido: EVAPRE_EJEMPLO,
  archivoUrl: '/mock/evapre-0201295631.pdf',
  resumen: EVAPRE_EJEMPLO_RESUMEN,
};

// Claudia Patricia Ospina Henao (solicitud de tiroidectomía total en Gestión
// de cirugías): ASA II, sin predictores de vía aérea difícil. Sus laboratorios
// (incluidos TSH/T4/calcio) son los que "Adjuntar resultados" del paso 4 de su
// chequeo toma de esta EVAPRE.
const EVAPRE_CLAUDIA = {
  valores: {
    procedimiento:
      'TIROIDECTOMIA TOTAL CON NEUROMONITOREO DEL NERVIO LARINGEO RECURRENTE.\n'
      + 'INDICACION: BOCIO MULTINODULAR CON NODULO DOMINANTE TIRADS 4 (BETHESDA III) Y COMPRESION TRAQUEAL LEVE.\n'
      + 'CIRUJANA: DRA. NATALIA ESCOBAR. SERVICIO: CABEZA Y CUELLO.',

    patologicos:
      'BOCIO MULTINODULAR EUTIROIDEO DESDE 2023. HIPERTENSION ARTERIAL LEVE DESDE 2021, CONTROLADA. OBESIDAD GRADO I (IMC 31). '
      + 'SIN DIABETES, ASMA, EPOC NI APNEA DEL SUEÑO CONOCIDA. STOP-BANG 2 (RIESGO BAJO).',
    quirurgicos: 'CESAREAS (2000 Y 2005) CON LIGADURA TUBARICA (2005).',
    obstetricos: 'F.U.M.: 23.SEP.2026 (CICLOS REGULARES)\nGESTACION: 2\nPARTO: 0\nABORTO: 0\nCESAREA: 2\nECTOPICO: 0',
    anestesicos:
      'ANESTESIA RAQUIDEA PARA CESAREAS (2000 Y 2005), SIN COMPLICACIONES. SIN ANTECEDENTE PERSONAL NI FAMILIAR DE HIPERTERMIA MALIGNA.',
    toxicos: 'NIEGA TABAQUISMO, ALCOHOL Y SUSTANCIAS PSICOACTIVAS.',
    alergicos: 'NIEGA ALERGIAS A MEDICAMENTOS, LATEX Y ALIMENTOS.',
    farmacologicos: 'LOSARTAN 50 MG C/24 H (SUSPENDER 24 HORAS ANTES DE LA CIRUGIA). NO USA ANTICOAGULANTES NI ANTIAGREGANTES.',
    transfusional: 'NIEGA TRANSFUSIONES PREVIAS.',

    hb: '13,8 g/dL',
    hcto: '41 %',
    plaquetas: '268.000 /mm³',
    leucocitos: '7.200 /mm³',
    tp: '12,1 s (CONTROL 12,0)',
    ptt: '29 s (CONTROL 30)',
    inr: '1,0',
    glicemia: '94 mg/dL',
    hba1c: '5,6 %',
    bun: '13 mg/dL',
    creatinina: '0,8 mg/dL (TFG 92 mL/min)',
    ionograma: 'Na 140, K 4,2, Cl 103',
    albumina: '4,2 g/dL',
    parcialOrina: 'SIN ALTERACIONES. EMBARAZO DESCARTADO (BHCG NEGATIVA).',
    gasesArteriales: 'NO SE REQUIEREN GASES ARTERIALES. SPO2 98 % AL AIRE AMBIENTE.',
    otrosQuimica: 'TSH 1,8 mUI/L (0,4-4,0)\nT4 LIBRE 1,1 ng/dL (0,8-1,8)\nCALCIO TOTAL 9,4 mg/dL (8,6-10,2)\nEUTIROIDISMO Y CALCEMIA NORMAL.',
    ekg: 'RITMO SINUSAL A 72 LPM, EJE NORMAL, SIN ISQUEMIA, NI BLOQUEO DE RAMA. QTc 410 ms.',
    rxTorax: 'SIN INFILTRADOS NI DERRAME. DESVIACION TRAQUEAL LEVE A LA DERECHA. SILUETA CARDIACA NORMAL.',
    otrosImagenes:
      'ECOGRAFIA DE TIROIDES: BOCIO MULTINODULAR, NODULO DOMINANTE EN LOBULO DERECHO DE 2,4 CM (TIRADS 4).\n'
      + 'TAC DE CUELLO: DESPLAZAMIENTO TRAQUEAL LEVE SIN ESTENOSIS CRITICA (LUZ > 10 MM). SIN EXTENSION RETROESTERNAL.',

    sensorio: 'ALERTA, ORIENTADA, GLASGOW 15/15',
    ta: '124/78',
    fc: '72',
    fr: '16',
    temperatura: '36,6',
    peso: '82',
    imc: '31,2',
    talla: '162',
    cabezaOrganos: 'PUPILAS ISOCORICAS, NORMOREACTIVAS. MUCOSAS ROSADAS, HUMEDAS, ANICTERICAS. DENTADURA NATURAL COMPLETA, SIN PIEZAS FLOJAS.',
    protesisDental: 'no',
    tipoProtesis: '',
    lentes: 'no',
    aperturaOral: '>=3',
    dtm: '6-6.5',
    distanciaExternomentoniana: '>=12',
    circunferenciaCuello: '>=40',
    testMordida: 'I',
    distanciaInterincisivos: '>4',
    mallampaty: 'II',
    cuelloCabeza:
      'BOCIO PALPABLE, NODULAR, MOVIL CON LA DEGLUTICION, SIN ADENOPATIAS. TRAQUEA DESVIADA LEVEMENTE A LA DERECHA. '
      + 'EXTENSION CERVICAL CONSERVADA. SIN ESTRIDOR NI DISFONIA.',
    cardiotoracico: 'RUIDOS CARDIACOS RITMICOS, SIN SOPLOS.\nMURMULLO VESICULAR CONSERVADOS, SIN RUIDOS SOBREAGREGADOS',
    abdomen: 'BLANDO, NO DOLOROSO A LA PALPACION, SIN MASAS NI MEGALIAS. PERISTATISMO POSITIVO',
    gu: 'SIN ALTERACIONES.',
    extremidades: 'PULSOS DISTALES SIMETRICOS ++. LLENADO CAPILAR < 2 SEGUNDOS. SIN EDEMAS',
    neurologico: 'GLASGOW 15/15. SIN DEFICIT MOTOR NI SENSITIVO.',
    karnofsky: '100',
    estadoFisicoAsa: 'II',
    nyha: 'I',
    leeThrciFactores: [],
    leeThrciPuntos: '0',
    leeRevisadoFactores: [],
    leeRevisadoClase: 'I',
    capacidadFuncional: 'excelente',
    hemoderivados: 'NO REQUIERE RESERVA DE HEMODERIVADOS. GRUPO Y RH EN HISTORIA: A POSITIVO.',
    uciPostquirurgica: 'no',
    tipoAnestesia: 'general',
    opinionRecomendaciones:
      '1. AYUNO 8 HORAS SOLIDOS, 6 HORAS LIQUIDOS CLAROS\n'
      + '2. SE EXPLICAN RIESGOS Y BENEFICIOS DE LA ANESTESIA GENERAL (INCLUIDA LA DISFONIA TRANSITORIA POR INTUBACION), SE RESUELVEN DUDAS Y SE FIRMA CONSENTIMIENTO INFORMADO\n'
      + '3. SUSPENDER LOSARTAN 24 HORAS ANTES DE LA CIRUGIA\n'
      + '4. EUTIROIDISMO Y CALCEMIA NORMAL CONFIRMADOS (TSH, T4 LIBRE, CALCIO); REPETIR CALCIO A LAS 24 HORAS DEL POSTOPERATORIO\n'
      + '5. NEUROMONITOREO DEL NERVIO LARINGEO RECURRENTE: TUBO ENDOTRAQUEAL CON ELECTRODOS Y RELAJANTE MUSCULAR DE ACCION CORTA, SIN REPETIR DOSIS\n'
      + '6. PROFILAXIS DE NVPO (MUJER, NO FUMADORA, OPIOIDES POSTOPERATORIOS): DEXAMETASONA 8 MG Y ONDANSETRON 4 MG IV\n'
      + '7. POSTOPERATORIO: VIGILAR HEMATOMA CERVICAL Y SIGNOS DE HIPOCALCEMIA\n\n'
      + 'ANALISIS: PACIENTE FEMENINA DE 49 AÑOS, ASA II (HTA CONTROLADA, OBESIDAD GRADO I), PROGRAMADA PARA TIROIDECTOMIA TOTAL. '
      + 'RIESGO CARDIOVASCULAR BAJO (LEE REVISADO CLASE I, NYHA I, > 10 METS), SIN NECESIDAD DE ESTUDIOS ADICIONALES. VIA AEREA SIN '
      + 'PREDICTORES DE DIFICULTAD (MALLAMPATI II, APERTURA ORAL > 3 CM, DTM 6-6,5 CM); LA DESVIACION TRAQUEAL LEVE Y EL CUELLO '
      + 'DE 40 CM O MAS JUSTIFICAN TENER VIDEOLARINGOSCOPIO DISPONIBLE. SE PLANEA ANESTESIA GENERAL BALANCEADA CON INTUBACION '
      + 'OROTRAQUEAL Y MONITORIA ESTANDAR ASA CON CAPNOGRAFIA. APTA PARA EL PROCEDIMIENTO CON LAS RECOMENDACIONES ANTERIORES.',
  },
  signosVitales: {
    estatura: '162', peso: '82', temperatura: '36.6', frecuenciaCardiaca: '72', frecuenciaRespiratoria: '16', sistolica: '124', diastolica: '78',
  },
  diagnosticos: {
    cie10: 'E042 - BOCIO MULTINODULAR NO TOXICO',
    cie11: '',
    tipoDx: 'confirmado-nuevo',
  },
};

const EVAPRE_REGISTRO_CLAUDIA = {
  id: 'evapre-claudia', fecha: '07.OCT.2026', hora: '09:30 AM', numero: '0201295702', tituloNota: 'EVALUACIÓN PREANESTESICA',
  autor: 'VARGAS LOZANO JUAN PABLO', rol: 'Médico', especialidad: 'ANESTESIOLOGÍA', ambito: 'QX', plantilla: 'EVAPRE',
  contenido: EVAPRE_CLAUDIA,
  archivoUrl: '/mock/evapre-0201295702.pdf',
  resumen:
    'Paciente femenina de 49 años, ASA II (HTA controlada, obesidad grado I), sin alergias, programada para tiroidectomía total '
    + 'con neuromonitoreo. Sin predictores de vía aérea difícil (Mallampati II, apertura oral > 3 cm, DTM 6-6,5 cm); bocio con '
    + 'desviación traqueal leve. Riesgo cardiovascular bajo (Lee revisado clase I, NYHA I, > 10 METs). Hemograma, coagulación, '
    + 'glicemia y creatinina normales; TSH 1,8, T4 libre 1,1 y calcio 9,4 normales. Plan: anestesia general balanceada con intubación '
    + 'orotraqueal, relajante de acción corta, suspender losartán 24 h antes y profilaxis de NVPO. Apta para el procedimiento.',
};

const EVAPRE_POR_DOCUMENTO = {
  1048291: [EVAPRE_REGISTRO_MARIA_FERNANDA],
  31902576: [EVAPRE_REGISTRO_CLAUDIA],
};

// Registros EVAPRE de un paciente (más reciente primero), por número de
// documento con o sin puntos ("31.902.576").
export function getEvapreRegistros(numeroDocumento) {
  const documento = Number(String(numeroDocumento ?? '').replace(/\D/g, ''));
  return EVAPRE_POR_DOCUMENTO[documento] ?? [];
}
