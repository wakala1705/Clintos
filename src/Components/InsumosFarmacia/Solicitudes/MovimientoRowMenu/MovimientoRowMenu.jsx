'use client';

import { useEffect, useRef, useState } from 'react';
import './MovimientoRowMenu.css';
import {
  LuBan, LuEllipsis, LuEye, LuPrinter,
} from 'react-icons/lu';

// Menú "⋮" que agrupa Ver detalle/Imprimir/Anular -- mismo patrón
// autocontenido (estado local de apertura/cierre + cierre por click-afuera/
// Escape) que TaskRowMenu/RowActionsMenu, ver AGENTS.md "Component
// organization". "Editar" queda fuera, como botón directo en la fila (ver
// MovimientosGrid.jsx). "Ver detalle" abre MovimientoDetalleModal (único
// ítem con efecto real); Imprimir/Anular siguen visual-only (sin modales
// todavía, ver spec).
export default function MovimientoRowMenu({ consecutivo, onVerDetalle }) {
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
    <div className="mig-row-menu" ref={rootRef}>
      <button
        type="button"
        className="mig-row-menu-btn"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más opciones para el movimiento ${consecutivo}`}
        title="Más opciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div className="mig-row-menu-dropdown" role="menu">
          <button type="button" className="mig-row-menu-item" role="menuitem" onClick={(e) => { handleItem(e); onVerDetalle(); }}>
            <LuEye className="icon" aria-hidden="true" />
            Ver detalle
          </button>
          <button type="button" className="mig-row-menu-item" role="menuitem" onClick={handleItem}>
            <LuPrinter className="icon" aria-hidden="true" />
            Imprimir
          </button>
          <button type="button" className="mig-row-menu-item mig-row-menu-item-danger" role="menuitem" onClick={handleItem}>
            <LuBan className="icon" aria-hidden="true" />
            Anular
          </button>
        </div>
      )}
    </div>
  );
}
