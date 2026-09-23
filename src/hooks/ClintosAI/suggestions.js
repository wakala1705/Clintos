// Fuente única de las acciones/preguntas del panel Clintos AI en Historia
// Clínica - Hospitalización. Un solo array por sección: SuggestionsSection/
// FaqSection lo usan para renderizar las cards, y clintosAiEngine.js lo usa
// para reconocer el prompt exacto cuando el usuario hace click (evita
// mantener el mismo texto duplicado en 3 archivos).
//
// Segunda iteración (encargo explícito): "Sugerencias para esta pantalla" +
// "También puedes preguntarme" pasan a "Acciones sugeridas" (tareas que
// Clintos AI puede EJECUTAR) y "Pregúntame" (preguntas de solo consulta) —
// separación por tipo de capacidad, no por origen de la pregunta. Máximo 4
// visibles en cada una (regla 17 del brief, "la pantalla inicial debe seguir
// siendo simple").
import {
  LuActivity, LuClipboardList, LuFileText, LuFlaskConical, LuLogOut, LuPill, LuStethoscope,
} from 'react-icons/lu';

export const SUGGESTIONS = [
  { id: 'resumir-pendientes', icon: LuClipboardList, label: 'Resumir pacientes con pendientes' },
  { id: 'resultados-criticos', icon: LuFlaskConical, label: 'Mostrar resultados críticos nuevos' },
  { id: 'preparar-evoluciones', icon: LuFileText, label: 'Preparar borradores de evolución' },
  { id: 'altas-probables', icon: LuLogOut, label: 'Identificar posibles altas' },
];

// Sin "¿Cuántos pacientes hay en este piso?" ni "Navegar a otro módulo"
// (encargos explícitos, ver bitácora): el primero ya está en el KPI "Mis
// pacientes" del dashboard, el segundo no entra en el tope de 4 preguntas de
// la segunda iteración. `clintosAiEngine.js` sigue pudiendo responder ambas
// si alguien las escribe en el composer — solo se quitan de la lista
// sugerida.
//
// Recortado a 3 (encargo explícito, "solo preguntas de ejemplo"): se quitó
// "¿Qué órdenes están pendientes por firmar?" — `clintosAiEngine.js` sigue
// respondiéndola igual si se escribe en el composer, solo deja de ser una
// card sugerida.
export const FAQ_PROMPTS = [
  { id: 'evolucion-pendiente', icon: LuActivity, label: 'Muéstrame los pacientes con evolución pendiente' },
  { id: 'criticos-hoy', icon: LuFlaskConical, label: '¿Qué resultados críticos hay hoy?' },
  { id: 'estado-paciente', icon: LuStethoscope, label: 'Explícame el estado de un paciente' },
];

// Acciones sugeridas cuando hay un paciente seleccionado en la tabla (ver
// AGENTS.md/brief "Contexto dinámico") — reemplazan a SUGGESTIONS mientras
// dura la selección, siempre sobre ESE paciente puntual, no sobre todo el
// piso. "Ver medicamentos" no tiene dato real en el mock (PACIENTES_PISO no
// trae medicación) — responde con el fallback honesto de siempre, nunca
// inventa un esquema; queda igual la card porque el punto es demostrar que
// la IA es contextual, no que ya cubre esa fuente de datos.
export const PATIENT_SUGGESTIONS = [
  { id: 'resumir-evolucion', icon: LuActivity, label: 'Resumir evolución' },
  { id: 'ver-ordenes', icon: LuClipboardList, label: 'Ver órdenes pendientes' },
  { id: 'revisar-resultados', icon: LuFlaskConical, label: 'Revisar resultados' },
  { id: 'ver-medicamentos', icon: LuPill, label: 'Ver medicamentos' },
];
