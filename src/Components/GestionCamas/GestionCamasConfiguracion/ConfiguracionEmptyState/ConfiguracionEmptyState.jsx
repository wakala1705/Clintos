import './ConfiguracionEmptyState.css';

// Estado de página completa (Error, encargo sección 21) — para los "sin
// resultados" parciales de la grilla/tabla ver los textos inline en
// GestionCamasConfiguracion.jsx (cada sección tiene su propio criterio de
// filtro, ver mockConfiguracionData.js).
export default function ConfiguracionEmptyState({
  icon: Icon, title, subtitle, ctaLabel, onCta,
}) {
  return (
    <div className="cbc-empty-state">
      <div className="cbc-empty-icon"><Icon className="icon" aria-hidden="true" /></div>
      <div className="cbc-empty-title">{title}</div>
      {subtitle && <div className="cbc-empty-sub">{subtitle}</div>}
      {ctaLabel && (
        <button type="button" className="btn btn-primary cbc-empty-cta" onClick={onCta}>{ctaLabel}</button>
      )}
    </div>
  );
}
