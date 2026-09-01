'use client';

import { useState } from 'react';
import './CatalogoMedicosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { MEDICOS_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuChevronLeft, LuChevronRight, LuSearch } from 'react-icons/lu';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

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

// "Listado de médicos por tipo de Recurso Humano" -- ventana de búsqueda de
// Id. Cirujano/Id. Anestesiólogo en AgregarProcedimientoModal (encargo
// explícito, ver capturas adjuntas). Un solo modal compartido por los 2
// campos (`tipo`, encargo explícito: "debe ser un modal que soporte varios
// en la tabla") en vez de dos casi idénticos -- las capturas son
// literalmente la misma pantalla abierta dos veces con un filtro de rol
// distinto, MEDICOS_CATALOGO ya trae ambos roles. Mismo look que
// CatalogoAseguradorasModal (buscador + tabla con borde + fila-botón
// seleccionable + paginación real); un solo buscador (por nombre, mismo
// criterio que la referencia -- "Nombre del profesional:" es el único
// campo que muestra) en vez del botón "Buscar [F12]" aparte: acá filtra en
// vivo, como el resto de catálogos de este proyecto.
export default function CatalogoMedicosModal({
  tipo, onSelect, onClose,
}) {
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
  const filtered = MEDICOS_CATALOGO.filter((m) => (
    m.descripcion === tipo && (!q || normalizar(m.nombre).includes(q))
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
    onSelect(`${seleccion.idMedico} - ${seleccion.nombre}`);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cmm-modal-card" role="dialog" aria-modal="true" aria-labelledby="cmm-title">
        <ModalHeader
          title="Listado de médicos por tipo de Recurso Humano"
          titleId="cmm-title"
          onClose={onClose}
          closeLabel={`Cerrar búsqueda de ${tipo.toLowerCase()}`}
        />
        <div className="modal-body cmm-body">
          <div className="cmm-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Buscar por nombre del profesional"
              aria-label="Buscar por nombre del profesional"
            />
          </div>

          <div className="cmm-table">
            <div className="cmm-row cmm-row-head">
              <span>Id. Médico</span>
              <span>Nombre</span>
              <span>Descripción</span>
              <span>Sede</span>
            </div>
            <div className="cmm-list" role="listbox" aria-labelledby="cmm-title">
              {pageItems.length === 0 && (
                <div className="cmm-empty">Sin resultados para los filtros aplicados.</div>
              )}
              {pageItems.map((m) => {
                const active = seleccion?.idMedico === m.idMedico;
                return (
                  <button
                    type="button"
                    key={m.idMedico}
                    role="option"
                    aria-selected={active}
                    className={`cmm-row cmm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(m)}
                  >
                    <span className="cmm-id">{m.idMedico}</span>
                    <span className="cmm-nombre">{m.nombre}</span>
                    <span className="cmm-descripcion">{m.descripcion}</span>
                    <span className="cmm-sede">{m.sede}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {total > 0 && (
            <div className="cmm-pagination">
              <span className="cmm-pagination-label">
                {start}–{end} de {total} registros
              </span>

              <div className="cmm-pagination-controls">
                <label className="cmm-pagination-size">
                  <select value={pageSize} onChange={(e) => handleChangePageSize(Number(e.target.value))} aria-label="Registros por página">
                    {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>

                <button
                  type="button"
                  className="cmm-pagination-nav-btn"
                  aria-label="Página anterior"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <LuChevronLeft className="icon" />
                </button>

                {paginas.map((p, i) => (
                  p === '...' ? <span key={`ellipsis-${i}`} className="cmm-pagination-ellipsis">…</span> : (
                    <button
                      type="button"
                      key={p}
                      className={`cmm-pagination-page${p === currentPage ? ' active' : ''}`}
                      aria-current={p === currentPage ? 'page' : undefined}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                ))}

                <button
                  type="button"
                  className="cmm-pagination-nav-btn"
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
