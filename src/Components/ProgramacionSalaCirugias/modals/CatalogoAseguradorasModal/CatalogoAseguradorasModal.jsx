'use client';

import { useState } from 'react';
import './CatalogoAseguradorasModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { ASEGURADORAS_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Quita tildes -- mismo helper que CatalogoSalasModal.jsx/
// CatalogoDiagnosticosModal.jsx (no compartido entre los 3, ver AGENTS.md
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

// Ventana de búsqueda de "Id. aseguradora" -- mismo look que
// CatalogoDiagnosticosModal (2 buscadores + tabla con borde + fila-botón
// seleccionable + footer Cancelar/Confirmar + paginación real). Sin tabs ni
// checkbox "Sólo activos" (encargo explícito: se simplificó a 2 buscadores
// simultáneos -- Id./Razón social -- en vez del único buscador con tabs de
// la primera versión).
export default function CatalogoAseguradorasModal({ onSelect, onClose }) {
  const [queryId, setQueryId] = useState('');
  const [queryRazonSocial, setQueryRazonSocial] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [seleccion, setSeleccion] = useState(null);

  function handleQueryId(v) {
    setQueryId(v);
    setPage(1);
  }
  function handleQueryRazonSocial(v) {
    setQueryRazonSocial(v);
    setPage(1);
  }
  function handleChangePageSize(v) {
    setPageSize(v);
    setPage(1);
  }

  const qId = normalizar(queryId.trim());
  const qRazonSocial = normalizar(queryRazonSocial.trim());
  const filtered = ASEGURADORAS_CATALOGO.filter((a) => (
    (!qId || normalizar(a.idTercero).includes(qId))
    && (!qRazonSocial || normalizar(a.razonSocial).includes(qRazonSocial))
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
    onSelect(`${seleccion.idTercero} - ${seleccion.razonSocial}`);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card caam-modal-card" role="dialog" aria-modal="true" aria-labelledby="caam-title">
        <ModalHeader
          title="Seleccionar aseguradora"
          titleId="caam-title"
          onClose={onClose}
          closeLabel="Cerrar búsqueda de aseguradora"
        />
        <div className="modal-body caam-body">
          <div className="caam-search-row">
            <div className="caam-search">
              <LuSearch className="icon" aria-hidden="true" />
              <input
                type="text"
                value={queryId}
                onChange={(e) => handleQueryId(e.target.value)}
                placeholder="Buscar por Id."
                aria-label="Buscar por Id."
              />
            </div>
            <div className="caam-search">
              <LuSearch className="icon" aria-hidden="true" />
              <input
                type="text"
                value={queryRazonSocial}
                onChange={(e) => handleQueryRazonSocial(e.target.value)}
                placeholder="Buscar por razón social"
                aria-label="Buscar por razón social"
              />
            </div>
          </div>

          <div className="caam-table">
            <div className="caam-row caam-row-head">
              <span>Id. Tercero</span>
              <span>Razón social</span>
              <span>Id. Ciudad</span>
              <span>Ciudad</span>
            </div>
            <div className="caam-list" role="listbox" aria-labelledby="caam-title">
              {pageItems.length === 0 && (
                <div className="caam-empty">Sin resultados para los filtros aplicados.</div>
              )}
              {pageItems.map((a) => {
                const active = seleccion?.idTercero === a.idTercero;
                return (
                  <button
                    type="button"
                    key={a.idTercero}
                    role="option"
                    aria-selected={active}
                    className={`caam-row caam-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(a)}
                  >
                    <span className="caam-id">{a.idTercero}</span>
                    <span className="caam-razon-social">{a.razonSocial}</span>
                    <span className="caam-id">{a.idCiudad}</span>
                    <span className="caam-ciudad">{a.ciudad}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {total > 0 && (
            <div className="caam-pagination">
              <span className="caam-pagination-label">
                {start}–{end} de {total} registros
              </span>

              <div className="caam-pagination-controls">
                <label className="caam-pagination-size">
                  <select value={pageSize} onChange={(e) => handleChangePageSize(Number(e.target.value))} aria-label="Registros por página">
                    {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>

                <button
                  type="button"
                  className="caam-pagination-nav-btn"
                  aria-label="Página anterior"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <LuChevronLeft className="icon" />
                </button>

                {paginas.map((p, i) => (
                  p === '...' ? <span key={`ellipsis-${i}`} className="caam-pagination-ellipsis">…</span> : (
                    <button
                      type="button"
                      key={p}
                      className={`caam-pagination-page${p === currentPage ? ' active' : ''}`}
                      aria-current={p === currentPage ? 'page' : undefined}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                ))}

                <button
                  type="button"
                  className="caam-pagination-nav-btn"
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
