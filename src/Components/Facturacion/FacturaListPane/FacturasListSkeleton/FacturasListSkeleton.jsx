import './FacturasListSkeleton.css';

// Skeleton de la lista (no spinner genérico) para que el layout no salte al
// cargar/filtrar — mismo criterio que PatientsTableSkeleton.jsx.
export default function FacturasListSkeleton({ rows = 8 }) {
  return (
    <div className="fact-skeleton" role="status" aria-label="Cargando facturas">
      {Array.from({ length: rows }, (_, r) => (
        <div className="fact-skeleton-row" key={r}>
          <div className="fact-skeleton-main">
            <span className="fact-skeleton-bar" style={{ width: '90px' }}></span>
            <span className="fact-skeleton-bar fact-skeleton-sub" style={{ width: `${55 + (r % 3) * 12}%` }}></span>
          </div>
          <div className="fact-skeleton-end">
            <span className="fact-skeleton-bar" style={{ width: '56px' }}></span>
            <span className="fact-skeleton-bar" style={{ width: '76px' }}></span>
          </div>
        </div>
      ))}
    </div>
  );
}
