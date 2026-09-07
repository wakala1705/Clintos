'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './SlotAccionesMenu.css';
import { LuCalendarPlus, LuTriangleAlert } from 'react-icons/lu';

// Menú contextual disparado al clickear una celda vacía de AgendaSemana (ver
// as-slot en AgendaSemana.jsx): antes el clic disparaba directo el flujo de
// "Programar cirugía" (buscador de paciente -> wizard); ahora, como la celda
// puede servir a los 2 flujos de creación que ya existían por separado en
// ProgramarCirugiaDropdown ("Programar cirugía"/"Cirugía de urgencia", ver
// ese componente), primero deja elegir cuál. Mismo patrón portal +
// position:fixed + 2 pasadas de medición que BedActionsMenu.jsx (recalcula
// en scroll/resize, cierra por click-afuera/Escape) -- a diferencia de ese
// componente, acá el trigger no es un botón "..." propio sino la celda ya
// clickeada (recibe `anchorEl`, el nodo del botón, en vez de manejar su
// propio ref + estado de apertura).
export default function SlotAccionesMenu({
  anchorEl, onClose, onProgramarCirugia, onCirugiaUrgencia,
}) {
  const [pos, setPos] = useState(null);
  const menuRef = useRef(null);

  function calcularPosicion() {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const openUp = menuHeight > 0 && rect.bottom + 4 + menuHeight > window.innerHeight;
    setPos({
      openUp,
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
      left: rect.left,
    });
  }

  useLayoutEffect(() => {
    calcularPosicion();
    calcularPosicion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorEl]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        anchorEl && !anchorEl.contains(e.target)
        && menuRef.current && !menuRef.current.contains(e.target)
      ) onClose();
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorEl]);

  if (!pos) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`sam-menu${pos.openUp ? ' menu-up' : ''}`}
      role="menu"
      style={{ top: pos.top, bottom: pos.bottom, left: pos.left }}
    >
      <button type="button" className="sam-item" role="menuitem" onClick={onProgramarCirugia}>
        <LuCalendarPlus className="icon" aria-hidden="true" />
        Programar cirugía
      </button>
      <button type="button" className="sam-item sam-item-warning" role="menuitem" onClick={onCirugiaUrgencia}>
        <LuTriangleAlert className="icon" aria-hidden="true" />
        Cirugía de urgencia
      </button>
    </div>,
    document.body,
  );
}
