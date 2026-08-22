import './BarrasComparativas.css';
import { LuChevronRight } from 'react-icons/lu';

// Card genérica de barras horizontales ordenadas de mayor a menor (encargo,
// sección 7: "Por servicio") — reusada también para "Por sede" (sección 8:
// el prompt permite donut O barras para sede; acá se usa el mismo lenguaje
// de barras para no introducir un segundo patrón visual de comparación en
// la misma pantalla). `filaActiva` resalta la fila si el filtro de
// Sede/Servicio ya la aisló (ver GestionCamasIndicadores.jsx).
export default function BarrasComparativas({
  titulo, filas, unidad, max, ctaLabel, onCta,
}) {
  const maxValor = max ?? Math.max(...filas.map((f) => f.valor), 1);
  return (
    <div className="card cbin-barras-card">
      <div className="cbin-card-head">
        <h2>{titulo}</h2>
      </div>
      <div className="cbin-barras-list">
        {filas.map((f) => (
          <div className="cbin-barras-row" key={f.label}>
            <div className="cbin-barras-row-top">
              <span className="cbin-barras-label">{f.label}</span>
              <span className="cbin-barras-valor">{f.valor}{unidad}</span>
            </div>
            <div className="cbin-barras-bar">
              <div className="cbin-barras-bar-fill" style={{ width: `${Math.min(100, (f.valor / maxValor) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      {ctaLabel && (
        <div className="cbin-card-footer-link">
          <button type="button" className="cbin-link-btn" onClick={onCta}>
            {ctaLabel}<LuChevronRight className="icon" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
