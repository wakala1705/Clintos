'use client';

import { useEffect, useRef, useState } from 'react';
import './NuevaCitaDropdown.css';
import { LuChevronDown, LuPlus } from 'react-icons/lu';
import Button from '@/Components/Button/Button';

// Split button (ref. "Nuevo evento" de Outlook): el cuerpo principal dispara
// directo el flujo normal (mismo wizard que el botón "Agendar cita" del
// header de página, ver `onNuevaCita` pasado desde ProgramarCita.jsx vía
// MiniCalendar) — el chevron es un trigger aparte que solo abre el menú de
// acciones alternativas. "Nueva cita" no se repite ahí adentro (ya la cubre
// el cuerpo principal); "Multiagendamiento" todavía no tiene flujo propio —
// placeholder con toast, igual que Buscar/Configuración del header.
// Mismo patrón de apertura/cierre (click afuera + Escape) que
// RowHeightDropdown/RangoDropdown.
export default function NuevaCitaDropdown({ onNuevaCita }) {
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
    <div className="pc-nc-dropdown" ref={rootRef}>
      <div className="pc-nc-split">
        <Button icon={LuPlus} className="pc-nc-main" onClick={() => onNuevaCita?.()}>
          Agendar cita
        </Button>
        <Button
          className="pc-nc-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Más opciones para agendar"
        >
          <LuChevronDown className="icon pc-nc-chev" aria-hidden="true" />
        </Button>
      </div>

      {open && (
        <div className="pc-nc-menu" role="menu">
          <button
            type="button"
            className="pc-nc-option"
            role="menuitem"
            onClick={() => { setOpen(false); window.ncToast?.('Multiagendamiento en desarrollo.'); }}
          >
            Multiagendamiento
          </button>
        </div>
      )}
    </div>
  );
}
