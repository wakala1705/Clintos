'use client';

import { useEffect, useRef, useState } from 'react';
import './VistaPanelMenu.css';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';
import {
  LuCheck, LuKanban, LuRows2, LuRows3, LuSettings2, LuTable,
} from 'react-icons/lu';

const VISTA_OPCIONES = [
  { value: 'tabla', label: 'Tabla', icon: LuTable },
  { value: 'tablero', label: 'Tablero', icon: LuKanban },
];

const TIPO_OPCIONES = [
  { value: 'compacto', label: 'Compacto', icon: LuRows2 },
  { value: 'expandido', label: 'Expandido', icon: LuRows3 },
];

// Botón "Configuración de vista" de la barra del Panel general: elige entre
// la Tabla y el Tablero (por estado) y el tipo de vista, Compacto (KPIs de una
// línea, la tarjeta gana alto) o Expandido (antes un botón expandir/contraer
// aparte en la barra). Mismo patrón que
// VistaModoMenu.jsx (Facturación): trigger de ícono + dropdown con check en la
// opción activa. Vive en la barra de ambas vistas.
export default function VistaPanelMenu({
  vista, onChange, tipo, onChangeTipo,
}) {
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

  function handleSelect(value) {
    setOpen(false);
    if (value !== vista) onChange(value);
  }
  // Cambiar el tipo no cierra el menú: se ve el cambio al instante.
  function handleTipo(value) {
    if (value !== tipo) onChangeTipo(value);
  }

  return (
    <div className="vpm-root" ref={rootRef}>
      <button
        type="button"
        className="vpm-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Configuración de vista"
        title="Configuración de vista"
      >
        <LuSettings2 className="icon" aria-hidden="true" />
      </button>

      {open && (
        <div className={`vpm-dropdown ${panel.panel}`} role="menu">
          <div className={panel.groupLabel}>Vista</div>
          {VISTA_OPCIONES.map(({ value, label, icon: Icon }) => (
            <button
              type="button"
              key={value}
              className={[panel.item, vista === value && panel.selected].filter(Boolean).join(' ')}
              role="menuitemradio"
              aria-checked={vista === value}
              onClick={() => handleSelect(value)}
            >
              <Icon className={panel.icon} aria-hidden="true" />
              {label}
              {vista === value && <LuCheck className={panel.check} aria-hidden="true" />}
            </button>
          ))}
          <div className={panel.divider} role="separator" />
          <div className={panel.groupLabel}>Tipo de vista</div>
          {TIPO_OPCIONES.map(({ value, label, icon: Icon }) => (
            <button
              type="button"
              key={value}
              className={[panel.item, tipo === value && panel.selected].filter(Boolean).join(' ')}
              role="menuitemradio"
              aria-checked={tipo === value}
              onClick={() => handleTipo(value)}
            >
              <Icon className={panel.icon} aria-hidden="true" />
              {label}
              {tipo === value && <LuCheck className={panel.check} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
