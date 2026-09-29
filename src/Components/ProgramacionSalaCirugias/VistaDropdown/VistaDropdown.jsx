'use client';

import { useEffect, useRef, useState } from 'react';
import '@/Components/FormSelect/FormSelect.css';
import './VistaDropdown.css';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';
import { LuCalendarRange, LuCheck, LuChevronDown } from 'react-icons/lu';

// Vista "Mes" oculta del selector (encargo explícito, 2026-09-29) -- el resto
// del feature (AgendaMes.jsx, mesLabel/grillaMes en mockCirugiaData.js,
// `vista === 'mes'` en ProgramacionSalaCirugias.jsx) se deja intacto, no se
// borra: "ocultar" ≠ "eliminar" acá. Si se reactiva, alcanza con reagregar
// la entrada acá; el atajo de teclado "M" se cae solo (busca por key sobre
// este array).
const OPTIONS = [
  { id: 'dia', label: 'Día', key: 'D' },
  { id: 'semana', label: 'Semana', key: 'S' },
];

// Reemplaza el chip-group segmentado Día/Semana (antes Día/Semana/Mes,
// encargo explícito) por un dropdown estilo RangoDropdown de
// ProgramarCita/AgendaToolbar.jsx -- mismo patrón de apertura/cierre (click
// afuera + Escape) y mismos atajos de teclado globales D/S (ver
// RangoDropdown.jsx). El trigger reusa `.form-select-trigger` de
// FormSelect.css (mismo criterio que CatalogPickerTrigger.jsx) para verse
// igual que el resto de selectores de FiltrosBar (Sala/Estado) -- encargo
// explícito, 2026-09-29: antes era un botón tipo "pill" (radio 999px) propio
// que desentonaba con esos dos. `.psc-vista-*` en VistaDropdown.css queda
// solo para lo que no cubre FormSelect.css: el wrapper, el ícono líder y el
// menú/atajo de teclado. `onChange` recibe el id elegido y el orquestador
// (ProgramacionSalaCirugias.jsx) decide qué agenda renderizar.
// "Mostrar fines de semana" vive como item dentro de este menú (estilo
// Google Calendar) en vez de un checkbox suelto en el header — solo
// aplica a la vista Semana, igual que su visibilidad anterior.
export default function VistaDropdown({ value, onChange, mostrarFinesDeSemana, onToggleFinesDeSemana }) {
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

  useEffect(() => {
    function handleShortcut(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
      const match = OPTIONS.find((o) => o.key.toLowerCase() === e.key.toLowerCase());
      if (match) onChange(match.id);
    }
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [onChange]);

  const current = OPTIONS.find((o) => o.id === value);

  function handleSelect(id) {
    setOpen(false);
    if (id !== value) onChange(id);
  }

  return (
    <div className="psc-vista-dropdown" ref={rootRef}>
      <button
        type="button"
        className={`form-select-trigger psc-vista-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="psc-vista-trigger-label">
          <LuCalendarRange className="icon" aria-hidden="true" />
          {current?.label}
        </span>
        <LuChevronDown className={`icon form-select-chev${open ? ' open' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className={`psc-vista-menu ${panel.panel}`} role="listbox">
          {OPTIONS.map((o) => (
            <button
              type="button"
              key={o.id}
              className={[panel.item, o.id === value && panel.selected].filter(Boolean).join(' ')}
              role="option"
              aria-selected={o.id === value}
              onClick={() => handleSelect(o.id)}
            >
              <span>{o.label}</span>
              {o.id === value ? (
                <LuCheck className={panel.check} aria-hidden="true" />
              ) : (
                <span className="psc-vista-shortcut">{o.key}</span>
              )}
            </button>
          ))}

          {value === 'semana' && (
            <>
              <div className={panel.divider} role="separator" />
              <button
                type="button"
                className={panel.item}
                aria-pressed={mostrarFinesDeSemana}
                onClick={() => onToggleFinesDeSemana(!mostrarFinesDeSemana)}
              >
                <span>Mostrar fines de semana</span>
                {mostrarFinesDeSemana && <LuCheck className={panel.check} aria-hidden="true" />}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
