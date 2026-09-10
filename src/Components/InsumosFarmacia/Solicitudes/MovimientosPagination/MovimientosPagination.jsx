'use client';

import './MovimientosPagination.css';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Footer de la grilla principal -- mismo patrón simple (label + ‹ Página N
// de M ›) que Facturacion/FacturaListPane/Pagination y ListaPacientes/
// Pagination (60 movimientos no justifica los números de página clicables +
// selector de tamaño de CamasPagination, pensado para volúmenes mucho
// mayores, ver su comentario). .icon-btn-circle: vive en Topbar.css, ya
// cargado por <Topbar> en Solicitudes.jsx.
export default function MovimientosPagination({
  page, pageSize, total, onChangePage,
}) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="mig-pagination">
      <span className="mig-pagination-label">
        Mostrando <b>{start}–{end}</b> de <b>{total}</b> movimientos
      </span>
      <div className="mig-pagination-controls">
        <button
          type="button"
          className="icon-btn-circle"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
        >
          <LuChevronLeft className="icon" />
        </button>
        <span className="mig-pagination-page">Página {page} de {totalPages}</span>
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
