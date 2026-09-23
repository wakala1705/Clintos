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
import { answerPrompt, buildDraftText, nombreVisible } from '@/hooks/ClintosAI/clintosAiEngine';
import { PATIENT_SUGGESTIONS } from '@/hooks/ClintosAI/suggestions';

const THINKING_DELAY_MS = 550;

// Panel abierto de Clintos AI (STATE 02-07). Dueño de toda la conversación:
// cada pregunta (sugerencia, FAQ, texto libre o click en un paciente de un
// resultado) pasa por el mismo camino — pushUserTurn -> "escribiendo..." ->
// reemplazo por la respuesta real de clintosAiEngine.answerPrompt — así el
// estado nunca se puede quedar mostrando dos respuestas para una pregunta.
export default function ClintosAIPanel({
  onClose, userFirstName, pacientes, areaLabel, onOpenHistoria, onNavigate, layoutMode, onLayoutModeChange,
  narrowViewport, selectedPaciente, screenLabel, onClearPaciente, externalAsk, onExternalAskHandled,
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

  // Compartida por ask() (calcula la respuesta con el motor mock) y el efecto
  // de `externalAsk` de abajo (ya trae la respuesta calculada afuera) — mismo
  // camino pushUserTurn -> "escribiendo..." -> reemplazo por la respuesta
  // real para las dos vías, así ninguna se puede quedar mostrando dos
  // respuestas para una pregunta.
  function pushTurnWithAnswer(promptText, getResponse) {
    const userTurn = { id: newId(), role: 'user', payload: { text: promptText } };
    const typingTurn = { id: newId(), role: 'assistant', typing: true, payload: { kind: 'text' } };
    setTurns((prev) => [...prev, userTurn, typingTurn]);
    setThinking(true);

    setTimeout(() => {
      const response = getResponse();
      setTurns((prev) => prev.map((t) => (t.id === typingTurn.id
        ? { id: typingTurn.id, role: 'assistant', payload: response }
        : t)));
      setThinking(false);
    }, THINKING_DELAY_MS);
  }

  function ask(promptText) {
    pushTurnWithAnswer(promptText, () => answerPrompt(promptText, { pacientes, areaLabel, selectedPaciente }));
  }

  // Botón "Resumen" de un registro en HistoriaClinicaTab.jsx (encargo
  // explícito: ese resumen ahora aparece acá en vez de inline en el
  // registro) — `externalAsk` ya trae la pregunta Y la respuesta calculadas
  // afuera (el texto real de `registro.resumen`, nunca inventado), así que
  // reusa pushTurnWithAnswer con una respuesta fija en vez de pasar por
  // answerPrompt. Avisa al padre (ClintosAI.jsx) que ya la consumió para que
  // no la vuelva a disparar en el próximo render.
  //
  // `handledExternalAskRef`: cuando `askExternal` abre el panel recién ahora
  // (estaba cerrado), ClintosAIPanel monta con `externalAsk` ya seteado en
  // las props — un efecto que corre al montar, y React StrictMode
  // (desarrollo) invoca dos veces todo efecto de montaje para detectar
  // justo este tipo de caso: sin esta guarda, la pregunta+respuesta se
  // duplicaba en la conversación (encontrado al verificar con Playwright).
  // La guarda hace el efecto idempotente por valor de `externalAsk`, no un
  // parche solo para StrictMode.
  const handledExternalAskRef = useRef(null);
  useEffect(() => {
    if (!externalAsk || externalAsk === handledExternalAskRef.current) return;
    handledExternalAskRef.current = externalAsk;
    pushTurnWithAnswer(externalAsk.prompt, () => ({ kind: 'text', text: externalAsk.response }));
    onExternalAskHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalAsk]);

  function handleSend(text) {
    setComposerValue('');
    ask(text);
  }

  // Nombre corto ("María González", no "María Fernanda González Restrepo")
  // en el turno de "usuario" — un click no es lo mismo que escribir una
  // pregunta larga (hallazgo de la auditoría UX, heurística 2).
  function handleSelectPatient(_id, nombre) {
    ask(`Resumen de ${nombreVisible(nombre)}`);
  }

  // `resolved` guarda el desenlace ('confirmed'/'cancelled'), no solo un
  // booleano — ConfirmActionCard lo usa para mostrar un estado final
  // distinto al de "esperando tu decisión" (mismo tono ámbar para ambos era
  // un hallazgo de la auditoría UX, heurística 1: visibilidad del estado del
  // sistema).
  //
  // Al confirmar, genera un borrador por paciente (STATE 07) — `items` ya
  // trae los pacientes completos (ver clintosAiEngine.confirmEvolucionesPayload),
  // así que buildDraftText tiene diagnóstico/pendientes reales para trabajar,
  // nunca inventa un dato que el mock no modele.
  function handleConfirmAction(turnId, items) {
    setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, resolved: 'confirmed' } : t)));
    const drafts = items.map((p) => ({
      id: p.id, nombre: p.paciente, cama: p.cama, texto: buildDraftText(p), saved: false,
    }));
    setTurns((prev) => [...prev, {
      id: newId(),
      role: 'assistant',
      payload: {
        kind: 'draft-list',
        intro: `Preparé ${drafts.length} ${drafts.length === 1 ? 'borrador' : 'borradores'} de evolución. Revísalos antes de guardarlos.`,
        drafts,
      },
    }]);
  }

  function handleCancelAction(turnId) {
    setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, resolved: 'cancelled' } : t)));
    setTurns((prev) => [...prev, {
      id: newId(), role: 'assistant', payload: { kind: 'text', text: 'Entendido, no se preparó ningún borrador.' },
    }]);
  }

  // Edición/guardado de un borrador puntual dentro de un turno 'draft-list'
  // — cada borrador guarda su propio estado (texto editado, guardado),
  // mismo criterio por-ítem que `resolved` en ConfirmActionCard.
  function handleChangeDraftText(turnId, draftId, texto) {
    setTurns((prev) => prev.map((t) => (t.id !== turnId ? t : {
      ...t,
      payload: { ...t.payload, drafts: t.payload.drafts.map((d) => (d.id === draftId ? { ...d, texto } : d)) },
    })));
  }

  function handleSaveDraft(turnId, draftId) {
    setTurns((prev) => prev.map((t) => (t.id !== turnId ? t : {
      ...t,
      payload: { ...t.payload, drafts: t.payload.drafts.map((d) => (d.id === draftId ? { ...d, saved: true } : d)) },
    })));
  }

  // "Nuevo chat" / "← Volver": descarta la conversación actual y vuelve a
  // STATE 02 (bienvenida + sugerencias) — no hay historial persistente que
  // guardar todavía (ver PanelHeader.jsx), así que reiniciar es simplemente
  // vaciar el estado local. Los dos controles del header disparan lo mismo.
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
  // "Barra lateral" se renderiza como "Flotante" en viewports angostos (ver
  // ClintosAI.jsx) — `layoutMode` (la elección real del usuario) sigue
  // viajando sin tocar hacia PanelHeader/LayoutSwitcher, así el check del
  // dropdown no miente sobre qué eligió.
  const effectiveLayoutMode = layoutMode === 'sidebar' && narrowViewport ? 'floating' : layoutMode;
  // Contexto dinámico (brief sección 12): con un paciente seleccionado en la
  // tabla, "Acciones sugeridas" pasa a las 4 acciones sobre ESE paciente.
  const suggestionItems = selectedPaciente ? PATIENT_SUGGESTIONS : undefined;
  // "Pregúntame" es un bloque general (preguntas de piso/pantalla completa,
  // no de un paciente puntual) — encargo explícito: se oculta apenas el
  // agente se vuelve contextual, derivado directo de `selectedPaciente` (no
  // un prop aparte que cada pantalla tenga que calcular) para que reaccione
  // solo al seleccionar/deseleccionar una fila (HistoriaClinicaHospitalizacion.jsx)
  // y quede oculto siempre en pantallas de contexto fijo (AtencionPaciente.jsx).
  const hideFaq = Boolean(selectedPaciente);

  return (
    <section className={`cai-panel cai-panel--${effectiveLayoutMode}`} role="dialog" aria-labelledby="clintos-ai-title">
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
          selectedPaciente={selectedPaciente}
          screenLabel={screenLabel}
          onClearPaciente={onClearPaciente}
          hideFaq={hideFaq}
        />
      ) : (
        <>
          <div className="cai-body" ref={bodyRef}>
            {!hasConversation && (
              <>
                <WelcomeState
                  userFirstName={userFirstName}
                  selectedPaciente={selectedPaciente}
                  screenLabel={screenLabel}
                  onClearPaciente={onClearPaciente}
                />
                <SuggestionsSection onSelect={ask} items={suggestionItems} />
                {!hideFaq && <FaqSection onSelect={ask} />}
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
                onChangeDraftText={handleChangeDraftText}
                onSaveDraft={handleSaveDraft}
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
