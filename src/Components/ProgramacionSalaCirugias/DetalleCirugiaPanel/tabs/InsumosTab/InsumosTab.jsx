'use client';

import { LuPackageMinus, LuPackagePlus } from 'react-icons/lu';
import './InsumosTab.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { SOLICITUD_FARMACIA_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Tono de <Badge> por estado de solicitud (encargo explícito): solicitado en
// verde, sin solicitar en ámbar.
const SOLICITUD_TONE = { 'sin-solicitar': 'warn', solicitado: 'success' };

const COLGROUP = (
  <colgroup>
    <col />
    <col className="ist-col-cantidad" />
    <col className="ist-col-estado" />
  </colgroup>
);
const HEAD_ROW = (
  <tr><th>Insumo</th><th className="ist-num">Cantidad</th><th>Estado</th></tr>
);

// Columna "Estado" = estado de la solicitud a farmacia del insumo. El pie de
// la tabla muestra el avance ("n de N solicitados") y una sola acción según
// ese estado: "Pedir insumos a farmacia" (primary) mientras quede alguno sin
// solicitar, "Devolver insumos" (solo visual por ahora, sin lógica) una vez
// que hay insumos solicitados -- no se puede devolver lo que no se pidió.
// Ambas se deshabilitan si la cirugía ya está cerrada (`puedeAccionar`).
export default function InsumosTab({ cirugia, puedeAccionar, onPedirInsumos }) {
  const { canasta } = cirugia;
  const total = canasta.items.length;
  const solicitados = canasta.items.filter((i) => i.solicitudFarmacia === 'solicitado').length;
  const hayInsumosPorSolicitar = solicitados < total;
  return (
    <div className="ist-tab">
      {/* Encabezado fijo fuera del área que scrollea: solo el listado
          scrollea (encargo explícito), así la barra de scroll no pasa junto
          al encabezado. Dos tablas con el mismo <colgroup> y
          table-layout:fixed para que las columnas calcen; la de filas repite
          el <thead> oculto visualmente para lectores de pantalla. */}
      <div className="ist-head" aria-hidden="true">
        <table className="ist-table">
          {COLGROUP}
          <thead>{HEAD_ROW}</thead>
        </table>
      </div>
      <div className="ist-body">
        <table className="ist-table">
          {COLGROUP}
          <thead className="ist-sr-head">{HEAD_ROW}</thead>
          <tbody>
            {canasta.items.map((item) => {
              const solicitud = item.solicitudFarmacia ?? 'sin-solicitar';
              return (
                <tr key={item.nombre}>
                  <td className="cell-primary">{item.nombre}</td>
                  <td className="cell-muted ist-num">{item.cantidad}</td>
                  <td><Badge tone={SOLICITUD_TONE[solicitud]}>{SOLICITUD_FARMACIA_LABEL[solicitud]}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="ist-footer">
        <span className="ist-resumen">
          <strong>{solicitados}</strong> de {total} solicitados a farmacia
        </span>
        {hayInsumosPorSolicitar ? (
          <Button
            icon={LuPackagePlus}
            disabled={!puedeAccionar}
            onClick={() => onPedirInsumos(cirugia)}
          >
            Pedir insumos a farmacia
          </Button>
        ) : (
          <Button variant="secondary-accent" icon={LuPackageMinus} disabled={!puedeAccionar}>
            Devolver insumos
          </Button>
        )}
      </div>
    </div>
  );
}
