import './TrazabilidadPagination.css';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Mismo patrón dominante del proyecto (Mostrando X-Y de Z + Página N de M +
// flechas ícono-solo `.icon-btn-circle`, ver Pagination.jsx de Facturación/
// ListaPacientes) -- `.icon-btn-circle` ya vive en Topbar.css (shell global,
// ver AGENTS.md), no hace falta redefinirla acá. El botón "Reintentar
// trabajos colgados" se quitó de acá por encargo explícito; queda solo en
// TrazabilidadToolbar.jsx (cabecera de la tabla).
export default function TrazabilidadPagination({ page, pageSize, total, onChangePage }) {
  if (total === 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="traz-pagination">
      <span className="traz-pagination-label">
        Mostrando <b>{start}–{end}</b> de <b>{total}</b> registros
      </span>
      <div className="traz-pagination-controls">
        <button
          type="button"
          className="icon-btn-circle"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
        >
          <LuChevronLeft className="icon" />
        </button>
        <span className="traz-pagination-page">Página {page} de {totalPages}</span>
        <button
          type="button"
          className="icon-btn-circle"
          aria-label="Página siguiente"
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
        >
          <LuChevronRight className="icon" />
        </button>
      </div>
    </div>
  );
}
