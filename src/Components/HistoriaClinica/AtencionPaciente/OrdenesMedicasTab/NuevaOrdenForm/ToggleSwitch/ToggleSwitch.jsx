'use client';

import './ToggleSwitch.css';

// Switch Sí/No (Prioritario/Única dosis en ItemFormPanel) — un solo
// consumidor hoy, así que vive local a NuevaOrdenForm en vez de un
// componente app-wide (ver AGENTS.md "Component organization").
export default function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="ts-wrap">
      <span className="ts-label">{label}</span>
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
