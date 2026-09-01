'use client';

import { useEffect, useRef, useState } from 'react';
import './AccionesBar.css';
import Button from '@/Components/Button/Button';
import {
  LuBan, LuCalendarClock, LuChevronDown, LuCircleCheck, LuInfo, LuPlus,
} from 'react-icons/lu';

const ESTADOS_TERMINALES = ['cancelada', 'incumplida'];

// Split-button "Nueva cirugía" y menú "Más acciones": mismo patrón
// autocontenido de TurnoRowActionsMenu.jsx (estado local `open` + cierre
// por click-afuera/Escape) en vez de un componente Dropdown genérico, que
// no existe en el proyecto. No se intenta fusionar visualmente el botón
// primario con el toggle de flecha (Button usa CSS Modules — sus clases
// internas no son overrideables desde afuera, ver AGENTS.md "Botones") —
// van uno junto al otro con un gap chico, que ya satisface el pedido del
// encargo ("dropdown ... junto al botón").
export default function AccionesBar({
  selected, onNuevaCirugia, onNuevaUrgencia, onReprogramar, onCancelar, onMarcarProgramada, onMarcarIncumplida, onVerInfo,
}) {
  const [nuevaOpen, setNuevaOpen] = useState(false);
  const [masOpen, setMasOpen] = useState(false);
  const nuevaRef = useRef(null);
  const masRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (nuevaRef.current && !nuevaRef.current.contains(e.target)) setNuevaOpen(false);
      if (masRef.current && !masRef.current.contains(e.target)) setMasOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') { setNuevaOpen(false); setMasOpen(false); }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const puedeAccionar = Boolean(selected) && !ESTADOS_TERMINALES.includes(selected.estado);
  const puedeMarcarProgramada = Boolean(selected) && ['borrador', 'urgencia'].includes(selected.estado);
  const puedeMarcarIncumplida = Boolean(selected) && selected.estado === 'programada';

  return (
    <div className="ab-bar">
      <div className="ab-split" ref={nuevaRef}>
        <Button variant="primary" icon={LuPlus} onClick={onNuevaCirugia}>Nueva cirugía</Button>
        <button
          type="button"
          className="ab-split-toggle"
          aria-haspopup="menu"
          aria-expanded={nuevaOpen}
          aria-label="Más opciones de creación"
          onClick={() => setNuevaOpen((v) => !v)}
        >
          <LuChevronDown className="icon" />
        </button>
        {nuevaOpen && (
          <div className="ab-dropdown" role="menu">
            <button
              type="button"
              className="ab-dropdown-item"
              role="menuitem"
              onClick={() => { setNuevaOpen(false); onNuevaUrgencia(); }}
            >
              Cirugía de urgencia
            </button>
          </div>
        )}
      </div>

      <Button variant="secondary" icon={LuCalendarClock} disabled={!puedeAccionar} onClick={onReprogramar}>Reprogramar</Button>
      <Button variant="danger-outline" icon={LuBan} disabled={!puedeAccionar} onClick={onCancelar}>Cancelar</Button>

      <div className="ab-split" ref={masRef}>
        <Button variant="secondary" icon={LuChevronDown} disabled={!selected} onClick={() => setMasOpen((v) => !v)}>Más acciones</Button>
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
