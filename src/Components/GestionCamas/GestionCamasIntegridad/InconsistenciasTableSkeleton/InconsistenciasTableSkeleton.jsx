import './InconsistenciasTableSkeleton.css';

export default function InconsistenciasTableSkeleton({ rows = 5, columns = 7 }) {
  return (
    <div className="cbi-skeleton" role="status" aria-label="Verificando integridad de camas">
      {Array.from({ length: rows }, (_, r) => (
        <div className="cbi-skeleton-row" key={r}>
          {Array.from({ length: columns }, (_, c) => (
            <div className="cbi-skeleton-cell" key={c}>
              <span className="cbi-skeleton-bar" style={{ width: `${45 + ((r + c) % 4) * 10}%` }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
