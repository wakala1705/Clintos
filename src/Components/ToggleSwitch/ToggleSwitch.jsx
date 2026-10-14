'use client';

import './ToggleSwitch.css';

// Switch con etiqueta (Prioritario/Única dosis en ItemFormPanel, días de la
// agenda de cirujanos): app-wide porque lo usan 2+ rutas (ver AGENTS.md
// "Component organization").
// `ocultarEtiqueta`: el texto lo pinta quien lo usa (queda como aria-label).
export default function ToggleSwitch({
  label, checked, onChange, ocultarEtiqueta = false,
}) {
  return (
    <label className="ts-wrap">
      {!ocultarEtiqueta && <span className="ts-label">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`ts-track${checked ? ' checked' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="ts-thumb" />
      </button>
    </label>
  );
}
