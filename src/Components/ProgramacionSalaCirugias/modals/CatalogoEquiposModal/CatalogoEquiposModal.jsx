'use client';

import { useRef, useState } from 'react';
import './CatalogoEquiposModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { EQUIPOS_QX_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuSearch } from 'react-icons/lu';

// Quita tildes -- mismo helper que CatalogoInsumosModal.jsx/
// CatalogoMedicosModal.jsx (no compartido entre los 3, ver AGENTS.md
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

// Ventana de búsqueda del botón "Agregar equipo" en EquiposStep (Paso 4 del
// wizard "Nueva cirugía") -- mismo look/estructura que CatalogoInsumosModal
// (buscador + tabla con borde + fila-botón seleccionable), clases propias
// `.ceq-*` (ver AGENTS.md "Component organization"). Sin paginación: el
// catálogo de equipos (EQUIPOS_QX_CATALOGO) es chico, a diferencia de
// INSUMOS_CATALOGO/MEDICOS_CATALOGO. `onSelect` recibe el equipo completo
// `{nombre, tipo, identificacion}`.
export default function CatalogoEquiposModal({ onSelect, onClose }) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState(null);

  const q = normalizar(query.trim());
  const filtered = EQUIPOS_QX_CATALOGO.filter((e) => (
    !q || normalizar(e.nombre).includes(q) || normalizar(e.identificacion).includes(q)
  ));

  function handleConfirm() {
    if (!seleccion) return;
    onSelect(seleccion);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div ref={modalRef} className="modal-card ceq-modal-card" role="dialog" aria-modal="true" aria-labelledby="ceq-title">
        <ModalHeader
          title="Seleccionar equipo"
          titleId="ceq-title"
          onClose={onClose}
          closeLabel="Cerrar búsqueda de equipo"
        />
        <div className="modal-body ceq-body">
          <div className="ceq-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o identificación del equipo"
              aria-label="Buscar por nombre o identificación del equipo"
            />
          </div>

          <div className="ceq-table">
            <div className="ceq-row ceq-row-head">
              <span>Equipo</span>
              <span>Tipo</span>
              <span>Identificación</span>
            </div>
            <div className="ceq-list" role="listbox" aria-labelledby="ceq-title">
              {filtered.length === 0 && (
                <div className="ceq-empty">Sin resultados para los filtros aplicados.</div>
              )}
              {filtered.map((e) => {
                const active = seleccion?.identificacion === e.identificacion;
                return (
                  <button
                    type="button"
                    key={e.identificacion}
                    role="option"
                    aria-selected={active}
                    className={`ceq-row ceq-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(e)}
                  >
                    <span className="ceq-nombre">{e.nombre}</span>
                    <span className="ceq-tipo">{e.tipo}</span>
                    <span className="ceq-id">{e.identificacion}</span>
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
