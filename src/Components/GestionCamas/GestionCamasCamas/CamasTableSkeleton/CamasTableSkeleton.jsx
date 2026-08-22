import './CamasTableSkeleton.css';

// Skeleton de bloques (shimmer), no spinner genérico — mismo criterio que
// AdmisionesTableSkeleton (ver AGENTS.md): imita las 8 columnas reales de
// la tabla para que nada salte cuando termina de cargar.
export default function CamasTableSkeleton({ rows = 8, columns = 8 }) {
  return (
    <div className="cba-skeleton" role="status" aria-label="Cargando camas">
      {Array.from({ length: rows }, (_, r) => (
        <div className="cba-skeleton-row" key={r}>
          {Array.from({ length: columns }, (_, c) => (
            <div className="cba-skeleton-cell" key={c}>
              <span className="cba-skeleton-bar" style={{ width: `${45 + ((r + c) % 4) * 10}%` }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
