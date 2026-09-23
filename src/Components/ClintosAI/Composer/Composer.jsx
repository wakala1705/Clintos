'use client';

import { useRef, useState } from 'react';
import './Composer.css';
import {
  LuMic, LuPaperclip, LuSendHorizontal, LuX,
} from 'react-icons/lu';

// Composer del panel — visible siempre en la parte inferior (brief "El input
// debe permanecer visualmente accesible en todo momento"). El adjunto es
// solo una afinidad visual (no hay backend que lo procese todavía): agrega
// un chip con el nombre del archivo, que se limpia al enviar.
//
// `variant="centered"` (solo lo usa FullscreenWelcome.jsx, bienvenida de
// Pantalla completa): mismo componente/lógica, look de barra de búsqueda
// elevada en vez de footer fijo — ver Composer.css.
//
// Botón de mic: placeholder deshabilitado para dictado por voz (encargo
// explícito, funcionalidad futura) — a diferencia del adjunto, este no tiene
// NINGÚN comportamiento simulado (ni chip ni estado local), así no aparenta
// estar activo cuando no lo está (mismo criterio de "sin afordancias muertas
// que parezcan vivas" ya aplicado al resto del panel).
export default function Composer({
  value, onChange, onSend, disabled, variant = 'bar',
}) {
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const canSend = value.trim().length > 0 && !disabled;

  function handleSend() {
    if (!canSend) return;
    onSend(value.trim());
    setAttachment(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={`cai-composer${variant === 'centered' ? ' cai-composer--centered' : ''}`}>
      {attachment && (
        <div className="cai-attachment-chip">
          <span>{attachment}</span>
          <button type="button" onClick={() => setAttachment(null)} aria-label="Quitar archivo adjunto">
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="cai-composer-row">
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
            onChange={(e) => setAttachment(e.target.files?.[0]?.name ?? null)}
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
            <LuSendHorizontal className="icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
