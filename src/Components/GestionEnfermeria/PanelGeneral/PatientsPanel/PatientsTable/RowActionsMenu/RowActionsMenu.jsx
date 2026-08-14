'use client';

import { useEffect, useRef, useState } from 'react';
import './RowActionsMenu.css';
import {
  LuClipboardList, LuEllipsis, LuFileText, LuHeartPulse, LuNotebookPen, LuPill,
} from 'react-icons/lu';

// Menú "⋮" de acciones por paciente — mismo patrón autocontenido que
// RowActionsMenu de ListaPacientes (estado local de apertura/cierre +
// cierre por click-afuera/Escape), no el patrón imperativo de
// menú-único-reposicionado de legacy-app.js (AtencionEnfermeria.jsx): esta
// pantalla es código nuevo, no un port de un mockup HTML. Ver medicación/Ver
// órdenes navegan de verdad a la atención de ese paciente (mismas 2
// secciones que ya existen ahí, ver AtencionEnfermeria.jsx); el resto
// dispara el mismo aviso "en desarrollo" que el resto del proyecto
// (window.ncToast, ver AGENTS.md) porque sus pantallas reales
// (signos vitales, historia clínica de hospitalización, nota de enfermería)
// todavía no existen.
export default function RowActionsMenu({ paciente, onVerMedicacion, onVerOrdenes }) {
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

  function handleItem(action) {
    setOpen(false);
    action();
  }

  return (
    <div className="pg-row-menu" ref={rootRef}>
      <button
        type="button"
        className="pg-row-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para ${paciente}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div className="pg-row-menu-dropdown" role="menu">
          <button
            type="button"
            className="pg-row-menu-item"
            role="menuitem"
            onClick={() => handleItem(() => window.ncToast?.(`Historia clínica de ${paciente} (en desarrollo).`))}
          >
            <LuFileText className="icon" aria-hidden="true" />
            Ver historia clínica
          </button>
          <button type="button" className="pg-row-menu-item" role="menuitem" onClick={() => handleItem(onVerMedicacion)}>
            <LuPill className="icon" aria-hidden="true" />
            Ver medicación
          </button>
          <button
            type="button"
            className="pg-row-menu-item"
            role="menuitem"
            onClick={() => handleItem(() => window.ncToast?.(`Registro de signos vitales de ${paciente} (en desarrollo).`))}
          >
            <LuHeartPulse className="icon" aria-hidden="true" />
            Registrar signos vitales
          </button>
          <button type="button" className="pg-row-menu-item" role="menuitem" onClick={() => handleItem(onVerOrdenes)}>
            <LuClipboardList className="icon" aria-hidden="true" />
            Ver órdenes
          </button>
          <button
            type="button"
            className="pg-row-menu-item"
            role="menuitem"
            onClick={() => handleItem(() => window.ncToast?.(`Nota de enfermería de ${paciente} (en desarrollo).`))}
          >
            <LuNotebookPen className="icon" aria-hidden="true" />
            Registrar nota de enfermería
          </button>
        </div>
      )}
    </div>
  );
}
