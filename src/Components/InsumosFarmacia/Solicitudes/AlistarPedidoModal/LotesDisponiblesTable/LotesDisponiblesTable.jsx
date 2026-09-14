'use client';

import { useState } from 'react';
import './LotesDisponiblesTable.css';
import { LuRefreshCw } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import LoteRowMenu from './LoteRowMenu/LoteRowMenu';
import EditarLoteModal from './EditarLoteModal/EditarLoteModal';

// Tono de Badge para "Vence" (encargo explícito "pongamos la fecha en un
// badge... que cambie de color", reemplaza el cuadrito de color + texto
// plano de antes) -- mismo umbral (60/180 días) que toneVencimiento() de
// AlistarPedidoModal.jsx (el que colorea "Días para vencer" en Resumen de
// lote); si el umbral cambia acá, cambia allá también. "Vencido" (encargo
// explícito "agrega un estado vencido, para ver el ejemplo") es su propia
// rama por legibilidad, aunque hoy comparta el mismo tono "danger" que
// "próximo a vencer" -- Badge no tiene un 5to tono más urgente que rojo.
function toneVencimiento(diasVence) {
  if (diasVence < 0) return 'danger'; // vencido
  if (diasVence <= 60) return 'danger'; // próximo a vencer
  if (diasVence <= 180) return 'warn';
  return 'success';
}

// Réplica de la grilla inferior "Artículos disponibles para el código" de la
// referencia legacy -- lotes/existencias del artículo seleccionado en
// ArticulosItemsTable (ver AlistarPedidoModal.jsx, que pasa `lotes` desde
// mockSolicitudesData.js). La columna "Item" se eliminó (encargo explícito)
// -- la posición del lote dentro de esta lista (no un id global) sigue
// existiendo como `i`/`i + 1` en el código (EditarLoteModal/LoteRowMenu/
// aria-label de Cantidad la siguen usando), solo dejó de tener columna
// visible propia. Orden de columnas también por encargo explícito:
// Descripción primera, Ubicación antepenúltima (justo antes de Lote Serie/
// Acciones). Id Sede/Id.Bdg/Id. Artículo/Genérico/Días Vence/Trans./
// No.Documento se sacaron de esta tabla (encargo explícito) -- viven en
// "Resumen de lote" (mig-lotes-summary, AlistarPedidoModal.jsx).
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
// Borrar/Movimiento): ahora son acciones por fila, no globales. "Sugerir"
// queda como botón directo (encargo explícito) -- es la acción más frecuente
// del flujo de reparto (redistribuye por FEFO, ver onSugerirTodos abajo);
// "Editar" se movió adentro de LoteRowMenu ("⋮", junto a Movimiento/Borrar)
// porque ya tiene un disparador propio más rápido -- doble clic en la fila
// (mismo patrón que MovimientosGrid.jsx -> AlistarPedidoModal: el clic
// simple de esa misma secuencia ya deja la fila seleccionada antes de que
// dispare el dblclick) -- así que no necesita también un botón directo.
// stopPropagation en la celda evita que un click en estos botones dispare
// también el onSelect de la fila (mismo criterio que MovimientosGrid.jsx).
//
// Componente puramente presentacional (encargo explícito "validemos lo
// asignado contra lo esperado y habilitemos Confirmar") -- `lotes` ya llega
// fusionado con las ediciones de cantidad desde AlistarPedidoModal, que es
// quien ahora dueña `cantidadOverrides`: Confirmar necesita sumarlas por
// ítem para TODO el documento, no solo para el ítem cuyos lotes están
// visibles acá. `onCantidadChange` (input en línea o "Guardar" de
// EditarLoteModal) y `onSugerirTodos` (redistribuye por FEFO todo el ítem
// seleccionado, ver AlistarPedidoModal.jsx) solo delegan hacia arriba. La
// celda Cantidad guarda el string crudo del input, ya filtrado a solo
// dígitos (encargo explícito "solo números enteros" -- las cantidades de
// una solicitud de farmacia no se reparten en fracciones de unidad). type="text"
// + inputMode="numeric" en vez de type="number" (evita los estados
// intermedios válidos de un <input type=number> como "3." o "3e" que sí
// dejarían pasar un valor no entero al pegar/escribir rápido).
export default function LotesDisponiblesTable({
  lotes, selectedIndex, onSelect, onCantidadChange, onSugerirTodos,
}) {
  const [editIndex, setEditIndex] = useState(null);

  function handleKeyDown(e, index) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(index);
  }

  function handleCantidadChange(loteSerie, rawValue) {
    onCantidadChange(loteSerie, rawValue.replace(/\D/g, ''));
  }

  return (
    <div className="mig-lotes-table-scroll">
      <div className="mig-lotes-table-inner">
        <table className="mig-grid mig-lotes-grid">
          <thead>
            <tr>
              <th>Descripción</th>
              <th className="mig-num">Stock</th>
              <th className="mig-num">Cantidad</th>
              <th>Vence</th>
              <th>Ubicación</th>
              <th>Lote Serie</th>
              <th className="mig-lotes-acciones-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map((l, i) => (
              <tr
                key={`${l.loteSerie}-${i}`}
                className={i === selectedIndex ? 'selected' : ''}
                onClick={() => onSelect(i)}
                onDoubleClick={() => setEditIndex(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                tabIndex={0}
                aria-selected={i === selectedIndex}
              >
                <td className="mig-ellipsis mig-lotes-descripcion" title={l.descripcion}>{l.descripcion}</td>
                <td className="mig-num">{l.stock}</td>
                <td className="mig-num" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`mig-lotes-cantidad-input${Number(l.cantidad) > 0 ? ' asignado' : ''}`}
                    value={l.cantidad}
                    aria-label={`Cantidad del lote ${i + 1}`}
                    onChange={(e) => handleCantidadChange(l.loteSerie, e.target.value)}
                  />
                </td>
                <td>
                  <Badge tone={toneVencimiento(l.diasVence)}>{l.vence.replaceAll('-', '/')}</Badge>
                </td>
                <td className="mig-ellipsis" title={l.ubicacion}>{l.ubicacion}</td>
                <td>{l.loteSerie}</td>
                <td className="mig-lotes-acciones" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="mig-lotes-accion-btn"
                    aria-label="Sugerir reparto por FEFO"
                    title="Sugerir"
                    onClick={onSugerirTodos}
                  >
                    <LuRefreshCw className="icon" />
                  </button>
                  <LoteRowMenu itemLabel={i + 1} onEditar={() => setEditIndex(i)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {lotes.length === 0 && (
          <div className="mig-grid-empty">No hay lotes disponibles para este artículo.</div>
        )}
      </div>

      {editIndex !== null && lotes[editIndex] && (
        <EditarLoteModal
          lote={lotes[editIndex]}
          itemLabel={editIndex + 1}
          onClose={() => setEditIndex(null)}
          onSave={(cantidad) => {
            onCantidadChange(lotes[editIndex].loteSerie, cantidad);
            setEditIndex(null);
          }}
        />
      )}
    </div>
  );
}
