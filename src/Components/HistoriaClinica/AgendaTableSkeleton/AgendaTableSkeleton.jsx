import './AgendaTableSkeleton.css';

// Skeleton de bloques (shimmer), no spinner genérico — mismo criterio que
// PatientsTableSkeleton (ver AGENTS.md): imita el layout real (12 columnas
// de AgendaTable) para que nada salte cuando termina de cargar.
export default function AgendaTableSkeleton({ rows = 6, columns = 12 }) {
  return (
    <div className="hc-skeleton" role="status" aria-label="Cargando agenda del día">
      {Array.from({ length: rows }, (_, r) => (
        <div className="hc-skeleton-row" key={r}>
          {Array.from({ length: columns }, (_, c) => (
            <div className="hc-skeleton-cell" key={c}>
              <span className="hc-skeleton-bar" style={{ width: `${45 + ((r + c) % 4) * 10}%` }}></span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
