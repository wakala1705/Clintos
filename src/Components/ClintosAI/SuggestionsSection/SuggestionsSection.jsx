import './SuggestionsSection.css';
import { SUGGESTIONS } from '@/hooks/ClintosAI/suggestions';

// "Sugerencias para esta pantalla" — 4 acciones rápidas contextuales a
// Historia Clínica - Hospitalización (ver suggestions.js, única fuente
// compartida con el matcher de clintosAiEngine.js).
//
// `layout="row"` (solo FullscreenWelcome.jsx, bienvenida de Pantalla
// completa): mismas cards, en fila centrada en vez de grilla 2x2 — ver
// SuggestionsSection.css.
export default function SuggestionsSection({ onSelect, layout = 'grid' }) {
  return (
    <div className="cai-suggestions">
      <h4 className="cai-section-title">Sugerencias para esta pantalla</h4>
      <div className={`cai-suggestions-grid${layout === 'row' ? ' cai-suggestions-grid--row' : ''}`}>
        {SUGGESTIONS.map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" className="cai-suggestion-card" onClick={() => onSelect(label)}>
            <span className="cai-card-icon"><Icon className="icon" aria-hidden="true" /></span>
            <span className="cai-card-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
