import { LuFlag } from 'react-icons/lu';
import './PrioridadTag.css';
import Badge from '@/Components/Badge/Badge';

// Marca de prioridad de la solicitud: "Prioritaria" (con bandera) o "Normal".
// Siempre texto + ícono: la prioridad no depende solo del color.
export default function PrioridadTag({ prioritaria = false }) {
  if (!prioritaria) return <Badge tone="neutral">Normal</Badge>;
  return (
    <Badge tone="danger">
      <LuFlag className="pt-icon" aria-hidden="true" />
      Prioritaria
    </Badge>
  );
}
