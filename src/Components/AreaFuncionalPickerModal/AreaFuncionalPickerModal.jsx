'use client';

import { useEffect, useState } from 'react';
import './AreaFuncionalPickerModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { AREAS_FUNCIONALES_CATALOGO } from '@/hooks/AreaFuncional/areaFuncional';
import { LuSearch } from 'react-icons/lu';

// Quita tildes -- mismo helper que AllModulesModal.jsx/CatalogoAseguradorasModal.jsx
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

// Picker de "Área Funcional" (encargo explícito, ver imagen de referencia) --
// análogo a @/Components/BodegaPickerModal pero para el módulo Asistencial
// (login.jsx dispara este o aquel según el módulo elegido). App-wide, chrome
// propio (.afp-overlay/.afp-modal/.afp-body/.afp-footer) con fallback inline
// en los tokens que no todas las features declaran todavía (--z-modal/
// --surface-modal/--radius-lg/--radius) -- mismo criterio que
// @/Components/CatalogoAseguradorasModal (.cam-*). Sin botón "Cancelar" en
// el footer (a diferencia de BodegaPickerModal): así lo muestra la
// referencia, cerrar con la "X" del header cumple el mismo rol.
export default function AreaFuncionalPickerModal({ area, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState(area);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = normalizar(query.trim());
  const filtradas = q
    ? AREAS_FUNCIONALES_CATALOGO.filter((a) => normalizar(a.id).includes(q) || normalizar(a.descripcion).includes(q))
    : AREAS_FUNCIONALES_CATALOGO;

  function confirmar(a) {
    onSelect(a);
    onClose();
  }

  function handleSeleccionar() {
    if (!seleccion) return;
    confirmar(seleccion);
  }

  return (
    <div className="afp-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="afp-modal" role="dialog" aria-modal="true" aria-labelledby="afp-title">
        <ModalHeader
          title="Seleccionar Área Funcional"
          titleId="afp-title"
          onClose={onClose}
          closeLabel="Cerrar selección de área funcional"
        />

        <div className="afp-body">
          <div className="afp-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar área funcional por ID o descripción..."
              aria-label="Buscar área funcional por ID o descripción"
            />
          </div>

          <div className="afp-table">
            <div className="afp-row afp-row-head">
              <span>ID</span>
              <span>Descripción</span>
            </div>
            <div className="afp-list" role="listbox" aria-labelledby="afp-title">
              {filtradas.length === 0 && (
                <div className="afp-empty">Sin resultados para &quot;{query}&quot;.</div>
              )}
              {filtradas.map((a) => {
                const active = seleccion?.id === a.id;
                return (
                  <button
                    type="button"
                    key={a.id}
                    role="option"
                    aria-selected={active}
                    className={`afp-row afp-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(a)}
                    onDoubleClick={() => confirmar(a)}
                  >
                    <span className="afp-id">{a.id}</span>
                    <span className="afp-descripcion">{a.descripcion}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="afp-footer">
          <Button variant="primary" onClick={handleSeleccionar} disabled={!seleccion}>Seleccionar</Button>
        </div>
      </div>
    </div>
  );
}
