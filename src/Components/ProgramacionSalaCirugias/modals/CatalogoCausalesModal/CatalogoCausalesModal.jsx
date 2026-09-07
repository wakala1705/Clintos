'use client';

import { useEffect, useState } from 'react';
import './CatalogoCausalesModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuSearch } from 'react-icons/lu';

// Quita tildes para que la búsqueda encuentre "cancelacion" al escribir
// "cancelación" o viceversa -- mismo helper que CatalogoSalasModal.jsx (no
// compartido entre los 2, ver AGENTS.md "Component organization").
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// "Causales de anulación (CAU)" -- ventana de búsqueda de "Causal de
// reprogramación" en ReprogramarCirugiaModal (encargo explícito, ver
// capturas adjuntas). Mismo look que CatalogoSalasModal (buscador + tabla
// con borde + fila-botón seleccionable + footer Cancelar/Seleccionar, sin
// paginación real -- la referencia tampoco la tiene, solo scroll) en vez del
// de CatalogoMedicosModal (con paginación): el catálogo es chico y cabe
// scrolleado, igual que la referencia.
export default function CatalogoCausalesModal({
  causales, value, onSelect, onClose,
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
    ? causales.filter((c) => normalizar(c.descripcion).includes(q) || normalizar(c.idCausal).includes(q))
    : causales;

  function handleConfirm() {
    if (seleccion !== value) onSelect(seleccion);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card ccam-modal-card" role="dialog" aria-modal="true" aria-labelledby="ccam-title">
        <ModalHeader
          title="Causales de anulación"
          titleId="ccam-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo de causales"
        />
        <div className="modal-body ccam-body">
          <div className="ccam-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por descripción o ID..."
              aria-label="Buscar por descripción o ID..."
            />
          </div>

          <div className="ccam-table">
            <div className="ccam-row ccam-row-head">
              <span>Id. Causal</span>
              <span>Descripción</span>
            </div>
            <div className="ccam-list" role="listbox" aria-labelledby="ccam-title">
              {filtered.length === 0 && (
                <div className="ccam-empty">Sin resultados para &quot;{query}&quot;.</div>
              )}
              {filtered.map((c) => {
                const active = c.idCausal === seleccion;
                return (
                  <button
                    type="button"
                    key={c.idCausal}
                    role="option"
                    aria-selected={active}
                    className={`ccam-row ccam-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(c.idCausal)}
                  >
                    <span className="ccam-id">{c.idCausal}</span>
                    <span className="ccam-option-label">{c.descripcion}</span>
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
