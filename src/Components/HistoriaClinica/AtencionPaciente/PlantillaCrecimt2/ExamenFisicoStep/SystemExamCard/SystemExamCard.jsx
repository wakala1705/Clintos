'use client';

import { useId } from 'react';
import './SystemExamCard.css';

// Un sistema del examen físico (ver ExamenFisicoStep.jsx, 14 reusos — misma
// razón de extracción que TriStateField.jsx). 3 estados reales, no 2: `value`
// es `null` ("Sin registrar", el default) | 'normal' | 'anormal' — a
// propósito no colapsa "sin registrar" en "normal" para no asumir
// clínicamente que un campo que nadie diligenció es un hallazgo normal (ver
// encargo). El campo de hallazgos es progressive disclosure: solo aparece
// cuando el estado es 'anormal'.
export default function SystemExamCard({ label, value, onChange, descripcion, onDescripcionChange }) {
  const descriptionId = useId();

  return (
    <div className="ef-system-card">
      <div className="ef-system-head">
        <span className="ef-system-label">{label}</span>
        <div className="pf-toggle-group ef-system-toggle" role="group" aria-label={`Estado: ${label}`}>
          <button
            type="button"
            className={`pf-toggle-btn ef-toggle-sinregistrar${value == null ? ' active' : ''}`}
            aria-pressed={value == null}
            onClick={() => onChange(null)}
          >
            Sin registrar
          </button>
          <button
            type="button"
            className={`pf-toggle-btn ef-toggle-normal${value === 'normal' ? ' active' : ''}`}
            aria-pressed={value === 'normal'}
            onClick={() => onChange('normal')}
          >
            Normal
          </button>
          <button
            type="button"
            className={`pf-toggle-btn ef-toggle-anormal${value === 'anormal' ? ' active' : ''}`}
            aria-pressed={value === 'anormal'}
            onClick={() => onChange('anormal')}
          >
            Anormal
          </button>
        </div>
      </div>

      {value === 'anormal' && (
        <div className="form-field ef-system-desc">
          <label htmlFor={descriptionId}>Hallazgos / descripción</label>
          <textarea
            id={descriptionId}
            rows={2}
            value={descripcion}
            onChange={(e) => onDescripcionChange(e.target.value)}
            placeholder="Describe los hallazgos encontrados"
          />
        </div>
      )}
    </div>
  );
}
