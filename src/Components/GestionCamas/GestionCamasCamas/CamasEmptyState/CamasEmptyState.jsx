import './CamasEmptyState.css';

// Un solo componente para los 3 estados sin-tabla del encargo (Empty/Sin
// resultados/Error, sección 15) — mismo patrón que AdmisionesEmptyState,
// con un CTA opcional porque acá los 3 casos SÍ llevan uno ("Crear primera
// cama"/"Limpiar filtros"/"Reintentar"), a diferencia de aquel.
export default function CamasEmptyState({
  icon: Icon, title, subtitle, ctaLabel, onCta,
}) {
  return (
    <div className="cba-empty-state">
      <div className="cba-empty-icon"><Icon className="icon" aria-hidden="true" /></div>
      <div className="cba-empty-title">{title}</div>
      {subtitle && <div className="cba-empty-sub">{subtitle}</div>}
      {ctaLabel && (
        <button type="button" className="btn btn-primary cba-empty-cta" onClick={onCta}>{ctaLabel}</button>
      )}
    </div>
  );
}
