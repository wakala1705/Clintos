'use client';

import './TablePagination.css';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Footer de paginación de una tabla/listado: "Mostrando X–Y de N", páginas
// numeradas y selector de filas por vista. Misma estructura que
// CamasPagination (GestionCamas), pero app-wide y con el texto configurable
// (`itemLabel`) para no copiar el componente por feature. Se monta dentro de la
// tarjeta, debajo del área que scrollea. El select de "por página" es nativo a
// propósito (AGENTS.md, "Selects de formulario": los de paginación quedan fuera).
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

// Colapsa con "…" cuando hay muchas páginas (1 … 4 5 6 … 20).
function rangoPaginas(page, totalPages) {
  const delta = 1;
  const rango = [];
  const desde = Math.max(2, page - delta);
  const hasta = Math.min(totalPages - 1, page + delta);

  rango.push(1);
  if (desde > 2) rango.push('...');
  for (let p = desde; p <= hasta; p += 1) rango.push(p);
  if (hasta < totalPages - 1) rango.push('...');
  if (totalPages > 1) rango.push(totalPages);
  return rango;
}

export default function TablePagination({
  page, pageSize, total, onChangePage, onChangePageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS, itemLabel = 'registros',
}) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const paginas = rangoPaginas(page, totalPages);

  return (
    <div className="tpg">
      <span className="tpg-label">
        Mostrando <b>{start}–{end}</b> de <b>{total}</b> {itemLabel}
      </span>

      <div className="tpg-right">
        <label className="tpg-size">
          <select value={pageSize} onChange={(e) => onChangePageSize(Number(e.target.value))} aria-label={`Filas por vista (${itemLabel})`}>
            {pageSizeOptions.map((n) => <option key={n} value={n}>{n} por página</option>)}
          </select>
        </label>

        <div className="tpg-controls">
          <button
            type="button"
            className="tpg-nav-btn"
            aria-label="Página anterior"
            disabled={page <= 1}
            onClick={() => onChangePage(page - 1)}
          >
            <LuChevronLeft className="icon" />
          </button>

          {paginas.map((p, i) => (
            p === '...' ? <span key={`ellipsis-${i}`} className="tpg-ellipsis">…</span> : (
              <button
                type="button"
                key={p}
                className={`tpg-page${p === page ? ' active' : ''}`}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => onChangePage(p)}
              >
                {p}
              </button>
            )
          ))}

          <button
            type="button"
            className="tpg-nav-btn"
            aria-label="Página siguiente"
            disabled={page >= totalPages}
            onClick={() => onChangePage(page + 1)}
          >
            <LuChevronRight className="icon" />
          </button>
        </div>
      </div>
    </div>
  );
}
