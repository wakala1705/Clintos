import { useMemo, useState } from 'react';

// Selección de ítem dentro del detalle de una factura + el resumen de valores
// que depende de ella. Compartido por el modal "Ver detalle"
// (FacturaDetalleModalClasico) y el panel inferior del modo dividido
// (FacturaDetalleSplit).
//
// - El primer ítem viene seleccionado por defecto (encargo explícito) y se
//   vuelve a seleccionar al cambiar de factura, para no arrastrar la
//   selección de la factura anterior.
// - Clic de nuevo sobre el ítem seleccionado lo deselecciona (toggle): el
//   resumen pasa a agregar TODOS los ítems.
// - Selección por `id` estable del ítem (ver buildItems en
//   mockFacturasData.js), no por índice del array.
export default function useFacturaItemSeleccion(factura) {
  const [selectedItemId, setSelectedItemId] = useState(factura?.items[0]?.id ?? null);
  const [lastFacturaId, setLastFacturaId] = useState(factura?.id ?? null);
  if ((factura?.id ?? null) !== lastFacturaId) {
    setLastFacturaId(factura?.id ?? null);
    setSelectedItemId(factura?.items[0]?.id ?? null);
  }

  function toggleSelectedItem(id) {
    setSelectedItemId((cur) => (cur === id ? null : id));
  }

  const selectedIndex = factura?.items.findIndex((it) => it.id === selectedItemId) ?? -1;
  const selectedItem = selectedIndex >= 0 ? factura.items[selectedIndex] : null;

  const resumen = useMemo(() => {
    if (!factura) return null;
    const itemsResumen = selectedItemId
      ? factura.items.filter((it) => it.id === selectedItemId)
      : factura.items;
    const totales = itemsResumen.reduce((acc, it) => ({
      subtotalServicios: acc.subtotalServicios + it.vlrServicio,
      iva: acc.iva + it.vlrIVA,
      copago: acc.copago + it.vlrCopago,
      moderador: acc.moderador + it.vlrModerador,
      pagoCompartido: acc.pagoCompartido + it.vlrPagComp,
      descuento: acc.descuento + it.descuento,
    }), {
      subtotalServicios: 0, iva: 0, copago: 0, moderador: 0, pagoCompartido: 0, descuento: 0,
    });
    return {
      ...totales,
      totalItems: itemsResumen.length,
      total: totales.subtotalServicios + totales.iva + totales.copago + totales.moderador + totales.pagoCompartido - totales.descuento,
    };
  }, [factura, selectedItemId]);

  return {
    selectedItemId, selectedIndex, selectedItem, toggleSelectedItem, resumen,
  };
}
