'use client';

import { useState } from 'react';
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
// costo unidad/total, IVA), análoga a FacturaItemsTable de Facturación. Fila
// seleccionable (encargo explícito) con el mismo patrón click/teclado/aria
// que MovimientosGrid -- selección puramente visual (`.selected`, ver
// shared.css), sin acción asociada todavía. El padre (MovimientoDetalleModal)
// monta este componente con `key={movimiento.id}` para que la selección se
// reinicie sola al cambiar de movimiento, en vez de arrastrar el ítem
// resaltado de un movimiento al abrir otro.
export default function MovimientoItemsTable({ articulos }) {
  const [selectedItem, setSelectedItem] = useState(null);

  function handleKeyDown(e, item) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    setSelectedItem(item);
  }

  return (
    <div className="mig-items-scroll">
      <table className="mig-grid mig-items-grid">
        <thead>
          <tr>{COLUMNS.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {articulos.map((a) => (
            <tr
              key={a.item}
              className={a.item === selectedItem ? 'selected' : ''}
              onClick={() => setSelectedItem(a.item)}
              onKeyDown={(e) => handleKeyDown(e, a.item)}
              tabIndex={0}
              aria-selected={a.item === selectedItem}
            >
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
