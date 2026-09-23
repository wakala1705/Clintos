import './NavOptionsCard.css';
import Button from '@/Components/Button/Button';
import { LuArrowRight } from 'react-icons/lu';

// Capacidad NAVEGAR: accesos directos a otros módulos, siempre una acción de
// solo-lectura de la interfaz (navegar no es una acción clínica), así que no
// pasa por confirmación — a diferencia de ConfirmActionCard.
export default function NavOptionsCard({ text, options, onNavigate }) {
  return (
    <div className="cai-nav">
      <p className="cai-msg-assistant">{text}</p>
      <div className="cai-inline-actions">
        {options.map((opt) => (
          <Button key={opt.href} variant="outline" size="sm" icon={LuArrowRight} onClick={() => onNavigate(opt.href)}>
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
