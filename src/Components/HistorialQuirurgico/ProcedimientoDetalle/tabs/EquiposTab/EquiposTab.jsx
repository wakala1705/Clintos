'use client';

import './EquiposTab.css';
import EquiposTable from '@/Components/EquiposTable/EquiposTable';
import EmptyState from '../../../EmptyState/EmptyState';
import { LuServerOff } from 'react-icons/lu';

export default function EquiposTab({ procedimiento }) {
  const equipos = procedimiento.equipos ?? [];
  if (equipos.length === 0) {
    return <EmptyState icon={LuServerOff} title="No hay equipos registrados." />;
  }
  return (
    <div className="hq-table-wrap">
      <EquiposTable equipos={equipos} />
    </div>
  );
}
