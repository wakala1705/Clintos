'use client';

import { useEffect, useRef, useState } from 'react';
import './RowActionsMenu.css';
import {
  LuActivity, LuCircleCheckBig, LuEllipsis, LuFileText, LuLogOut,
} from 'react-icons/lu';

// Mismo patrón autocontenido (estado local de apertura/cierre + cierre por
// click-afuera/Escape) que RowActionsMenu de ListaPacientes/PanelGeneral —
// ver AGENTS.md. Acá "Editar"/"Detalles" ya son sus propias columnas con
// botón directo (ver AdmisionesTable.jsx, mismo layout de la referencia),
// así que este menú "⋮" solo lleva las acciones de flujo clínico/
// administrativo del ingreso.
export default function RowActionsMenu({ nombre, onRegistrarTriage, onAltaMedica, onAltaAdministrativa, onVerHistoria }) {
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
    <div className="adm-row-menu" ref={rootRef}>
      <button
        type="button"
        className="adm-row-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para ${nombre}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div className="adm-row-menu-dropdown" role="menu">
          <button type="button" className="adm-row-menu-item" role="menuitem" onClick={() => handleItem(onRegistrarTriage)}>
            <LuActivity className="icon" aria-hidden="true" />
            Registrar triage
          </button>
          <button type="button" className="adm-row-menu-item" role="menuitem" onClick={() => handleItem(onVerHistoria)}>
            <LuFileText className="icon" aria-hidden="true" />
            Ver historia clínica
          </button>
          <button type="button" className="adm-row-menu-item" role="menuitem" onClick={() => handleItem(onAltaMedica)}>
            <LuCircleCheckBig className="icon" aria-hidden="true" />
            Dar alta médica
          </button>
          <button type="button" className="adm-row-menu-item" role="menuitem" onClick={() => handleItem(onAltaAdministrativa)}>
            <LuLogOut className="icon" aria-hidden="true" />
            Dar alta administrativa
          </button>
        </div>
      )}
    </div>
  );
}
