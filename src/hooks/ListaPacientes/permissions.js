// TODO: reemplazar por el sistema real de roles/permisos cuando exista en el
// backend (hoy el proyecto no tiene ningún mecanismo de auth/roles — ver
// AGENTS.md/prompt de esta pantalla). Mientras tanto se simula un usuario con
// un rol fijo para poder condicionar la UI por rol sin hardcodear "todos
// pueden hacer todo".
export const CURRENT_USER_ROLE = 'admin_global';

const ROLES_CON_VISTA_MULTISEDE = ['admin_global'];
const ROLES_QUE_EDITAN_PACIENTE = ['admin_global', 'medico'];
const ROLES_QUE_INACTIVAN_PACIENTE = ['admin_global'];
const ROLES_CON_HISTORIA_CLINICA = ['admin_global', 'medico', 'enfermeria'];
const ROLES_QUE_AGENDAN_CITA = ['admin_global', 'medico', 'recepcion'];

// Admin global ve pacientes de todas las sedes (columna + filtro "Sede");
// el resto de roles ya viene restringido por backend a su propia sede, así
// que no necesitan verla.
export function canViewSede(role) {
  return ROLES_CON_VISTA_MULTISEDE.includes(role);
}

export function canEditPatient(role) {
  return ROLES_QUE_EDITAN_PACIENTE.includes(role);
}

export function canInactivatePatient(role) {
  return ROLES_QUE_INACTIVAN_PACIENTE.includes(role);
}

export function canViewHistoriaClinica(role) {
  return ROLES_CON_HISTORIA_CLINICA.includes(role);
}

export function canScheduleAppointment(role) {
  return ROLES_QUE_AGENDAN_CITA.includes(role);
}
