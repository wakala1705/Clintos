'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './CirugiaCardMenu.css';
import {
  LuBan, LuCalendarClock, LuCalendarX, LuCheckCheck, LuEllipsis, LuPencil,
} from 'react-icons/lu';
import { ESTADOS_TERMINALES_CIRUGIA } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Menú "..." de CirugiaCard (encargo explícito, 2026-09-07) -- mismo patrón
// portal + position:fixed + 2 pasadas de medición que BedActionsMenu.jsx
// (GestionCamas): recalcula en scroll/resize, cierra por click-afuera/
// Escape. A diferencia de ese componente, las 5 acciones son fijas (no hay
// un catálogo por estado) -- lo que sí depende del estado es qué acciones
// quedan deshabilitadas, mismo criterio que puedeAccionar/
// puedeMarcarIncumplida en DetalleCirugiaPanel.jsx (ESTADOS_TERMINALES_CIRUGIA
// vive en mockCirugiaData.js para que ambos consumidores compartan
// exactamente la misma regla). Los 5 ítems se agrupan en 3 bloques separados
// por `.ccm-divider` (encargo explícito): editar/reprogramar (ajustan la
// cirugía programada), marcar como realizada/incumplida (resuelven su
// desenlace), cancelar (la da de baja) -- agrupar por qué tan relacionadas
// están las acciones entre sí, no por color/tono.
export default function CirugiaCardMenu({
  cirugia, onEditar, onReprogramar, onMarcarRealizada, onMarcarIncumplida, onCancelar,
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const puedeAccionar = !ESTADOS_TERMINALES_CIRUGIA.includes(cirugia.estado);
  // Mismo criterio que puedeMarcarIncumplida en DetalleCirugiaPanel.jsx: una
  // cirugía en curso/futura solo puede "incumplirse" si estaba programada
  // (urgencia se resuelve o no en el momento, no queda pendiente de
  // cumplirse después).
  const puedeMarcarIncumplida = cirugia.estado === 'programada';

  function calcularPosicion() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const openUp = menuHeight > 0 && rect.bottom + 4 + menuHeight > window.innerHeight;
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
        && menuRef.current && !menuRef.current.contains(e.target)
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
    action(cirugia);
  }

  return (
    <div className={`ccm-wrap${open ? ' open' : ''}`}>
      <button
        type="button"
        ref={btnRef}
        className="ccm-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más opciones para la cirugía de ${cirugia.paciente.nombre}`}
        title="Más opciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          className={`ccm-dropdown${pos.openUp ? ' menu-up' : ''}`}
          role="menu"
          style={{ top: pos.top, bottom: pos.bottom, right: pos.right }}
        >
          <button
            type="button"
            className="ccm-item"
            role="menuitem"
            disabled={!puedeAccionar}
            onClick={() => handleItem(onEditar)}
          >
            <LuPencil className="icon" aria-hidden="true" />
            Editar
          </button>
          <button
            type="button"
            className="ccm-item"
            role="menuitem"
            disabled={!puedeAccionar}
            onClick={() => handleItem(onReprogramar)}
          >
            <LuCalendarClock className="icon" aria-hidden="true" />
            Reprogramar
          </button>

          <div className="ccm-divider" role="separator" />

          <button
            type="button"
            className="ccm-item"
            role="menuitem"
            disabled={!puedeAccionar}
            onClick={() => handleItem(onMarcarRealizada)}
          >
            <LuCheckCheck className="icon" aria-hidden="true" />
            Marcar como realizada
          </button>
          <button
            type="button"
            className="ccm-item"
            role="menuitem"
            disabled={!puedeMarcarIncumplida}
            onClick={() => handleItem(onMarcarIncumplida)}
          >
            <LuCalendarX className="icon" aria-hidden="true" />
            Marcar como incumplida
          </button>

          <div className="ccm-divider" role="separator" />

          <button
            type="button"
            className="ccm-item ccm-item-danger"
            role="menuitem"
            disabled={!puedeAccionar}
            onClick={() => handleItem(onCancelar)}
          >
            <LuBan className="icon" aria-hidden="true" />
            Cancelar
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
}
