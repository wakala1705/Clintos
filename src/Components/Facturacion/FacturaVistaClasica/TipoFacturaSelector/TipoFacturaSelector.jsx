'use client';

import './TipoFacturaSelector.css';

// Lista de tarjetas seleccionables para "Tipo Factura" del panel izquierdo de
// FacturaAgregarModalClasico (encargo explícito, ver imagen de referencia) --
// reemplaza el FormSelect que tenía este campo antes. `options` trae
// icon/description por opción (ver TIPO_FACTURA_OPTIONS en
// FacturaAgregarModalClasico.jsx), a diferencia del shape genérico
// {value,label} de FormSelect. `description` ya no se pinta (encargo
// explícito: tarjetas más compactas, ver `.tfs-desc` en el .css) -- sigue
// viniendo en `options` porque es contenido de dominio (no una prop de UI),
// no se borró de TIPO_FACTURA_OPTIONS.
export default function TipoFacturaSelector({ value, onChange, options }) {
  return (
    <div className="tfs-list" role="radiogroup" aria-label="Tipo de factura">
      {options.map(({ value: optValue, label, icon: Icon }) => {
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
            </span>
            <span className="tfs-radio" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
