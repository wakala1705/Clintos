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
            <th>Insumo</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map((item) => (
            <tr key={item.nombre}>
              <td className="cell-primary">
                {item.nombre}
                <span className="hq-item-codigo">{item.codigo}</span>
              </td>
              <td className="cell-muted">{item.cantidad} {item.unidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
