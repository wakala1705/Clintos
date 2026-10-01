import './KpiCard.css';

// Tarjeta KPI única del proyecto. Por defecto es informativa (un <div>); con
// `onClick` pasa a ser un botón-filtro (toggle) y `active` marca el filtro
// aplicado. `compact` la deja en una sola línea (ícono + label a la izquierda,
// valor a la derecha, sin descripción ni barra) para ceder alto a la tabla o
// al panel de abajo. `progress` es exclusivo del KPI de Ocupación.
export default function KpiCard({
  icon: Icon, label, value, description, variant = 'neutral', progress,
  compact = false, active = false, onClick, className,
}) {
  const clase = [
    'pg-kpi-card',
    `pg-kpi-${variant}`,
    compact && 'pg-kpi-compact',
    onClick && 'pg-kpi-action',
    active && 'active',
    className,
  ].filter(Boolean).join(' ');

  const contenido = (
    <>
      <div className="pg-kpi-top">
        <div className="pg-kpi-icon">
          <Icon className="icon" aria-hidden="true" />
        </div>
        <span className="pg-kpi-label" title={label}>{label}</span>
      </div>
      <div className="pg-kpi-value">{value}</div>
      {description ? <div className="pg-kpi-desc">{description}</div> : null}
      {progress && (
        <div
          className="pg-kpi-progress"
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <div className="pg-kpi-progress-fill" style={{ width: `${progress.percent}%` }} />
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={clase} aria-pressed={active} onClick={onClick}>
        {contenido}
      </button>
    );
  }
  return <div className={clase}>{contenido}</div>;
}
