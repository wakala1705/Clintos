'use client';

import './FacturaItemResumen.css';
import { formatCOP } from '@/hooks/Facturacion/mockFacturasData';

function Trazabilidad({ item }) {
  return (
    <>
      <div className="fir-row"><span>CCosto</span><span>{item.ccosto}</span></div>
      <div className="fir-row"><span>Tabla Origen</span><span>{item.tablaOrigen}</span></div>
      <div className="fir-row"><span>ID Item Prestación</span><span>{item.idItemPrestacion.toLocaleString('es-CO')}</span></div>
      <div className="fir-row"><span>FTRDID</span><span>{item.ftrdid.toLocaleString('es-CO')}</span></div>
    </>
  );
}

// Panel contextual junto a la tabla de ítems. `selectedItem`/`selectedIndex`/
// `resumen` salen de useFacturaItemSeleccion.
//
// - Por defecto (modal "Ver detalle"): con un ítem seleccionado muestra
//   valores + trazabilidad (CCosto/Tabla Origen/ID Item Prestación/FTRDID) de
//   ESE ítem, titulado con su número; sin selección agrega todos los ítems y
//   se titula "Resumen de factura". El título dice siempre el alcance para
//   que sus valores no se lean como el total de la factura.
// - `soloTrazabilidad` (panel del modo dividido, encargo explícito): los
//   valores por ítem ya están como columnas de la tabla (ver `showValores` en
//   FacturaItemsTable), así que acá solo queda la trazabilidad del ítem
//   seleccionado; sin selección, un aviso para elegir uno.
export default function FacturaItemResumen({
  selectedItem, selectedIndex, resumen, soloTrazabilidad = false,
}) {
  const header = selectedItem && (
    <>
      <div className="fir-eyebrow">{soloTrazabilidad ? 'Trazabilidad' : 'Ítem seleccionado'}</div>
      <div className="fir-title">
        Ítem {String(selectedIndex + 1).padStart(3, '0')}
        <span className="fir-ref">{selectedItem.referencia}</span>
      </div>
      <div className="fir-desc" title={selectedItem.descripcion}>{selectedItem.descripcion}</div>
    </>
  );

  if (soloTrazabilidad) {
    return (
      <div className="fir-card" aria-live="polite">
        {selectedItem ? (
          <>
            {header}
            <Trazabilidad item={selectedItem} />
          </>
        ) : (
          <>
            <div className="fir-eyebrow">Trazabilidad</div>
            <div className="fir-empty">Selecciona un ítem de la tabla para ver su trazabilidad.</div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fir-card" aria-live="polite">
      {selectedItem ? header : (
        <>
          <div className="fir-eyebrow">Todos los ítems</div>
          <div className="fir-title">Resumen de factura</div>
          <div className="fir-desc">{resumen.totalItems} ítems · selecciona una fila para ver su detalle</div>
        </>
      )}

      <div className="fir-row"><span>Subtotal servicios</span><span>{formatCOP(resumen.subtotalServicios)}</span></div>
      <div className="fir-row"><span>IVA</span><span>{formatCOP(resumen.iva)}</span></div>
      <div className="fir-row"><span>Copago</span><span>{formatCOP(resumen.copago)}</span></div>
      <div className="fir-row"><span>Moderador</span><span>{formatCOP(resumen.moderador)}</span></div>
      <div className="fir-row"><span>Pago compartido</span><span>{formatCOP(resumen.pagoCompartido)}</span></div>
      <div className="fir-row"><span>Descuento</span><span>{formatCOP(resumen.descuento)}</span></div>
      <div className="fir-divider" aria-hidden="true" />
      <div className="fir-row fir-total">
        <span>{selectedItem ? 'Total del ítem' : 'Valor total'}</span>
        <span>{formatCOP(resumen.total)}</span>
      </div>

      {selectedItem && (
        <>
          <div className="fir-subtitle">Trazabilidad</div>
          <Trazabilidad item={selectedItem} />
        </>
      )}
    </div>
  );
}
