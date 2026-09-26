// Etiqueta de cada nivel de triage (escala de 5 prioridades). La consumen
// @/Components/TriageBadge (título/aria-label del círculo) y las features que
// muestran el nivel como texto (Admisiones, Triage).
export const TRIAGE_LABEL = {
  1: 'Prioridad 1 · Resucitación (crítico)',
  2: 'Prioridad 2 · Emergencia',
  3: 'Prioridad 3 · Urgente',
  4: 'Prioridad 4 · Menos urgente',
  5: 'Prioridad 5 · No urgente',
  none: 'Sin clasificar',
};
