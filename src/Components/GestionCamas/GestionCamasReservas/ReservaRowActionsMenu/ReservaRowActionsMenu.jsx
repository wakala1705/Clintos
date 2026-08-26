'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './ReservaRowActionsMenu.css';
import { MENU_ACCIONES } from '@/hooks/GestionCamas/mockReservasData';
import { LuBan, LuEllipsis, LuEye } from 'react-icons/lu';

const ACCION_ICONO = {
  ver: LuEye,
  cancelar: LuBan,
};

// Menú "⋯" — mismo patrón autocontenido (portal a document.body +
// position:fixed) que LimpiezaRowActionsMenu.jsx. Solo Pendiente/Confirmada
// tienen entradas (Ver/Cancelar, encargo sección 8) — Utilizada/Vencida/
// Cancelada no tienen menú, así que el trigger ni siquiera se monta (ver
// ReservaRowActionsMenu({ estado }) en GestionCamasReservas.jsx).
export default function ReservaRowActionsMenu({ estado, paciente, onAction }) {
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

  const items = MENU_ACCIONES[estado] || [];
  if (items.length === 0) return null;

  return (
    <div className="cbr-actions-menu">
      <button
        type="button"
        ref={btnRef}
        className="cbr-actions-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para la reserva de ${paciente}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && pos && createPortal(
        <div
          ref={dropdownRef}
          className={`cbr-actions-menu-dropdown${pos.openUp ? ' menu-up' : ''}`}
          role="menu"
          style={{ top: pos.top, bottom: pos.bottom, right: pos.right }}
        >
          {items.map((item) => {
            const Icon = ACCION_ICONO[item.action] ?? LuEye;
            return (
              <button
                type="button"
                key={item.action}
                className="cbr-actions-menu-item"
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
