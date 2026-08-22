import './IndicadoresEmptyState.css';

// Un solo componente para los 3 estados sin-contenido del encargo (sección
// 20: Sin datos/Sin resultados/Error) — mismo patrón que
// CamasEmptyState/InconsistenciasEmptyState (feature-folders hermanos).
export default function IndicadoresEmptyState({
  icon: Icon, title, subtitle, ctaLabel, onCta,
}) {
  return (
    <div className="cbin-empty-state">
      <div className="cbin-empty-icon"><Icon className="icon" aria-hidden="true" /></div>
      <div className="cbin-empty-title">{title}</div>
      {subtitle && <div className="cbin-empty-sub">{subtitle}</div>}
      {ctaLabel && (
        <button type="button" className="btn btn-primary cbin-empty-cta" onClick={onCta}>{ctaLabel}</button>
      )}
    </div>
  );
}
