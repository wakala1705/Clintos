'use client';

import { useEffect, useState } from 'react';
import './SedePickerModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { SEDES_CATALOGO } from '@/hooks/Sede/sede';
import { LuSearch } from 'react-icons/lu';

// Quita tildes -- mismo helper que AreaFuncionalPickerModal.jsx (no
// compartido entre features, ver AGENTS.md "Component organization").
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Picker de "Sede" -- mismo layout y comportamiento que
// @/Components/AreaFuncionalPickerModal (clic selecciona, doble clic
// confirma, Escape/X cierran) pero con el catálogo de sedes. Chrome propio
// (.sp-*) por el mismo criterio app-wide, sin depender del shared.css de
// cada feature. A diferencia del de área, se puede cerrar sin elegir: la
// sede ya tiene un valor por defecto.
export default function SedePickerModal({ sede, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState(sede);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = normalizar(query.trim());
  const filtradas = q
    ? SEDES_CATALOGO.filter((s) => normalizar(s.id).includes(q) || normalizar(s.descripcion).includes(q))
    : SEDES_CATALOGO;

  function confirmar(s) {
    onSelect(s);
    onClose();
  }

  return (
    <div className="sp-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sp-modal" role="dialog" aria-modal="true" aria-labelledby="sp-title">
        <ModalHeader
          title="Seleccionar Sede"
          titleId="sp-title"
          onClose={onClose}
          closeLabel="Cerrar selección de sede"
        />

        <div className="sp-body">
          <div className="sp-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar sede por ID o descripción..."
              aria-label="Buscar sede por ID o descripción"
            />
          </div>

          <div className="sp-table">
            <div className="sp-row sp-row-head">
              <span>ID</span>
              <span>Descripción</span>
            </div>
            <div className="sp-list" role="listbox" aria-labelledby="sp-title">
              {filtradas.length === 0 && (
                <div className="sp-empty">Sin resultados para &quot;{query}&quot;.</div>
              )}
              {filtradas.map((s) => {
                const active = seleccion?.id === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    role="option"
                    aria-selected={active}
                    className={`sp-row sp-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(s)}
                    onDoubleClick={() => confirmar(s)}
                  >
                    <span className="sp-id">{s.id}</span>
                    <span className="sp-descripcion">{s.descripcion}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sp-footer">
          <Button variant="primary" onClick={() => seleccion && confirmar(seleccion)} disabled={!seleccion}>Seleccionar</Button>
        </div>
      </div>
    </div>
  );
}
