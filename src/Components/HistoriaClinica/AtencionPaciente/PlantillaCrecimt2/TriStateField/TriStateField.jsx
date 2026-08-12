'use client';

import { useId } from 'react';
import './TriStateField.css';

const DEFAULT_OPTIONS = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'nosabe', label: 'No sabe' },
];

// Toggle Sí/No/No sabe (o Sí/No, ver "options") con campo de descripción de
// progressive disclosure — reutilizado 9 veces en AntecedentesContent.jsx
// (8 condiciones de Antecedentes familiares + Otros antecedentes), la razón
// por la que se extrajo como componente propio en vez de repetir el markup.
export default function TriStateField({
  label,
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  showDescription = false,
  descriptionValue = '',
  onDescriptionChange,
  descriptionLabel = 'Descripción',
  descriptionPlaceholder = 'Describe brevemente...',
}) {
  const descriptionId = useId();

  return (
    <div className="pf-condition">
      <div className="pf-condition-row">
        <span className="pf-condition-label">{label}</span>
        <div className="pf-toggle-group" role="group" aria-label={label}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pf-toggle-btn${value === opt.value ? ' active' : ''}`}
              aria-pressed={value === opt.value}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showDescription && (
        <div className="form-field pf-condition-desc">
          <label htmlFor={descriptionId}>{descriptionLabel}</label>
          <input
            id={descriptionId}
            type="text"
            value={descriptionValue}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={descriptionPlaceholder}
          />
        </div>
      )}
    </div>
  );
}
