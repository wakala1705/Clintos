'use client';

import { useState } from 'react';
import './CatalogoProcedimientosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { PROCEDIMIENTOS_QX_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const PREFIJO_OPTIONS = [
  { value: '', label: 'Todos los prefijos' },
  ...Array.from(new Set(PROCEDIMIENTOS_QX_CATALOGO.map((p) => p.prefijo))).map((v) => ({ value: v, label: v })),
];

// Quita tildes -- mismo helper que CatalogoDiagnosticosModal.jsx/
// CatalogoAseguradorasModal.jsx (no compartido entre los 3, ver AGENTS.md
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

// Ventana de búsqueda de "Id. Cirugía" en AgregarProcedimientoModal --
// calcada de "Listado de Procedimientos contratados para el Tercero (KCNT)"
// del sistema legacy (encargo explícito, ver captura adjunta), modal
// "grande" (960px, encargo explícito) con el mismo look de
// CatalogoAseguradorasModal (varios buscadores + tabla con borde + fila-
// botón seleccionable + paginación real). Simplificado de la referencia
// (mismo criterio ya aplicado en CatalogoAseguradorasModal -- ver su
// comentario): la referencia separaba "Descripción/Id. Servicio" de
// "Descripción/Id. CUPS" como 4 campos + botón "Buscar [F12]"; acá Servicio
// y CUPS son el mismo dato en el mock (no hay una capa CUPS distinta), así
// que quedan 2 buscadores (Id./Descripción) + filtro de Prefijo, todo
// filtrando en vivo -- sin botón "Buscar" aparte, mismo criterio que el
// resto de catálogos de este proyecto (filtran mientras se escribe).
export default function CatalogoProcedimientosModal({ onSelect, onClose }) {
  const [queryId, setQueryId] = useState('');
  const [queryDescripcion, setQueryDescripcion] = useState('');
  const [prefijo, setPrefijo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [seleccion, setSeleccion] = useState(null);

  function handleQueryId(v) {
    setQueryId(v);
    setPage(1);
  }
  function handleQueryDescripcion(v) {
    setQueryDescripcion(v);
    setPage(1);
  }
  function handlePrefijo(v) {
    setPrefijo(v);
    setPage(1);
  }
  function handleChangePageSize(v) {
    setPageSize(v);
    setPage(1);
  }

  const qId = normalizar(queryId.trim());
  const qDescripcion = normalizar(queryDescripcion.trim());
  const filtered = PROCEDIMIENTOS_QX_CATALOGO.filter((p) => (
    (!qId || normalizar(p.idServicio).includes(qId))
    && (!qDescripcion || normalizar(p.descripcion).includes(qDescripcion))
    && (!prefijo || p.prefijo === prefijo)
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
    onSelect(`${seleccion.idServicio} - ${seleccion.descripcion}`);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cpm-modal-card" role="dialog" aria-modal="true" aria-labelledby="cpm-title">
        <ModalHeader
          title="Seleccionar procedimiento quirúrgico"
          titleId="cpm-title"
          onClose={onClose}
          closeLabel="Cerrar búsqueda de procedimiento"
        />
        <div className="modal-body cpm-body">
          <div className="cpm-search-row">
            <div className="cpm-search">
              <LuSearch className="icon" aria-hidden="true" />
              <input
                type="text"
                value={queryId}
                onChange={(e) => handleQueryId(e.target.value)}
                placeholder="Buscar por Id. servicio"
                aria-label="Buscar por Id. servicio"
              />
            </div>
            <div className="cpm-search cpm-search-wide">
              <LuSearch className="icon" aria-hidden="true" />
              <input
                type="text"
                value={queryDescripcion}
                onChange={(e) => handleQueryDescripcion(e.target.value)}
                placeholder="Buscar por descripción del servicio"
                aria-label="Buscar por descripción del servicio"
              />
            </div>
            <FormSelect
              value={prefijo}
              onChange={handlePrefijo}
              options={PREFIJO_OPTIONS}
              ariaLabel="Filtrar por prefijo"
            />
          </div>

          <div className="cpm-table">
            <div className="cpm-row cpm-row-head">
              <span>Prefijo</span>
              <span>Id. Servicio</span>
              <span>Descripción servicio</span>
            </div>
            <div className="cpm-list" role="listbox" aria-labelledby="cpm-title">
              {pageItems.length === 0 && (
                <div className="cpm-empty">Sin resultados para los filtros aplicados.</div>
              )}
              {pageItems.map((p) => {
                const active = seleccion?.idServicio === p.idServicio;
                return (
                  <button
                    type="button"
                    key={p.idServicio}
                    role="option"
                    aria-selected={active}
                    className={`cpm-row cpm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(p)}
                  >
                    <span className="cpm-prefijo">{p.prefijo}</span>
                    <span className="cpm-id">{p.idServicio}</span>
                    <span className="cpm-descripcion">{p.descripcion}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {total > 0 && (
            <div className="cpm-pagination">
              <span className="cpm-pagination-label">
                {start}–{end} de {total} registros
              </span>

              <div className="cpm-pagination-controls">
                <label className="cpm-pagination-size">
                  <select value={pageSize} onChange={(e) => handleChangePageSize(Number(e.target.value))} aria-label="Registros por página">
                    {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>

                <button
                  type="button"
                  className="cpm-pagination-nav-btn"
                  aria-label="Página anterior"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <LuChevronLeft className="icon" />
                </button>

                {paginas.map((p, i) => (
                  p === '...' ? <span key={`ellipsis-${i}`} className="cpm-pagination-ellipsis">…</span> : (
                    <button
                      type="button"
                      key={p}
                      className={`cpm-pagination-page${p === currentPage ? ' active' : ''}`}
                      aria-current={p === currentPage ? 'page' : undefined}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                ))}

                <button
                  type="button"
                  className="cpm-pagination-nav-btn"
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
