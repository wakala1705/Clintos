'use client';

import MovimientoItemsTable from '../MovimientoDetalleModal/MovimientoItemsTable/MovimientoItemsTable';
import './MovimientoDetalleInline.css';

// Panel de detalle debajo de la grilla (encargo explícito: mismo patrón que
// FacturaDetalleClasico en Facturación, modo "Lista"), reemplazando al modal
// "Ver detalle" como único punto de entrada -- ese modal sigue existiendo
// para el resto de los campos (paciente, admisión, fecha contable...), acá
// solo los artículos solicitados del movimiento seleccionado. Reusa
// MovimientoItemsTable (../MovimientoDetalleModal/MovimientoItemsTable) con
// key={movimiento.id} para que la selección de ítem se reinicie sola al
// cambiar de movimiento, mismo criterio que MovimientoDetalleModal.jsx.
//
// `fill` (modo "Dividida", montado como `bottom` de SplitPane): la tarjeta
// de ítems pasa de alto fijo (280px, modo "Lista") a flex:1 para
// crecer/encogerse con el arrastre del divisor -- ver MovimientoDetalleInline.css.
export default function MovimientoDetalleInline({ movimiento, fill = false }) {
  const className = `mig-detalle-inline${fill ? ' mig-detalle-inline-fill' : ''}`;

  if (!movimiento) {
    return (
      <div className={`${className} mig-detalle-inline-empty`}>
        Selecciona un movimiento en la grilla para ver el detalle de sus artículos.
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mig-detalle-inline-header">
        <h3 className="mig-section-title">Artículos solicitados ({movimiento.articulos.length})</h3>
        <span className="mig-detalle-inline-consecutivo">{movimiento.consecutivo}</span>
      </div>
      <div className="mig-items-card">
        <MovimientoItemsTable key={movimiento.id} articulos={movimiento.articulos} />
      </div>
    </div>
  );
}
