'use client';

import {
  LuCalendarClock, LuCalendarX, LuCheckCheck, LuClipboardList, LuClock, LuTriangleAlert,
} from 'react-icons/lu';
import KpiCard from '@/Components/KpiCard/KpiCard';

// Informativos (sin onClick): el orden pone primero lo que necesita atención
// de coordinación (retrasadas), después el total y el desglose por estado.
const KPIS = [
  {
    key: 'retrasadas', icon: LuClock, variant: 'danger', label: 'Retrasadas',
  },
  {
    key: 'total', icon: LuClipboardList, variant: 'neutral', label: 'Total del día',
  },
  {
    key: 'programadas', icon: LuCalendarClock, variant: 'info', label: 'Programadas',
  },
  {
    key: 'urgencias', icon: LuTriangleAlert, variant: 'warning', label: 'Urgencias',
  },
  {
    key: 'realizadas', icon: LuCheckCheck, variant: 'success', label: 'Realizadas',
  },
  {
    key: 'canceladas', icon: LuCalendarX, variant: 'muted', label: 'Canceladas / incumplidas',
  },
];

// Fragmento: las tarjetas son hijos directos del grid `.td-kpis` de la página.
export default function TableroKpis({ kpis }) {
  return (
    <>
      {KPIS.map(({
        key, icon, variant, label,
      }) => (
        <KpiCard key={key} icon={icon} label={label} value={kpis[key]} variant={variant} compact />
      ))}
    </>
  );
}
