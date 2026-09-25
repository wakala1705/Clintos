import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import './SolicitudesFooter.css';

// Footer de la card: total de solicitudes a la izquierda, paginación a la
// derecha (anterior · página actual · siguiente).
export default function SolicitudesFooter({
  total, page, totalPages, onChangePage,
}) {
  return (
    <footer className="ic-footer">
      <span aria-live="polite">
        Total: <b>{total}</b> {total === 1 ? 'solicitud' : 'solicitudes'}
      </span>

      <nav className="ic-pagination" aria-label="Paginación de solicitudes">
        <button
          type="button"
          className="ic-pagination-btn"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
        >
          <LuChevronLeft className="icon" aria-hidden="true" />
        </button>
        <span className="ic-pagination-page" aria-current="page">{page}</span>
        <button
          type="button"
          className="ic-pagination-btn"
          aria-label="Página siguiente"
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
        >
          <LuChevronRight className="icon" aria-hidden="true" />
        </button>
      </nav>
    </footer>
  );
}
