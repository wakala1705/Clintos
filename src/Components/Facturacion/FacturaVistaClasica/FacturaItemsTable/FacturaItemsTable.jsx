'use client';

import { formatCOP } from '@/hooks/Facturacion/mockFacturasData';

// Vlr. Servicio/Vlr. IVA/Vlr. Copago/Vlr. Moderador/Vlr. Pag.Comp/Descuento
// se sacaron de acá (encargo explícito) -- son la misma información que ya
// muestra "Resumen de factura" (Subtotal servicios/IVA/Copago/Moderador/
// Pago compartido/Descuento, ver FacturaDetalleModalClasico.jsx) apenas se
// selecciona un ítem; mostrarlas repetidas en la tabla era redundante.
const ITEM_COLUMNS = [
  'Item', 'Prefijo', 'Referencia', 'Descripción', 'Cantidad', 'Vlr. Unidad', 'Vlr. Total',
];

// Grilla densa de ítems de una factura (mismas columnas que el formulario
// legacy de referencia) -- extraída originalmente para ser consumida tanto
// por FacturaDetalleClasico como por FacturaDetalleModalClasico; hoy
// FacturaDetalleClasico ya no la usa (ver su comentario), así que
// FacturaDetalleModalClasico es el único consumidor. Sin CSS propio: solo
// consume .fvc-items-scroll/.fvc-grid/.fvc-items-grid/.fvc-num/.fvc-ellipsis,
// ya definidas en ../../shared/shared.css (mismo criterio que
// SegmentedFilterBar.jsx) -- el estilo de fila seleccionada/hover/focus
// (tr.selected, tr:hover, tr:focus-visible) también sale de ahí, mismas
// reglas que ya usa FacturasGridClasica.
//
// Selección de fila (encargo explícito: "cada ítem debe ser seleccionable")
// -- mismo patrón accesible que las filas de FacturasGridClasica (clic +
// Enter/Espacio, aria-selected, tabIndex). `selectedId`/`onSelect` son del
// llamador: acá solo se compara contra `item.id` (id estable por posición,
// ver buildItems en mockFacturasData.js -- sobrevive a que el llamador filtre
// `items` por búsqueda, a diferencia de un índice del array renderizado).
export default function FacturaItemsTable({ items, selectedId, onSelect }) {
  return (
    <div className="fvc-items-scroll">
      <table className="fvc-grid fvc-items-grid">
        <thead>
          <tr>{ITEM_COLUMNS.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              className={item.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(item.id)}
              tabIndex={0}
              aria-selected={item.id === selectedId}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item.id); } }}
            >
              <td>{String(idx + 1).padStart(3, '0')}</td>
              <td className="fvc-num">{item.prefijo}</td>
              <td>{item.referencia}</td>
              <td className="fvc-ellipsis" title={item.descripcion}>{item.descripcion}</td>
              <td className="fvc-num">{item.cantidad}</td>
              <td className="fvc-num">{formatCOP(item.vlrUnidad)}</td>
              <td className="fvc-num">{formatCOP(item.vlrUnidad)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
