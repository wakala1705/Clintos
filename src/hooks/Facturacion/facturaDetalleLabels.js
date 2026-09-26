// Etiquetas/tonos del detalle de una factura -- compartidos por el modal
// "Ver detalle" (FacturaDetalleModalClasico) y el panel inferior del modo
// dividido (FacturaDetalleSplit), que muestran los mismos datos. La grilla
// (FacturasGridClasica) mantiene su propia copia a propósito: su columna
// "Facturación" usa "Sin facturar" en vez de "Pendiente" (ver su comentario).

export const TIPO_LABEL = {
  individual: 'Individual',
  masiva: 'Masiva',
  copago: 'Copago',
  moderadora: 'Moderadora',
  'pago-compartido': 'Pago Compartido',
};

export const CLASE_LABEL = { salud: 'Salud', particular: 'Particular' };

// 3 estados del flujo de facturación electrónica ("Estado de envío").
export const ESTADO_PE = {
  pendiente: { label: 'Pendiente', tone: 'warn' },
  'fe-pendiente': { label: 'Pendiente de correo', tone: 'warn' },
  enviada: { label: 'Enviada', tone: 'success' },
};

// Badge junto al número de factura.
export const ESTADO_FACTURACION = {
  pendiente: { label: 'Pendiente', tone: 'warn' },
  facturada: { label: 'Facturada', tone: 'success' },
};

// "Estado FE" (P/A) del formulario legacy -- solo 2 estados (encargo):
// 'pendiente-electronica' colapsa junto con null en "Procesada".
export function estadoFacturaBadge(f) {
  return f.estado === 'anulada'
    ? { label: 'Anulada', tone: 'danger' }
    : { label: 'Procesada', tone: 'info' };
}
