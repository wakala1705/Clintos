'use client';

import { useEffect, useRef, useState } from 'react';
import './RowHeightDropdown.css';
import { LuCheck, LuChevronDown, LuRows3 } from 'react-icons/lu';

const OPTIONS = [
  { value: 24, label: 'Compacta' },
  { value: 32, label: 'Media' },
  { value: 40, label: 'Amplia' },
];

// Mismo patrón de apertura/cierre (click afuera + Escape) que RangoDropdown
// — controla la altura de cada franja de 20 min de ScheduleGrid (ver
// ROW_H/rowHeight en ScheduleGrid.jsx), aplica a las dos vistas (Por
// médico/Por especialidad) porque ambas renderizan la misma grilla.
export default function RowHeightDropdown({ value, onChange }) {
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

  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <div className="pc-rowh-dropdown" ref={rootRef}>
      <button
        type="button"
        className="pc-rowh-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Altura de las franjas de la agenda"
        title="Altura de las franjas de la agenda"
      >
        <LuRows3 className="icon" aria-hidden="true" />
        {current.label}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="pc-rowh-menu" role="listbox">
          {OPTIONS.map((o) => (
            <button
              type="button"
              key={o.value}
              className={`pc-rowh-option${o.value === value ? ' active' : ''}`}
              role="option"
              aria-selected={o.value === value}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <span>{o.label}</span>
              {o.value === value && <LuCheck className="icon" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
