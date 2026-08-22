'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import './InconsistenciaRowActionsMenu.css';
import { PUEDE_IGNORAR } from '@/hooks/GestionCamas/mockIntegridadData';
import { LuEllipsis } from 'react-icons/lu';

// Mismo patrón autocontenido + flip-up que CamaRowActionsMenu (Camas) —
// "Ignorar" solo aparece si PUEDE_IGNORAR (encargo, sección 7/8: "solo
// mostrarla si el usuario tiene permisos suficientes" — stand-in local de
// permisos, ver mockIntegridadData.js), y "Corregir"/"Ignorar" solo tienen
// sentido mientras la inconsistencia sigue Activa.
function getScrollParent(node) {
  let el = node?.parentElement;
  while (el && el !== document.body) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') return el;
    el = el.parentElement;
  }
  return null;
}

export default function InconsistenciaRowActionsMenu({
  inconsistencia, onVer, onCorregir, onIgnorar, onVerHistorial,
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
    fn(inconsistencia);
  }

  const esActiva = inconsistencia.estado === 'activa';

  return (
    <div className="cbi-actions-menu" ref={rootRef}>
      <button
        type="button"
        className="cbi-actions-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para ${inconsistencia.titulo}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div ref={dropdownRef} className={`cbi-actions-menu-dropdown${openUp ? ' menu-up' : ''}`} role="menu">
          <button type="button" className="cbi-actions-menu-item" role="menuitem" onClick={() => handleItem(onVer)}>Ver</button>
          {esActiva && (
            <button type="button" className="cbi-actions-menu-item" role="menuitem" onClick={() => handleItem(onCorregir)}>Corregir</button>
          )}
          {esActiva && PUEDE_IGNORAR && (
            <button type="button" className="cbi-actions-menu-item" role="menuitem" onClick={() => handleItem(onIgnorar)}>Ignorar</button>
          )}
          <button type="button" className="cbi-actions-menu-item" role="menuitem" onClick={() => handleItem(onVerHistorial)}>Ver historial</button>
        </div>
      )}
    </div>
  );
}
