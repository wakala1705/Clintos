'use client';

import { useEffect, useRef, useState } from 'react';
import './ClintosAIPanel.css';
import PanelHeader from '../PanelHeader/PanelHeader';
import WelcomeState from '../WelcomeState/WelcomeState';
import SuggestionsSection from '../SuggestionsSection/SuggestionsSection';
import FaqSection from '../FaqSection/FaqSection';
import FullscreenWelcome from '../FullscreenWelcome/FullscreenWelcome';
import ConversationView from '../ConversationView/ConversationView';
import Composer from '../Composer/Composer';
import SafetyFooter from '../SafetyFooter/SafetyFooter';
import { answerPrompt, confirmResultPayload } from '@/hooks/ClintosAI/clintosAiEngine';

const THINKING_DELAY_MS = 550;

// Panel abierto de Clintos AI (STATE 02-06). Dueño de toda la conversación:
// cada pregunta (sugerencia, FAQ, texto libre o click en un paciente de un
// resultado) pasa por el mismo camino — pushUserTurn -> "escribiendo..." ->
// reemplazo por la respuesta real de clintosAiEngine.answerPrompt — así el
// estado nunca se puede quedar mostrando dos respuestas para una pregunta.
export default function ClintosAIPanel({
  onClose, userFirstName, pacientes, areaLabel, onOpenHistoria, onNavigate, layoutMode, onLayoutModeChange,
}) {
  const [turns, setTurns] = useState([]);
  const [composerValue, setComposerValue] = useState('');
  const [thinking, setThinking] = useState(false);
  const nextId = useRef(0);
  const bodyRef = useRef(null);

  // Solo baja el scroll una vez que hay conversación — sin el guard,
  // este efecto también corre al montar con `turns` vacío y empuja el
  // saludo inicial (STATE 02) fuera de la vista si el contenido de
  // bienvenida+sugerencias ya excede el alto del panel.
  useEffect(() => {
    if (turns.length > 0 && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [turns]);

  function newId() {
    nextId.current += 1;
    return nextId.current;
  }

  function ask(promptText) {
    const userTurn = { id: newId(), role: 'user', payload: { text: promptText } };
    const typingTurn = { id: newId(), role: 'assistant', typing: true, payload: { kind: 'text' } };
    setTurns((prev) => [...prev, userTurn, typingTurn]);
    setThinking(true);

    setTimeout(() => {
      const response = answerPrompt(promptText, { pacientes, areaLabel });
      setTurns((prev) => prev.map((t) => (t.id === typingTurn.id
        ? { id: typingTurn.id, role: 'assistant', payload: response }
        : t)));
      setThinking(false);
    }, THINKING_DELAY_MS);
  }

  function handleSend(text) {
    setComposerValue('');
    ask(text);
  }

  function handleSelectPatient(_id, nombre) {
    ask(`Resumen de ${nombre}`);
  }

  function handleConfirmAction(turnId, count) {
    setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, resolved: true } : t)));
    setTurns((prev) => [...prev, { id: newId(), role: 'assistant', payload: confirmResultPayload(count) }]);
  }

  function handleCancelAction(turnId) {
    setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, resolved: true } : t)));
    setTurns((prev) => [...prev, {
      id: newId(), role: 'assistant', payload: { kind: 'text', text: 'Entendido, no se creó ningún borrador.' },
    }]);
  }

  // "Nuevo chat": descarta la conversación actual y vuelve a STATE 02
  // (bienvenida + sugerencias) — no hay historial persistente que guardar
  // todavía (ver PanelHeader.jsx), así que reiniciar es simplemente vaciar
  // el estado local.
  function handleNewChat() {
    setTurns([]);
    setComposerValue('');
    setThinking(false);
  }

  const hasConversation = turns.length > 0;
  // Bienvenida centrada tipo "chats tradicionales" (encargo explícito, solo
  // Pantalla completa) — apenas hay conversación se vuelve al layout normal
  // en los 3 modos (ConversationView + composer fijo abajo), ver
  // FullscreenWelcome.jsx.
  const isFullscreenWelcome = layoutMode === 'fullscreen' && !hasConversation;

  return (
    <section className={`cai-panel cai-panel--${layoutMode}`} role="dialog" aria-labelledby="clintos-ai-title">
      <PanelHeader
        onClose={onClose}
        layoutMode={layoutMode}
        onLayoutModeChange={onLayoutModeChange}
        onNewChat={handleNewChat}
        hasConversation={hasConversation}
      />

      {isFullscreenWelcome ? (
        <FullscreenWelcome
          userFirstName={userFirstName}
          composerValue={composerValue}
          onComposerChange={setComposerValue}
          onSend={handleSend}
          thinking={thinking}
          onSuggestionSelect={ask}
        />
      ) : (
        <>
          <div className="cai-body" ref={bodyRef}>
            {!hasConversation && (
              <>
                <WelcomeState userFirstName={userFirstName} />
                <SuggestionsSection onSelect={ask} />
                <FaqSection onSelect={ask} />
              </>
            )}
            {hasConversation && (
              <ConversationView
                turns={turns}
                onSelectPatient={handleSelectPatient}
                onOpenHistoria={onOpenHistoria}
                onConfirmAction={handleConfirmAction}
                onCancelAction={handleCancelAction}
                onNavigate={onNavigate}
              />
            )}
          </div>

          <Composer value={composerValue} onChange={setComposerValue} onSend={handleSend} disabled={thinking} />
        </>
      )}

      <SafetyFooter />
    </section>
  );
}
