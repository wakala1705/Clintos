import './AuditoriaEmptyState.css';

export default function AuditoriaEmptyState({
  icon: Icon, title, subtitle, ctaLabel, onCta,
}) {
  return (
    <div className="cbau-empty-state">
      <div className="cbau-empty-icon"><Icon className="icon" aria-hidden="true" /></div>
      <div className="cbau-empty-title">{title}</div>
      {subtitle && <div className="cbau-empty-sub">{subtitle}</div>}
      {ctaLabel && (
        <button type="button" className="btn btn-primary cbau-empty-cta" onClick={onCta}>{ctaLabel}</button>
      )}
    </div>
  );
}
