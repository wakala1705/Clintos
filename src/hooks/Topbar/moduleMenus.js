import {
  LuActivity, LuCalendarDays, LuCalendarPlus, LuClipboardCheck, LuFileInput, LuFileText,
  LuHeartPulse, LuHistory, LuLayoutGrid, LuMessagesSquare, LuPackage, LuReceipt,
  LuSyringe, LuUsers,
} from 'react-icons/lu';

// Páginas de cada módulo para el dropdown del breadcrumb (Topbar). La clave es
// el label del nivel `section` que pasa cada pantalla. Espeja los subitems del
// Sidebar -- si se agrega una página al módulo, va en los dos. Solo páginas con
// ruta real: los subitems del Sidebar sin pantalla todavía (Reasignación de
// Citas, Cartera, Tesorería...) no se listan.
export const MODULE_MENUS = {
  'Consulta Externa': [
    { id: 'asignacion-citas', label: 'Asignación de citas', href: '/asignacion-citas', icon: LuCalendarDays },
    { id: 'programar-cita', label: 'Programar cita', href: '/programar-cita', icon: LuCalendarPlus },
    { id: 'historias-clinicas', label: 'Historias Clínicas', href: '/historia-clinica', icon: LuFileText },
    { id: 'pacientes', label: 'Pacientes', href: '/lista-pacientes', icon: LuUsers },
    { id: 'pyms', label: 'PyMS', href: '/vacunacion', icon: LuSyringe },
  ],
  'Hospitalización': [
    { id: 'historia-clinica', label: 'Historia Clínica', href: '/hospitalizacion/historia-clinica', icon: LuFileText },
    { id: 'gestion-enfermeria', label: 'Gestión de Enfermería', href: '/gestion-enfermeria', icon: LuHeartPulse },
    { id: 'triage', label: 'Triage', href: '/hospitalizacion/triage', icon: LuActivity },
    { id: 'admisiones', label: 'Admisiones', href: '/admisiones', icon: LuClipboardCheck },
    { id: 'interconsulta', label: 'Interconsulta', href: '/hospitalizacion/interconsulta', icon: LuMessagesSquare },
  ],
  'Cirugía': [
    { id: 'gestion', label: 'Gestión de cirugías', href: '/cirugia/gestion', icon: LuClipboardCheck },
    { id: 'panel', label: 'Panel general', href: '/cirugia', icon: LuLayoutGrid },
    { id: 'programacion', label: 'Programación', href: '/cirugia/programacion', icon: LuCalendarDays },
    { id: 'canastas', label: 'Canastas', href: '/cirugia/canastas', icon: LuPackage },
  ],
  'Finanzas': [
    { id: 'facturas', label: 'Facturas', href: '/facturas', icon: LuReceipt },
    { id: 'trazabilidad', label: 'Trazabilidad', href: '/trazabilidad', icon: LuHistory },
  ],
  'Inventario': [
    { id: 'salidas', label: 'Salidas asistenciales', href: '/insumos-farmacia/solicitudes', icon: LuFileText },
    { id: 'entradas', label: 'Entradas asistenciales', href: '/insumos-farmacia/entradas', icon: LuFileInput },
  ],
};
