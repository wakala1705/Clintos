'use client';

import { useEffect, useRef, useState } from 'react';
import './ViewSettingsMenu.css';
import { LuSettings2, LuMaximize2, LuMinimize2 } from 'react-icons/lu';

// Dropdown de "configuración de vista" del pf-titlebar (ver
// PlantillaCrecimt2.jsx). "Maximizar" ya está conectado (`maximizada`/
// `onToggleMaximizar` vienen de AtencionPaciente.jsx, ver comentario en
// PlantillaCrecimt2.jsx). "Tipo de formulario" (encargo explícito) reusa las
// 3 variantes de tamaño de input/select ya definidas para el proyecto
// (--input-sm/md/lg, ver ../../shared/shared.css) — Compacto/Normal/Amplio,
// mismo orden — aplicadas a los 13 pasos completos vía --pf-input-height en
// .pf-content (ver `densidad`/`onDensidadChange`, PlantillaCrecimt2.jsx +
// PlantillaCrecimt2.css). Abrir/cerrar el propio dropdown usa el mismo
// patrón de click-outside/Escape que UserMenu.jsx.
const DENSIDADES = [
  { value: 'compacto', label: 'Compacto' },
  { value: 'normal', label: 'Normal' },
  { value: 'amplio', label: 'Amplio' },
];

export default function ViewSettingsMenu({
  maximizada, onToggleMaximizar, densidad, onDensidadChange,
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
          <div className="pf-toggle-group vsm-type-toggle" role="group" aria-label="Tipo de formulario">
            {DENSIDADES.map((d) => (
              <button
                type="button"
                key={d.value}
                className={`pf-toggle-btn${densidad === d.value ? ' active' : ''}`}
                aria-pressed={densidad === d.value}
                onClick={() => onDensidadChange?.(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
