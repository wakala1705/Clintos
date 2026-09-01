'use client';

import { useEffect, useRef, useState } from 'react';
import './VistaDropdown.css';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

const OPTIONS = [
  { id: 'dia', label: 'Día' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
];

// Reemplaza el chip-group segmentado Día/Semana/Mes (encargo explícito) por
// un dropdown estilo RangoDropdown de ProgramarCita/AgendaToolbar.jsx --
// mismo patrón de apertura/cierre (click afuera + Escape). CSS propio
// (.psc-vista-*) en vez de importar el de esa feature, mismo criterio ya
// aplicado a CatalogoSalasModal vs FiltroPickerModal (ver AGENTS.md
// "Component organization"). `onChange` recibe el id elegido y el
// orquestador (ProgramacionSalaCirugias.jsx) decide qué agenda renderizar
// (AgendaSemana para Día/Semana, AgendaMes para Mes).
export default function VistaDropdown({ value, onChange }) {
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

  const current = OPTIONS.find((o) => o.id === value);

  function handleSelect(id) {
    setOpen(false);
    if (id !== value) onChange(id);
  }

  return (
    <div className="psc-vista-dropdown" ref={rootRef}>
      <button
        type="button"
        className="psc-vista-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current?.label}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="psc-vista-menu" role="listbox">
          {OPTIONS.map((o) => (
            <button
              type="button"
              key={o.id}
              className={`psc-vista-option${o.id === value ? ' active' : ''}`}
              role="option"
              aria-selected={o.id === value}
              onClick={() => handleSelect(o.id)}
            >
              <span>{o.label}</span>
              {o.id === value && <LuCheck className="icon" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
