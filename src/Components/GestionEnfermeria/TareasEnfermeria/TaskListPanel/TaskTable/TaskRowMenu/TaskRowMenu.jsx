'use client';

import { useEffect, useRef, useState } from 'react';
import './TaskRowMenu.css';
import {
  LuBan, LuCalendarClock, LuCircleSlash, LuEllipsis, LuEye, LuHistory, LuUserRoundCog,
} from 'react-icons/lu';

// Menú "⋮" de acciones por tarea — mismo patrón autocontenido que
// RowActionsMenu.jsx (PatientsPanel/PatientsTable): estado local de
// apertura/cierre + cierre por click-afuera/Escape. Reservado para acciones
// SECUNDARIAS (encargo explícito): "Iniciar"/"Completar" se movieron a un
// botón primario directo en la fila (ver accionPrimariaDeTarea en
// TaskTable.jsx) y ya no viven acá. "Ver historial" abre el mismo panel de
// detalle que "Ver detalle" (TaskDetailPanel ya incluye la sección
// Trazabilidad, ver encargo punto 11 — no se duplica esa vista en un modal
// aparte) — 2 entradas al mismo panel porque son 2 intenciones distintas
// del usuario ("revisar la tarea" vs. "revisar qué pasó"), aunque el
// destino sea idéntico.
export default function TaskRowMenu({
  tarea, disabled, onVerDetalle, onReasignar, onReprogramar, onNoRealizada, onCancelar,
}) {
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

  const d = disabled ?? {};

  return (
    <div className="task-row-menu" ref={rootRef}>
      <button
        type="button"
        className="task-row-menu-btn"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para ${tarea.nombre}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div className="task-row-menu-dropdown" role="menu" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="task-row-menu-item" role="menuitem" onClick={() => handleItem(onVerDetalle)}>
            <LuEye className="icon" aria-hidden="true" />
            Ver detalle
          </button>
          <button type="button" className="task-row-menu-item" role="menuitem" onClick={() => handleItem(onVerDetalle)}>
            <LuHistory className="icon" aria-hidden="true" />
            Ver historial
          </button>
          <div className="task-row-menu-divider" role="separator"></div>
          <button type="button" className="task-row-menu-item" role="menuitem" onClick={() => handleItem(onReasignar)}>
            <LuUserRoundCog className="icon" aria-hidden="true" />
            Reasignar
          </button>
          <button type="button" className="task-row-menu-item" role="menuitem" disabled={d.reprogramar} onClick={() => handleItem(onReprogramar)}>
            <LuCalendarClock className="icon" aria-hidden="true" />
            Reprogramar
          </button>
          <div className="task-row-menu-divider" role="separator"></div>
          <button
            type="button"
            className="task-row-menu-item task-row-menu-item-warn"
            role="menuitem"
            disabled={d.noRealizada}
            onClick={() => handleItem(onNoRealizada)}
          >
            <LuCircleSlash className="icon" aria-hidden="true" />
            Marcar como no realizada
          </button>
          <button
            type="button"
            className="task-row-menu-item task-row-menu-item-danger"
            role="menuitem"
            disabled={d.cancelar}
            onClick={() => handleItem(onCancelar)}
          >
            <LuBan className="icon" aria-hidden="true" />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
