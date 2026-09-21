import { useSyncExternalStore } from 'react';

// Catálogo + selección de sede -- mismo patrón pub/sub que
// hooks/AreaFuncional/areaFuncional.js (ver ese comentario para el motivo del
// listener propio además del evento "storage"). A diferencia del área
// funcional, la sede NO tiene un gate de login que obligue a elegir: sin
// selección guardada se asume la primera del catálogo, para que el picker del
// Topbar siempre muestre un valor real en vez de "Selecciona".
// Los códigos/nombres siguen los que ya usan otras pantallas del mock
// (01 = Sede Norte en NuevaCita, Centro/Sur/Oriente en Gestión de Camas).
export const SEDES_CATALOGO = [
  { id: '01', descripcion: 'SEDE NORTE' },
  { id: '02', descripcion: 'SEDE CENTRO' },
  { id: '03', descripcion: 'SEDE SUR' },
  { id: '04', descripcion: 'SEDE ORIENTE' },
];

const SEDE_KEY = 'clintos-sede-seleccionada';

const listeners = new Set();

export function setSedeSeleccionada(id) {
  try {
    window.localStorage.setItem(SEDE_KEY, id);
  } catch {
    // localStorage puede no estar disponible (modo privado, SSR).
  }
  listeners.forEach((callback) => callback());
}

export function getSedeIdSeleccionada() {
  try {
    return window.localStorage.getItem(SEDE_KEY);
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

export function useSedeSeleccionada() {
  const id = useSyncExternalStore(subscribe, getSedeIdSeleccionada, getServerSnapshot);
  return SEDES_CATALOGO.find((s) => s.id === id) ?? SEDES_CATALOGO[0];
}
