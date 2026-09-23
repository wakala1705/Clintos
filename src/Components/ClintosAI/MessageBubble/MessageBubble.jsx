import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MessageBubble.css';

// Turno de texto simple, de usuario o de Clintos AI. Deliberadamente sin
// estética de "burbuja de chat" (brief: "evitar interfaces tipo ChatGPT
// genérico") — el turno del usuario es una línea alineada a la derecha, la
// respuesta del asistente es texto de párrafo normal dentro del panel.
//
// Respuesta del asistente vía react-markdown+remark-gfm (encargo explícito:
// el informe gerencial de ejemplo en `generalContext` trae Markdown real —
// encabezados, negritas, tablas, líneas — ver buildInformeGerencial en
// clintosAiEngine.js). `<div>` en vez de `<p>` porque Markdown puede generar
// elementos de bloque (tablas, listas) que no son válidos dentro de un
// `<p>`; un texto plano de una sola línea (el resto de las respuestas del
// motor) igual renderiza como un único `<p>` interno, sin cambio visual.
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
  return (
    <div className={`cai-msg-assistant${tone ? ` tone-${tone}` : ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
