'use client';

import { useId, useState } from 'react';
import './RecomendacionCard.css';

// Una card de recomendación (ver RecomendacionesStep.jsx, 8 reusos). El
// checkbox representa "esta recomendación fue indicada al cuidador"
// (encargo explícito — no un simple indicador de "campo diligenciado"), por
// eso vive dentro de un <label> junto al título: marcar cualquiera de los
// dos selecciona la recomendación completa (target de clic más grande,
// WCAG). 3 estados visuales reales: sin seleccionar (borde neutro, sin
// textarea montado — "oculto", no solo deshabilitado, ver encargo),
// seleccionada (borde + fondo primary-tinted) y seleccionada+en edición
// (aro de foco reforzado). `isEditing` es estado local ligado al foco real
// del textarea, no un :focus-within en CSS — así el aro solo aparece
// mientras el profesional está escribiendo, no con cualquier foco dentro de
// la card (p. ej. el propio checkbox).
export default function RecomendacionCard({ label, checked, onCheckedChange, contenido, onContenidoChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const checkboxId = useId();
  const hintId = useId();
  const textareaId = useId();

  return (
    <div className={`rc-card${checked ? ' checked' : ''}${isEditing ? ' editing' : ''}`}>
      <label className="rc-card-header" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          type="checkbox"
          className="rc-checkbox"
          checked={checked}
          aria-describedby={hintId}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <span className="rc-card-title">{label}</span>
      </label>
      <span id={hintId} className="sr-only">Esta recomendación fue indicada al cuidador</span>

      {checked && (
        <div className="rc-card-body">
          <label htmlFor={textareaId} className="sr-only">Contenido de la recomendación: {label}</label>
          <textarea
            id={textareaId}
            className="rc-textarea"
            value={contenido}
            placeholder="Escribe o ajusta el contenido de esta recomendación..."
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onChange={(e) => onContenidoChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
