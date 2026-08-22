import './ConfiguracionSkeleton.css';

// Cubre filtros/cards/cambios recientes a la vez (encargo, sección 21) —
// `variant` decide si dibuja la grilla de 8 cards o filas de tabla, para
// poder usarse tanto en la grilla de catálogos como en Cambios recientes
// sin duplicar el componente.
export default function ConfiguracionSkeleton({ variant = 'grid' }) {
  if (variant === 'table') {
    return (
      <div className="cbc-sk-table" role="status" aria-label="Cargando configuración">
        {Array.from({ length: 5 }, (_, r) => (
          <div className="cbc-sk-row" key={r}>
            <span className="cbc-sk-bar" style={{ width: `${55 + (r % 3) * 12}%` }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="cbc-sk-grid" role="status" aria-label="Cargando catálogos">
      {Array.from({ length: 8 }, (_, i) => (
        <div className="cbc-sk-card" key={i}>
          <span className="cbc-sk-circle" />
          <span className="cbc-sk-bar" style={{ width: '70%' }} />
          <span className="cbc-sk-bar" style={{ width: '95%' }} />
          <span className="cbc-sk-bar" style={{ width: '40%' }} />
        </div>
      ))}
    </div>
  );
}
