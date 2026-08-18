import './TriageBadge.css';
import { TRIAGE_LABEL } from '@/hooks/Admisiones/mockAdmisionesData';

// Círculo relleno (no tinte + texto como el resto de badges del proyecto):
// es el mismo lenguaje visual de un triage físico (pulsera/ficha de color),
// así que el color sí es el protagonista acá — pero nunca es la única
// señal: el número (o el guion de "sin clasificar") ya es texto dentro del
// círculo, y `aria-label`/`title` llevan la etiqueta completa para lector de
// pantalla y hover (mismo criterio "nunca solo color" del resto de badges,
// ver AGENTS.md, solo que aplicado con número en vez de ícono).
export default function TriageBadge({ level }) {
  const cls = level ? `triage-dot triage-${level}` : 'triage-dot triage-none';
  const label = level ? TRIAGE_LABEL[level] : TRIAGE_LABEL.none;
  return (
    <span className={cls} title={label} aria-label={`Triage: ${label}`}>
      {level ?? '–'}
    </span>
  );
}
