import { useSyncExternalStore } from 'react';

// Overrides en memoria de "Guardar" (FacturaAgregarModalClasico, Agregar/
// Editar) -- FACTURAS (mockFacturasData.js) es un array estático importado
// por valor, nunca se muta directo. Vive en un store aparte (mismo patrón
// pub/sub que vistaClasicaPrefs.js, sin localStorage -- se reinicia al
// recargar la página, igual que estadoPEOverrides/estadoFacturacionOverrides
// que ya vivían como useState en FacturaVistaClasica.jsx) porque "Nueva
// factura" se abre desde Facturacion.jsx, un padre de FacturaVistaClasica,
// no un hijo suyo -- no hay un único componente común más abajo en el árbol
// donde guardar esto como useState.
//
// `facturasNuevas`: facturas creadas por Guardar bajo "Agregar", más
// reciente primero (se insertan al inicio de la tabla). `facturasEditadas`:
// id -> objeto completo con los cambios de Guardar bajo "Editar" -- mismo
// criterio de merge por id que estadoOverrides en FacturaVistaClasica.jsx.
let snapshot = { facturasNuevas: [], facturasEditadas: {} };

const listeners = new Set();

function setSnapshot(next) {
  snapshot = next;
  listeners.forEach((callback) => callback());
}

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return snapshot;
}

export function agregarFactura(factura) {
  setSnapshot({ ...snapshot, facturasNuevas: [factura, ...snapshot.facturasNuevas] });
}

export function editarFactura(id, cambios) {
  setSnapshot({
    ...snapshot,
    facturasEditadas: { ...snapshot.facturasEditadas, [id]: { ...snapshot.facturasEditadas[id], ...cambios } },
  });
}

// "Refrescar" (FacturaVistaClasica.jsx) -- descarta lo guardado localmente,
// mismo criterio que el resto de los overrides de esa pantalla (sin backend
// real, "refrescar" simula volver a pedirle los datos a un servidor que
// nunca se enteró de estos cambios).
export function resetFacturasStore() {
  setSnapshot({ facturasNuevas: [], facturasEditadas: {} });
}

export function useFacturasStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
