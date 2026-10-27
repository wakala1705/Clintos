'use client';

import { useEffect, useState } from 'react';
import './CatalogoInstitucionesModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import SearchField from '@/Components/SearchField/SearchField';

// Quita tildes para que la búsqueda no distinga "clínica" de "clinica".
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Picker de la institución que remite la orden externa. Mismo look que el resto
// de catálogos en modal (buscador + tabla con borde + fila-botón + footer
// Cancelar/Seleccionar); la fila elegida queda pendiente hasta "Seleccionar".
// `instituciones` es `[{ value, label }]` y `onSelect` recibe el `value`.
export default function CatalogoInstitucionesModal({
  instituciones, value, onSelect, onClose,
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
  const filtradas = q ? instituciones.filter((i) => normalizar(i.label).includes(q)) : instituciones;

  function handleConfirm() {
    onSelect(seleccion);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cim-modal-card" role="dialog" aria-modal="true" aria-labelledby="cim-title">
        <ModalHeader
          title="Seleccionar institución"
          titleId="cim-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo de instituciones"
        />
        <div className="modal-body cim-body">
          <SearchField value={query} onChange={setQuery} placeholder="Buscar por nombre..." ariaLabel="Buscar institución por nombre" />

          <div className="cim-table">
            <div className="cim-row cim-row-head">
              <span>Institución</span>
            </div>
            <div className="cim-list" role="listbox" aria-labelledby="cim-title">
              {filtradas.length === 0 && (
                <div className="cim-empty">Sin resultados para &quot;{query}&quot;.</div>
              )}
              {filtradas.map((i) => {
                const active = i.value === seleccion;
                return (
                  <button
                    type="button"
                    key={i.value}
                    role="option"
                    aria-selected={active}
                    className={`cim-row cim-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(i.value)}
                  >
                    {i.label}
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
