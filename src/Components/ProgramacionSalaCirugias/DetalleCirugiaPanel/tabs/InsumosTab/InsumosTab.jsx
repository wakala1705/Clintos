'use client';

import { LuPackageMinus, LuPackagePlus } from 'react-icons/lu';
import './InsumosTab.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { SOLICITUD_FARMACIA_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Tono de <Badge> por estado de solicitud (encargo explícito): solicitado en
// verde, sin solicitar en ámbar.
const SOLICITUD_TONE = { 'sin-solicitar': 'warn', solicitado: 'success' };

// Columna "Estado" = estado de la solicitud a farmacia del insumo (encargo
// explícito: reemplaza a disponible/faltante). "Pedir insumos a farmacia"
// vive en el pie de esta tabla (antes en el footer del detalle) y pasa todos
// los insumos a "Solicitado"; se deshabilita si la cirugía ya está cerrada
// (`puedeAccionar`) o si no queda ninguno por solicitar.
export default function InsumosTab({ cirugia, puedeAccionar, onPedirInsumos }) {
  const { canasta } = cirugia;
  const hayInsumosPorSolicitar = canasta.items.some((i) => i.solicitudFarmacia !== 'solicitado');
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
                <td><Badge tone={SOLICITUD_TONE[solicitud]}>{SOLICITUD_FARMACIA_LABEL[solicitud]}</Badge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="ist-footer">
        {/* Solo visual por ahora (encargo explícito, sin lógica todavía). */}
        <Button variant="secondary-accent" icon={LuPackageMinus} disabled={!puedeAccionar}>
          Devolver insumos
        </Button>
        <Button
          variant="secondary-accent"
          icon={LuPackagePlus}
          disabled={!puedeAccionar || !hayInsumosPorSolicitar}
          onClick={() => onPedirInsumos(cirugia)}
        >
          Pedir insumos a farmacia
        </Button>
      </div>
    </div>
  );
}
