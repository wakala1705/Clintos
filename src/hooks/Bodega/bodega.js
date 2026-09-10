import { useSyncExternalStore } from 'react';

// Catálogo + selección de bodega -- vive acá (no en hooks/InsumosFarmacia,
// de donde se movió) porque ahora la selecciona el gate post-login de Home
// (ver BodegaPickerButton), antes de que exista ninguna pantalla de
// Inventario montada: es un concepto cross-feature, mismo criterio que
// hooks/Session/session.js para el módulo activo (ver AGENTS.md "Hooks /
// logic organization").
export const BODEGAS_CATALOGO = [
  { idGrupo: '01', descripcion: 'FARMACIA PISO 3 T1' },
  { idGrupo: 'AF', descripcion: 'ACTIVOS FIJOS' },
  { idGrupo: 'AS', descripcion: 'SUMINISTRO ASEO' },
  { idGrupo: 'BC', descripcion: 'BODEGA DE CIRUGIA ONCOMEDICA' },
  { idGrupo: '02', descripcion: 'FARMACIA CENTRAL DISPENSACION' },
];

const BODEGA_KEY = 'clintos-bodega-seleccionada';

// A diferencia de session.js (que solo setea el módulo activo justo antes de
// una navegación completa a /home, así que el próximo mount ya lee el valor
// nuevo), acá BodegaPickerButton setea la bodega mientras sigue montado en
// la MISMA pestaña (gate de Home, o cambio manual desde Solicitudes) -- el
// evento nativo "storage" no se dispara en la pestaña que escribió, así que
// hace falta este pub/sub propio además de él (que sigue cubriendo la
// sincronización entre pestañas).
const listeners = new Set();

export function setBodegaSeleccionada(idGrupo) {
  try {
    window.localStorage.setItem(BODEGA_KEY, idGrupo);
  } catch {
    // localStorage puede no estar disponible (modo privado, SSR).
  }
  listeners.forEach((callback) => callback());
}

export function getBodegaIdSeleccionada() {
  try {
    return window.localStorage.getItem(BODEGA_KEY);
  } catch {
    return null;
  }
}

function subscribe(callback) {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getServerSnapshot() {
  return null;
}

// useSyncExternalStore (no useState+useEffect) evita el mismatch de
// hidratación al leer localStorage -- mismo patrón que useActiveModule
// (hooks/Session/session.js).
export function useBodegaId() {
  return useSyncExternalStore(subscribe, getBodegaIdSeleccionada, getServerSnapshot);
}

export function useBodegaSeleccionada() {
  const id = useBodegaId();
  return BODEGAS_CATALOGO.find((b) => b.idGrupo === id) ?? null;
}
