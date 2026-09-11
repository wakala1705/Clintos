'use client';

import './MovimientosGrid.css';
import Badge from '@/Components/Badge/Badge';
import MovimientoRowMenu from '../MovimientoRowMenu/MovimientoRowMenu';
import { formatFecha } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

// "Id.Contrato" se ocultó de la grilla (encargo explícito) -- sigue vivo en
// el resumen de MovimientoDetalleModal ("Ver detalle"), ya no se duplica acá.
const COLUMNS = [
  'Estado', 'Consecutivo', 'No.Admisión', 'No.Prestación', 'Fecha de solicitud',
  'Procedencia', 'Movimiento', 'Paciente', 'Ubicación',
];

// Tono/label del Badge por fila -- distinto de ESTADO_OPTIONS (plural,
// pensado para los chips del toolbar), acá singular porque es el estado de
// UN movimiento puntual.
const ESTADO_BADGE = {
  confirmado: { tone: 'success', label: 'Confirmado' },
  'sin-confirmar': { tone: 'warn', label: 'Sin Confirmar' },
  anulado: { tone: 'danger', label: 'Anulado' },
};

// Réplica de la grilla principal de la pantalla legacy de referencia --
// mismo esqueleto .mig-grid/.mig-ellipsis/.mig-num que MovimientoItemsTable
// (ver Solicitudes/shared/shared.css), fila seleccionable con el mismo
// patrón de teclado/aria que FacturasGridClasica/AdmisionesTable. Columna
// "Acciones": Editar/Ver detalle/Imprimir/Anular viven todas en el menú "⋮"
// (MovimientoRowMenu) -- "Editar" era antes un botón directo, se movió
// adentro (encargo explícito) para no repartir la columna en dos
// disparadores. V1 sigue siendo visual-only salvo "Ver detalle" (sin
// modales todavía para el resto, ver spec). Doble clic en la fila (encargo
// explícito) dispara el mismo AlistarPedidoModal que "Alistar pedido" del
// menú -- el clic simple de esa misma secuencia ya deja la fila
// seleccionada antes de que dispare el dblclick, así que no hace falta
// lógica extra para "la fila seleccionada".
export default function MovimientosGrid({
  movimientos, selectedId, onSelect, onVerDetalle, onAlistarPedido,
}) {
  function handleKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(id);
  }

  return (
    <div className="mig-grid-scroll">
      <table className="mig-grid">
        <thead>
          <tr>
            {COLUMNS.map((c) => <th key={c}>{c}</th>)}
            <th className="col-acciones"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr
              key={m.id}
              className={m.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(m.id)}
              onDoubleClick={() => onAlistarPedido(m)}
              onKeyDown={(e) => handleKeyDown(e, m.id)}
              tabIndex={0}
              aria-selected={m.id === selectedId}
            >
              <td><Badge tone={ESTADO_BADGE[m.estado].tone}>{ESTADO_BADGE[m.estado].label}</Badge></td>
              <td className="mig-strong">{m.consecutivo}</td>
              <td>{m.noAdmision}</td>
              <td>{m.noPrestacion}</td>
              <td className="mig-fecha-solicitud">{formatFecha(m.fecha)} <span className="mig-fecha-sep">·</span> {m.hora}</td>
              <td>{m.procedencia}</td>
              <td>{m.movimiento}</td>
              <td className="mig-ellipsis" title={m.paciente}>{m.paciente}</td>
              <td className="mig-ellipsis" title={m.ubicacion}>{m.ubicacion}</td>
              <td className="col-acciones" onClick={(e) => e.stopPropagation()}>
                <div className="mig-row-actions">
                  <MovimientoRowMenu
                    consecutivo={m.consecutivo}
                    estado={m.estado}
                    onVerDetalle={() => onVerDetalle(m)}
                    onAlistarPedido={() => onAlistarPedido(m)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {movimientos.length === 0 && (
        <div className="mig-grid-empty">No hay movimientos que coincidan con los filtros seleccionados.</div>
      )}
    </div>
  );
}
