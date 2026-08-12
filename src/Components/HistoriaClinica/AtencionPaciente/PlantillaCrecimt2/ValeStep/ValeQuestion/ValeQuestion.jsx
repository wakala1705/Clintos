'use client';

import './ValeQuestion.css';
import { LuCircleAlert } from 'react-icons/lu';

const OPCIONES_SI_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
];

// Unidad de pregunta reutilizable para las etapas de tamizaje real de VALE
// (Desarrollo C/E/I y Vestibular) — código C/E/I + texto completo de la
// pregunta (sin resumir ni modificar, ver encargo) + respuesta Sí/No como
// segmented control (reutiliza .pf-toggle-group, mismo control que
// TriStateField.jsx, no se inventa un control nuevo) + "Observación
// directa" en tratamiento secundario (checkbox .pf-check-row) para no
// competir visualmente con la pregunta principal.
export default function ValeQuestion({
  id, codigo, texto, valor, onValorChange,
  observacionDirecta, onObservacionDirectaChange, error, setNodeRef,
}) {
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  return (
    <div className={`vale-q${error ? ' has-error' : ''}${!codigo ? ' no-code' : ''}`} ref={setNodeRef}>
      <div className="vale-q-main">
        {codigo && <span className={`vale-q-code ${codigo.toLowerCase()}`} aria-hidden="true">{codigo}</span>}
        <p className="vale-q-text" id={labelId}>{texto}</p>
      </div>

      <div className="vale-q-controls">
        <div
          className="pf-toggle-group vale-q-answer"
          role="group"
          aria-labelledby={labelId}
          aria-describedby={error ? errorId : undefined}
        >
          {OPCIONES_SI_NO.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pf-toggle-btn${valor === opt.value ? ' active' : ''}`}
              aria-pressed={valor === opt.value}
              onClick={() => onValorChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <label className="pf-check-row vale-q-observacion">
          <input
            type="checkbox"
            checked={observacionDirecta}
            onChange={(e) => onObservacionDirectaChange(e.target.checked)}
          />
          Observación directa
        </label>
      </div>

      {error && (
        <span id={errorId} className="pf-field-error vale-q-error">
          <LuCircleAlert className="icon" aria-hidden="true" />
          Responde esta pregunta para continuar
        </span>
      )}
    </div>
  );
}
