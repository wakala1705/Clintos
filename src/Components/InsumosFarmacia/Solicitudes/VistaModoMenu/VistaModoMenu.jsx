'use client';

import { useEffect, useRef, useState } from 'react';
import './VistaModoMenu.css';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';
import { LuCheck, LuList, LuPanelBottom, LuSettings2 } from 'react-icons/lu';

const VISTA_OPCIONES = [
  { value: 'lista', label: 'Lista', icon: LuList },
  { value: 'dividida', label: 'Dividida', icon: LuPanelBottom },
];

// Botón de "configuración de vista" que abre un dropdown con Lista/Dividida
// -- mismo componente que VistaModoMenu.jsx de Facturación (FacturaVistaClasica),
// duplicado acá con clases propias (mig-vista-menu-*) porque no está
// promovido a @/Components app-wide todavía en su origen (mismo criterio de
// duplicación por feature que el resto, ver AGENTS.md "Component organization").
export default function VistaModoMenu({ modo, onChange }) {
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
    if (value !== modo) onChange(value);
  }

  return (
    <div className="mig-vista-menu-root" ref={rootRef}>
      <button
        type="button"
        className="mig-vista-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Configuración de vista"
        title="Configuración de vista"
      >
        <LuSettings2 className="icon" aria-hidden="true" />
      </button>

      {open && (
        <div className={`mig-vista-menu-dropdown ${panel.panel}`} role="menu">
          <div className={panel.groupLabel}>Modo de vista</div>
          {VISTA_OPCIONES.map(({ value, label, icon: Icon }) => (
            <button
              type="button"
              key={value}
              className={[panel.item, modo === value && panel.selected].filter(Boolean).join(' ')}
              role="menuitemradio"
              aria-checked={modo === value}
              onClick={() => handleSelect(value)}
            >
              <Icon className={panel.icon} aria-hidden="true" />
              {label}
              {modo === value && <LuCheck className={panel.check} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
