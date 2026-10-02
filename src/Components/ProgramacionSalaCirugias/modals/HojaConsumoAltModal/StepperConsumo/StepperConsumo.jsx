'use client';

import { LuMinus, LuPlus } from 'react-icons/lu';
import './StepperConsumo.css';
import { pasoConsumo } from '@/hooks/ProgramacionSalaCirugias/hojaConsumo/hojaConsumo';

// Cantidad con botones − / +: entre 0 y `max` (lo entregado), y el valor también se puede
// escribir. `value` es texto ('' = sin registrar); `onChange` recibe el nuevo texto.
export default function StepperConsumo({ value, max, onChange, label, invalid }) {
  const actual = value === '' ? null : Number(value);
  return (
    <div className="hca-stepper">
      <button
        type="button"
        className="hca-stepper-btn"
        aria-label={`Disminuir ${label}`}
        disabled={actual === 0}
        onClick={() => onChange(pasoConsumo(value, -1, max))}
      >
        <LuMinus className="icon" aria-hidden="true" />
      </button>
      <input
        className="hca-stepper-valor"
        type="number"
        inputMode="numeric"
        min="0"
        placeholder="0"
        value={value}
        aria-label={`Consumido de ${label}`}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="hca-stepper-btn"
        aria-label={`Aumentar ${label}`}
        disabled={max !== null && actual !== null && actual >= max}
        onClick={() => onChange(pasoConsumo(value, 1, max))}
      >
        <LuPlus className="icon" aria-hidden="true" />
      </button>
    </div>
  );
}
