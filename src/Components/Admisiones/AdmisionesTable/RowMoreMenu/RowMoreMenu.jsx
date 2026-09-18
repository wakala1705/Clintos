'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './RowMoreMenu.css';
import { LuEllipsis, LuEye, LuPencil } from 'react-icons/lu';

// Menú "⋯" de la fila con "Ver detalle" y "Editar" (en ese orden), que antes
// eran dos columnas de botón-ícono sueltas. El listado se porta a
// document.body con position:fixed (mismo criterio que FormSelect, ver
// AGENTS.md) para que el overflow de .adm-table-wrap no lo recorte ni le
// agregue scroll a la tabla cuando la fila está cerca del borde inferior.
// Como el listado queda al final del body, el foco se mueve al primer ítem al
// abrir y las flechas lo recorren; Escape devuelve el foco al botón.
export default function RowMoreMenu({ nombre, onDetalle, onEditar }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const items = [
    { id: 'detalle', label: 'Ver detalle', icon: LuEye, onSelect: onDetalle },
    { id: 'editar', label: 'Editar', icon: LuPencil, onSelect: onEditar },
  ];

  function close({ restoreFocus = false } = {}) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  // Alineado al borde derecho del botón (la columna vive pegada al borde de
  // la tabla). `right` se calcula contra el viewport porque el menú es fixed.
  useLayoutEffect(() => {
    if (!open) return undefined;
    function updateCoords() {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [open]);

  // Depende del booleano y no de `coords`: este cambia con cada scroll/resize
  // y no debe robar el foco del ítem que el usuario ya recorrió.
  const positioned = coords !== null;
  useEffect(() => {
    if (open && positioned) menuRef.current?.querySelector('[role="menuitem"]')?.focus();
  }, [open, positioned]);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e) {
      const insideTrigger = triggerRef.current?.contains(e.target);
      const insideMenu = menuRef.current?.contains(e.target);
      if (!insideTrigger && !insideMenu) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleMenuKeyDown(e) {
    const nodes = Array.from(menuRef.current.querySelectorAll('[role="menuitem"]'));
    const index = nodes.indexOf(document.activeElement);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nodes[(index + 1) % nodes.length].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        nodes[(index - 1 + nodes.length) % nodes.length].focus();
        break;
      case 'Home':
        e.preventDefault();
        nodes[0].focus();
        break;
      case 'End':
        e.preventDefault();
        nodes[nodes.length - 1].focus();
        break;
      case 'Escape':
        e.preventDefault();
        close({ restoreFocus: true });
        break;
      case 'Tab':
        // No se cancela: el foco sigue con normalidad, el menú deja de tener
        // sentido abierto.
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function handleSelect(onSelect) {
    close();
    onSelect();
  }

  return (
    <div className="adm-more-menu">
      <button
        type="button"
        ref={triggerRef}
        className="adm-more-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más opciones para ${nombre}`}
        title="Más opciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && coords && createPortal(
        <div
          ref={menuRef}
          className="adm-more-menu-dropdown"
          role="menu"
          aria-label={`Opciones de ${nombre}`}
          style={{ top: coords.top, right: coords.right }}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map(({ id, label, icon: Icon, onSelect }) => (
            <button
              type="button"
              key={id}
              className="adm-more-menu-item"
              role="menuitem"
              onClick={() => handleSelect(onSelect)}
            >
              <Icon className="icon" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
