'use client';

import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import DatePicker from '@/Components/DatePicker/DatePicker';
import { addDias, diaCortoLabel, fechaISO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './CanastasFechaNav.css';

// Navegador de fecha del header de "Canastas de cirugía" (antes vivía en la
// barra de filtros; el diseño 2026-09-30 lo lleva al header). El label abre un
// DatePicker propio para saltar a una fecha puntual sin clickear flecha por
// flecha.
export default function CanastasFechaNav({ fecha, onFechaChange }) {
  const hoyISO = fechaISO(new Date());
  const label = `${fecha === hoyISO ? 'Hoy · ' : ''}${diaCortoLabel(fecha)}`;
  const cambiarDia = (delta) => onFechaChange(fechaISO(addDias(new Date(`${fecha}T00:00:00`), delta)));

  return (
    <div className="cnc-date-nav">
      <button type="button" className="psc-agenda-nav-btn" aria-label="Día anterior" onClick={() => cambiarDia(-1)}>
        <LuChevronLeft className="icon" aria-hidden="true" />
      </button>
      <DatePicker
        value={fecha}
        onChange={onFechaChange}
        triggerClassName="cnc-date-nav-label"
        ariaLabel="Ir a una fecha"
      >
        {label}
      </DatePicker>
      <button type="button" className="psc-agenda-nav-btn" aria-label="Día siguiente" onClick={() => cambiarDia(1)}>
        <LuChevronRight className="icon" aria-hidden="true" />
      </button>
    </div>
  );
}
