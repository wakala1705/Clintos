import './KpiFilterCard.css';

// Tarjeta KPI que también actúa como filtro toggle sobre la tabla de agenda
// (no es solo informativa) — variant define el color del ícono (warning /
// success / info), active resalta la tarjeta con el borde azul de selección.
export default function KpiFilterCard({ icon: Icon, label, value, variant, active, onClick }) {
  return (
    <button
      type="button"
      className={`kpi-card kpi-${variant}${active ? ' active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className="kpi-icon">
        <Icon className="icon" />
      </div>
      <div className="kpi-body">
        <span className="kpi-value">{value}</span>
        <span className="kpi-label">{label}</span>
      </div>
    </button>
  );
}
