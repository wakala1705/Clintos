'use client';

import {
  LuClock, LuPackage, LuPackageCheck, LuPackageMinus,
} from 'react-icons/lu';
import KpiCard from '@/Components/KpiCard/KpiCard';
import { KPI_FILTRO, kpisCanastas } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';

// Orden por prioridad de la tarea: primero lo accionable, al final lo hecho.
const KPIS = [
  {
    key: 'porRecibir', icon: LuPackage, variant: 'info', label: 'Despachadas por recibir',
  },
  {
    key: 'consumoPendiente', icon: LuPackageMinus, variant: 'warning', label: 'Consumo pendiente',
  },
  {
    key: 'enPreparacion', icon: LuClock, variant: 'muted', label: 'En preparación',
  },
  {
    key: 'recibidas', icon: LuPackageCheck, variant: 'success', label: 'Canastas recibidas',
  },
];

// Fragmento: las 4 tarjetas son hijos directos del grid `.cnc-resumen` de la
// página. Cada una es un <KpiCard> compacto (el panel de trabajo de abajo
// necesita el alto) que actúa como botón-filtro del estado en la lista
// (`filtro` = filtro activo); un segundo click lo quita.
export default function CanastasKpis({ cirugias, filtro, onFiltrar }) {
  const kpis = kpisCanastas(cirugias);
  return (
    <>
      {KPIS.map(({
        key, icon, variant, label,
      }) => {
        const activo = filtro === KPI_FILTRO[key];
        return (
          <KpiCard
            key={key}
            icon={icon}
            label={label}
            value={kpis[key]}
            variant={variant}
            compact
            active={activo}
            onClick={() => onFiltrar(activo ? 'todas' : KPI_FILTRO[key])}
          />
        );
      })}
    </>
  );
}
