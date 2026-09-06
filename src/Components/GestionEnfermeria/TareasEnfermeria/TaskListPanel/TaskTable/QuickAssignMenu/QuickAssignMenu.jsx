'use client';

import { useEffect, useRef, useState } from 'react';
import './QuickAssignMenu.css';
import { ASIGNACION_RAPIDA_OPCIONES } from '@/hooks/GestionEnfermeria/mockTareasData';
import Button from '@/Components/Button/Button';
import { LuUserRoundPlus } from 'react-icons/lu';

// Acción "Asignar" en fila para tareas sin responsable (encargo explícito:
// "la asignación debe poder realizarse rápidamente sin abandonar la
// bandeja") — popover propio en vez de abrir ReassignModal (que sigue
// existiendo, vía el menú ⋯ "Reasignar", para asignar a una persona
// concreta con más calma). Mismo patrón autocontenido que TaskRowMenu.jsx
// (estado local `open` + cierre por click-afuera/Escape). Las 4 opciones
// son roles genéricos de triage rápido (ASIGNACION_RAPIDA_OPCIONES,
// mockTareasData.js), no personas — la asignación a alguien específico
// sigue pasando por "Reasignar".
export default function QuickAssignMenu({ onAsignar }) {
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
    <div className="task-quick-assign" ref={rootRef}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        icon={LuUserRoundPlus}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        Asignar
      </Button>

      {open && (
        <ul className="task-quick-assign-dropdown" role="listbox" aria-label="Asignar responsable" onClick={(e) => e.stopPropagation()}>
          {ASIGNACION_RAPIDA_OPCIONES.map((o) => (
            <li key={o} role="presentation">
              <button
                type="button"
                role="option"
                className="task-quick-assign-option"
                onClick={() => { setOpen(false); onAsignar(o); }}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
