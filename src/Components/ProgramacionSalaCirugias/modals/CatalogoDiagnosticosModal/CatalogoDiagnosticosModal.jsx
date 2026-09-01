'use client';

import { useState } from 'react';
import './CatalogoDiagnosticosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { DIAGNOSTICOS_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const SEXO_OPTIONS = [
  { value: '', label: 'Todos los sexos' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Masculino', label: 'Masculino' },
];

// Quita tildes -- mismo helper que CatalogoSalasModal.jsx (no compartido
// entre ambos para no acoplar dos modales de catálogo por un util, ver
// AGENTS.md "Component organization").
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

// Ventana de búsqueda de "Dx. ingreso" (encargo explícito, ver onBuscar en
// InformacionGeneralStep.jsx) -- mismo look que CatalogoSalasModal
// (buscador + tabla con borde + fila-botón seleccionable + footer
// Cancelar/Confirmar), con 2 buscadores (Descripción/Código) + filtro de
// sexo y paginación real sobre DIAGNOSTICOS_CATALOGO en vez del "12423
// registros" fijo de la captura de referencia -- ver comentario del
// catálogo en mockCirugiaData.js.
//
// El filtro de sexo es inclusivo: eligiendo "Femenino"/"Masculino" muestra
// ese sexo + los diagnósticos "Ambos" (no excluye los genéricos), igual que
// un filtro de aplicabilidad clínica esperaría comportarse.
export default function CatalogoDiagnosticosModal({ onSelect, onClose }) {
  const [queryDescripcion, setQueryDescripcion] = useState('');
  const [queryCodigo, setQueryCodigo] = useState('');
  const [sexo, setSexo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [seleccion, setSeleccion] = useState(null);

  function handleQueryDescripcion(v) {
    setQueryDescripcion(v);
    setPage(1);
  }
  function handleQueryCodigo(v) {
    setQueryCodigo(v);
    setPage(1);
  }
  function handleSexo(v) {
    setSexo(v);
    setPage(1);
  }
  function handleChangePageSize(v) {
    setPageSize(v);
    setPage(1);
  }

  const qDescripcion = normalizar(queryDescripcion.trim());
  const qCodigo = normalizar(queryCodigo.trim());
  const filtered = DIAGNOSTICOS_CATALOGO.filter((d) => (
    (!qDescripcion || normalizar(d.descripcion).includes(qDescripcion))
    && (!qCodigo || normalizar(d.codigo).includes(qCodigo))
    && (!sexo || d.sexo === sexo || d.sexo === 'Ambos')
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
    onSelect(`${seleccion.codigo} - ${seleccion.descripcion}`);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cdm-modal-card" role="dialog" aria-modal="true" aria-labelledby="cdm-title">
        <ModalHeader
          title="Seleccionar diagnóstico"
          titleId="cdm-title"
          onClose={onClose}
          closeLabel="Cerrar búsqueda de diagnóstico"
        />
        <div className="modal-body cdm-body">
          <div className="cdm-search-row">
            <div className="cdm-search">
              <LuSearch className="icon" aria-hidden="true" />
              <input
                type="text"
                value={queryDescripcion}
                onChange={(e) => handleQueryDescripcion(e.target.value)}
                placeholder="Buscar por descripción"
                aria-label="Buscar por descripción"
              />
            </div>
            <div className="cdm-search">
              <LuSearch className="icon" aria-hidden="true" />
              <input
                type="text"
                value={queryCodigo}
                onChange={(e) => handleQueryCodigo(e.target.value)}
                placeholder="Buscar por código"
                aria-label="Buscar por código"
              />
            </div>
            <FormSelect
              value={sexo}
              onChange={handleSexo}
              options={SEXO_OPTIONS}
              ariaLabel="Filtrar por sexo"
            />
          </div>

          <div className="cdm-table">
            <div className="cdm-row cdm-row-head">
              <span>Código</span>
              <span>Descripción</span>
            </div>
            <div className="cdm-list" role="listbox" aria-labelledby="cdm-title">
              {pageItems.length === 0 && (
                <div className="cdm-empty">Sin resultados para los filtros aplicados.</div>
              )}
              {pageItems.map((d) => {
                const active = seleccion?.codigo === d.codigo;
                return (
                  <button
                    type="button"
                    key={d.codigo}
                    role="option"
                    aria-selected={active}
                    className={`cdm-row cdm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(d)}
                  >
                    <span className="cdm-codigo">{d.codigo}</span>
                    <span className="cdm-descripcion">{d.descripcion}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {total > 0 && (
            <div className="cdm-pagination">
              <span className="cdm-pagination-label">
                {start}–{end} de {total} registros
              </span>

              <div className="cdm-pagination-controls">
                <label className="cdm-pagination-size">
                  <select value={pageSize} onChange={(e) => handleChangePageSize(Number(e.target.value))} aria-label="Registros por página">
                    {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>

                <button
                  type="button"
                  className="cdm-pagination-nav-btn"
                  aria-label="Página anterior"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <LuChevronLeft className="icon" />
                </button>

                {paginas.map((p, i) => (
                  p === '...' ? <span key={`ellipsis-${i}`} className="cdm-pagination-ellipsis">…</span> : (
                    <button
                      type="button"
                      key={p}
                      className={`cdm-pagination-page${p === currentPage ? ' active' : ''}`}
                      aria-current={p === currentPage ? 'page' : undefined}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                ))}

                <button
                  type="button"
                  className="cdm-pagination-nav-btn"
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
