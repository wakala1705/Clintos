'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './BedActionsMenu.css';
import { MENU_ACCIONES } from '@/hooks/GestionCamas/mockCamasData';
import { LuEllipsis } from 'react-icons/lu';

// Menú "⋯" — mismo patrón autocontenido que RowActionsMenu.jsx (estado
// local de apertura + cierre por click-afuera/Escape). Las opciones vienen
// de MENU_ACCIONES[estado] (mockCamasData.js): solo las válidas para el
// estado actual de la cama (encargo explícito), nunca una lista fija.
//
// Portal a document.body + position:fixed (mismo patrón que el dropdown de
// FormSelect y los tooltips flotantes de los sidebars, ver AGENTS.md/bitácora
// de esta sesión): BedCard tiene `overflow:hidden` en `.cb-card` (recorta
// los 2 paneles a las esquinas redondeadas de la tarjeta, ver BedCard.css) y
// el dropdown, con 2-3 ítems, es más alto que la tarjeta compacta — sin
// portal, el propio `.cb-card` le cortaba el borde inferior. Coordenadas
// calculadas desde el botón (`getBoundingClientRect`), recalculadas en
// scroll (capture:true)/resize para que seguir siguiendo al botón dentro
// del contenedor con scroll (`.cb-body-wrap`/`.bb-modal-body`).
export default function BedActionsMenu({ estado, numero, onAction }) {
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

  // 2 pasadas (mismo motivo que el tooltip flotante de los sidebars): la
  // primera ubica el dropdown hacia abajo para poder medir su altura real;
  // si no entra antes del borde inferior del viewport, la 2da pasada lo
  // reubica hacia arriba con esa altura ya conocida.
  useLayoutEffect(() => {
    if (!open) return;
    calcularPosicion();
    calcularPosicion();
  }, [open]);

  useEffect(() => {
    if (!open) return;
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

  function handleItem(action) {
    setOpen(false);
    onAction(action);
  }

  return (
    <div className="cb-actions-menu">
      <button
        type="button"
        ref={btnRef}
        className="cb-actions-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para cama ${numero}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && pos && createPortal(
        <div
          ref={dropdownRef}
          className={`cb-actions-menu-dropdown${pos.openUp ? ' menu-up' : ''}`}
          role="menu"
          style={{ top: pos.top, bottom: pos.bottom, right: pos.right }}
        >
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
        </div>,
        document.body,
      )}
    </div>
  );
}
