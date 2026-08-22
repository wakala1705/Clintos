import './AuditoriaTableSkeleton.css';

export default function AuditoriaTableSkeleton({ rows = 8, columns = 6 }) {
  return (
    <div className="cbau-skeleton" role="status" aria-label="Cargando historial de auditoría">
      {Array.from({ length: rows }, (_, r) => (
        <div className="cbau-skeleton-row" key={r}>
          {Array.from({ length: columns }, (_, c) => (
            <div className="cbau-skeleton-cell" key={c}>
              <span className="cbau-skeleton-bar" style={{ width: `${45 + ((r + c) % 4) * 10}%` }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
