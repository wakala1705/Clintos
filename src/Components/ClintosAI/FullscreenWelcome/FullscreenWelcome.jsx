'use client';

import { useState } from 'react';
import './FullscreenWelcome.css';
import { LuChevronDown, LuChevronUp, LuSparkles } from 'react-icons/lu';
import Composer from '../Composer/Composer';
import SuggestionsSection from '../SuggestionsSection/SuggestionsSection';
import FaqSection from '../FaqSection/FaqSection';

// Bienvenida de "Pantalla completa" — layout centrado tipo chat tradicional
// (encargo explícito, referencia: Home de Rovo): saludo + composer grande
// centrados, sugerencias en fila debajo, FAQ plegado bajo "Más sugerencias".
// Solo se monta cuando layoutMode==='fullscreen' && !hasConversation (ver
// ClintosAIPanel.jsx) — apenas hay conversación se vuelve al layout normal
// (ConversationView + composer fijo abajo), igual en los 3 modos de layout.
//
// Sin riel de "Tus chats" (decisión explícita): hoy no hay persistencia de
// conversaciones — "Nuevo chat" solo vacía el estado, no guarda nada — así
// que un listado de historial sería vacío o inventado. Si a futuro cada chat
// descartado se guarda en una lista, ese riel se agrega acá como una columna
// nueva a la izquierda de .cai-fs-center, sin tocar el resto de esta vista.
export default function FullscreenWelcome({
  userFirstName, composerValue, onComposerChange, onSend, thinking, onSuggestionSelect,
}) {
  const [showFaq, setShowFaq] = useState(false);

  return (
    <div className="cai-fs-welcome">
      <div className="cai-fs-center">
        <span className="cai-icon-circle cai-fs-avatar">
          <LuSparkles className="icon" aria-hidden="true" />
        </span>
        <h2 className="cai-fs-greeting">Hola, {userFirstName} 👋</h2>
        <p className="cai-fs-lead">Soy Clintos AI, tu asistente en hospitalización.</p>

        <div className="cai-fs-composer">
          <Composer
            value={composerValue}
            onChange={onComposerChange}
            onSend={onSend}
            disabled={thinking}
            variant="centered"
          />
        </div>

        <SuggestionsSection onSelect={onSuggestionSelect} layout="row" />

        <button type="button" className="cai-fs-more-toggle" onClick={() => setShowFaq((v) => !v)}>
          Más sugerencias
          {showFaq
            ? <LuChevronUp className="icon" aria-hidden="true" />
            : <LuChevronDown className="icon" aria-hidden="true" />}
        </button>
        {showFaq && <FaqSection onSelect={onSuggestionSelect} />}
      </div>
    </div>
  );
}
