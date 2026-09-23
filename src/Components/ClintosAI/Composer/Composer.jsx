'use client';

import { useRef } from 'react';
import './Composer.css';
import {
  LuArrowUp, LuFileText, LuMic, LuPaperclip, LuX,
} from 'react-icons/lu';

// Extensión en mayúsculas ("PDF", "XLSX") para la card de adjunto — derivada
// del nombre real del archivo elegido (nunca inventada), mismo criterio
// honesto que el resto del mock: si no hay extensión, no se muestra nada en
// vez de un "ARCHIVO" genérico inventado.
function extensionLabel(filename) {
  const dot = filename.lastIndexOf('.');
  if (dot <= 0 || dot === filename.length - 1) return null;
  return filename.slice(dot + 1).toUpperCase();
}

// Composer del panel — visible siempre en la parte inferior (brief "El input
// debe permanecer visualmente accesible en todo momento"). `attachment`/
// `onAttachmentChange` controlado desde ClintosAIPanel.jsx (no estado local
// acá): el nombre del archivo también viaja a clintosAiEngine.answerPrompt
// para el flujo de "Generar informe gerencial" en `generalContext` (ver
// GENERAL_SUGGESTIONS/buildInformeGerencial) — dejó de ser solo una afinidad
// visual, así que el estado tiene que sobrevivir a que el envío se dispare
// desde afuera (una card de sugerencia), no solo desde este componente. Se
// limpia al enviar, sin importar si esa pregunta puntual lo usó o no (mismo
// criterio que ya tenía cuando era decorativo).
//
// `variant="centered"` (solo lo usa FullscreenWelcome.jsx, bienvenida de
// Pantalla completa): mismo componente/lógica, look de barra de búsqueda
// elevada en vez de footer fijo — ver Composer.css.
//
// Botón de mic: placeholder deshabilitado para dictado por voz (encargo
// explícito, funcionalidad futura) — a diferencia del adjunto, este no tiene
// NINGÚN comportamiento simulado, así no aparenta estar activo cuando no lo
// está (mismo criterio de "sin afordancias muertas que parezcan vivas" ya
// aplicado al resto del panel).
export default function Composer({
  value, onChange, onSend, disabled, variant = 'bar', attachment, onAttachmentChange,
}) {
  const fileInputRef = useRef(null);
  const canSend = value.trim().length > 0 && !disabled;

  function handleSend() {
    if (!canSend) return;
    onSend(value.trim());
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={`cai-composer${variant === 'centered' ? ' cai-composer--centered' : ''}`}>
      <div className="cai-composer-row">
        {attachment && (
          <div className="cai-attachment-chip">
            <span className="cai-attachment-chip-icon">
              <LuFileText className="icon" aria-hidden="true" />
            </span>
            <span className="cai-attachment-chip-info">
              <span className="cai-attachment-chip-name">{attachment}</span>
              {extensionLabel(attachment) && <span className="cai-attachment-chip-type">{extensionLabel(attachment)}</span>}
            </span>
            <button
              type="button"
              className="cai-attachment-chip-remove"
              onClick={() => onAttachmentChange(null)}
              aria-label="Quitar archivo adjunto"
            >
              <LuX className="icon" aria-hidden="true" />
            </button>
          </div>
        )}
        <textarea
          className="cai-composer-input"
          placeholder="Escribe tu pregunta o solicita una tarea..."
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Escribe tu pregunta o solicita una tarea para Kora"
        />
        <div className="cai-composer-controls">
          <button
            type="button"
            className="cai-composer-attach"
            aria-label="Adjuntar archivo"
            onClick={() => fileInputRef.current?.click()}
          >
            <LuPaperclip className="icon" aria-hidden="true" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            onChange={(e) => onAttachmentChange(e.target.files?.[0]?.name ?? null)}
          />
          <button
            type="button"
            className="cai-composer-mic"
            disabled
            aria-label="Dictado por voz (próximamente)"
            title="Dictado por voz (próximamente)"
          >
            <LuMic className="icon" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="cai-composer-send"
            disabled={!canSend}
            onClick={handleSend}
            aria-label="Enviar"
          >
            <LuArrowUp className="icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
