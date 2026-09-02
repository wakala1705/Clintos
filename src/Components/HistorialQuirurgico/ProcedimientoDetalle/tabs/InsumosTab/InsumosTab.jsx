'use client';

import './InsumosTab.css';
import EmptyState from '../../../EmptyState/EmptyState';
import { LuPackageX } from 'react-icons/lu';

export default function InsumosTab({ procedimiento }) {
  const insumos = procedimiento.insumos ?? [];
  if (insumos.length === 0) {
    return <EmptyState icon={LuPackageX} title="No hay insumos registrados." />;
  }
  return (
    <div className="hq-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Id. Servicio</th>
            <th>Insumo</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map((item) => (
            <tr key={item.codigo}>
              <td className="cell-muted">{item.codigo}</td>
              <td className="cell-primary">{item.nombre}</td>
              <td className="cell-muted">{item.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
