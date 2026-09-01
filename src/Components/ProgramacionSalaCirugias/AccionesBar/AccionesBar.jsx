'use client';

import { useEffect, useRef, useState } from 'react';
import './AccionesBar.css';
import Button from '@/Components/Button/Button';
import {
  LuBan, LuCalendarClock, LuChevronDown, LuCircleCheck, LuInfo,
} from 'react-icons/lu';

const ESTADOS_TERMINALES = ['cancelada', 'incumplida'];

// "Otras acciones" del bloque lateral (ver MiniCalendarCirugias.jsx, que la
// monta debajo del divider, después del mini-calendario) -- todas dependen
// de una cirugía seleccionada, a diferencia de "Programar cirugía"
// (ProgramarCirugiaDropdown.jsx), que vive arriba del divider porque no la
// necesita. Menú "Más acciones": mismo patrón autocontenido de
// TurnoRowActionsMenu.jsx (estado local `open` + cierre por
// click-afuera/Escape) en vez de un componente Dropdown genérico, que no
// existe en el proyecto.
export default function AccionesBar({
  selected, onReprogramar, onCancelar, onMarcarProgramada, onMarcarIncumplida, onVerInfo,
}) {
  const [masOpen, setMasOpen] = useState(false);
  const masRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (masRef.current && !masRef.current.contains(e.target)) setMasOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setMasOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const puedeAccionar = Boolean(selected) && !ESTADOS_TERMINALES.includes(selected?.estado);
  const puedeMarcarProgramada = Boolean(selected) && ['borrador', 'urgencia'].includes(selected?.estado);
  const puedeMarcarIncumplida = Boolean(selected) && selected?.estado === 'programada';

  return (
    <div className="ab-panel">
      <span className="ab-title">Otras acciones</span>

      <Button variant="secondary" icon={LuCalendarClock} disabled={!puedeAccionar} onClick={onReprogramar} className="ab-block-btn">
        Reprogramar
      </Button>
      <Button variant="danger-outline" icon={LuBan} disabled={!puedeAccionar} onClick={onCancelar} className="ab-block-btn">
        Cancelar
      </Button>

      <div className="ab-split" ref={masRef}>
        <Button variant="secondary" icon={LuChevronDown} disabled={!selected} onClick={() => setMasOpen((v) => !v)} className="ab-block-btn">
          Más acciones
        </Button>
        {masOpen && selected && (
          <div className="ab-dropdown" role="menu">
            <button
              type="button"
              className="ab-dropdown-item"
              role="menuitem"
              disabled={!puedeMarcarProgramada}
              onClick={() => { setMasOpen(false); onMarcarProgramada(); }}
            >
              <LuCircleCheck className="icon" aria-hidden="true" />
              Marcar como programada
            </button>
            <button
              type="button"
              className="ab-dropdown-item"
              role="menuitem"
              disabled={!puedeMarcarIncumplida}
              onClick={() => { setMasOpen(false); onMarcarIncumplida(); }}
            >
              <LuCalendarClock className="icon" aria-hidden="true" />
              Marcar como incumplida
            </button>
            <button
              type="button"
              className="ab-dropdown-item"
              role="menuitem"
              onClick={() => { setMasOpen(false); onVerInfo(); }}
            >
              <LuInfo className="icon" aria-hidden="true" />
              Ver información/historial
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
