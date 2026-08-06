'use client';

import { useEffect, useRef, useState } from 'react';
import './RangoDropdown.css';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

const OPTIONS = [
  { id: 'dia', label: 'Día', key: 'D' },
  { id: 'semana', label: 'Semana', key: 'S' },
];

// Dropdown estilo Google Calendar para el rango de la agenda (Día/Semana),
// con el mismo patrón de apertura/cierre que UserMenu.jsx (click afuera +
// Escape). Además expone atajos de teclado globales D/S — igual que Gmail o
// el propio Google Calendar — mientras este control está montado (solo
// aplica en la vista "Por médico", que es donde el rango tiene sentido).
export default function RangoDropdown({ value, onChange }) {
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

  return (
    <div className="pc-rango-dropdown" ref={rootRef}>
      <button
        type="button"
        className="pc-rango-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current?.label}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="pc-rango-menu" role="listbox">
          {OPTIONS.map((o) => (
            <button
              type="button"
              key={o.id}
              className={`pc-rango-option${o.id === value ? ' active' : ''}`}
              role="option"
              aria-selected={o.id === value}
              onClick={() => { onChange(o.id); setOpen(false); }}
            >
              <span>{o.label}</span>
              {o.id === value ? (
                <LuCheck className="icon" aria-hidden="true" />
              ) : (
                <span className="pc-rango-shortcut">{o.key}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
