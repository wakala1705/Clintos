'use client';

import { useState } from 'react';
import {
  LuCalendarDays, LuChevronLeft, LuChevronRight, LuClock, LuTriangleAlert,
} from 'react-icons/lu';
import './VistaPreviaSemanal.css';
import Button from '@/Components/Button/Button';
import KpiCard from '@/Components/KpiCard/KpiCard';
import CalendarioSemanal from '../CalendarioSemanal/CalendarioSemanal';
import { minutosDisponibles, modeloDia } from '@/hooks/AgendaCirujanos/disponibilidad';
import { formatoHoras, rangoSemanaLabel } from '@/hooks/AgendaCirujanos/formato';
import { lunesDe, sumarDias } from '@/hooks/AgendaCirujanos/horario';

const LEYENDA = [
  ['disponible', 'Disponible'],
  ['fuera', 'Fuera de agenda'],
  ['bloqueo', 'Bloqueo'],
  ['apertura', 'Apertura extra'],
  ['programada', 'Programada'],
  ['realizada', 'Realizada'],
  ['urgencia', 'Urgencia'],
  ['conflicto', 'Cirugía fuera de agenda'],
];

// Vista previa semanal de lo que verá Programación: disponible vs fuera de
// agenda, bloqueos, aperturas extra y las cirugías del cirujano (las que quedan
// fuera de agenda, resaltadas). Refleja el BORRADOR del horario, no solo lo
// guardado. Navega por semanas; solo guarda cuál se está viendo.
export default function VistaPreviaSemanal({
  horario, excepciones, cirugias, conflictos, hoy, onVerConflictos,
}) {
  const [lunes, setLunes] = useState(() => lunesDe(hoy));
  const fechas = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const modelos = fechas.map((fecha) => modeloDia(fecha, horario, excepciones));
  const disponibles = minutosDisponibles(fechas, horario, excepciones);
  const deLaSemana = cirugias.filter((c) => fechas.includes(c.fecha) && c.estado !== 'cancelada');
  const motivos = new Map(conflictos.map((c) => [c.cirugia.id, c.motivo]));
  const etiquetaConflictos = conflictos.length === 1 ? 'Cirugía fuera de agenda' : 'Cirugías fuera de agenda';

  return (
    <section className="ac-card ac-preview" aria-label="Vista previa de la agenda">
      <div className="ac-preview-cab">
        <div>
          <h2>Vista previa</h2>
          <p>Así verá Programación la disponibilidad de este cirujano.</p>
        </div>
        <div className="ac-semana-nav">
          <Button variant="outline" size="sm" onClick={() => setLunes(lunesDe(hoy))}>Hoy</Button>
          <button
            type="button"
            className="psc-agenda-nav-btn"
            aria-label="Semana anterior"
            onClick={() => setLunes((actual) => sumarDias(actual, -7))}
          >
            <LuChevronLeft className="icon" aria-hidden="true" />
          </button>
          <span className="ac-semana-rango" aria-live="polite">{rangoSemanaLabel(lunes)}</span>
          <button
            type="button"
            className="psc-agenda-nav-btn"
            aria-label="Semana siguiente"
            onClick={() => setLunes((actual) => sumarDias(actual, 7))}
          >
            <LuChevronRight className="icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="ac-stats">
        <KpiCard compact icon={LuClock} label="Disponibles esta semana" value={formatoHoras(disponibles)} variant="neutral" />
        <KpiCard compact icon={LuCalendarDays} label="Cirugías esta semana" value={deLaSemana.length} variant="info" />
        {conflictos.length > 0 ? (
          <KpiCard
            compact
            icon={LuTriangleAlert}
            label={`${etiquetaConflictos} · Ver`}
            value={conflictos.length}
            variant="warning"
            onClick={onVerConflictos}
          />
        ) : (
          <KpiCard compact icon={LuTriangleAlert} label="Cirugías fuera de agenda" value={0} variant="success" />
        )}
      </div>

      <ul className="ac-leyenda" aria-label="Leyenda">
        {LEYENDA.map(([clave, texto]) => (
          <li key={clave}>
            <i className={`ac-sw ac-sw-${clave}`} aria-hidden="true" />
            {texto}
          </li>
        ))}
      </ul>

      <CalendarioSemanal
        fechas={fechas}
        modelos={modelos}
        cirugias={deLaSemana}
        motivos={motivos}
        hoy={hoy}
      />
    </section>
  );
}
