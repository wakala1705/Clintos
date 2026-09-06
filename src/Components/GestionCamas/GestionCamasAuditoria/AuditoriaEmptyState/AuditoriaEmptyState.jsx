import './AuditoriaEmptyState.css';
import Button from '@/Components/Button/Button';

export default function AuditoriaEmptyState({
  icon: Icon, title, subtitle, ctaLabel, onCta,
}) {
  return (
    <div className="cbau-empty-state">
      <div className="cbau-empty-icon"><Icon className="icon" aria-hidden="true" /></div>
      <div className="cbau-empty-title">{title}</div>
      {subtitle && <div className="cbau-empty-sub">{subtitle}</div>}
      {ctaLabel && (
        <Button type="button" onClick={onCta} className="cbau-empty-cta">{ctaLabel}</Button>
      )}
    </div>
  );
}
