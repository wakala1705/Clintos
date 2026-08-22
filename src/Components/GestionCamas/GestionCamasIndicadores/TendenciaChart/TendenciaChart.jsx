'use client';

import './TendenciaChart.css';

// SVG hand-rolled (sin librería de gráficos, ver package.json) — mismo
// patrón que TrendChart en GestionCamasResumen.jsx, extraído a componente
// propio acá porque Indicadores lo reusa 6 veces (una por tab) con series
// distintas en vez de una sola vez fija. Etiquetas de valor/fecha ESTÁTICAS
// bajo el gráfico en vez de tooltip JS al hover (mismo criterio de
// simplicidad que el de Resumen: legible sin depender de interacción).
export default function TendenciaChart({ serie, unidad, meta }) {
  const valores = serie.map((p) => p.valor);
  const max = Math.max(meta ?? 0, ...valores) * 1.15 || 100;
  const width = 100;
  const height = 100;

  const puntos = serie.map((p, i) => ({
    x: (i / (serie.length - 1)) * width,
    y: height - (p.valor / max) * height,
    ...p,
  }));
  const linePath = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const metaY = meta != null ? height - (meta / max) * height : null;

  // Muestra como mucho ~6 etiquetas bajo el eje (evita amontonar texto
  // cuando la granularidad es "Diario", 14 puntos).
  const paso = Math.ceil(serie.length / 6);

  return (
    <div className="cbin-trend">
      <svg className="cbin-trend-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <path d={areaPath} className="cbin-trend-area" />
        {metaY != null && <line x1="0" x2={width} y1={metaY} y2={metaY} className="cbin-trend-meta-line" />}
        <path d={linePath} className="cbin-trend-line" vectorEffect="non-scaling-stroke" />
        {puntos.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r="1.6" className="cbin-trend-dot" />
        ))}
      </svg>
      {meta != null && <div className="cbin-trend-meta-label">Meta {meta}{unidad}</div>}
      <div className="cbin-trend-labels">
        {puntos.filter((_, i) => i % paso === 0 || i === puntos.length - 1).map((p) => (
          <div className="cbin-trend-label-item" key={p.label}>
            <span className="cbin-trend-label-value">{p.valor}{unidad}</span>
            <span className="cbin-trend-label-date">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
