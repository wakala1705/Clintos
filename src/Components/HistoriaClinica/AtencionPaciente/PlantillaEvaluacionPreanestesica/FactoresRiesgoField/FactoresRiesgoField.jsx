'use client';

import './FactoresRiesgoField.css';
import Button from '@/Components/Button/Button';
import { LuCheck } from 'react-icons/lu';

// Grupo de checkboxes (factores de los índices de Lee) con el botón "Todos"
// del legado: marca todos los factores de una vez. `value` es el array de
// `value` de las opciones marcadas.
export default function FactoresRiesgoField({ id, label, options, value, onChange }) {
  function toggle(optValue) {
    onChange(value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue]);
  }

  return (
    <div className="pea-field" role="group" aria-labelledby={`${id}-label`}>
      <div className="pea-checks-head">
        <span id={`${id}-label`} className="pea-field-label">{label}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={LuCheck}
          onClick={() => onChange(options.map((o) => o.value))}
        >
          Todos
        </Button>
      </div>
      <div className="pea-checks-grid">
        {options.map((o) => (
          <label className="pea-check" key={o.value}>
            <input
              type="checkbox"
              checked={value.includes(o.value)}
              onChange={() => toggle(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
