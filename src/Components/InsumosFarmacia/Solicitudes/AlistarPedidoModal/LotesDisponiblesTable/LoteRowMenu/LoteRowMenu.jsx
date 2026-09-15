'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
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
//
// Portal a document.body + position:fixed (encargo explícito "revisa el
// dropdown que se corta") -- a diferencia de MovimientoRowMenu.jsx (que sí
// puede quedarse position:absolute porque su grilla no tiene un ancestro con
// overflow recortando activamente), este dropdown vive dentro de
// .mig-lotes-table-scroll/.mig-lotes-table-inner (LotesDisponiblesTable.css,
// overflow:hidden/auto con max-height:260px) -- position:absolute ahí
// quedaba recortado por ese overflow, cortando el último ítem ("Borrar") en
// vez de flotar libre. Mismo patrón (calcularPosicion con soporte
// "abrir hacia arriba" + reposicionar en scroll/resize) que
// MantenimientoRowActionsMenu.jsx/LimpiezaRowActionsMenu.jsx/
// ReservaRowActionsMenu.jsx de GestionCamas -- z-index un paso por encima de
// --z-modal (no --z-popover, que queda por debajo del modal) porque el
// portal cuelga directo de document.body, fuera del stacking context del
// modal.
export default function LoteRowMenu({ itemLabel, onEditar }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  function calcularPosicion() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight ?? 0;
    const openUp = dropdownHeight > 0 && rect.bottom + 4 + dropdownHeight > window.innerHeight;
    setPos({
      openUp,
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
      right: window.innerWidth - rect.right,
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    calcularPosicion();
    calcularPosicion();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target)
        && dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    function handleReposition() { calcularPosicion(); }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open]);

  function handleItem(e) {
    e.stopPropagation();
    setOpen(false);
  }

  return (
    <div className="mig-lote-row-menu">
      <button
        type="button"
        ref={btnRef}
        className="mig-lote-row-menu-btn"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más opciones para el lote ${itemLabel}`}
        title="Más opciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && pos && createPortal(
        <div
          ref={dropdownRef}
          className={`mig-lote-row-menu-dropdown${pos.openUp ? ' menu-up' : ''}`}
          role="menu"
          style={{ top: pos.top, bottom: pos.bottom, right: pos.right }}
        >
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
        </div>,
        document.body,
      )}
    </div>
  );
}
