'use client';

import { useState } from 'react';
import './CatalogoAseguradorasModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { ASEGURADORAS_CATALOGO } from '@/hooks/CatalogoAseguradorasModal/mockAseguradorasData';
import { LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Quita tildes -- mismo helper que AllModulesModal.jsx/FiltroPickerModal.jsx
// (no compartido entre features, ver AGENTS.md "Component organization").
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

// Picker de "Id. Tercero"/"Id. aseguradora" -- componente app-wide (ver
// AGENTS.md "Component organization": "App-wide components... viven
// directamente bajo src/Components/<ComponentName>/", no anidados en una
// sola feature). Nació en ProgramacionSalaCirugias (disparado desde el
// ícono de búsqueda de "Id. Aseguradora"/"Id. Contrato" en NuevaUrgenciaModal/
// InformacionGeneralStep) y se promovió acá cuando Facturación
// (FacturaEditarModalClasico) empezó a necesitar exactamente el mismo picker
// -- encargo explícito: "usa el mismo componente de programación de
// cirugía, en el de facturación" en vez de duplicarlo con datos propios.
// Chrome de modal completamente autocontenido (.cam-overlay/.cam-modal/
// .cam-body/.cam-footer, NO el `.modal-card` de ProgramacionSalaCirugias ni
// el `.modal` de Facturación/SolicitudConsumo) para poder montarse sin
// cambios en cualquier feature -- solo consume tokens de color (--primary/
// --border/--surface-modal/--ink-*/--bg/--gray-bg/--interactive-selected-*)
// y --z-modal, ya declarados por cada feature en su propio `:root` (mismo
// contrato que @/Components/ModalHeader/ModalHeader, ver AGENTS.md
// "Modales"). Sin focus trap (useModalFocusTrap es un hook propio de
// ProgramacionSalaCirugias, no se llevó acá): ningún consumidor de este
// picker lo necesitaba ya (NuevaUrgenciaModal/InformacionGeneralStep no lo
// usaban en su propio modal padre tampoco), mismo criterio simple de
// Escape+click-afuera que el resto de modales del proyecto.
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
    onSelect(seleccion.idTercero);
    onClose();
  }

  return (
    <div className="cam-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cam-modal" role="dialog" aria-modal="true" aria-labelledby="cam-title">
        <ModalHeader
          title="Seleccionar aseguradora"
          titleId="cam-title"
          onClose={onClose}
          closeLabel="Cerrar búsqueda de aseguradora"
        />
        <div className="cam-body">
          <div className="cam-search-row">
            <div className="cam-search">
              <LuSearch className="icon" aria-hidden="true" />
              <input
                type="text"
                value={queryId}
                onChange={(e) => handleQueryId(e.target.value)}
                placeholder="Buscar por Id."
                aria-label="Buscar por Id."
              />
            </div>
            <div className="cam-search">
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

          <div className="cam-table">
            <div className="cam-row cam-row-head">
              <span>Id. Tercero</span>
              <span>Razón social</span>
              <span>Id. Ciudad</span>
              <span>Ciudad</span>
            </div>
            <div className="cam-list" role="listbox" aria-labelledby="cam-title">
              {pageItems.length === 0 && (
                <div className="cam-empty">Sin resultados para los filtros aplicados.</div>
              )}
              {pageItems.map((a) => {
                const active = seleccion?.idTercero === a.idTercero;
                return (
                  <button
                    type="button"
                    key={a.idTercero}
                    role="option"
                    aria-selected={active}
                    className={`cam-row cam-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(a)}
                  >
                    <span className="cam-id">{a.idTercero}</span>
                    <span className="cam-razon-social">{a.razonSocial}</span>
                    <span className="cam-id">{a.idCiudad}</span>
                    <span className="cam-ciudad">{a.ciudad}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {total > 0 && (
            <div className="cam-pagination">
              <span className="cam-pagination-label">
                {start}–{end} de {total} registros
              </span>

              <div className="cam-pagination-controls">
                <label className="cam-pagination-size">
                  <select value={pageSize} onChange={(e) => handleChangePageSize(Number(e.target.value))} aria-label="Registros por página">
                    {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>

                <button
                  type="button"
                  className="cam-pagination-nav-btn"
                  aria-label="Página anterior"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <LuChevronLeft className="icon" />
                </button>

                {paginas.map((p, i) => (
                  p === '...' ? <span key={`ellipsis-${i}`} className="cam-pagination-ellipsis">…</span> : (
                    <button
                      type="button"
                      key={p}
                      className={`cam-pagination-page${p === currentPage ? ' active' : ''}`}
                      aria-current={p === currentPage ? 'page' : undefined}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                ))}

                <button
                  type="button"
                  className="cam-pagination-nav-btn"
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
        <div className="cam-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={!seleccion}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
