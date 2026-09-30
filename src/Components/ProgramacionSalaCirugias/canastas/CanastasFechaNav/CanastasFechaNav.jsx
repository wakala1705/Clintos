'use client';

import { useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { addDias, diaCortoLabel, fechaISO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './CanastasFechaNav.css';

// Navegador de fecha del header de "Canastas de cirugía" (antes vivía en la
// barra de filtros; el diseño 2026-09-30 lo lleva al header). El label se
// vuelve un <input type="date"> nativo al clickearlo, para saltar a una fecha
// puntual sin clickear flecha por flecha.
export default function CanastasFechaNav({ fecha, onFechaChange }) {
  const [editando, setEditando] = useState(false);
  const hoyISO = fechaISO(new Date());
  const label = `${fecha === hoyISO ? 'Hoy · ' : ''}${diaCortoLabel(fecha)}`;
  const cambiarDia = (delta) => onFechaChange(fechaISO(addDias(new Date(`${fecha}T00:00:00`), delta)));

  return (
    <div className="cnc-date-nav">
      <button type="button" className="psc-agenda-nav-btn" aria-label="Día anterior" onClick={() => cambiarDia(-1)}>
        <LuChevronLeft className="icon" aria-hidden="true" />
      </button>
      {editando ? (
        <input
          type="date"
          className="cnc-date-nav-input"
          value={fecha}
          aria-label="Ir a una fecha"
          autoFocus
          onChange={(e) => { if (e.target.value) onFechaChange(e.target.value); setEditando(false); }}
          onBlur={() => setEditando(false)}
        />
      ) : (
        <button type="button" className="cnc-date-nav-label" onClick={() => setEditando(true)}>{label}</button>
      )}
      <button type="button" className="psc-agenda-nav-btn" aria-label="Día siguiente" onClick={() => cambiarDia(1)}>
        <LuChevronRight className="icon" aria-hidden="true" />
      </button>
    </div>
  );
}
