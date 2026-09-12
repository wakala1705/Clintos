'use client';

import { useEffect, useRef, useState } from 'react';
import './LoteRowMenu.css';
import { LuClipboardCheck, LuEllipsis, LuPencil, LuTrash2 } from 'react-icons/lu';

// Menú "⋮" de la columna Acciones de LotesDisponiblesTable -- agrupa
// Editar/Movimiento/Borrar (encargo explícito), mismo patrón autocontenido
// (estado local de apertura/cierre + cierre por click-afuera/Escape) que
// MovimientoRowMenu.jsx (ver AGENTS.md "Component organization"). "Sugerir"
// se sacó de acá (encargo explícito) -- pasó a ser el botón directo al lado
// del trigger (ver LotesDisponiblesTable.jsx): es la acción más frecuente
// del flujo de reparto. "Editar" entró en su lugar -- ya tiene un
// disparador propio más rápido (doble clic en la fila), así que no
// necesitaba también un botón directo; acá solo abre EditarLoteModal vía
// `onEditar`. Movimiento/Borrar siguen visual-only (mismo criterio que el
// resto de AlistarPedidoModal).
export default function LoteRowMenu({ itemLabel, onEditar }) {
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
          <button type="button" className="mig-lote-row-menu-item" role="menuitem" onClick={(e) => { handleItem(e); onEditar(); }}>
            <LuPencil className="icon" aria-hidden="true" />
            Editar
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
