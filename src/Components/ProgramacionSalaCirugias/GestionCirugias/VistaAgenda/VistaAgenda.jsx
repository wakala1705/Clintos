'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuCheck, LuSettings2 } from 'react-icons/lu';
import './VistaAgenda.css';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';
import Button from '@/Components/Button/Button';
import { JORNADAS, horaFranja } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';

const OPCIONES_DIAS = [
  { value: 'semana', label: 'Semana completa' },
  { value: 'habil', label: 'Semana hábil (lun–vie)' },
  { value: 'tres', label: '3 días hábiles (hoy + 2)' },
];

const OPCIONES_JORNADA = Object.entries(JORNADAS).map(([value, j]) => ({
  value,
  label: value === 'operativa' ? `${j.label} (${horaFranja(j.desde).slice(0, 2)}–${horaFranja(j.hasta).slice(0, 2)} h)` : j.label,
}));

// Configuración de vista de la agenda: horas visibles (jornada operativa o 24
// horas) y días visibles (semana completa, semana hábil o 3 días hábiles). Solo cambia
// lo que se ve. El panel se porta a document.body (la tarjeta de la agenda
// recorta lo que se sale) y mantiene el Escape dentro del menú para no cerrar
// el modal que lo contiene. `ocultarDias`: sin el grupo "Días visibles" (vista
// Día de Programación, donde no aplica).
export default function VistaAgenda({
  jornada, onJornada, diasVista, onDiasVista, ocultarDias = false,
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  function abrir() {
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return undefined;
    panelRef.current?.querySelector('[role^="menuitem"]')?.focus();
    function onDown(e) {
      if (panelRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    const cerrar = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('resize', cerrar);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('resize', cerrar);
    };
  }, [open]);

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...panelRef.current.querySelectorAll('[role^="menuitem"]')];
    const i = items.indexOf(document.activeElement);
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant="outline"
        icon={LuSettings2}
        className="va-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : abrir())}
      >
        Vista
      </Button>
      {open && createPortal(
        <div
          ref={panelRef}
          className={`va-panel ${panel.panel}`}
          role="menu"
          aria-label="Configuración de vista"
          style={{ top: pos.top, right: pos.right }}
          onKeyDown={onKeyDown}
        >
          <div className={panel.groupLabel}>Horas visibles</div>
          {OPCIONES_JORNADA.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={jornada === o.value}
              className={[panel.item, jornada === o.value && panel.selected].filter(Boolean).join(' ')}
              onClick={() => onJornada(o.value)}
            >
              {o.label}
              {jornada === o.value && <LuCheck className={panel.check} aria-hidden="true" />}
            </button>
          ))}
          {!ocultarDias && (
            <>
              <div className={panel.divider} role="separator" />
              <div className={panel.groupLabel}>Días visibles</div>
            </>
          )}
          {!ocultarDias && OPCIONES_DIAS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={diasVista === o.value}
              className={[panel.item, diasVista === o.value && panel.selected].filter(Boolean).join(' ')}
              onClick={() => onDiasVista(o.value)}
            >
              {o.label}
              {diasVista === o.value && <LuCheck className={panel.check} aria-hidden="true" />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
