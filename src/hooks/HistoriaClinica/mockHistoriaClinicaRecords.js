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
        { id: 'evo-1', fecha: '17.ABR.2026', hora: '08:35 AM', tituloNota: 'NOTA DE EVOLUCIÓN', autor: 'CAMILO GRONDONA', rol: 'Médico', especialidad: 'MEDICINA GENERAL', ambito: 'QX', plantilla: 'EVO' },
        { id: 'evo-2', fecha: '16.ABR.2026', hora: '02:10 PM', tituloNota: 'NOTA DE EVOLUCIÓN', autor: 'CAMILO GRONDONA', rol: 'Médico', especialidad: 'MEDICINA GENERAL', ambito: 'QX', plantilla: 'EVO' },
      ],
    },
    {
      tipo: 'NOTAS DE ENFERMERÍA',
      registros: [
        { id: 'ne-1', fecha: '17.ABR.2026', hora: '08:35 AM', tituloNota: 'NOTA DE ENFERMERÍA', autor: 'Lopéz Pérez Carmen', rol: 'Enfermera', especialidad: 'ENFERMERÍA', ambito: 'QX' },
        { id: 'ne-2', fecha: '17.ABR.2026', hora: '04:13 AM', tituloNota: 'NOTA DE ENFERMERÍA', autor: 'Lopéz Pérez Carmen', rol: 'Enfermera', especialidad: 'ENFERMERÍA', ambito: 'QX' },
      ],
    },
    {
      tipo: 'EVONU',
      registros: [
        { id: 'evonu-1', fecha: '15.ABR.2026', hora: '10:20 AM', tituloNota: 'NOTA DE EVOLUCIÓN NUTRICIONAL', autor: 'Katherine Ospina', rol: 'Nutricionista', especialidad: 'NUTRICIÓN', ambito: 'QX', plantilla: 'EVONU' },
      ],
    },
    {
      tipo: 'EVOPSI',
      registros: [
        { id: 'evopsi-1', fecha: '14.ABR.2026', hora: '09:00 AM', tituloNota: 'NOTA DE EVOLUCIÓN PSICOLÓGICA', autor: 'Andrés Felipe Rojas', rol: 'Psicólogo', especialidad: 'PSICOLOGÍA', ambito: 'QX', plantilla: 'EVOPSI' },
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
// del sistema legado (INGHOSP, HIC, INFOQX, ERICK y una EVO más), hasta que
// haya registros reales por paciente.
const EVO_HOSPITALIZACION = {
  id: 'evo-h1', fecha: '18.SEP.2026', hora: '10:19 AM', tituloNota: 'EVOLUCION',
  autor: 'MARTINEZ MORENO DIEGO FERNANDO', rol: 'Médico', especialidad: 'HEMATO-ONCOLOGÍA', ambito: 'QX', plantilla: 'EVO',
};

const GRUPOS_HOSPITALIZACION_EXTRA = [
  {
    tipo: 'INGHOSP',
    registros: [
      { id: 'inghosp-1', fecha: '21.SEP.2026', hora: '03:35 PM', tituloNota: 'INGRESO A HOSPITALIZACION', autor: 'MEDICO3 MEDICO4 MEDICO1 MEDICO2', rol: 'Médico', especialidad: 'MEDICINA GENERAL', ambito: 'QX', plantilla: 'INGHOSP' },
    ],
  },
  {
    tipo: 'HIC',
    registros: [
      { id: 'hic-1', fecha: '21.SEP.2026', hora: '09:31 AM', tituloNota: 'HISTORIA CLINICA DE INTERCONSULTA', autor: 'MARTINEZ MORENO DIEGO FERNANDO', rol: 'Médico', especialidad: 'HEMATO-ONCOLOGÍA', ambito: 'QX', plantilla: 'HIC' },
    ],
  },
  {
    tipo: 'INFOQX',
    registros: [
      { id: 'infoqx-1', fecha: '21.SEP.2026', hora: '08:54 AM', tituloNota: 'INFORME QUIRURGICO', autor: 'LOBATON RAMIREZ JOSE FERNANDO', rol: 'Médico', especialidad: 'HEMATO-ONCOLOGÍA', ambito: 'QX', plantilla: 'INFOQX' },
    ],
  },
  {
    tipo: 'ERICK',
    registros: [
      { id: 'erick-1', fecha: '18.SEP.2026', hora: '10:20 AM', tituloNota: 'HISTORIA CLINICA-PRUEBAS', autor: 'MARTINEZ MORENO DIEGO FERNANDO', rol: 'Médico', especialidad: 'HEMATO-ONCOLOGÍA', ambito: 'QX', plantilla: 'ERICK' },
    ],
  },
];

export function getRegistrosGruposHospitalizacion() {
  const base = REGISTROS_BY_DOCUMENTO['1234567890'].map((grupo) => (
    grupo.tipo === 'EVO' ? { ...grupo, registros: [EVO_HOSPITALIZACION, ...grupo.registros] } : grupo
  ));
  return [...base, ...GRUPOS_HOSPITALIZACION_EXTRA];
}
