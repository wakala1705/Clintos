'use client';

import './MovimientoItemsTable.css';
import { formatMoneda } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

const COLUMNS = [
  'Item', 'Código', 'Descripción', 'Marca', 'Bdg', 'Cant. Solicitada', 'Cant. Entregada',
  'Costo Unidad Anterior', 'Costo Unidad', 'Costo Unidad Desc.', 'Costo Unidad Neto',
  'Costo Total Unidad', 'Costo Total Desc.', 'Costo Total Neto',
  'IVA %', 'IVA Unitario', 'IVA Total',
];

// Tabla de artículos del movimiento seleccionado -- reusa el mismo esqueleto
// .mig-grid/.mig-num que MovimientosGrid (ver Solicitudes/shared/shared.css)
// con las columnas propias de este dominio (cantidad solicitada/entregada,
// costo unidad/total, IVA), análoga a FacturaItemsTable de Facturación.
export default function MovimientoItemsTable({ articulos }) {
  return (
    <div className="mig-items-scroll">
      <table className="mig-grid mig-items-grid">
        <thead>
          <tr>{COLUMNS.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {articulos.map((a) => (
            <tr key={a.item}>
              <td>{a.item}</td>
              <td>{a.codigo}</td>
              <td className="mig-ellipsis" title={a.descripcion}>{a.descripcion}</td>
              <td>{a.marca}</td>
              <td>{a.bdg}</td>
              <td className="mig-num">{a.cantidadSolicitada}</td>
              <td className="mig-num">{a.cantidadEntregada}</td>
              <td className="mig-num">{formatMoneda(a.costoUnidad.anterior)}</td>
              <td className="mig-num">{formatMoneda(a.costoUnidad.unidad)}</td>
              <td className="mig-num">{formatMoneda(a.costoUnidad.descuento)}</td>
              <td className="mig-num">{formatMoneda(a.costoUnidad.neto)}</td>
              <td className="mig-num">{formatMoneda(a.costoTotal.unidad)}</td>
              <td className="mig-num">{formatMoneda(a.costoTotal.descuento)}</td>
              <td className="mig-num">{formatMoneda(a.costoTotal.neto)}</td>
              <td className="mig-num">{a.iva.porcentaje}</td>
              <td className="mig-num">{formatMoneda(a.iva.unitario)}</td>
              <td className="mig-num">{formatMoneda(a.iva.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
