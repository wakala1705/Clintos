'use client';

import {
  LuPackageMinus, LuPackagePlus, LuPackageSearch, LuPackageX,
} from 'react-icons/lu';
import './InsumosTab.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import {
  SOLICITUD_FARMACIA_LABEL, cantidadDevuelta, estadoInsumo, resumenCanasta,
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

// Un insumo "solicitado" avanza por dentro (farmacia lo prepara y luego lo
// despacha) sin cambiar su `solicitudFarmacia`: la fila lo refleja para que
// no contradiga el aviso del pie ("Farmacia despachó la canasta").
function estadoFila(estado, item) {
  if (estado === 'solicitado') {
    if (item.despachado !== undefined) return { label: 'Despachado', tone: 'info' };
    if (item.preparado) return { label: 'En preparación', tone: 'neutral' };
  }
  return { label: SOLICITUD_FARMACIA_LABEL[estado], tone: ESTADO_TONE[estado] };
}

// La columna "Devuelto" solo aparece cuando algún insumo tiene devolución.
function colgroup(conDevuelto) {
  return (
    <colgroup>
      <col />
      <col className="ist-col-cantidad" />
      {conDevuelto && <col className="ist-col-cantidad" />}
      <col className="ist-col-estado" />
    </colgroup>
  );
}
function headRow(conDevuelto) {
  return (
    <tr>
      <th>Insumo</th>
      <th className="ist-num">Cantidad</th>
      {conDevuelto && <th className="ist-num">Devuelto</th>}
      <th>Estado</th>
    </tr>
  );
}

// El pie muestra el avance y UNA acción según el paso en que va la canasta:
// 1. quedan insumos sin solicitar -> "Pedir insumos a farmacia"
// 2. quedan solicitados sin entregar -> "Ver en Canastas" (la recepción se
//    registra allá, no acá) + "Cancelar solicitud", que pide la causal y los
//    devuelve a sin solicitar
// 3. todo entregado -> "Devolver insumos" (abre Devoluciones en Cirugías)
// Pedir se deshabilita con la cirugía cerrada (`puedeAccionar`);
// Devolver no: lo no usado se devuelve también después de realizada o
// cancelada la cirugía.
export default function InsumosTab({
  cirugia, puedeAccionar, onPedirInsumos, onCancelarSolicitud, onVerEnCanastas,
}) {
  const { canasta } = cirugia;
  const total = canasta.items.length;
  const pasos = canasta.items.map((i) => i.solicitudFarmacia ?? 'sin-solicitar');
  const porSolicitar = pasos.filter((p) => p === 'sin-solicitar').length;
  const porEntregar = pasos.filter((p) => p === 'solicitado').length;
  const conDevuelto = canasta.items.some((i) => cantidadDevuelta(cirugia, i.nombre) > 0);

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
    const { estado, preparados } = resumenCanasta(cirugia);
    const hayRecibido = canasta.items.some((i) => i.solicitudFarmacia === 'solicitado' && (i.recibido ?? 0) > 0);
    if (estado === 'despachada') resumen = <>Farmacia <strong>despachó</strong> la canasta: recíbela en Canastas de cirugía</>;
    else if (estado === 'despacho-parcial') resumen = <>Farmacia despachó <strong>menos de lo solicitado</strong>: recibe lo que llegó en Canastas de cirugía; la solicitud sigue abierta</>;
    else resumen = <>Farmacia está preparando la canasta: <strong>{preparados}</strong> de {total} preparados</>;
    // Mientras farmacia no entregue, la solicitud se puede cancelar
    // (secundaria, ícono rojo: mismo criterio que Cancelar cirugía).
    accion = (
      <div className="ist-acciones">
        <Button
          variant="secondary-accent"
          icon={LuPackageX}
          disabled={!puedeAccionar || hayRecibido}
          title={hayRecibido ? 'Ya se recibieron insumos de esta solicitud' : undefined}
          onClick={onCancelarSolicitud}
        >
          Anular solicitud
        </Button>
        <Button variant={estado === 'despachada' || estado === 'despacho-parcial' ? 'primary' : 'secondary-accent'} icon={LuPackageSearch} onClick={() => onVerEnCanastas(cirugia)}>
          Ver en Canastas
        </Button>
      </div>
    );
  } else {
    const devueltos = canasta.items.filter((i) => cantidadDevuelta(cirugia, i.nombre) > 0).length;
    resumen = <><strong>{devueltos}</strong> de {total} con devolución</>;
    accion = (
      <Button variant="secondary-accent" icon={LuPackageMinus} onClick={() => onVerEnCanastas(cirugia)}>
        Registrar consumo y devolución
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
          {colgroup(conDevuelto)}
          <thead>{headRow(conDevuelto)}</thead>
        </table>
      </div>
      <div className="ist-body">
        <table className="ist-table">
          {colgroup(conDevuelto)}
          <thead className="ist-sr-head">{headRow(conDevuelto)}</thead>
          <tbody>
            {canasta.items.map((item) => {
              const estado = estadoInsumo(cirugia, item);
              const { label, tone } = estadoFila(estado, item);
              const devuelta = cantidadDevuelta(cirugia, item.nombre);
              return (
                <tr key={item.nombre}>
                  <td className="cell-primary">{item.nombre}</td>
                  <td className="cell-muted ist-num">{item.cantidad}</td>
                  {conDevuelto && <td className="cell-muted ist-num">{devuelta || '—'}</td>}
                  <td><Badge tone={tone}>{label}</Badge></td>
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
