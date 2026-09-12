'use client';

import { useState } from 'react';
import './LotesDisponiblesTable.css';
import { LuPencil } from 'react-icons/lu';
import LoteRowMenu from './LoteRowMenu/LoteRowMenu';
import EditarLoteModal from './EditarLoteModal/EditarLoteModal';

// Semáforo rojo/ámbar/verde para "Vence" -- mismos 3 tonos que el resto del
// proyecto usa para vigencias, sin umbral fijo todavía (60/180 días es un
// primer corte visual; a ajustar cuando el negocio defina la regla real de
// próximo-a-vencer para insumos de farmacia).
function colorVencimiento(diasVence) {
  if (diasVence <= 60) return 'var(--red)';
  if (diasVence <= 180) return 'var(--amber)';
  return 'var(--green)';
}

// Réplica de la grilla inferior "Artículos disponibles para el código" de la
// referencia legacy -- lotes/existencias del artículo seleccionado en
// ArticulosItemsTable (ver AlistarPedidoModal.jsx, que pasa `lotes` desde
// mockSolicitudesData.js). "Item" es la posición del lote dentro de esta
// lista (no un id global). Id Sede/Id.Bdg/Id. Artículo/Genérico/Días Vence/
// Trans./No.Documento se sacaron de esta tabla (encargo explícito) -- viven
// en "Resumen de lote" (mig-lotes-summary, AlistarPedidoModal.jsx).
// "Esperada" también se sacó (encargo explícito) -- es el mismo valor para
// las 4 filas (la cantidad solicitada del ítem, no varía por lote), así que
// se movió a mig-lotes-title (ver AlistarPedidoModal.jsx), junto al código/
// descripción del artículo, en vez de repetirse en cada fila. Fila
// seleccionable
// (encargo explícito, mismo patrón clic/Enter-Espacio que ArticulosItemsTable)
// -- alimenta "Resumen de lote" en AlistarPedidoModal.jsx, mismo criterio que
// FacturaItemsTable/"Resumen de factura" en FacturaDetalleModalClasico.
// Columna "Acciones" (encargo explícito) -- reemplazó la franja
// mig-alistar-actions que vivía debajo de toda la tabla (Sugerir/Editar/
// Borrar/Movimiento): ahora son acciones por fila, no globales. "Editar"
// queda como botón directo (acción más frecuente); Sugerir/Movimiento/Borrar
// se agrupan en LoteRowMenu ("⋮", mismo patrón que MovimientoRowMenu.jsx).
// stopPropagation en la celda evita que un click en estos botones dispare
// también el onSelect de la fila (mismo criterio que MovimientosGrid.jsx).
// "Editar" abre EditarLoteModal (encargo explícito) -- también por doble
// clic en la fila, mismo patrón que MovimientosGrid.jsx -> AlistarPedidoModal
// (el clic simple de esa misma secuencia ya deja la fila seleccionada antes
// de que dispare el dblclick, sin lógica extra acá). "Guardar" en ese modal
// simula la persistencia (encargo explícito "que se vea reflejado en la
// tabla") -- `cantidadOverrides` (keyed por loteSerie, identidad estable del
// lote) pisa la `cantidad` original solo para el render de esta tabla/el
// modal reabierto; no hay backend real ni se toca mockSolicitudesData.js.
// La celda Cantidad además es un <input> editable en línea (encargo
// explícito "mejoremos la usabilidad") -- comparte el mismo `cantidadOverrides`
// que EditarLoteModal, así que editar acá o desde el modal siempre queda
// consistente. Se guarda el string crudo del input (no `.toFixed`, mismo
// criterio que ArticulosModal.jsx/SolicitudConsumo) para no pisarle al
// usuario el punto decimal mientras todavía está escribiendo.
export default function LotesDisponiblesTable({ lotes, selectedIndex, onSelect }) {
  const [editIndex, setEditIndex] = useState(null);
  const [cantidadOverrides, setCantidadOverrides] = useState({});

  const lotesConEdicion = lotes.map((l) => (
    l.loteSerie in cantidadOverrides ? { ...l, cantidad: cantidadOverrides[l.loteSerie] } : l
  ));

  function updateCantidad(loteSerie, value) {
    setCantidadOverrides((prev) => ({ ...prev, [loteSerie]: value }));
  }

  function handleKeyDown(e, index) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(index);
  }

  return (
    <div className="mig-lotes-table-scroll">
      <div className="mig-lotes-table-inner">
        <table className="mig-grid mig-lotes-grid">
          <thead>
            <tr>
              <th>Item</th>
              <th>Ubicación</th>
              <th className="mig-num">Stock</th>
              <th className="mig-num">Cantidad</th>
              <th>Descripción</th>
              <th>Vence</th>
              <th>Lote Serie</th>
              <th className="mig-lotes-acciones-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lotesConEdicion.map((l, i) => (
              <tr
                key={`${l.loteSerie}-${i}`}
                className={i === selectedIndex ? 'selected' : ''}
                onClick={() => onSelect(i)}
                onDoubleClick={() => setEditIndex(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                tabIndex={0}
                aria-selected={i === selectedIndex}
              >
                <td>{i + 1}</td>
                <td className="mig-ellipsis" title={l.ubicacion}>{l.ubicacion}</td>
                <td className="mig-num">{l.stock.toFixed(2)}</td>
                <td className="mig-num" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    className="mig-lotes-cantidad-input"
                    value={l.cantidad}
                    min={0}
                    step="0.01"
                    aria-label={`Cantidad del lote ${i + 1}`}
                    onChange={(e) => updateCantidad(l.loteSerie, e.target.value)}
                  />
                </td>
                <td className="mig-ellipsis mig-lotes-descripcion" title={l.descripcion}>{l.descripcion}</td>
                <td>
                  <span className="mig-vence-dot" style={{ background: colorVencimiento(l.diasVence) }} aria-hidden="true" />
                  {l.vence.replaceAll('-', '/')}
                </td>
                <td>{l.loteSerie}</td>
                <td className="mig-lotes-acciones" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="mig-lotes-accion-btn"
                    aria-label={`Editar lote ${i + 1}`}
                    title="Editar"
                    onClick={() => setEditIndex(i)}
                  >
                    <LuPencil className="icon" />
                  </button>
                  <LoteRowMenu itemLabel={i + 1} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {lotes.length === 0 && (
          <div className="mig-grid-empty">No hay lotes disponibles para este artículo.</div>
        )}
      </div>

      {editIndex !== null && lotesConEdicion[editIndex] && (
        <EditarLoteModal
          lote={lotesConEdicion[editIndex]}
          itemLabel={editIndex + 1}
          onClose={() => setEditIndex(null)}
          onSave={(cantidad) => {
            setCantidadOverrides((prev) => ({ ...prev, [lotesConEdicion[editIndex].loteSerie]: cantidad }));
            setEditIndex(null);
          }}
        />
      )}
    </div>
  );
}
