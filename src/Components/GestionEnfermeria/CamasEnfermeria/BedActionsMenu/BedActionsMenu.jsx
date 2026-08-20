'use client';

import { useEffect, useRef, useState } from 'react';
import './BedActionsMenu.css';
import { MENU_ACCIONES } from '@/hooks/GestionEnfermeria/mockCamasData';
import { LuEllipsis } from 'react-icons/lu';

// Menú "⋯" — mismo patrón autocontenido que RowActionsMenu.jsx (estado
// local de apertura + cierre por click-afuera/Escape). Las opciones vienen
// de MENU_ACCIONES[estado] (mockCamasData.js): solo las válidas para el
// estado actual de la cama (encargo explícito), nunca una lista fija.
export default function BedActionsMenu({ estado, numero, onAction }) {
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
    onAction(action);
  }

  return (
    <div className="cb-actions-menu" ref={rootRef}>
      <button
        type="button"
        className="cb-actions-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para cama ${numero}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div className="cb-actions-menu-dropdown" role="menu">
          {MENU_ACCIONES[estado].map((item) => (
            <button
              type="button"
              key={item.action}
              className="cb-actions-menu-item"
              role="menuitem"
              onClick={() => handleItem(item.action)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
