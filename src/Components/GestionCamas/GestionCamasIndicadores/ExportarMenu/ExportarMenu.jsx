'use client';

import { useEffect, useRef, useState } from 'react';
import './ExportarMenu.css';
import {
  LuChevronDown, LuDownload, LuFileSpreadsheet, LuFileText, LuFileType2,
} from 'react-icons/lu';

const FORMATOS = [
  { id: 'excel', label: 'Exportar Excel', icon: LuFileSpreadsheet },
  { id: 'csv', label: 'Exportar CSV', icon: LuFileText },
  { id: 'pdf', label: 'Exportar PDF', icon: LuFileType2 },
];

// Mismo patrón autocontenido que AreaSelector/FormSelect (estado local
// `open` + cierre por click-afuera/Escape). `onExport(formato)` queda a
// cargo del padre (ver GestionCamasIndicadores.jsx) para armar el toast con
// los filtros activos — encargo sección 3: "la exportación debe respetar
// los filtros aplicados" (sin backend real que genere el archivo, ver
// AGENTS.md "en desarrollo").
export default function ExportarMenu({ onExport }) {
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
    <div className="cbin-export-wrap" ref={rootRef}>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <LuDownload className="icon" aria-hidden="true" />
        Exportar
        <LuChevronDown className={`icon cbin-export-chev${open ? ' open' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="cbin-export-dropdown" role="menu">
          {FORMATOS.map((f) => (
            <button
              type="button"
              key={f.id}
              className="cbin-export-item"
              role="menuitem"
              onClick={() => { setOpen(false); onExport(f.id); }}
            >
              <f.icon className="icon" aria-hidden="true" />
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
