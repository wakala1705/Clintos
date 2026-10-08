'use client';

import {
  LuCalendarDays, LuCircleCheck, LuCircleX, LuDoorOpen, LuHeartPulse,
} from 'react-icons/lu';
import KpiCard from '@/Components/KpiCard/KpiCard';

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Cada KPI de estado es también un filtro de la tabla (toggle): un segundo
// click sobre el activo vuelve a 'todas'. "Programadas hoy" es el total, así
// que equivale a 'todas'; "Ocupación" es solo informativo. Fragmento: las
// tarjetas son hijos directos del grid `.pg-cir-kpis` de la página.
export default function PanelKpis({
  kpis, compact = false, filtro = 'todas', onFiltro, periodo = 'hoy',
}) {
  const filtroProps = (valor) => ({
    active: filtro === valor,
    onClick: () => onFiltro(filtro === valor ? 'todas' : valor),
  });

  return (
    <>
      <KpiCard
        icon={LuCalendarDays}
        label={`Programadas ${periodo}`}
        value={kpis.programadas}
        {...filtroProps('todas')}
        description="Cirugías en agenda"
        compact={compact}
        variant="neutral"
      />
      <KpiCard
        icon={LuHeartPulse}
        label="En curso"
        value={kpis.enCurso}
        {...filtroProps('en-curso')}
        description={kpis.enCurso === 0 ? 'Ninguna en este momento' : `En ${plural(kpis.salasEnCurso, 'sala', 'salas')}`}
        compact={compact}
        variant="info"
      />
      <KpiCard
        icon={LuCircleCheck}
        label="Finalizadas"
        value={kpis.finalizadas}
        {...filtroProps('finalizadas')}
        description={`Cirugías realizadas ${periodo}`}
        compact={compact}
        variant="success"
      />
      <KpiCard
        icon={LuCircleX}
        label="Canceladas"
        value={kpis.canceladas}
        {...filtroProps('canceladas')}
        description="Canceladas o incumplidas"
        compact={compact}
        variant="danger"
      />
      <KpiCard
        icon={LuDoorOpen}
        label="Ocupación de salas"
        value={`${kpis.ocupacionPct}%`}
        description={`${kpis.salasOcupadas}/${kpis.salasTotal} salas con cirugías`}
        compact={compact}
        variant="neutral"
        progress={{ percent: kpis.ocupacionPct }}
      />
    </>
  );
}
