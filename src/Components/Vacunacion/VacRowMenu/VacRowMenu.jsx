'use client';

import { useEffect, useRef, useState } from 'react';
import './VacRowMenu.css';
import { LuBellRing, LuEllipsis, LuFileText, LuSyringe } from 'react-icons/lu';

// Menú "más acciones" de una fila — mismo patrón autocontenido (estado local
// de apertura/cierre + cierre por click-afuera/Escape) que RowActionsMenu de
// Lista de Pacientes, reimplementado acá porque ese componente es propio de
// otra feature (ver AGENTS.md). Acciones sin pantalla propia todavía (ver
// encargo: "no diseñes esa vista todavía") — cada una es un placeholder vía
// window.ncToast, mismo criterio "en desarrollo" que el resto del aplicativo.
export default function VacRowMenu({ onRegistrarAplicacion, onVerEsquema, onEnviarRecordatorio }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

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

  return (
    <div className="vac-row-menu" ref={rootRef}>
      <button
        type="button"
        className="vac-row-menu-btn"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Más acciones"
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div className="vac-row-menu-dropdown" role="menu">
          <button
            type="button"
            className="vac-row-menu-item"
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onRegistrarAplicacion(); }}
          >
            <LuSyringe className="icon" aria-hidden="true" />
            Registrar aplicación
          </button>
          <button
            type="button"
            className="vac-row-menu-item"
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onVerEsquema(); }}
          >
            <LuFileText className="icon" aria-hidden="true" />
            Ver esquema completo
          </button>
          <button
            type="button"
            className="vac-row-menu-item"
            role="menuitem"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEnviarRecordatorio(); }}
          >
            <LuBellRing className="icon" aria-hidden="true" />
            Enviar recordatorio
          </button>
        </div>
      )}
    </div>
  );
}
