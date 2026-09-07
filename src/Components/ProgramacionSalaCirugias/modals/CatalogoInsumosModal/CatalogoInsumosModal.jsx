'use client';

import { useState } from 'react';
import './CatalogoInsumosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { INSUMOS_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Quita tildes -- mismo helper que CatalogoMedicosModal.jsx/
// CatalogoProcedimientosModal.jsx (no compartido entre los 3, ver AGENTS.md
// "Component organization").
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

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

// Ventana de búsqueda del botón "Agregar insumo" en InsumosStep (Paso 3 del
// wizard "Nueva cirugía") -- mismo look que CatalogoMedicosModal (buscador +
// tabla con borde + fila-botón seleccionable + paginación real), clases
// propias `.cim-*` (ver AGENTS.md "Component organization"). Un solo
// buscador (por Id. servicio o nombre) filtrando en vivo, sin filtro de
// prefijo (INSUMOS_CATALOGO no tiene esa dimensión). `onSelect` recibe el
// insumo completo `{codigo, nombre}` -- a diferencia de los otros catálogos
// de este feature (que arman un string "id - nombre" para precargar un
// input de texto), acá el consumidor necesita ambos campos por separado
// para agregar una fila nueva a la tabla de insumos.
export default function CatalogoInsumosModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [seleccion, setSeleccion] = useState(null);

  function handleQuery(v) {
    setQuery(v);
    setPage(1);
  }
  function handleChangePageSize(v) {
    setPageSize(v);
    setPage(1);
  }

  const q = normalizar(query.trim());
  const filtered = INSUMOS_CATALOGO.filter((i) => (
    !q || normalizar(i.codigo).includes(q) || normalizar(i.nombre).includes(q)
  ));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginas = rangoPaginas(currentPage, totalPages);

  function handleConfirm() {
    if (!seleccion) return;
    onSelect(seleccion);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cim-modal-card" role="dialog" aria-modal="true" aria-labelledby="cim-title">
        <ModalHeader
          title="Seleccionar insumo"
          titleId="cim-title"
          onClose={onClose}
          closeLabel="Cerrar búsqueda de insumo"
        />
        <div className="modal-body cim-body">
          <div className="cim-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Buscar por Id. servicio o nombre del insumo"
              aria-label="Buscar por Id. servicio o nombre del insumo"
            />
          </div>

          <div className="cim-table">
            <div className="cim-row cim-row-head">
              <span>Id. Servicio</span>
              <span>Insumo</span>
            </div>
            <div className="cim-list" role="listbox" aria-labelledby="cim-title">
              {pageItems.length === 0 && (
                <div className="cim-empty">Sin resultados para los filtros aplicados.</div>
              )}
              {pageItems.map((i) => {
                const active = seleccion?.codigo === i.codigo;
                return (
                  <button
                    type="button"
                    key={i.codigo}
                    role="option"
                    aria-selected={active}
                    className={`cim-row cim-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(i)}
                  >
                    <span className="cim-id">{i.codigo}</span>
                    <span className="cim-nombre">{i.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {total > 0 && (
            <div className="cim-pagination">
              <span className="cim-pagination-label">
                {start}–{end} de {total} registros
              </span>

              <div className="cim-pagination-controls">
                <label className="cim-pagination-size">
                  <select value={pageSize} onChange={(e) => handleChangePageSize(Number(e.target.value))} aria-label="Registros por página">
                    {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>

                <button
                  type="button"
                  className="cim-pagination-nav-btn"
                  aria-label="Página anterior"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <LuChevronLeft className="icon" />
                </button>

                {paginas.map((p, i) => (
                  p === '...' ? <span key={`ellipsis-${i}`} className="cim-pagination-ellipsis">…</span> : (
                    <button
                      type="button"
                      key={p}
                      className={`cim-pagination-page${p === currentPage ? ' active' : ''}`}
                      aria-current={p === currentPage ? 'page' : undefined}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                ))}

                <button
                  type="button"
                  className="cim-pagination-nav-btn"
                  aria-label="Página siguiente"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <LuChevronRight className="icon" />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={!seleccion}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
