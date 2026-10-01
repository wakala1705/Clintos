import { LuMinus, LuPlus } from 'react-icons/lu';
import './NumeroStepper.css';

// Campo numérico con botones − / + de 44 px (uso táctil). Controlado: emite el
// número, o '' si el input queda vacío.
export default function NumeroStepper({
  value, onChange, min = 0, label = '', id,
}) {
  const actual = value === '' || value === null || value === undefined ? null : Number(value);
  const sufijo = label ? ` ${label}` : '';
  const mover = (delta) => onChange(Math.max((actual ?? (min - (delta > 0 ? 1 : 0))) + delta, min));
  return (
    <div className="hgq-stepper">
      <button
        type="button"
        className="hgq-stepper-btn"
        aria-label={`Disminuir${sufijo}`}
        disabled={actual !== null && actual <= min}
        onClick={() => mover(-1)}
      >
        <LuMinus className="icon" aria-hidden="true" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        className="hgq-input hgq-input-num hgq-stepper-input"
        min={min}
        value={value ?? ''}
        aria-label={label || undefined}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
      <button
        type="button"
        className="hgq-stepper-btn"
        aria-label={`Aumentar${sufijo}`}
        onClick={() => mover(1)}
      >
        <LuPlus className="icon" aria-hidden="true" />
      </button>
    </div>
  );
}
