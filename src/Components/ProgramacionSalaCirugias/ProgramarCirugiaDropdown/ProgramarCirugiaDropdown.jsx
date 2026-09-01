'use client';

import { useEffect, useRef, useState } from 'react';
import './ProgramarCirugiaDropdown.css';
import { LuChevronDown, LuPlus } from 'react-icons/lu';
import Button from '@/Components/Button/Button';

// Split button (mismo patrón que NuevaCitaDropdown en Programar cita, ver
// src/Components/ProgramarCita/NuevaCitaDropdown): el cuerpo principal
// dispara el flujo normal de creación -- antes el botón "Nueva cirugía" de
// AccionesBar, ahora reubicado acá arriba del mini-calendario (ver
// MiniCalendarCirugias.jsx, que monta este componente + el resto del bloque
// lateral) -- el chevron es un trigger aparte que abre "Cirugía de
// urgencia", la única acción alternativa de creación que tenía el dropdown
// original.
export default function ProgramarCirugiaDropdown({ onNuevaCirugia, onNuevaUrgencia }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
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

  return (
    <div className="pcd-dropdown" ref={rootRef}>
      <div className="pcd-split">
        <Button icon={LuPlus} className="pcd-main" onClick={() => onNuevaCirugia?.()}>
          Programar cirugía
        </Button>
        <Button
          className="pcd-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Más opciones de creación"
        >
          <LuChevronDown className="icon pcd-chev" aria-hidden="true" />
        </Button>
      </div>

      {open && (
        <div className="pcd-menu" role="menu">
          <button
            type="button"
            className="pcd-option"
            role="menuitem"
            onClick={() => { setOpen(false); onNuevaUrgencia?.(); }}
          >
            Cirugía de urgencia
          </button>
        </div>
      )}
    </div>
  );
}
