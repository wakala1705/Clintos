'use client';

import { useEffect, useRef, useState } from 'react';
import './ViewToggle.css';
import {
  LuChevronDown, LuGrid3X3, LuList, LuSlidersHorizontal,
} from 'react-icons/lu';

// Botón "Vista" con popover (encargo: agrupar Tarjetas/Tabla en un selector
// como el de Gestión de Enfermería > Gestión de medicamentos) en vez de un
// par de botones sueltos siempre visibles — mismo patrón de trigger
// (.date-picker-btn) + popover (.filter-popover/.fp-section/
// .segmented-control) que esa pantalla, ver MedicamentosPanel.jsx.
export default function ViewToggle({ view, onChange }) {
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
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className="date-picker-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LuSlidersHorizontal className="icon" aria-hidden="true" />
        Vista
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-popover filter-popover-right open" role="dialog" aria-label="Modo de vista">
          <div className="fp-section">
            <div className="fp-section-title">Modo de vista</div>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-btn${view === 'tarjetas' ? ' active' : ''}`}
                aria-pressed={view === 'tarjetas'}
                onClick={() => onChange('tarjetas')}
              >
                <LuGrid3X3 className="icon" aria-hidden="true" />
                Tarjetas
              </button>
              <button
                type="button"
                className={`segmented-btn${view === 'tabla' ? ' active' : ''}`}
                aria-pressed={view === 'tabla'}
                onClick={() => onChange('tabla')}
              >
                <LuList className="icon" aria-hidden="true" />
                Tabla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
