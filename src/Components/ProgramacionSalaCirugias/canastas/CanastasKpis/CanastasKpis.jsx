'use client';

import {
  LuClock, LuLock, LuPackage, LuPackageCheck,
} from 'react-icons/lu';
import { kpisCanastas } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastasKpis.css';

const KPIS = [
  {
    key: 'recibidas', icon: LuPackageCheck, tone: 'success', label: 'Canastas recibidas',
  },
  {
    key: 'porRecibir', icon: LuPackage, tone: 'info', label: 'Despachadas por recibir',
  },
  {
    key: 'enPreparacion', icon: LuClock, tone: 'neutral', label: 'En preparación en farmacia',
  },
  {
    key: 'bloqueadas', icon: LuLock, tone: 'danger', label: 'Cirugías con inicio bloqueado',
  },
];

// Fragmento: las 4 tarjetas son hijos directos del grid `.cnc-resumen` de la
// página (junto a CanastaAlerta).
export default function CanastasKpis({ cirugias }) {
  const kpis = kpisCanastas(cirugias);
  return (
    <>
      {KPIS.map(({
        key, icon: Icon, tone, label,
      }) => (
        <div className="cnc-kpi" key={key}>
          <span className={`cnc-kpi-icon-wrap cnc-kpi-${tone}`}><Icon className="icon" aria-hidden="true" /></span>
          <div>
            <div className="cnc-kpi-value">{kpis[key]}</div>
            <div className="cnc-kpi-label">{label}</div>
          </div>
        </div>
      ))}
    </>
  );
}
