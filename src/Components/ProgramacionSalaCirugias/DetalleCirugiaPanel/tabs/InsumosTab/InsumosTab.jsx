'use client';

import './InsumosTab.css';
import { SOLICITUD_FARMACIA_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Columna "Estado" = estado de la solicitud a farmacia del insumo (encargo
// explícito: reemplaza a disponible/faltante). Pasa a "Solicitado" con
// "Pedir insumos a farmacia" del footer del detalle.
export default function InsumosTab({ cirugia }) {
  const { canasta } = cirugia;
  return (
    <div className="ist-tab">
      <table className="ist-table">
        <thead>
          <tr><th>Insumo</th><th>Cantidad</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {canasta.items.map((item) => {
            const solicitud = item.solicitudFarmacia ?? 'sin-solicitar';
            return (
              <tr key={item.nombre}>
                <td className="cell-primary">{item.nombre}</td>
                <td className="cell-muted">{item.cantidad}</td>
                <td><span className={`ist-tag ist-tag-${solicitud}`}>{SOLICITUD_FARMACIA_LABEL[solicitud]}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
