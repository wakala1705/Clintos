import './TipoBadge.css';
import { TIPO_LABEL } from '@/hooks/HistoriaClinica/mockAgendaData';

export default function TipoBadge({ tipo }) {
  return (
    <span className={`tipo-badge ${tipo}`}>
      <span className="dot"></span>
      {TIPO_LABEL[tipo]}
    </span>
  );
}
