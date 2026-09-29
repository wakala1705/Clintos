import './TrazabilidadTableSkeleton.css';

// Skeleton de bloques (shimmer), no spinner genérico -- mismo criterio que
// AdmisionesTableSkeleton/AgendaTableSkeleton (ver AGENTS.md): imita el
// layout real (10 columnas de TrazabilidadTable) para que nada salte cuando
// termina de cargar.
export default function TrazabilidadTableSkeleton({ rows = 8, columns = 10 }) {
  return (
    <div className="traz-skeleton" role="status" aria-label="Cargando trazabilidad">
      {Array.from({ length: rows }, (_, r) => (
        <div className="traz-skeleton-row" key={r}>
          {Array.from({ length: columns }, (_, c) => (
            <div className="traz-skeleton-cell" key={c}>
              <span className="traz-skeleton-bar" style={{ width: `${45 + ((r + c) % 4) * 10}%` }}></span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
