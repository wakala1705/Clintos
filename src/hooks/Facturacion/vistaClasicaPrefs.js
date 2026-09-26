import { useSyncExternalStore } from 'react';

// Preferencias de la vista clásica de Facturación que se recuerdan entre
// visitas: el modo de vista (lista / dividida) y la proporción del divisor del
// modo dividido. Mismo patrón pub/sub + localStorage que hooks/Sede/sede.js
// (listener propio además del evento "storage", que solo dispara en OTRAS
// pestañas). getServerSnapshot devuelve el default para que el render del
// servidor y la hidratación coincidan.

const MODO_KEY = 'clintos-facturacion-vista-modo';
const RATIO_KEY = 'clintos-facturacion-split-ratio';

export const VISTA_MODOS = ['lista', 'dividida'];
const MODO_DEFAULT = 'lista';
export const SPLIT_RATIO_DEFAULT = 50;

const listeners = new Set();

function read(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // localStorage puede no estar disponible (modo privado, SSR).
  }
  listeners.forEach((callback) => callback());
}

function subscribe(callback) {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getModo() {
  const v = read(MODO_KEY);
  return VISTA_MODOS.includes(v) ? v : MODO_DEFAULT;
}

function getRatio() {
  const n = Number(read(RATIO_KEY));
  return Number.isFinite(n) && n > 0 && n < 100 ? n : SPLIT_RATIO_DEFAULT;
}

export function setVistaModo(modo) {
  write(MODO_KEY, modo);
}

export function setSplitRatio(ratio) {
  write(RATIO_KEY, Math.round(ratio * 10) / 10);
}

export function useVistaModo() {
  return useSyncExternalStore(subscribe, getModo, () => MODO_DEFAULT);
}

export function useSplitRatio() {
  return useSyncExternalStore(subscribe, getRatio, () => SPLIT_RATIO_DEFAULT);
}
