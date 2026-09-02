'use client';

import './FarmaciaTab.css';
import EmptyState from '../../../EmptyState/EmptyState';
import { LuPill } from 'react-icons/lu';

export default function FarmaciaTab({ procedimiento }) {
  const farmacia = procedimiento.farmacia ?? [];
  if (farmacia.length === 0) {
    return <EmptyState icon={LuPill} title="No hay pedidos a farmacia registrados para este procedimiento." />;
  }
  return (
    <div className="hq-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Medicamento / producto</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {farmacia.map((m) => (
            <tr key={m.medicamento}>
              <td className="cell-primary">{m.medicamento}</td>
              <td className="cell-muted">{m.cantidad}</td>
              <td className="cell-muted">{m.unidad}</td>
              <td><span className="hq-farmacia-estado">{m.estado}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
