'use client';

import { useEffect, useRef, useState } from 'react';
import './ImprimirMenu.css';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';
import Button from '@/Components/Button/Button';
import {
  LuChevronDown, LuPrinter,
} from 'react-icons/lu';

const OPCIONES = [
  { id: 'reporte-previo', label: 'Reporte previo', icon: LuPrinter },
  { id: 'imprimir-factura', label: 'Imprimir factura', icon: LuPrinter },
  { id: 'anexo-factura', label: 'Anexo factura', icon: LuPrinter },
];

// Botón "Imprimir" con chevron que agrupa Reporte previo / Imprimir factura /
// Anexo factura. El menú se abre hacia arriba: vive en el footer de la
// tarjeta y no hay espacio debajo.
export default function ImprimirMenu({ onSelect }) {
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

  return (
    <div className="fa-imprimir" ref={rootRef}>
      <Button
        variant="secondary-accent"
        icon={LuPrinter}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Imprimir
        <LuChevronDown className="icon fa-imprimir-chev" aria-hidden="true" />
      </Button>

      {open && (
        <div className={`fa-imprimir-menu ${panel.panel}`} role="menu">
          {OPCIONES.map((o) => (
            <button
              key={o.id}
              type="button"
              role="menuitem"
              className={panel.item}
              onClick={() => { setOpen(false); onSelect?.(o.id); }}
            >
              <o.icon className={panel.icon} aria-hidden="true" />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
