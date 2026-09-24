'use client';

import { useEffect, useRef, useState } from 'react';
import './LayoutSwitcher.css';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';
import { LuAppWindow, LuCheck, LuMaximize2, LuPanelRight } from 'react-icons/lu';

const MODES = [
  { value: 'floating', label: 'Flotante', icon: LuAppWindow },
  { value: 'sidebar', label: 'Barra lateral', icon: LuPanelRight },
  { value: 'fullscreen', label: 'Pantalla completa', icon: LuMaximize2 },
];

// Selector de layout del panel (Flotante / Barra lateral / Pantalla
// completa) — mismo patrón de dropdown (click-afuera + Escape, ver
// ViewSettingsMenu.jsx en HistoriaClinica/AtencionPaciente/PlantillaCrecimt2)
// que ya usa el proyecto para este tipo de menú. El ícono del trigger
// refleja el modo activo, igual que el botón resaltado de la referencia.
export default function LayoutSwitcher({ mode, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const TriggerIcon = MODES.find((m) => m.value === mode)?.icon ?? LuPanelRight;

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
    <div className="cai-layout-root" ref={rootRef}>
      <button
        type="button"
        className="cai-layout-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Cambiar diseño del panel"
        title="Cambiar diseño del panel"
      >
        <TriggerIcon className="icon" aria-hidden="true" />
      </button>

      {open && (
        <div className={`cai-layout-dropdown ${panel.panel}`} role="menu">
          <div className={panel.groupLabel}>Cambiar a</div>
          {MODES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={[panel.item, mode === value && panel.selected].filter(Boolean).join(' ')}
              role="menuitemradio"
              aria-checked={mode === value}
              onClick={() => {
                onChange(value);
                setOpen(false);
              }}
            >
              <Icon className={panel.icon} aria-hidden="true" />
              {label}
              {mode === value && <LuCheck className={panel.check} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
