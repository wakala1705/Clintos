import './FaqSection.css';
import { LuChevronRight, LuMessageCircle } from 'react-icons/lu';
import { FAQ_PROMPTS } from '@/hooks/ClintosAI/suggestions';

// "Pregúntame" (segunda iteración — antes "También puedes preguntarme") —
// preguntas de solo consulta, máximo 4 visibles (brief, regla 17). Cada una
// con ícono + texto + chevron (ver shared.css .cai-card-btn, reusado tal
// cual).
export default function FaqSection({ onSelect }) {
  return (
    <div className="cai-faq">
      <h4 className="cai-section-title"><LuMessageCircle className="icon" aria-hidden="true" /> Pregúntame</h4>
      <div className="cai-faq-list">
        {FAQ_PROMPTS.map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" className="cai-card-btn" onClick={() => onSelect(label)}>
            <span className="cai-card-icon"><Icon className="icon" aria-hidden="true" /></span>
            <span className="cai-card-label">{label}</span>
            <LuChevronRight className="cai-card-chevron" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
