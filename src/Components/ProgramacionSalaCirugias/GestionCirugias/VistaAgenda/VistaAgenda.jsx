'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  LuCalendar1, LuCalendarClock, LuCalendarDays, LuCalendarRange, LuCheck, LuClock,
  LuDoorOpen, LuSettings2, LuStethoscope, LuSunMedium,
} from 'react-icons/lu';
import './VistaAgenda.css';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';
import { JORNADAS, horaFranja } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';

// `key`: atajo de teclado global (D = Día, S = Semana completa), solo en la
// agenda de Programación (cuando hay `onVista`). La vista "Mes" sigue oculta
// del selector (encargo explícito, 2026-09-29); el resto del feature la conserva.
const OPCION_DIA = {
  value: 'dia', label: 'Día', key: 'D', icon: LuCalendar1,
};
const OPCIONES_DIAS = [
  {
    value: 'semana', label: 'Semana completa', key: 'S', icon: LuCalendarDays,
  },
  { value: 'habil', label: 'Semana hábil (lun–vie)', icon: LuCalendarRange },
  { value: 'tres', label: '3 días hábiles (hoy + 2)', icon: LuCalendarClock },
];

const OPCIONES_MODO = [
  { value: 'salas', label: 'Salas', icon: LuDoorOpen },
  { value: 'medicos', label: 'Médicos', icon: LuStethoscope },
];

const ICONOS_JORNADA = { '24h': LuClock, operativa: LuSunMedium };

const OPCIONES_JORNADA = Object.entries(JORNADAS).map(([value, j]) => ({
  value,
  icon: ICONOS_JORNADA[value],
  label: value === 'operativa' ? `${j.label} (${horaFranja(j.desde).slice(0, 2)}–${horaFranja(j.hasta).slice(0, 2)} h)` : j.label,
}));

// Configuración de vista de la agenda: horas visibles (jornada operativa o 24
// horas) y días visibles (semana completa, semana hábil o 3 días hábiles). Solo cambia
// lo que se ve. El panel se porta a document.body (la tarjeta de la agenda
// recorta lo que se sale) y mantiene el Escape dentro del menú para no cerrar
// el modal que lo contiene. `vista`/`onVista`: en la agenda de Programación,
// "Día" es una opción más de "Días visibles" (junto a semana completa/hábil/3
// días); elegirla cambia `vista` a 'dia', y elegir otra, a 'semana' + su
// `diasVista`. Sin `onVista` (modal de Programar cirugía) no hay opción Día.
// `modoAgenda`/`onModoAgenda`: grupo "Agenda por" (salas | médicos), solo en la
// agenda de Programación (sin `onModoAgenda` el grupo no se muestra).
export default function VistaAgenda({
  jornada, onJornada, diasVista, onDiasVista, vista, onVista, modoAgenda, onModoAgenda, ocultarJornada,
}) {
  const opcionesDias = onVista ? [OPCION_DIA, ...OPCIONES_DIAS] : OPCIONES_DIAS;
  const diasActual = onVista && vista === 'dia' ? 'dia' : diasVista;
  function elegirDias(value) {
    if (!onVista) { onDiasVista(value); return; }
    if (value === 'dia') { onVista('dia'); return; }
    onDiasVista(value);
    onVista('semana');
  }

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(undefined);
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

  // Atajos D/S (solo cuando la agenda maneja `vista`).
  useEffect(() => {
    if (!onVista) return undefined;
    function onShortcut(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el?.tagName) || el?.isContentEditable) return;
      const match = [OPCION_DIA, ...OPCIONES_DIAS].find((o) => o.key?.toLowerCase() === e.key.toLowerCase());
      if (match) elegirDias(match.value);
    }
    document.addEventListener('keydown', onShortcut);
    return () => document.removeEventListener('keydown', onShortcut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onVista, onDiasVista]);

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

  // Opción de radio con ícono, check en la activa y (opcional) atajo de teclado.
  function renderOpcion(o, activa, onElegir) {
    const Icon = o.icon;
    return (
      <button
        key={o.value}
        type="button"
        role="menuitemradio"
        aria-checked={activa}
        className={[panel.item, activa && panel.selected].filter(Boolean).join(' ')}
        onClick={() => onElegir(o.value)}
      >
        <Icon className={panel.icon} aria-hidden="true" />
        {o.label}
        {activa
          ? <LuCheck className={panel.check} aria-hidden="true" />
          : o.key && onVista && <span className="va-shortcut">{o.key}</span>}
      </button>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="va-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Configuración de vista"
        title="Configuración de vista"
        onClick={() => (open ? setOpen(false) : abrir())}
      >
        <LuSettings2 className="icon" aria-hidden="true" />
      </button>
      {open && createPortal(
        <div
          ref={panelRef}
          className={`va-panel ${panel.panel}`}
          role="menu"
          aria-label="Configuración de vista"
          style={{ top: pos.top, right: pos.right }}
          onKeyDown={onKeyDown}
        >
          {onModoAgenda && (
            <>
              <div className={panel.groupLabel}>Agenda por</div>
              {OPCIONES_MODO.map((o) => renderOpcion(o, modoAgenda === o.value, onModoAgenda))}
              <div className={panel.divider} role="separator" />
            </>
          )}
          {!ocultarJornada && (
            <>
              <div className={panel.groupLabel}>Horas visibles</div>
              {OPCIONES_JORNADA.map((o) => renderOpcion(o, jornada === o.value, onJornada))}
              <div className={panel.divider} role="separator" />
            </>
          )}
          <div className={panel.groupLabel}>Días visibles</div>
          {opcionesDias.map((o) => renderOpcion(o, diasActual === o.value, elegirDias))}
        </div>,
        document.body,
      )}
    </>
  );
}
