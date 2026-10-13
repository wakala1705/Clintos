'use client';

import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuSettings2 } from 'react-icons/lu';
import './ColumnasMenu.css';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';

// Botón de configuración de pantalla. Hoy tiene una sola opción: mostrar u
// ocultar en bloque las validaciones del chequeo previo (Orden, Estudios,
// Valoración y Autorización). "Estado del chequeo" siempre queda visible como
// resumen. Mismo patrón de trigger + panel que VistaModoMenu (Facturación).
export default function ColumnasMenu({ mostrarValidaciones, onToggleValidaciones }) {
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
    <div className="gcm-root" ref={rootRef}>
      <button
        type="button"
        className="gcm-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Configuración de pantalla"
        title="Configuración de pantalla"
      >
        <LuSettings2 className="icon" aria-hidden="true" />
      </button>

      {open && (
        <div className={`gcm-dropdown ${panel.panel}`} role="menu" aria-label="Configuración de pantalla">
          <div className={panel.groupLabel}>Configuración de pantalla</div>
          <button
            type="button"
            className={[panel.item, 'gcm-item', mostrarValidaciones && panel.selected].filter(Boolean).join(' ')}
            role="menuitemcheckbox"
            aria-checked={mostrarValidaciones}
            onClick={onToggleValidaciones}
          >
            <span className="gcm-item-text">
              Mostrar validaciones
              <span className="gcm-item-hint">Orden, estudios, valoración y autorización</span>
            </span>
            {mostrarValidaciones && <LuCheck className={panel.check} aria-hidden="true" />}
          </button>
        </div>
      )}
    </div>
  );
}
