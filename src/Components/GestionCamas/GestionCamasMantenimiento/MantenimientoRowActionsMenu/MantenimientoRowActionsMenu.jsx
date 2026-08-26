'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './MantenimientoRowActionsMenu.css';
import { MENU_ACCIONES } from '@/hooks/GestionCamas/mockMantenimientoData';
import {
  LuBan, LuCalendarClock, LuCircleCheck, LuEllipsis, LuHistory, LuMessageSquare, LuWrench,
} from 'react-icons/lu';

const ACCION_ICONO = {
  'iniciar-mantenimiento': LuWrench,
  reprogramar: LuCalendarClock,
  cancelar: LuBan,
  'finalizar-mantenimiento': LuCircleCheck,
  'registrar-observacion': LuMessageSquare,
  'ver-historial': LuHistory,
};

// Menú "⋯" de la fila — mismo patrón autocontenido (portal a document.body +
// position:fixed, reposicionado en 2 pasadas) que LimpiezaRowActionsMenu.jsx/
// BedActionsMenu.jsx. "Ver detalle" vive en el botón-ícono 👁 aparte (ver
// GestionCamasMantenimiento.jsx), nunca acá — mismo patrón que BedTable.jsx
// (encargo sección 9). Los botones cortan la propagación del click porque la
// fila entera también abre el detalle al hacer clic (encargo sección 11).
export default function MantenimientoRowActionsMenu({ estado, cama, onAction }) {
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

  const acciones = MENU_ACCIONES[estado] || [];

  return (
    <div className="cbm-actions-menu">
      <button
        type="button"
        ref={btnRef}
        className="cbm-actions-menu-btn"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
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
          className={`cbm-actions-menu-dropdown${pos.openUp ? ' menu-up' : ''}`}
          role="menu"
          style={{ top: pos.top, bottom: pos.bottom, right: pos.right }}
        >
          {acciones.length === 0 ? (
            <span className="cbm-actions-menu-empty">Sin acciones disponibles</span>
          ) : acciones.map((item) => {
            const Icon = ACCION_ICONO[item.action] ?? LuHistory;
            return (
              <button
                type="button"
                key={item.action}
                className="cbm-actions-menu-item"
                role="menuitem"
                onClick={(e) => { e.stopPropagation(); handleItem(item.action); }}
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
