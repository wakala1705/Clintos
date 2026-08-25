'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './InfoTooltip.css';
import { LuInfo } from 'react-icons/lu';

const BUBBLE_WIDTH = 220;

// Ícono "i" con burbuja al hover/foco — mismo patrón base que
// GestionCamasIndicadores/InfoTooltip.jsx (replicado acá con su propio
// nombre de clase por feature-folder en vez de un import cruzado), pero acá
// la burbuja se porta a document.body con position:fixed en vez de quedar
// position:absolute dentro de .cbnt-tooltip-wrap: los 3 usos de este
// componente (Tipo/Clase/Nivel, NuevaCamaModal.jsx) viven cerca del borde
// izquierdo de un formulario de modal, y `.modal-card > form` tiene
// overflow:hidden (ver GestionCamas.css) — una burbuja centrada ahí se
// recortaba contra ese borde (bug real, reportado). Mismo criterio que
// FormSelect.jsx para su listado de opciones.
export default function InfoTooltip({ texto }) {
  const wrapRef = useRef(null);
  const [coords, setCoords] = useState(null);

  function show() {
    const rect = wrapRef.current.getBoundingClientRect();
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - BUBBLE_WIDTH / 2, 8),
      window.innerWidth - 8 - BUBBLE_WIDTH,
    );
    const bottom = window.innerHeight - rect.top + 8;
    setCoords({ left, bottom });
  }

  function hide() {
    setCoords(null);
  }

  return (
    <span
      className="cbnt-tooltip-wrap"
      ref={wrapRef}
      tabIndex={0}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <LuInfo className="icon cbnt-tooltip-icon" aria-hidden="true" />
      {coords && createPortal(
        <span
          className="cbnt-tooltip-bubble"
          role="tooltip"
          style={{ left: coords.left, bottom: coords.bottom, width: BUBBLE_WIDTH }}
        >
          {texto}
        </span>,
        document.body,
      )}
    </span>
  );
}
