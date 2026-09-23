// Fuente única de las 4 sugerencias contextuales + 6 preguntas frecuentes del
// panel Clintos AI en Historia Clínica - Hospitalización. Un solo array por
// sección: SuggestionsSection/FaqSection lo usan para renderizar las cards, y
// clintosAiEngine.js lo usa para reconocer el prompt exacto cuando el usuario
// hace click (evita mantener el mismo texto duplicado en 3 archivos).
import {
  LuActivity, LuArrowRightLeft, LuClipboardList, LuFileText, LuFlaskConical, LuLogOut, LuStethoscope, LuUsers,
} from 'react-icons/lu';

export const SUGGESTIONS = [
  { id: 'resumir-pendientes', icon: LuClipboardList, label: 'Resumir pacientes con pendientes' },
  { id: 'resultados-criticos', icon: LuFlaskConical, label: 'Mostrar resultados críticos nuevos' },
  { id: 'crear-evoluciones', icon: LuFileText, label: 'Crear notas de evolución pendientes' },
  { id: 'altas-probables', icon: LuLogOut, label: 'Identificar pacientes para posible alta' },
];

export const FAQ_PROMPTS = [
  { id: 'cuantos-pacientes', icon: LuUsers, label: '¿Cuántos pacientes hay en este piso?' },
  { id: 'evolucion-pendiente', icon: LuActivity, label: 'Muéstrame los pacientes con evolución pendiente' },
  { id: 'criticos-hoy', icon: LuFlaskConical, label: '¿Qué resultados críticos hay hoy?' },
  { id: 'estado-paciente', icon: LuStethoscope, label: 'Explícame el estado de un paciente' },
  { id: 'ordenes-firmar', icon: LuClipboardList, label: '¿Qué órdenes están pendientes por firmar?' },
  { id: 'navegar-modulo', icon: LuArrowRightLeft, label: 'Navegar a otro módulo' },
];
