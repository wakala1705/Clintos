'use client';

import './FacturaDetalleClasico.css';
import FacturaItemsTable from '../FacturaItemsTable/FacturaItemsTable';
import { formatCOP } from '@/hooks/Facturacion/mockFacturasData';

// Panel inferior de la vista clásica: barra de datos de la admisión, grilla
// densa de ítems (mismas columnas que el formulario legacy de referencia) y
// footer con el total. Editar/Imprimir y el resto de acciones de la factura
// viven en la columna Acciones de FacturasGridClasica; Imprimir anexo/Anexo
// por prefijo/Capitados se trasladaron al footer de la tabla de ítems del
// modal "Ver detalle" (FacturaDetalleModalClasico, fvcd-items-footer) --
// encargo explícito, no se duplican acá. Sin selección: mensaje de estado
// vacío, mismo criterio que FacturaDetallePanel (vista nueva).
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
        <div className="fvc-info-item">
          <span className="fvc-info-label">Total Factura:</span>
          <span className="fvc-info-value fvc-info-total">{formatCOP(factura.valorTotal)}</span>
        </div>
        <div className="fvc-info-spacer" />
      </div>

      <FacturaItemsTable items={factura.items} />

      <div className="fvc-footer-bar">
        <div className="fvc-footer-right">
          <span className="fvc-footer-total-label">Total Factura:</span>
          <span className="fvc-footer-total-value">{formatCOP(factura.valorTotal)}</span>
        </div>
      </div>
    </div>
  );
}
