'use client';

import './CamasPagination.css';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Encargo (sección 14): "grandes volúmenes" — a diferencia de Pagination
// (ListaPacientes, solo ‹ Página N de M ›), acá hace falta números de
// página clicables + selector de cantidad, así que se arma un componente
// propio en vez de reusar aquel (mismo criterio que BedListView en
// BedBoardModal: no forzar un componente ajeno cuyo shape no encaja).
// Colapsa el rango de páginas con "…" cuando hay muchas (52 en el caso de
// 512 camas / 10 por página) para no listar 52 botones.
// Vive directamente bajo GestionCamas/ (no dentro de un feature-folder
// puntual) — usado por GestionCamas.jsx (Camas, tablero operativo), mismo
// criterio que GestionCamasSidebar (AGENTS.md, "App-wide components"). Antes
// también lo usaba la vieja pantalla de inventario administrativo en
// /gestion-camas/camas (GestionCamasCamas.jsx, eliminada por duplicar este
// tablero) — se mantiene como componente propio en vez de volver a anidarlo
// en un solo feature-folder, por si un futuro listado grande del módulo
// vuelve a necesitarlo.
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

export default function CamasPagination({
  page, pageSize, total, onChangePage, onChangePageSize,
}) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const paginas = rangoPaginas(page, totalPages);

  return (
    <div className="cba-pagination">
      <span className="cba-pagination-label">
        Mostrando <b>{start}–{end}</b> de <b>{total}</b> camas
      </span>

      <div className="cba-pagination-controls">
        <button
          type="button"
          className="cba-pagination-nav-btn"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
        >
          <LuChevronLeft className="icon" />
        </button>

        {paginas.map((p, i) => (
          p === '...' ? <span key={`ellipsis-${i}`} className="cba-pagination-ellipsis">…</span> : (
            <button
              type="button"
              key={p}
              className={`cba-pagination-page${p === page ? ' active' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChangePage(p)}
            >
              {p}
            </button>
          )
        ))}

        <button
          type="button"
          className="cba-pagination-nav-btn"
          aria-label="Página siguiente"
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
        >
          <LuChevronRight className="icon" />
        </button>
      </div>

      <label className="cba-pagination-size">
        <select value={pageSize} onChange={(e) => onChangePageSize(Number(e.target.value))} aria-label="Camas por página">
          {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} por página</option>)}
        </select>
      </label>
    </div>
  );
}
