'use client';

import { useEffect, useRef, useState } from 'react';
import './ViewSettingsMenu.css';
import { LuSettings2, LuMaximize2, LuMinimize2 } from 'react-icons/lu';

// Dropdown de "configuración de vista" del pf-titlebar (ver
// PlantillaCrecimt2.jsx). "Maximizar" ya está conectado (`maximizada`/
// `onToggleMaximizar` vienen de AtencionPaciente.jsx, ver comentario en
// PlantillaCrecimt2.jsx); el selector Compacto/Normal sigue siendo solo
// visual. Abrir/cerrar el propio dropdown usa el mismo patrón de
// click-outside/Escape que UserMenu.jsx.
export default function ViewSettingsMenu({ maximizada, onToggleMaximizar }) {
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
    <div className="vsm-root" ref={rootRef}>
      <button
        type="button"
        className="pf-titlebar-icon-btn vsm-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Configuración de vista"
        title="Configuración de vista"
      >
        <LuSettings2 className="icon" aria-hidden="true" />
      </button>

      {open && (
        <div className="vsm-dropdown" role="menu">
          <button
            type="button"
            className="vsm-item"
            role="menuitem"
            onClick={() => {
              onToggleMaximizar?.();
              setOpen(false);
            }}
          >
            {maximizada ? (
              <LuMinimize2 className="icon" aria-hidden="true" />
            ) : (
              <LuMaximize2 className="icon" aria-hidden="true" />
            )}
            {maximizada ? 'Restaurar' : 'Maximizar'}
          </button>

          <div className="vsm-divider"></div>

          <div className="vsm-section-label">Tipo de formulario</div>
          {/* .pf-toggle-group / .pf-toggle-btn: definidas en
              ../PlantillaCrecimt2.css (shared del feature) */}
          <div className="pf-toggle-group vsm-type-toggle">
            <button type="button" className="pf-toggle-btn">Compacto</button>
            <button type="button" className="pf-toggle-btn active">Normal</button>
          </div>
        </div>
      )}
    </div>
  );
}
