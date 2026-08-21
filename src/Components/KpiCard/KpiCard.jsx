import './KpiCard.css';

// Tarjeta KPI puramente informativa (a diferencia de KpiFilterCard en
// HistoriaClinica, que también actúa como filtro-botón) — el Panel General
// ya tiene su propio filtro segmentado en "Pacientes en piso" (Todos/Con
// pendientes/Prolongados, ver PatientsPanel.jsx), así que estas 5 tarjetas
// solo necesitan comunicar el estado del piso de un vistazo, sin ser
// clicables. `progress` es exclusivo del KPI de Ocupación (única tarjeta con
// barra, ver PanelGeneral.jsx).
export default function KpiCard({ icon: Icon, label, value, description, variant = 'neutral', progress }) {
  return (
    <div className={`pg-kpi-card pg-kpi-${variant}`}>
      <div className="pg-kpi-top">
        <div className="pg-kpi-icon">
          <Icon className="icon" aria-hidden="true" />
        </div>
        <span className="pg-kpi-label">{label}</span>
      </div>
      <div className="pg-kpi-value">{value}</div>
      <div className="pg-kpi-desc">{description}</div>
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
    </div>
  );
}
