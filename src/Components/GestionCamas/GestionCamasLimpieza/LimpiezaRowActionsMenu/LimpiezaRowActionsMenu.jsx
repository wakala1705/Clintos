'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './LimpiezaRowActionsMenu.css';
import { MENU_ACCIONES } from '@/hooks/GestionCamas/mockLimpiezaData';
import { LuEllipsis, LuEye, LuHistory } from 'react-icons/lu';

// Solo acciones secundarias de solo-lectura en esta V1 (encargo sección 5) —
// Iniciar/Finalizar limpieza permanecen como CTA principal de la fila, nunca
// acá.
const ACCION_ICONO = {
  'ver-detalle': LuEye,
  'ver-historial': LuHistory,
};

// Menú "⋯" de la fila — mismo patrón autocontenido (portal a document.body +
// position:fixed, reposicionado en 2 pasadas) que BedActionsMenu.jsx: acciones
// secundarias que varían según MENU_ACCIONES[estado] (mockLimpiezaData.js),
// nunca una lista fija.
export default function LimpiezaRowActionsMenu({ estado, cama, onAction }) {
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
    <div className="cbl-actions-menu">
      <button
        type="button"
        ref={btnRef}
        className="cbl-actions-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para cama ${cama}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && pos && createPortal(
        <div
          ref={dropdownRef}
          className={`cbl-actions-menu-dropdown${pos.openUp ? ' menu-up' : ''}`}
          role="menu"
          style={{ top: pos.top, bottom: pos.bottom, right: pos.right }}
        >
          {(MENU_ACCIONES[estado] || []).length === 0 ? (
            <span className="cbl-actions-menu-empty">Sin acciones disponibles</span>
          ) : MENU_ACCIONES[estado].map((item) => {
            const Icon = ACCION_ICONO[item.action] ?? LuEye;
            return (
              <button
                type="button"
                key={item.action}
                className="cbl-actions-menu-item"
                role="menuitem"
                onClick={() => handleItem(item.action)}
              >
                <Icon className="icon" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
