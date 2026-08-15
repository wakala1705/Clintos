import './VacPagination.css';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Mismo look que .lp-pagination (Lista de Pacientes) — reimplementado acá
// porque esa feature no se importa cruzada (ver AGENTS.md). `count` es el
// tamaño real del resultado filtrado; a diferencia del KPI "Pacientes con
// esquema" (248, una cifra institucional aparte, ver VacKpiRow.jsx), este
// mock no simula más páginas de datos reales detrás de la tabla — Anterior/
// Siguiente quedan deshabilitados con un title que lo explica en vez de
// fingir una paginación que no tiene a dónde ir.
export default function VacPagination({ count }) {
  if (count === 0) return null;

  return (
    <div className="vac-pagination">
      <span className="vac-pagination-label">
        Mostrando <b>1–{count}</b> de <b>{count}</b> pacientes
      </span>
      <div className="vac-pagination-controls">
        <button type="button" className="icon-btn-circle" aria-label="Página anterior" disabled>
          <LuChevronLeft className="icon" />
        </button>
        <span className="vac-pagination-page">Página 1 de 1</span>
        <button
          type="button"
          className="icon-btn-circle"
          aria-label="Página siguiente"
          title="Vista de demostración: no hay más páginas cargadas"
          disabled
        >
          <LuChevronRight className="icon" />
        </button>
      </div>
    </div>
  );
}
