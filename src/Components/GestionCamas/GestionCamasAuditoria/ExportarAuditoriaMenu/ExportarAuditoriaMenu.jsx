'use client';

import { useEffect, useRef, useState } from 'react';
import './ExportarAuditoriaMenu.css';
import Button from '@/Components/Button/Button';
import {
  LuChevronDown, LuDownload, LuFileSpreadsheet, LuFileText, LuFileType2,
} from 'react-icons/lu';

const FORMATOS = [
  { id: 'excel', label: 'Exportar Excel', icon: LuFileSpreadsheet },
  { id: 'csv', label: 'Exportar CSV', icon: LuFileText },
  { id: 'pdf', label: 'Exportar PDF', icon: LuFileType2 },
];

// Mismo patrón/copia que ExportarMenu (Indicadores) — se duplica acá con su
// propio nombre en vez de un import cruzado entre feature-folders hermanos
// (mismo criterio que EstadoAdminBadge/EstadoCamaBadge, ver AGENTS.md).
export default function ExportarAuditoriaMenu({ onExport }) {
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
    <div className="cbau-export-wrap" ref={rootRef}>
      <Button
        type="button"
        variant="secondary"
        icon={LuDownload}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Exportar
        <LuChevronDown className={`icon cbau-export-chev${open ? ' open' : ''}`} aria-hidden="true" />
      </Button>

      {open && (
        <div className="cbau-export-dropdown" role="menu">
          {FORMATOS.map((f) => (
            <button
              type="button"
              key={f.id}
              className="cbau-export-item"
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
