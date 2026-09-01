'use client';

import './InsumosTab.css';
import { INSUMO_ESTADO_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

export default function InsumosTab({ cirugia }) {
  const { canasta } = cirugia;
  return (
    <div className="ist-tab">
      <h4 className="ist-title">Canasta: {canasta.nombre}</h4>
      <table className="ist-table">
        <thead>
          <tr><th>Insumo</th><th>Cantidad</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {canasta.items.map((item) => (
            <tr key={item.nombre}>
              <td>{item.nombre}</td>
              <td>{item.cantidad}</td>
              <td><span className={`ist-tag ist-tag-${item.estado}`}>{INSUMO_ESTADO_LABEL[item.estado]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
