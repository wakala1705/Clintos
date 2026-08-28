'use client';

import { useEffect, useRef, useState } from 'react';
import './TurnoRowActionsMenu.css';
import { LuEllipsis, LuPause, LuPencil, LuPlay } from 'react-icons/lu';

// Menú "⋮" de Tipos de turno — mismo patrón autocontenido que RowActionsMenu
// de Panel General (estado local de apertura/cierre + cierre por
// click-afuera/Escape, ver AGENTS.md). Sin modal de confirmación para
// activar/desactivar: no hay motivo que capturar a este nivel (a diferencia
// de "Desactivar cama", que sí lo requiere).
export default function TurnoRowActionsMenu({ turno, onEditar, onToggleEstado }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
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

  function handleItem(action) {
    setOpen(false);
    action();
  }

  const activo = turno.estado === 'activo';

  return (
    <div className="ct-row-menu" ref={rootRef}>
      <button
        type="button"
        className="ct-row-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para el turno ${turno.nombre}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div className="ct-row-menu-dropdown" role="menu">
          <button type="button" className="ct-row-menu-item" role="menuitem" onClick={() => handleItem(() => onEditar(turno))}>
            <LuPencil className="icon" aria-hidden="true" />
            Editar
          </button>
          <button type="button" className="ct-row-menu-item" role="menuitem" onClick={() => handleItem(() => onToggleEstado(turno))}>
            {activo ? <LuPause className="icon" aria-hidden="true" /> : <LuPlay className="icon" aria-hidden="true" />}
            {activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      )}
    </div>
  );
}
