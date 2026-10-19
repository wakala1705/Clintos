'use client';

// Tabla de insumos devueltos de una entrada, compartida por el panel de detalle
// (EntradaDetalle) y el modal (EntradaDetalleModal). Estilos .mig-* de
// ../../Solicitudes/shared/shared.css; va dentro de una .mig-items-card.
export default function EntradaItemsTable({ items }) {
  return (
    <div className="mig-items-scroll">
      <table className="mig-grid">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Lote</th>
            <th className="mig-num">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={`${i.codigo}-${i.noLote ?? ''}`}>
              <td className="mig-strong">{i.codigo}</td>
              <td>{i.nombre}</td>
              <td>{i.manejaLote && i.noLote ? i.noLote : '—'}</td>
              <td className="mig-num">{i.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
