'use client';

import './MantenimientoPagination.css';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Mismo componente/patrón que ReservasPagination.jsx — número de páginas
// clicables + selector de cantidad, con su propio prefijo de clase (ver
// AGENTS.md "Component organization").
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

export default function MantenimientoPagination({
  page, pageSize, total, onChangePage, onChangePageSize,
}) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const paginas = rangoPaginas(page, totalPages);

  return (
    <div className="cbm-pagination">
      <span className="cbm-pagination-label">
        Mostrando <b>{start}–{end}</b> de <b>{total}</b> mantenimientos
      </span>

      <div className="cbm-pagination-controls">
        <button
          type="button"
          className="cbm-pagination-nav-btn"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
        >
          <LuChevronLeft className="icon" />
        </button>

        {paginas.map((p, i) => (
          p === '...' ? <span key={`ellipsis-${i}`} className="cbm-pagination-ellipsis">…</span> : (
            <button
              type="button"
              key={p}
              className={`cbm-pagination-page${p === page ? ' active' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChangePage(p)}
            >
              {p}
            </button>
          )
        ))}

        <button
          type="button"
          className="cbm-pagination-nav-btn"
          aria-label="Página siguiente"
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
        >
          <LuChevronRight className="icon" />
        </button>
      </div>

      <label className="cbm-pagination-size">
        <select value={pageSize} onChange={(e) => onChangePageSize(Number(e.target.value))} aria-label="Mantenimientos por página">
          {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} por página</option>)}
        </select>
      </label>
    </div>
  );
}
