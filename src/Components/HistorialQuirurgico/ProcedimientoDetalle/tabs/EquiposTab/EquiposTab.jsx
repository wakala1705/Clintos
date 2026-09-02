'use client';

import './EquiposTab.css';
import EmptyState from '../../../EmptyState/EmptyState';
import { LuServerOff } from 'react-icons/lu';

export default function EquiposTab({ procedimiento }) {
  const equipos = procedimiento.equipos ?? [];
  if (equipos.length === 0) {
    return <EmptyState icon={LuServerOff} title="No hay equipos registrados." />;
  }
  return (
    <div className="hq-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Equipo</th>
            <th>Tipo</th>
            <th>Identificación</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((e) => (
            <tr key={e.nombre}>
              <td className="cell-primary">{e.nombre}</td>
              <td className="cell-muted">{e.tipo}</td>
              <td className="cell-muted">{e.identificacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
