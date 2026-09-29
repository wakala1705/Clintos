'use client';

import './FacturaItemsTable.css';
import { formatCOP } from '@/hooks/Facturacion/mockFacturasData';

// Columnas: `render` pinta la celda; `num` alinea a la derecha
// (.fvc-items-num, ver FacturaItemsTable.css) -- el <th> lleva la misma
// clase que sus celdas.
//
// IVA/Copago/Moderador/Pago compartido/Descuento solo se muestran con
// `showValores` (panel del modo dividido, encargo explícito): ahí el panel
// derecho quedó solo con la trazabilidad, así que los valores por ítem viven
// en la tabla. En el modal no se pasan -- esos valores ya los muestra
// FacturaItemResumen al seleccionar un ítem y repetirlos era redundante.
// CCosto/Tabla Origen/ID Item Prestación/FTRDID nunca van como columna:
// viven en FacturaItemResumen, atados a la fila seleccionada.
const BASE_COLUMNS = [
  { label: 'Item', render: (item, idx) => String(idx + 1).padStart(3, '0') },
  { label: 'Prefijo', className: 'fvc-num', render: (item) => item.prefijo },
  { label: 'Referencia', render: (item) => item.referencia },
  {
    label: 'Descripción', ellipsis: true, className: 'fvc-uppercase', render: (item) => item.descripcion,
  },
  { label: 'Cantidad', num: true, render: (item) => item.cantidad },
  { label: 'Vlr. Unidad', num: true, render: (item) => formatCOP(item.vlrUnidad) },
  { label: 'Vlr. Total', num: true, render: (item) => formatCOP(item.vlrServicio) },
];
const VALORES_COLUMNS = [
  { label: 'IVA', num: true, render: (item) => formatCOP(item.vlrIVA) },
  { label: 'Copago', num: true, render: (item) => formatCOP(item.vlrCopago) },
  { label: 'Moderador', num: true, render: (item) => formatCOP(item.vlrModerador) },
  { label: 'Pago compartido', num: true, render: (item) => formatCOP(item.vlrPagComp) },
  { label: 'Descuento', num: true, render: (item) => formatCOP(item.descuento) },
];

function cellClass(c) {
  if (c.num) return 'fvc-items-num';
  return [c.ellipsis && 'fvc-ellipsis', c.className].filter(Boolean).join(' ') || undefined;
}

// Grilla densa de ítems de una factura (mismas columnas que el formulario
// legacy de referencia) -- la consumen el modal "Ver detalle"
// (FacturaDetalleModalClasico) y el panel inferior del modo dividido
// (FacturaDetalleSplit), ambos dentro de una tarjeta .fvc-items-card. Su CSS
// propio solo alinea las columnas numéricas; el resto
// (.fvc-items-scroll/.fvc-grid/.fvc-items-grid/.fvc-num/.fvc-ellipsis) ya
// viene de ../../shared/shared.css (mismo criterio que
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
//
// "Vlr. Total" usa `item.vlrServicio` (Vlr. Unidad × Cantidad), no
// `item.vlrUnidad` repetido -- bug real encontrado al replicar una factura
// de referencia con cantidades > 1 (Jeringa cantidad 5, Vlr. Total debía
// ser 2.500, no 500): pasaba inadvertido porque buildItems() siempre generó
// `cantidad: 1`, caso en el que ambos campos coinciden por coincidencia.
export default function FacturaItemsTable({
  items, selectedId, onSelect, showValores = false,
}) {
  const columns = showValores ? [...BASE_COLUMNS, ...VALORES_COLUMNS] : BASE_COLUMNS;
  return (
    <div className="fvc-items-scroll">
      <table className="fvc-grid fvc-items-grid">
        <thead>
          <tr>{columns.map((c) => <th key={c.label} className={c.num ? 'fvc-items-num' : undefined}>{c.label}</th>)}</tr>
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
              {columns.map((c) => (
                <td key={c.label} className={cellClass(c)} title={c.ellipsis ? c.render(item, idx) : undefined}>
                  {c.render(item, idx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
