'use client';

import { useEffect, useRef, useState } from 'react';
import './RowActionsMenu.css';
import { LuEllipsis, LuPencil, LuUserX } from 'react-icons/lu';

// Menú "más acciones" de una fila, con el mismo patrón autocontenido que
// UserMenu (estado local de apertura/cierre + cierre por click-afuera/Escape)
// en vez del patrón imperativo de menú-único-reposicionado que usa el resto
// del proyecto (legacy-nueva-cita.js) — esta pantalla es código nuevo, no un
// port de un mockup HTML, así que no arrastra esa restricción.
export default function RowActionsMenu({ canEdit, canInactivate, onEditar, onInactivar }) {
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

  if (!canEdit && !canInactivate) return <span className="lp-row-menu-spacer" aria-hidden="true"></span>;

  return (
    <div className="lp-row-menu" ref={rootRef}>
      <button
        type="button"
        className="lp-row-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Más acciones"
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div className="lp-row-menu-dropdown" role="menu">
          {canEdit && (
            <button
              type="button"
              className="lp-row-menu-item"
              role="menuitem"
              onClick={() => { setOpen(false); onEditar(); }}
            >
              <LuPencil className="icon" aria-hidden="true" />
              Editar datos
            </button>
          )}
          {canInactivate && (
            <button
              type="button"
              className="lp-row-menu-item danger"
              role="menuitem"
              onClick={() => { setOpen(false); onInactivar(); }}
            >
              <LuUserX className="icon" aria-hidden="true" />
              Inactivar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
