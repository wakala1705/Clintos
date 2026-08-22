'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import './BedActionsMenu.css';
import { MENU_ACCIONES } from '@/hooks/GestionCamas/mockCamasData';
import { LuEllipsis } from 'react-icons/lu';

// Contenedor con scroll más cercano (overflow-y auto/scroll) — el dropdown
// necesita saber contra qué borde puede desbordar (el `.cb-body-wrap`/
// `.modal-body` que lo scrollea, no necesariamente el viewport completo),
// sin que este componente necesite conocer el nombre de esa clase en cada
// feature que lo monta (Gestión de Camas/Bed Board de Enfermería...).
function getScrollParent(node) {
  let el = node?.parentElement;
  while (el && el !== document.body) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') return el;
    el = el.parentElement;
  }
  return null;
}

// Menú "⋯" — mismo patrón autocontenido que RowActionsMenu.jsx (estado
// local de apertura + cierre por click-afuera/Escape). Las opciones vienen
// de MENU_ACCIONES[estado] (mockCamasData.js): solo las válidas para el
// estado actual de la cama (encargo explícito), nunca una lista fija.
//
// Se abre hacia abajo por defecto; si la tarjeta está cerca del borde
// inferior del contenedor con scroll (última fila de la grilla), el
// dropdown desbordaba ese contenedor y agrandaba su scroll con espacio en
// blanco extra — un useLayoutEffect mide el dropdown apenas se abre (antes
// de pintar, sin parpadeo) y lo voltea hacia arriba (`.menu-up`) cuando no
// entra completo.
export default function BedActionsMenu({ estado, numero, onAction }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const rootRef = useRef(null);
  const dropdownRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !dropdownRef.current) return;
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const scrollParent = getScrollParent(rootRef.current);
    const limiteInferior = scrollParent ? scrollParent.getBoundingClientRect().bottom : window.innerHeight;
    setOpenUp(dropdownRect.bottom > limiteInferior);
  }, [open]);

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
        <div ref={dropdownRef} className={`cb-actions-menu-dropdown${openUp ? ' menu-up' : ''}`} role="menu">
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
