'use client';

import {
  LuCalendarDays, LuCircleCheck, LuCircleX, LuDoorOpen, LuHeartPulse,
} from 'react-icons/lu';
import KpiCard from '@/Components/KpiCard/KpiCard';

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Informativos (sin onClick). Fragmento: las tarjetas son hijos directos del
// grid `.pg-cir-kpis` de la página.
export default function PanelKpis({ kpis }) {
  return (
    <>
      <KpiCard
        icon={LuCalendarDays}
        label="Programadas hoy"
        value={kpis.programadas}
        description="Cirugías en agenda"
        variant="neutral"
      />
      <KpiCard
        icon={LuHeartPulse}
        label="En curso"
        value={kpis.enCurso}
        description={kpis.enCurso === 0 ? 'Ninguna en este momento' : `En ${plural(kpis.salasEnCurso, 'sala', 'salas')}`}
        variant="info"
      />
      <KpiCard
        icon={LuCircleCheck}
        label="Finalizadas"
        value={kpis.finalizadas}
        description="Cirugías realizadas hoy"
        variant="success"
      />
      <KpiCard
        icon={LuCircleX}
        label="Canceladas"
        value={kpis.canceladas}
        description="Canceladas o incumplidas"
        variant="danger"
      />
      <KpiCard
        icon={LuDoorOpen}
        label="Ocupación de salas"
        value={`${kpis.ocupacionPct}%`}
        description={`${kpis.salasOcupadas}/${kpis.salasTotal} salas con cirugías`}
        variant="neutral"
        progress={{ percent: kpis.ocupacionPct }}
      />
    </>
  );
}
