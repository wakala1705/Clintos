'use client';

import { useState } from 'react';
import './CatalogoContratosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { CONTRATOS_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuSearch } from 'react-icons/lu';

// Quita tildes -- mismo helper que CatalogoEquiposModal.jsx/
// CatalogoInsumosModal.jsx (no compartido entre los 3, ver AGENTS.md
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

// Ventana de búsqueda de "Id. Contrato" en NuevaUrgenciaModal -- mismo look/
// estructura que CatalogoEquiposModal (buscador + tabla con borde + fila-
// botón seleccionable, sin paginación porque CONTRATOS_CATALOGO es chico),
// clases propias `.ccm-*` (ver AGENTS.md "Component organization").
// `onSelect` recibe el string "idContrato - descripción", mismo formato que
// CatalogoAseguradorasModal/CatalogoProcedimientosModal (precarga un input
// de texto, no un objeto estructurado).
export default function CatalogoContratosModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState(null);

  const q = normalizar(query.trim());
  const filtered = CONTRATOS_CATALOGO.filter((c) => (
    !q || normalizar(c.idContrato).includes(q) || normalizar(c.descripcion).includes(q)
  ));

  function handleConfirm() {
    if (!seleccion) return;
    onSelect(`${seleccion.idContrato} - ${seleccion.descripcion}`);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card ccm-modal-card" role="dialog" aria-modal="true" aria-labelledby="ccm-title">
        <ModalHeader
          title="Seleccionar contrato"
          titleId="ccm-title"
          onClose={onClose}
          closeLabel="Cerrar búsqueda de contrato"
        />
        <div className="modal-body ccm-body">
          <div className="ccm-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por Id. o descripción del contrato"
              aria-label="Buscar por Id. o descripción del contrato"
            />
          </div>

          <div className="ccm-table">
            <div className="ccm-row ccm-row-head">
              <span>Id. Contrato</span>
              <span>Descripción</span>
            </div>
            <div className="ccm-list" role="listbox" aria-labelledby="ccm-title">
              {filtered.length === 0 && (
                <div className="ccm-empty">Sin resultados para los filtros aplicados.</div>
              )}
              {filtered.map((c) => {
                const active = seleccion?.idContrato === c.idContrato;
                return (
                  <button
                    type="button"
                    key={c.idContrato}
                    role="option"
                    aria-selected={active}
                    className={`ccm-row ccm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(c)}
                  >
                    <span className="ccm-id">{c.idContrato}</span>
                    <span className="ccm-descripcion">{c.descripcion}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={!seleccion}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
