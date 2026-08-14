import './TaskSummaryCard.css';

// A diferencia de KpiCard (PanelGeneral, puramente informativa — ver su
// comentario), estas 5 tarjetas SÍ son filtros rápidos (encargo explícito:
// "deben funcionar como filtros rápidos") — <button> real con estado
// `active` (borde+fondo primary, mismo criterio visual que .chip-filter.active
// en shared.css) en vez de <div>, para que se lea y se navegue como un
// control, no como una simple métrica.
//
// `secondary` (solo Completadas, encargo: "menor peso visual") reduce ícono/
// valor y cambia a tono gris — sigue siendo el mismo componente/patrón de
// click, no una variante aparte. `sublabel` (solo Pendientes, encargo: "una
// tarea vencida sigue siendo pendiente") muestra la relación Pendientes/
// Vencidas sin que sean 2 números que puedan leerse como contradictorios.
export default function TaskSummaryCard({
  icon: Icon, label, value, sublabel, tono = 'neutral', active, secondary, onClick,
}) {
  return (
    <button
      type="button"
      className={`task-summary-card task-summary-${tono}${active ? ' active' : ''}${secondary ? ' secondary' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className="task-summary-icon">
        <Icon className="icon" aria-hidden="true" />
      </div>
      <div className="task-summary-body">
        <span className="task-summary-value">{value}</span>
        <span className="task-summary-label">{label}</span>
        {sublabel && <span className="task-summary-sublabel">{sublabel}</span>}
      </div>
    </button>
  );
}
