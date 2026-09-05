'use client';

import './FacturaDetalleClasico.css';
import { formatCOP } from '@/hooks/Facturacion/mockFacturasData';

// Panel inferior de la vista clásica: una sola barra con los datos de la
// admisión y el total de la factura. Editar/Imprimir y el resto de acciones
// de la factura viven en la columna Acciones de FacturasGridClasica; Imprimir
// anexo/Anexo por prefijo/Capitados se trasladaron al footer de la tabla de
// ítems del modal "Ver detalle" (FacturaDetalleModalClasico,
// fvcd-items-footer) -- encargo explícito, no se duplican acá. La grilla de
// ítems (FacturaItemsTable) ya no se repite acá: vive en el modal "Ver
// detalle" y mostrarla dos veces era redundante -- se ocultó para darle más
// alto a la tabla principal de facturas (encargo explícito, 2026-09-05). El
// total se mostraba dos veces (info-bar plano + footer resaltado); se dejó
// solo el resaltado y ambas barras se unificaron en una (encargo explícito,
// 2026-09-05). Sin selección: mensaje de estado vacío, mismo criterio que
// FacturaDetallePanel (vista nueva).
export default function FacturaDetalleClasico({ factura }) {
  if (!factura) {
    return (
      <div className="fvc-detail fvc-detail-empty">
        Selecciona una factura en la grilla para ver su detalle.
      </div>
    );
  }

  return (
    <div className="fvc-detail">
      <div className="fvc-info-bar">
        <div className="fvc-info-item">
          <span className="fvc-info-label">No. Admisión:</span>
          <span className="fvc-info-value">{factura.noAdmision}</span>
        </div>
        <div className="fvc-info-item">
          <span className="fvc-info-label">Nombre Afiliado:</span>
          <span className="fvc-info-value fvc-info-name">{factura.nombreAfiliado}</span>
        </div>
        <div className="fvc-info-spacer" />
        <div className="fvc-footer-right">
          <span className="fvc-footer-total-label">Total Factura:</span>
          <span className="fvc-footer-total-value">{formatCOP(factura.valorTotal)}</span>
        </div>
      </div>
    </div>
  );
}
