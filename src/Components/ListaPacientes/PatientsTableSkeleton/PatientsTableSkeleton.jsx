import './PatientsTableSkeleton.css';

// Skeleton de la tabla (no spinner genérico) para que el layout no salte
// cuando cambian filtros/búsqueda/página — mismas columnas que PatientsTable.
export default function PatientsTableSkeleton({ rows = 8, columns = 8 }) {
  return (
    <div className="lp-skeleton" role="status" aria-label="Cargando pacientes">
      {Array.from({ length: rows }, (_, r) => (
        <div className="lp-skeleton-row" key={r}>
          {Array.from({ length: columns }, (_, c) => (
            <div className="lp-skeleton-cell" key={c}>
              {c === 0 && <span className="lp-skeleton-avatar"></span>}
              <span className="lp-skeleton-bar" style={{ width: c === 0 ? '65%' : `${45 + ((r + c) % 4) * 10}%` }}></span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
