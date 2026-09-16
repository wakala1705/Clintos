'use client';

import './TipoFacturaSelector.css';

// Lista de tarjetas seleccionables para "Tipo Factura" del panel izquierdo de
// FacturaAgregarModalClasico (encargo explícito, ver imagen de referencia) --
// reemplaza el FormSelect que tenía este campo antes. `options` trae
// icon/description por opción (ver TIPO_FACTURA_OPTIONS en
// FacturaAgregarModalClasico.jsx), a diferencia del shape genérico
// {value,label} de FormSelect.
export default function TipoFacturaSelector({ value, onChange, options }) {
  return (
    <div className="tfs-list" role="radiogroup" aria-label="Tipo de factura">
      {options.map(({ value: optValue, label, description, icon: Icon }) => {
        const selected = value === optValue;
        return (
          <button
            key={optValue}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`tfs-card${selected ? ' selected' : ''}`}
            onClick={() => onChange(optValue)}
          >
            <span className="tfs-icon"><Icon className="icon" aria-hidden="true" /></span>
            <span className="tfs-body">
              <span className="tfs-title">{label}</span>
              <span className="tfs-desc">{description}</span>
            </span>
            <span className="tfs-radio" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
