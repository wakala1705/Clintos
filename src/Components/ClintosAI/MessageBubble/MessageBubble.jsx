import './MessageBubble.css';

// Turno de texto simple, de usuario o de Clintos AI. Deliberadamente sin
// estética de "burbuja de chat" (brief: "evitar interfaces tipo ChatGPT
// genérico") — el turno del usuario es una línea alineada a la derecha, la
// respuesta del asistente es texto de párrafo normal dentro del panel.
export default function MessageBubble({ role, text, tone, typing = false }) {
  if (role === 'user') {
    return <p className="cai-msg-user">{text}</p>;
  }
  if (typing) {
    return (
      <p className="cai-msg-typing" aria-live="polite" aria-label="Kora está escribiendo">
        <span className="cai-typing-dot" />
        <span className="cai-typing-dot" />
        <span className="cai-typing-dot" />
      </p>
    );
  }
  return <p className={`cai-msg-assistant${tone ? ` tone-${tone}` : ''}`}>{text}</p>;
}
