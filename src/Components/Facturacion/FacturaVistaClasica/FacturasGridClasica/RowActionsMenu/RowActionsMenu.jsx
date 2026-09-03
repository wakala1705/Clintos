'use client';

import { useEffect, useRef, useState } from 'react';
import './RowActionsMenu.css';
import {
  LuBan, LuCopy, LuDollarSign, LuEllipsis, LuFileMinus, LuFileStack,
} from 'react-icons/lu';

const ACCIONES = [
  { key: 'otras-monedas', label: 'Otras monedas', icon: LuDollarSign },
  { key: 'admisiones-masivas', label: 'Admisiones masivas', icon: LuFileStack },
  { key: 'anular', label: 'Anular', icon: LuBan },
  { key: 'razon-anulacion', label: 'Razón anulación', icon: LuFileMinus },
  { key: 'copias', label: 'Copias', icon: LuCopy },
];

// Mismo patrón autocontenido (estado local de apertura/cierre + cierre por
// click-afuera/Escape) que RowActionsMenu de ListaPacientes/Admisiones, ver
// AGENTS.md "Component organization" -- agrupa las acciones que antes vivían
// sueltas en la fila fvc-acciones-bar del panel de detalle (sin
// funcionalidad real, ver FacturaDetalleClasico), ahora por fila en la
// columna Acciones de la grilla.
export default function RowActionsMenu({ numero }) {
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
    <div className="fvc-row-menu" ref={rootRef}>
      <button
        type="button"
        className="fvc-row-menu-btn"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más opciones para la factura ${numero}`}
        title="Más opciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && (
        <div className="fvc-row-menu-dropdown" role="menu">
          {ACCIONES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className="fvc-row-menu-item"
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            >
              <Icon className="icon" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
