'use client';

import './KarnofskyField.css';
import { KARNOFSKY_OPCIONES } from '@/hooks/HistoriaClinica/evaluacionPreanestesicaCampos';

// Escala de Karnofsky: lista con scroll de una sola opción (radiogroup), como
// el cuadro de selección del legado.
export default function KarnofskyField({ id, label, value, onChange }) {
  return (
    <div className="pea-field">
      <span id={`${id}-label`} className="pea-field-label">{label}</span>
      <div className="pea-karnofsky" role="radiogroup" aria-labelledby={`${id}-label`}>
        {KARNOFSKY_OPCIONES.map((o) => (
          <label className={`pea-karnofsky-option${value === o.value ? ' selected' : ''}`} key={o.value}>
            <input
              type="radio"
              name={id}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
