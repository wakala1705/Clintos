'use client';

import './PersonalTab.css';
import EmptyState from '../../../EmptyState/EmptyState';
import { LuUserX } from 'react-icons/lu';

export default function PersonalTab({ procedimiento }) {
  const personal = procedimiento.personal ?? [];
  if (personal.length === 0) {
    return <EmptyState icon={LuUserX} title="No hay personal clínico registrado." />;
  }
  return (
    <div className="hq-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Tipo de profesional</th>
          </tr>
        </thead>
        <tbody>
          {personal.map((p) => (
            <tr key={p.nombre}>
              <td className="cell-primary">{p.nombre}</td>
              <td className="cell-muted">{p.rol}</td>
              <td className="cell-muted">{p.tipoProfesional}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
