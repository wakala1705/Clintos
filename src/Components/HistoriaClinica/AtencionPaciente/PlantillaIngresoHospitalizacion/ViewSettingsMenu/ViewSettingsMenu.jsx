'use client';

import { useEffect, useRef, useState } from 'react';
import './ViewSettingsMenu.css';
import { LuSettings2 } from 'react-icons/lu';

// Dropdown de "Configuración de vista" del pih-titlebar (ver
// PlantillaIngresoHospitalizacion.jsx). A diferencia del ViewSettingsMenu de
// PlantillaCrecimt2 (que combina maximizar + densidad en el mismo dropdown),
// acá "Expandir pantalla" ya vive como botón propio en pih-titlebar-actions
// -- este menú solo trae "Diseño de columna" (encargo explícito, antes
// llamado "Tamaño de la columna" con opciones Compacto/Flexible -- renombrado
// porque "2 columnas" ya no angosta con espacio libre, reorganiza los campos
// en grilla, ver .pih-cols-2 en shared.css): Flexible es el comportamiento
// actual (pila vertical de ancho completo / grid de 3 columnas en
// .pih-grid-3), "2 columnas" reparte TODOS los campos del formulario
// (incluidos los de .pih-grid-3) en una grilla de 2 columnas. Mismo patrón de
// click-outside/Escape que UserMenu.jsx/ViewSettingsMenu.jsx
// (PlantillaCrecimt2).
const COLUMN_LAYOUTS = [
  { value: 'dos-columnas', label: '2 columnas' },
  { value: 'flexible', label: 'Flexible' },
];

export default function ViewSettingsMenu({ columnLayout, onColumnLayoutChange }) {
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
        className="pih-titlebar-icon-btn vsm-trigger"
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
          <div className="vsm-section-label">Diseño de columna</div>
          <div className="vsm-colsize-group" role="group" aria-label="Diseño de columna">
            {COLUMN_LAYOUTS.map((c) => (
              <button
                type="button"
                key={c.value}
                className={`vsm-colsize-option${columnLayout === c.value ? ' active' : ''}`}
                aria-pressed={columnLayout === c.value}
                onClick={() => onColumnLayoutChange?.(c.value)}
              >
                <span className="vsm-colsize-icon" aria-hidden="true">
                  <span></span><span></span><span></span>
                </span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
