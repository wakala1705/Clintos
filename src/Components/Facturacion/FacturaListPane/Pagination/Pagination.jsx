import './Pagination.css';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export default function Pagination({ page, pageSize, total, onChangePage }) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="fact-pagination">
      <span className="fact-pagination-label">
        Mostrando <b>{start}–{end}</b> de <b>{total}</b> facturas
      </span>
      <div className="fact-pagination-controls">
        <button
          type="button"
          className="icon-btn-circle"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
        >
          <LuChevronLeft className="icon" />
        </button>
        <span className="fact-pagination-page">Página {page} de {totalPages}</span>
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
