import './AdmisionesTableSkeleton.css';

// Skeleton de bloques (shimmer), no spinner genérico — mismo criterio que
// AgendaTableSkeleton/PatientsTableSkeleton (ver AGENTS.md): imita el
// layout real (14 columnas de AdmisionesTable) para que nada salte cuando
// termina de cargar.
export default function AdmisionesTableSkeleton({ rows = 6, columns = 14 }) {
  return (
    <div className="adm-skeleton" role="status" aria-label="Cargando admisiones">
      {Array.from({ length: rows }, (_, r) => (
        <div className="adm-skeleton-row" key={r}>
          {Array.from({ length: columns }, (_, c) => (
            <div className="adm-skeleton-cell" key={c}>
              <span className="adm-skeleton-bar" style={{ width: `${45 + ((r + c) % 4) * 10}%` }}></span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
