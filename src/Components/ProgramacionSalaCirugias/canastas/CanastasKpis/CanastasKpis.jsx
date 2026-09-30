'use client';

import {
  LuClock, LuPackage, LuPackageCheck, LuPackageMinus,
} from 'react-icons/lu';
import { KPI_FILTRO, kpisCanastas } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastasKpis.css';

// Orden por prioridad de la tarea: primero lo accionable, al final lo hecho.
const KPIS = [
  {
    key: 'porRecibir', icon: LuPackage, tone: 'info', label: 'Despachadas por recibir',
  },
  {
    key: 'consumoPendiente', icon: LuPackageMinus, tone: 'warn', label: 'Consumo pendiente',
  },
  {
    key: 'enPreparacion', icon: LuClock, tone: 'neutral', label: 'En preparación',
  },
  {
    key: 'recibidas', icon: LuPackageCheck, tone: 'success', label: 'Canastas recibidas',
  },
];

// Fragmento: las 4 tarjetas son hijos directos del grid `.cnc-resumen` de la
// página (junto a CanastaAlerta). Cada una es un botón que activa su filtro de
// estado en la lista (`filtro` = filtro activo); un segundo click lo quita.
export default function CanastasKpis({ cirugias, filtro, onFiltrar }) {
  const kpis = kpisCanastas(cirugias);
  return (
    <>
      {KPIS.map(({
        key, icon: Icon, tone, label,
      }) => {
        const activo = filtro === KPI_FILTRO[key];
        return (
          <button
            type="button"
            className={`cnc-kpi${activo ? ' activo' : ''}`}
            key={key}
            aria-pressed={activo}
            onClick={() => onFiltrar(activo ? 'todas' : KPI_FILTRO[key])}
          >
            <span className={`cnc-kpi-icon-wrap cnc-kpi-${tone}`}><Icon className="icon" aria-hidden="true" /></span>
            <span className="cnc-kpi-texto">
              <span className="cnc-kpi-value">{kpis[key]}</span>
              <span className="cnc-kpi-label">{label}</span>
            </span>
          </button>
        );
      })}
    </>
  );
}
