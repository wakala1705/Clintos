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
        { id: 'evo-1', fecha: '17.ABR.2026', hora: '08:35 AM', tituloNota: 'NOTA DE EVOLUCIÓN', autor: 'Manuel Hernández', rol: 'Médico' },
        { id: 'evo-2', fecha: '16.ABR.2026', hora: '02:10 PM', tituloNota: 'NOTA DE EVOLUCIÓN', autor: 'Manuel Hernández', rol: 'Médico' },
      ],
    },
    {
      tipo: 'NOTAS DE ENFERMERÍA',
      registros: [
        { id: 'ne-1', fecha: '17.ABR.2026', hora: '08:35 AM', tituloNota: 'NOTA DE ENFERMERÍA', autor: 'Lopéz Pérez Carmen', rol: 'Enfermera' },
        { id: 'ne-2', fecha: '17.ABR.2026', hora: '04:13 AM', tituloNota: 'NOTA DE ENFERMERÍA', autor: 'Lopéz Pérez Carmen', rol: 'Enfermera' },
      ],
    },
    {
      tipo: 'EVONU',
      registros: [
        { id: 'evonu-1', fecha: '15.ABR.2026', hora: '10:20 AM', tituloNota: 'NOTA DE EVOLUCIÓN NUTRICIONAL', autor: 'Katherine Ospina', rol: 'Nutricionista' },
      ],
    },
    {
      tipo: 'EVOPSI',
      registros: [
        { id: 'evopsi-1', fecha: '14.ABR.2026', hora: '09:00 AM', tituloNota: 'NOTA DE EVOLUCIÓN PSICOLÓGICA', autor: 'Andrés Felipe Rojas', rol: 'Psicólogo' },
      ],
    },
  ],
};

export function getRegistrosGrupos(documento) {
  return REGISTROS_BY_DOCUMENTO[documento] || [];
}
