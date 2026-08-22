import './InconsistenciasEmptyState.css';

// Un solo componente para los 4 estados sin-tabla del encargo (sección 15:
// "Sin inconsistencias" es un estado POSITIVO — encargo explícito, ver
// `tone` — a diferencia de Sin resultados/Error que son neutros/negativos).
export default function InconsistenciasEmptyState({
  icon: Icon, tone = 'neutral', title, subtitle, ctaLabel, onCta,
}) {
  return (
    <div className="cbi-empty-state">
      <div className={`cbi-empty-icon tone-${tone}`}><Icon className="icon" aria-hidden="true" /></div>
      <div className="cbi-empty-title">{title}</div>
      {subtitle && <div className="cbi-empty-sub">{subtitle}</div>}
      {ctaLabel && (
        <button type="button" className="btn btn-primary cbi-empty-cta" onClick={onCta}>{ctaLabel}</button>
      )}
    </div>
  );
}
