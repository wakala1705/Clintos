'use client';

import { useEffect, useRef, useState } from 'react';
import './LoteRowMenu.css';
import { LuClipboardCheck, LuEllipsis, LuRefreshCw, LuTrash2 } from 'react-icons/lu';

// Menú "⋮" de la columna Acciones de LotesDisponiblesTable -- agrupa
// Sugerir/Movimiento/Borrar (encargo explícito), mismo patrón autocontenido
// (estado local de apertura/cierre + cierre por click-afuera/Escape) que
// MovimientoRowMenu.jsx (ver AGENTS.md "Component organization"). "Editar"
// queda como botón directo al lado del trigger, fuera de este menú (encargo
// explícito) -- es la acción más frecuente de la fila, no una secundaria.
// Sin acciones reales todavía (visual-only, mismo criterio que el resto de
// AlistarPedidoModal, ver ese componente).
export default function LoteRowMenu({ itemLabel }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleItem(e) {
    e.stopPropagation();
    setOpen(false);
  }

  return (
    <div className="mig-lote-row-menu" ref={rootRef}>
      <button
        type="button"
        className="mig-lote-row-menu-btn"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más opciones para el lote ${itemLabel}`}
        title="Más opciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div className="mig-lote-row-menu-dropdown" role="menu">
          <button type="button" className="mig-lote-row-menu-item" role="menuitem" onClick={handleItem}>
            <LuRefreshCw className="icon" aria-hidden="true" />
            Sugerir
          </button>
          <button type="button" className="mig-lote-row-menu-item" role="menuitem" onClick={handleItem}>
            <LuClipboardCheck className="icon" aria-hidden="true" />
            Movimiento
          </button>
          <button type="button" className="mig-lote-row-menu-item mig-lote-row-menu-item-danger" role="menuitem" onClick={handleItem}>
            <LuTrash2 className="icon" aria-hidden="true" />
            Borrar
          </button>
        </div>
      )}
    </div>
  );
}
