'use client';

import { useEffect, useState } from 'react';
import './CatalogoSalasModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuSearch } from 'react-icons/lu';

// Quita tildes para que la búsqueda encuentre "quirofano" al escribir
// "quirófano" o viceversa — mismo helper que FiltroPickerModal.jsx de
// AsignacionCitas (no importado desde ahí para no acoplar dos features por
// un componente de picker, ver AGENTS.md "Component organization"), pero acá
// homologamos su mismo look (buscador + tabla con borde + fila-botón
// seleccionable + footer Cancelar/Seleccionar) para que todo picker en modal
// del proyecto se vea igual.
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// La fila elegida queda "pendiente" (estado local `seleccion`) hasta
// confirmar con "Seleccionar" -- cerrar con la X o "Cancelar" descarta la
// fila resaltada sin tocar el filtro, mismo criterio que FiltroPickerModal.
export default function CatalogoSalasModal({
  salas, value, onSelect, onClose,
}) {
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState(value);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = normalizar(query.trim());
  const filtered = q
    ? salas.filter((s) => normalizar(s.descripcion).includes(q) || normalizar(s.idSala).includes(q))
    : salas;

  function handleConfirm() {
    if (seleccion !== value) onSelect(seleccion);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card csm-modal-card" role="dialog" aria-modal="true" aria-labelledby="csm-title">
        <ModalHeader
          title="Catálogo de salas de cirugía"
          titleId="csm-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo de salas"
        />
        <div className="modal-body csm-body">
          <div className="csm-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o ID..."
              aria-label="Buscar por nombre o ID..."
            />
          </div>

          <div className="csm-table">
            <div className="csm-row csm-row-head">
              <span>Id. Sala</span>
              <span>Descripción</span>
              <span>Estado</span>
              <span className="csm-complejidad-head">Complejidad</span>
            </div>
            <div className="csm-list" role="listbox" aria-labelledby="csm-title">
              {filtered.length === 0 && (
                <div className="csm-empty">Sin resultados para &quot;{query}&quot;.</div>
              )}
              {filtered.map((s) => {
                const active = s.value === seleccion;
                return (
                  <button
                    type="button"
                    key={s.value}
                    role="option"
                    aria-selected={active}
                    className={`csm-row csm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(s.value)}
                  >
                    <span className="csm-id">{s.idSala}</span>
                    <span className="csm-option-label">{s.descripcion}</span>
                    <span className={`csm-badge${s.estado === 'Activo' ? ' csm-badge-activo' : ' csm-badge-mantenimiento'}`}>
                      {s.estado}
                    </span>
                    <span className="csm-complejidad">{s.complejidad}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={!seleccion}>Seleccionar</Button>
        </div>
      </div>
    </div>
  );
}
