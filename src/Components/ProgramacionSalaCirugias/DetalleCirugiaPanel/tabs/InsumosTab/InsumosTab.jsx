'use client';

import { LuPackageCheck, LuPackageMinus, LuPackagePlus } from 'react-icons/lu';
import './InsumosTab.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import {
  SOLICITUD_FARMACIA_LABEL, cantidadDevuelta, estadoInsumo,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Tono de <Badge> por paso del flujo de insumos (ver "Flujo de insumos" en
// mockCirugiaData.js): sin solicitar en ámbar y solicitado en verde (encargo
// explícito), entregado en azul, devuelto/devuelto parcial en neutro.
const ESTADO_TONE = {
  'sin-solicitar': 'warn',
  solicitado: 'success',
  entregado: 'info',
  'devuelto-parcial': 'neutral',
  devuelto: 'neutral',
};

const COLGROUP = (
  <colgroup>
    <col />
    <col className="ist-col-cantidad" />
    <col className="ist-col-cantidad" />
    <col className="ist-col-estado" />
  </colgroup>
);
const HEAD_ROW = (
  <tr><th>Insumo</th><th className="ist-num">Cantidad</th><th className="ist-num">Devuelto</th><th>Estado</th></tr>
);

// El pie muestra el avance y UNA acción según el paso en que va la canasta:
// 1. quedan insumos sin solicitar -> "Pedir insumos a farmacia"
// 2. quedan solicitados sin entregar -> "Registrar entrega"
// 3. todo entregado -> "Devolver insumos" (abre Devoluciones en Cirugías)
// Pedir/Registrar se deshabilitan con la cirugía cerrada (`puedeAccionar`);
// Devolver no: lo no usado se devuelve también después de realizada o
// cancelada la cirugía.
export default function InsumosTab({
  cirugia, puedeAccionar, onPedirInsumos, onRegistrarEntrega, onDevolverInsumos,
}) {
  const { canasta } = cirugia;
  const total = canasta.items.length;
  const pasos = canasta.items.map((i) => i.solicitudFarmacia ?? 'sin-solicitar');
  const porSolicitar = pasos.filter((p) => p === 'sin-solicitar').length;
  const porEntregar = pasos.filter((p) => p === 'solicitado').length;
  const entregados = pasos.filter((p) => p === 'entregado').length;

  let resumen;
  let accion;
  if (porSolicitar > 0) {
    resumen = <><strong>{total - porSolicitar}</strong> de {total} solicitados a farmacia</>;
    accion = (
      <Button icon={LuPackagePlus} disabled={!puedeAccionar} onClick={() => onPedirInsumos(cirugia)}>
        Pedir insumos a farmacia
      </Button>
    );
  } else if (porEntregar > 0) {
    resumen = <><strong>{entregados}</strong> de {total} entregados por farmacia</>;
    accion = (
      <Button icon={LuPackageCheck} disabled={!puedeAccionar} onClick={() => onRegistrarEntrega(cirugia)}>
        Registrar entrega
      </Button>
    );
  } else {
    const devueltos = canasta.items.filter((i) => cantidadDevuelta(cirugia, i.nombre) > 0).length;
    resumen = <><strong>{devueltos}</strong> de {total} con devolución</>;
    accion = (
      <Button variant="secondary-accent" icon={LuPackageMinus} onClick={onDevolverInsumos}>
        Devolver insumos
      </Button>
    );
  }

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
              const estado = estadoInsumo(cirugia, item);
              const devuelta = cantidadDevuelta(cirugia, item.nombre);
              return (
                <tr key={item.nombre}>
                  <td className="cell-primary">{item.nombre}</td>
                  <td className="cell-muted ist-num">{item.cantidad}</td>
                  <td className="cell-muted ist-num">{devuelta || '—'}</td>
                  <td><Badge tone={ESTADO_TONE[estado]}>{SOLICITUD_FARMACIA_LABEL[estado]}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="ist-footer">
        <span className="ist-resumen">{resumen}</span>
        {accion}
      </div>
    </div>
  );
}
