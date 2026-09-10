'use client';

import { useEffect, useRef, useState } from 'react';
import './MovimientoRowMenu.css';
import {
  LuBan, LuEllipsis, LuEye, LuPackage, LuPencil, LuPrinter,
} from 'react-icons/lu';

// Menú "⋮" que agrupa Editar/Ver detalle/Imprimir/Anular -- mismo patrón
// autocontenido (estado local de apertura/cierre + cierre por click-afuera/
// Escape) que TaskRowMenu/RowActionsMenu, ver AGENTS.md "Component
// organization". "Editar" vivía como botón directo en la fila
// (MovimientosGrid.jsx); se movió acá (encargo explícito) para no repartir
// las acciones de la columna en dos disparadores distintos. "Ver detalle"
// abre MovimientoDetalleModal (único ítem con efecto real); Editar/Imprimir/
// Anular siguen visual-only (sin modales todavía, ver spec). "Alistar
// pedido" (encargo explícito) solo aparece para movimientos en estado "Sin
// Confirmar" -- es la acción principal de esa fila, por eso va primera en
// la lista; abre AlistarPedidoModal (leyenda "en desarrollo", ver ese
// componente), mismo trigger que el doble clic en la fila (MovimientosGrid.jsx).
export default function MovimientoRowMenu({
  consecutivo, estado, onVerDetalle, onAlistarPedido,
}) {
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
          {estado === 'sin-confirmar' && (
            <button type="button" className="mig-row-menu-item" role="menuitem" onClick={(e) => { handleItem(e); onAlistarPedido(); }}>
              <LuPackage className="icon" aria-hidden="true" />
              Alistar pedido
            </button>
          )}
          <button type="button" className="mig-row-menu-item" role="menuitem" onClick={handleItem}>
            <LuPencil className="icon" aria-hidden="true" />
            Editar
          </button>
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
