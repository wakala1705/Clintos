import './IndicadoresSkeleton.css';

// Skeleton de bloques para KPIs + gráficos + tablas (encargo, sección 20) —
// un solo componente cubre las 3 zonas en vez de 3 skeletons separados,
// porque las 3 aparecen/desaparecen juntas (un solo `status`, ver
// GestionCamasIndicadores.jsx).
export default function IndicadoresSkeleton() {
  return (
    <div className="cbin-skeleton" role="status" aria-label="Cargando indicadores">
      <div className="cbin-skeleton-kpi-row">
        {Array.from({ length: 5 }, (_, i) => <div className="cbin-skeleton-kpi" key={i} />)}
      </div>
      <div className="cbin-skeleton-chart-row">
        <div className="cbin-skeleton-chart cbin-skeleton-chart-wide" />
        <div className="cbin-skeleton-chart" />
        <div className="cbin-skeleton-chart" />
      </div>
      <div className="cbin-skeleton-table" />
    </div>
  );
}
