'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import './CamaRowActionsMenu.css';
import { LuEllipsis } from 'react-icons/lu';

// Mismo patrón autocontenido + flip-up que BedActionsMenu (Bed Board): mide
// el dropdown apenas abre (useLayoutEffect, sin parpadeo) y lo voltea hacia
// arriba si no entra dentro del contenedor con scroll más cercano — mismas
// filas de la tabla al fondo de la página (ver getScrollParent).
function getScrollParent(node) {
  let el = node?.parentElement;
  while (el && el !== document.body) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') return el;
    el = el.parentElement;
  }
  return null;
}

export default function CamaRowActionsMenu({
  cama, onVerDetalle, onEditar, onCambiarEstado, onVerHistorial, onReservar, onTrasladar, onMantenimiento, onLimpieza,
}) {
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

  function handleItem(fn) {
    setOpen(false);
    fn(cama);
  }

  return (
    <div className="cba-actions-menu" ref={rootRef}>
      <button
        type="button"
        className="cba-actions-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para cama ${cama.codigo}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div ref={dropdownRef} className={`cba-actions-menu-dropdown${openUp ? ' menu-up' : ''}`} role="menu">
          <button type="button" className="cba-actions-menu-item" role="menuitem" onClick={() => handleItem(onVerDetalle)}>Ver detalle</button>
          <button type="button" className="cba-actions-menu-item" role="menuitem" onClick={() => handleItem(onEditar)}>Editar</button>
          <button type="button" className="cba-actions-menu-item" role="menuitem" onClick={() => handleItem(onCambiarEstado)}>Cambiar estado</button>
          <button type="button" className="cba-actions-menu-item" role="menuitem" onClick={() => handleItem(onVerHistorial)}>Ver historial</button>
          <button type="button" className="cba-actions-menu-item" role="menuitem" onClick={() => handleItem(onReservar)}>Reservas</button>
          <button type="button" className="cba-actions-menu-item" role="menuitem" onClick={() => handleItem(onTrasladar)}>Traslados</button>
          <button type="button" className="cba-actions-menu-item" role="menuitem" onClick={() => handleItem(onMantenimiento)}>Mantenimiento</button>
          <button type="button" className="cba-actions-menu-item" role="menuitem" onClick={() => handleItem(onLimpieza)}>Limpieza</button>
        </div>
      )}
    </div>
  );
}
