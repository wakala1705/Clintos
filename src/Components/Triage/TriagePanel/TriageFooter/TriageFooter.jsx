import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import './TriageFooter.css';

// Footer de la card: rango visible ("1 - 6 de 6 registros", como la
// referencia legacy) a la izquierda, paginación a la derecha — mismo patrón
// que Interconsulta/SolicitudesFooter.
export default function TriageFooter({
  desde, hasta, total, page, totalPages, onChangePage,
}) {
  return (
    <footer className="tg-footer">
      <span aria-live="polite">
        <b>{desde}</b> - <b>{hasta}</b> de <b>{total}</b> {total === 1 ? 'registro' : 'registros'}
      </span>

      <nav className="tg-pagination" aria-label="Paginación de pacientes">
        <button
          type="button"
          className="tg-pagination-btn"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
        >
          <LuChevronLeft className="icon" aria-hidden="true" />
        </button>
        <span className="tg-pagination-page" aria-current="page">{page}</span>
        <button
          type="button"
          className="tg-pagination-btn"
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
