import './SuggestionsSection.css';
import { LuZap } from 'react-icons/lu';
import { SUGGESTIONS } from '@/hooks/ClintosAI/suggestions';

// "Acciones sugeridas" (segunda iteración — antes "Sugerencias para esta
// pantalla") — tareas que Clintos AI puede EJECUTAR, no solo consultas (ver
// suggestions.js, única fuente compartida con el matcher de
// clintosAiEngine.js). `items` por defecto son las 4 de pantalla completa;
// con un paciente seleccionado, ClintosAIPanel.jsx pasa PATIENT_SUGGESTIONS
// en su lugar (brief "Contexto dinámico") — mismo componente, otro dataset.
//
// `layout="row"` (solo FullscreenWelcome.jsx, bienvenida de Pantalla
// completa): mismas cards, en fila centrada en vez de grilla 2x2 — ver
// SuggestionsSection.css.
export default function SuggestionsSection({ onSelect, layout = 'grid', items = SUGGESTIONS }) {
  return (
    <div className="cai-suggestions">
      <h4 className="cai-section-title"><LuZap className="icon" aria-hidden="true" /> Acciones sugeridas</h4>
      <div className={`cai-suggestions-grid${layout === 'row' ? ' cai-suggestions-grid--row' : ''}`}>
        {items.map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" className="cai-suggestion-card" onClick={() => onSelect(label)}>
            <span className="cai-card-icon"><Icon className="icon" aria-hidden="true" /></span>
            <span className="cai-card-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
