'use client';

import './EadItem.css';

const OPCIONES_LOGRO = [
  { value: 'logrado', label: 'Logrado' },
  { value: 'no_logrado', label: 'No logrado' },
];

// Unidad de ítem reutilizable para los 4 dominios de EAD (ver
// EadDomainEtapa.jsx) — texto completo del ítem clínico (sin resumir ni
// modificar, ver eadData.js) + respuesta Logrado/No logrado como segmented
// control (reutiliza .pf-toggle-group, mismo control que TriStateField.jsx/
// ValeQuestion.jsx — no se inventa un control nuevo). A diferencia de
// ValeQuestion (VALE), acá no hay código de categoría ni checkbox de
// "observación directa": el encargo de EAD no los pide.
export default function EadItem({ id, texto, valor, onValorChange }) {
  const labelId = `${id}-label`;

  return (
    <div className="ead-item">
      <p className="ead-item-text" id={labelId}>{texto}</p>
      <div className="pf-toggle-group ead-item-answer" role="group" aria-labelledby={labelId}>
        {OPCIONES_LOGRO.map((opt) => (
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
    </div>
  );
}
