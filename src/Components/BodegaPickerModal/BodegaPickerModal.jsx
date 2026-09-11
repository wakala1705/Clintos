'use client';

import { useEffect, useState } from 'react';
import './BodegaPickerModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuSearch } from 'react-icons/lu';
import { BODEGAS_CATALOGO } from '@/hooks/Bodega/bodega';

// Quita tildes para que la búsqueda encuentre "farmacia" al escribir
// "farmácia" o viceversa -- mismo helper que AllModulesModal.jsx/
// FiltroPickerModal.jsx (duplicado a propósito, ver comentario de esos
// archivos sobre por qué no se centraliza).
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Picker app-wide porque lo disparan tanto BodegaPickerButton (gate
// post-login de Home + meta-item "Bodega:" de Solicitudes) -- ver AGENTS.md
// "Component organization". Scaffolding de overlay/modal propio
// (.bdg-overlay/.bdg-modal/.bdg-body/.bdg-footer), no el .modal-overlay/
// .modal genérico de un shared.css por feature: al montarse desde 2+
// features (Home, InsumosFarmacia) no hay garantía de que ese shared.css
// esté cargado -- mismo criterio que AllModulesModal.css (.amm-overlay/
// .amm-modal). Búsqueda por id de grupo o descripción (encargo explícito) --
// el catálogo es corto hoy, pero el picker no asume que se quede así.
export default function BodegaPickerModal({ bodega, onSelect, onClose }) {
  const [seleccion, setSeleccion] = useState(bodega);
  const [query, setQuery] = useState('');

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function confirmar(b) {
    onSelect(b);
    onClose();
  }

  function handleElegir() {
    if (!seleccion) return;
    confirmar(seleccion);
  }

  const q = normalizar(query.trim());
  const bodegasFiltradas = q
    ? BODEGAS_CATALOGO.filter((b) => normalizar(b.idGrupo).includes(q) || normalizar(b.descripcion).includes(q))
    : BODEGAS_CATALOGO;

  return (
    <div className="bdg-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bdg-modal" role="dialog" aria-modal="true" aria-labelledby="bdg-title">
        <ModalHeader
          title="Seleccionar bodega"
          titleId="bdg-title"
          onClose={onClose}
          closeLabel="Cerrar selección de bodega"
        />

        <div className="bdg-body">
          <div className="bdg-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar bodega..."
              aria-label="Buscar bodega"
            />
          </div>

          <div className="bdg-table">
            <div className="bdg-row bdg-row-head">
              <span>Id. Grupo</span>
              <span>Descripción</span>
            </div>
            <div className="bdg-list" role="listbox" aria-labelledby="bdg-title">
              {bodegasFiltradas.length === 0 && (
                <p className="bdg-empty">Sin resultados para &quot;{query}&quot;.</p>
              )}
              {bodegasFiltradas.map((b) => {
                const active = seleccion?.idGrupo === b.idGrupo;
                return (
                  <button
                    type="button"
                    key={b.idGrupo}
                    role="option"
                    aria-selected={active}
                    className={`bdg-row bdg-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(b)}
                    onDoubleClick={() => confirmar(b)}
                  >
                    <span className="bdg-id">{b.idGrupo}</span>
                    <span className="bdg-descripcion">{b.descripcion}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bdg-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleElegir} disabled={!seleccion}>Aceptar</Button>
        </div>
      </div>
    </div>
  );
}
