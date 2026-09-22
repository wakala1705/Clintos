// Datos simulados de "Registros" (grupos de notas clínicas) para la pestaña
// Historia clínica de AtencionPaciente — solo LAYOUT, sin backend real (ver
// AGENTS.md/prompt de esta pantalla): getRegistrosGrupos() busca por
// documento en un mapa fijo. Un paciente sin entrada en el mapa (ej. María
// Fonseca) devuelve un arreglo vacío, que es justo lo que ejercita el estado
// vacío del panel de Registros.

const REGISTROS_BY_DOCUMENTO = {
  // Isabella Daniela Rodríguez Paternina — mismo documento que el paciente
  // demo de Gestión de Enfermería (ver mockAgendaData.js, cita id 8).
  '1234567890': [
    {
      tipo: 'EVO',
      estado: 'Activa',
      registros: [
        { id: 'evo-1', fecha: '17.ABR.2026', hora: '08:35 AM', numero: '0201295601', tituloNota: 'NOTA DE EVOLUCIÓN', autor: 'CAMILO GRONDONA', rol: 'Médico', especialidad: 'MEDICINA GENERAL', ambito: 'QX', plantilla: 'EVO' },
        { id: 'evo-2', fecha: '16.ABR.2026', hora: '02:10 PM', numero: '0201295602', tituloNota: 'NOTA DE EVOLUCIÓN', autor: 'CAMILO GRONDONA', rol: 'Médico', especialidad: 'MEDICINA GENERAL', ambito: 'QX', plantilla: 'EVO' },
      ],
    },
    {
      tipo: 'NOTAS DE ENFERMERÍA',
      registros: [
        { id: 'ne-1', fecha: '17.ABR.2026', hora: '08:35 AM', numero: '0201295603', tituloNota: 'NOTA DE ENFERMERÍA', autor: 'Lopéz Pérez Carmen', rol: 'Enfermera', especialidad: 'ENFERMERÍA', ambito: 'QX' },
        { id: 'ne-2', fecha: '17.ABR.2026', hora: '04:13 AM', numero: '0201295604', tituloNota: 'NOTA DE ENFERMERÍA', autor: 'Lopéz Pérez Carmen', rol: 'Enfermera', especialidad: 'ENFERMERÍA', ambito: 'QX' },
      ],
    },
    {
      tipo: 'EVONU',
      registros: [
        { id: 'evonu-1', fecha: '15.ABR.2026', hora: '10:20 AM', numero: '0201295605', tituloNota: 'NOTA DE EVOLUCIÓN NUTRICIONAL', autor: 'Katherine Ospina', rol: 'Nutricionista', especialidad: 'NUTRICIÓN', ambito: 'QX', plantilla: 'EVONU' },
      ],
    },
    {
      tipo: 'EVOPSI',
      registros: [
        { id: 'evopsi-1', fecha: '14.ABR.2026', hora: '09:00 AM', numero: '0201295606', tituloNota: 'NOTA DE EVOLUCIÓN PSICOLÓGICA', autor: 'Andrés Felipe Rojas', rol: 'Psicólogo', especialidad: 'PSICOLOGÍA', ambito: 'QX', plantilla: 'EVOPSI' },
      ],
    },
  ],
};

export function getRegistrosGrupos(documento) {
  return REGISTROS_BY_DOCUMENTO[documento] || [];
}

// Hospitalización (/hospitalizacion/historia-clinica/[id]): los documentos
// de esos pacientes son ficticios y no están en REGISTROS_BY_DOCUMENTO, así
// que todos muestran el mismo set de registros de ejemplo de Isabella
// (EVO, NOTAS DE ENFERMERÍA, EVONU, EVOPSI) — igual que Consulta Externa —
// más los registros de plantillas de Hospitalización tomados de la captura
// del sistema legado (INGHOSP, HIC, INFOQX, ERICK, HCURG y una EVO más),
// hasta que haya registros reales por paciente. Todos los registros llevan
// `numero` (folio, ver .rg-subrow-numero en RegistrosPanel.jsx) — encargo
// explícito de sumarlo al resto de las cards, no solo a HCURG.
//
// Orden final (ver getRegistrosGruposHospitalizacion): EVO, HCURG, INFOQX
// (encargo explícito de ubicar ambos justo después de EVO, en ese orden,
// antes que el resto de grupos compartidos con Consulta Externa), NOTAS DE
// ENFERMERÍA, EVONU, EVOPSI, INGHOSP, HIC, ERICK.
const EVO_HOSPITALIZACION = {
  id: 'evo-h1', fecha: '18.SEP.2026', hora: '10:19 AM', numero: '0201295607', tituloNota: 'EVOLUCION',
  autor: 'MARTINEZ MORENO DIEGO FERNANDO', rol: 'Médico', especialidad: 'HEMATO-ONCOLOGÍA', ambito: 'QX', plantilla: 'EVO',
};

// HCURG e INFOQX (historia clínica de cirugía) van separados de
// GRUPOS_HOSPITALIZACION_EXTRA porque van justo después de EVO, no al final
// (ver getRegistrosGruposHospitalizacion).
const GRUPO_HCURG = {
  tipo: 'HCURG',
  registros: [
    {
      id: 'hcurg-1', fecha: '21.SEP.2026', hora: '04:37 PM', numero: '0201295619', tituloNota: 'HISTORIA CLINICA DE URGENCIAS',
      autor: 'PASTRANA JUAN ESTEBAN', rol: 'Médico', especialidad: 'CARDIOLOGÍA', ambito: 'QX', plantilla: 'HCURG',
      archivoUrl: '/mock/historia-clinica-urgencias-hcurg.pdf',
      // Texto fijo que muestra el botón "Resumen" del panel de detalle (ver
      // HistoriaClinicaTab.jsx) -- sin IA real, la "generación" es un delay
      // simulado que revela este mismo texto (mismo criterio que el resto
      // del mock: "solo pinta el front"). Condensa el detalle del PDF de
      // origen (motivo de consulta, antecedentes, hallazgos al examen
      // físico y plan de tratamiento). Único registro con este campo hoy —
      // el botón solo aparece cuando `registro.resumen` existe.
      resumen: 'Paciente con antecedente de resección anterior de recto + ileostomía (04/03/2026) y adenocarcinoma de la unión rectosigmoidea en manejo con QT adyuvante (CAPEOX, 2do ciclo 04/06/2026), que ingresa por sus propios medios acompañado de familiar por cuadro de 3 días de evolución de retracción del estoma de la ileostomía con ausencia de salida de materia fecal. Examen físico sin hallazgos agudos: abdomen blando y depresible con ileostomía sin débito, sin signos de compromiso neurológico (Glasgow 15/15) ni de perfusión distal. No trae ayudas diagnósticas previas. Sin reingreso reciente ni antecedentes familiares relevantes (niega). Plan de tratamiento registrado: "vom".',
    },
  ],
};

const GRUPO_INFOQX = {
  tipo: 'INFOQX',
  registros: [
    { id: 'infoqx-1', fecha: '21.SEP.2026', hora: '08:54 AM', numero: '0201295610', tituloNota: 'INFORME QUIRURGICO', autor: 'LOBATON RAMIREZ JOSE FERNANDO', rol: 'Médico', especialidad: 'HEMATO-ONCOLOGÍA', ambito: 'QX', plantilla: 'INFOQX' },
  ],
};

const GRUPOS_HOSPITALIZACION_EXTRA = [
  {
    tipo: 'INGHOSP',
    registros: [
      {
        id: 'inghosp-1', fecha: '21.SEP.2026', hora: '03:35 PM', numero: '0201295608', tituloNota: 'INGRESO A HOSPITALIZACION',
        autor: 'GUZMAN OSPINA RICARDO ANDRES', rol: 'Médico', especialidad: 'MEDICINA GENERAL', ambito: 'QX', plantilla: 'INGHOSP',
        archivoUrl: '/mock/ingreso-hospitalizacion-inghosp.pdf',
        // Mismo criterio que `resumen` en HCURG (ver arriba): texto fijo que
        // revela el botón "Resumen" tras el delay simulado. A diferencia de
        // HCURG, el PDF de origen de este ingreso trae motivo de
        // consulta/enfermedad actual/antecedentes sociales sin diligenciar
        // (quedaron como plantilla con "___" y bloques de revisión por
        // sistema repetidos) — el resumen refleja eso tal cual, sin inventar
        // hallazgos que el documento no trae.
        resumen: 'Paciente femenina de 65 años, ingresada con diagnóstico presuntivo de fiebre paratifoidea A (EPS Salud Total, régimen contributivo). El motivo de consulta y la enfermedad actual quedaron registrados como plantilla sin diligenciar. Niega reingreso reciente, así como antecedentes tóxicos, patológicos, oncológicos, quirúrgicos, farmacológicos, transfusionales, alérgicos y familiares. Antecedentes gineco-obstétricos y antecedentes social/económico sin diligenciar. La revisión por sistemas y la inspección general se registraron con el mismo texto de plantilla en todas las secciones, sin hallazgos específicos consignados.',
      },
    ],
  },
  {
    tipo: 'HIC',
    registros: [
      { id: 'hic-1', fecha: '21.SEP.2026', hora: '09:31 AM', numero: '0201295609', tituloNota: 'HISTORIA CLINICA DE INTERCONSULTA', autor: 'MARTINEZ MORENO DIEGO FERNANDO', rol: 'Médico', especialidad: 'HEMATO-ONCOLOGÍA', ambito: 'QX', plantilla: 'HIC' },
    ],
  },
  {
    tipo: 'ERICK',
    registros: [
      { id: 'erick-1', fecha: '18.SEP.2026', hora: '10:20 AM', numero: '0201295611', tituloNota: 'HISTORIA CLINICA-PRUEBAS', autor: 'MARTINEZ MORENO DIEGO FERNANDO', rol: 'Médico', especialidad: 'HEMATO-ONCOLOGÍA', ambito: 'QX', plantilla: 'ERICK' },
    ],
  },
];

export function getRegistrosGruposHospitalizacion() {
  const base = REGISTROS_BY_DOCUMENTO['1234567890'].map((grupo) => (
    grupo.tipo === 'EVO' ? { ...grupo, registros: [EVO_HOSPITALIZACION, ...grupo.registros] } : grupo
  ));
  // HCURG e INFOQX van justo después de EVO, no al final con el resto de
  // GRUPOS_HOSPITALIZACION_EXTRA (encargo explícito).
  const [evoGrupo, ...restoBase] = base;
  return [evoGrupo, GRUPO_HCURG, GRUPO_INFOQX, ...restoBase, ...GRUPOS_HOSPITALIZACION_EXTRA];
}
