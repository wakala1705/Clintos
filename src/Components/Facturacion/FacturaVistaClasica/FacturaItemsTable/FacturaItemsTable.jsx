'use client';

import { formatCOP } from '@/hooks/Facturacion/mockFacturasData';

const ITEM_COLUMNS = [
  'Item', 'Referencia', 'Descripción', 'Prefijo', 'Cantidad', 'Vlr. Unidad', 'Vlr. Servicio',
  'Vlr. IVA', 'Vlr. Copago', 'Vlr. Moderador', 'Vlr. Pag.Comp', 'Descuento', 'Vlr. Total', 'CCosto',
];

// Grilla densa de ítems de una factura (mismas columnas que el formulario
// legacy de referencia) -- extraída para ser consumida tanto por
// FacturaDetalleClasico (panel inferior siempre visible) como por
// FacturaDetalleModalClasico (modal "Ver detalle"), sin duplicar el mapeo de
// columnas entre ambos. Sin CSS propio: solo consume .fvc-items-scroll/
// .fvc-grid/.fvc-items-grid/.fvc-num/.fvc-ellipsis, ya definidas en
// ../../shared/shared.css y FacturaDetalleClasico.css (mismo criterio que
// SegmentedFilterBar.jsx).
export default function FacturaItemsTable({ items }) {
  return (
    <div className="fvc-items-scroll">
      <table className="fvc-grid fvc-items-grid">
        <thead>
          <tr>{ITEM_COLUMNS.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={`${item.referencia}-${idx}`} className={idx === 0 ? 'selected' : ''}>
              <td>{String(idx + 1).padStart(3, '0')}</td>
              <td>{item.referencia}</td>
              <td className="fvc-ellipsis" title={item.descripcion}>{item.descripcion}</td>
              <td className="fvc-num">{item.prefijo}</td>
              <td className="fvc-num">{item.cantidad}</td>
              <td className="fvc-num">{formatCOP(item.vlrUnidad)}</td>
              <td className="fvc-num">{formatCOP(item.vlrServicio)}</td>
              <td className="fvc-num">{formatCOP(item.vlrIVA)}</td>
              <td className="fvc-num">{formatCOP(item.vlrCopago)}</td>
              <td className="fvc-num">{formatCOP(item.vlrModerador)}</td>
              <td className="fvc-num">{formatCOP(item.vlrPagComp)}</td>
              <td className="fvc-num">{formatCOP(item.descuento)}</td>
              <td className="fvc-num">{formatCOP(item.vlrUnidad)}</td>
              <td>{item.ccosto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
