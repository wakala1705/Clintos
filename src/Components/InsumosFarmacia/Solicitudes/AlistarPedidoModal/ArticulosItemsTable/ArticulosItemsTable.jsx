'use client';

import './ArticulosItemsTable.css';
import Badge from '@/Components/Badge/Badge';
import { formatMoneda } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

// Réplica de la grilla superior "Artículos Genéricos" de la referencia
// legacy (catálogo Movimiento De Inventario -> Alistar pedido). El punto
// rojo es un indicador visual fijo por ahora (la referencia lo muestra en
// las 6 filas de su único movimiento capturado, todas Sin Confirmar) --
// pendiente de definir su regla real cuando se conecte la lógica de
// alistamiento (ver AlistarPedidoModal.jsx). La columna "Ref." de la
// referencia legacy se ocultó (encargo explícito): siempre vino vacía, sin
// dato del mock que la alimente -- en su lugar va "Estado", con el mismo
// criterio pendiente/entregado que ya filtraba "Estado De Entrega" en
// AlistarPedidoModal.jsx (duplicado acá a propósito, mismo criterio que
// ESTADO_BADGE repetido en MovimientosGrid.jsx/AlistarPedidoModal.jsx). La
// columna ➜/— (antes entre Item e Id.Artículo, mismo criterio
// cantidadEntregada > 0) se eliminó (encargo explícito): quedaba redundante
// con este Badge, que ya comunica lo mismo con más claridad.
const ESTADO_ENTREGA_BADGE = {
  entregado: { tone: 'success', label: 'Entregado' },
  pendiente: { tone: 'warn', label: 'Pendiente' },
};

function estadoEntregaDe(a) {
  return a.cantidadEntregada > 0 ? 'entregado' : 'pendiente';
}

export default function ArticulosItemsTable({ articulos, selectedItem, onSelect }) {
  function handleKeyDown(e, item) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(item);
  }

  return (
    <div className="mig-items-table-scroll">
      <table className="mig-grid mig-items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Id. Artículo</th>
            <th>Descripción</th>
            <th className="mig-num">Cnt. Esperada</th>
            <th className="mig-num">Cant. Entregada</th>
            <th>Estado</th>
            <th className="mig-num">Costo Neto</th>
          </tr>
        </thead>
        <tbody>
          {articulos.map((a) => (
            <tr
              key={a.item}
              className={a.item === selectedItem ? 'selected' : ''}
              onClick={() => onSelect(a.item)}
              onKeyDown={(e) => handleKeyDown(e, a.item)}
              tabIndex={0}
              aria-selected={a.item === selectedItem}
            >
              <td><span className="mig-articulo-dot" aria-hidden="true" />{a.item}</td>
              <td className="mig-strong">{a.codigo}</td>
              <td className="mig-ellipsis" title={a.descripcion}>{a.descripcion}</td>
              <td className="mig-num">{a.cantidadSolicitada.toFixed(2)}</td>
              <td className="mig-num">{a.cantidadEntregada.toFixed(2)}</td>
              <td>
                <Badge tone={ESTADO_ENTREGA_BADGE[estadoEntregaDe(a)].tone}>
                  {ESTADO_ENTREGA_BADGE[estadoEntregaDe(a)].label}
                </Badge>
              </td>
              <td className="mig-num">${formatMoneda(a.costoTotal.neto)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {articulos.length === 0 && (
        <div className="mig-grid-empty">No hay artículos que coincidan con los filtros seleccionados.</div>
      )}
    </div>
  );
}
