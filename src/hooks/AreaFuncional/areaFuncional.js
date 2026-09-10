import { useSyncExternalStore } from 'react';

// Catálogo + selección de área funcional -- análogo a hooks/Bodega/bodega.js
// pero para el módulo Asistencial (ver login.jsx: al elegir "Módulo
// Asistencial" se dispara este picker en vez del de bodega). Mismo criterio
// cross-feature que ese módulo (ver AGENTS.md "Hooks / logic organization").
export const AREAS_FUNCIONALES_CATALOGO = [
  { id: '12', descripcion: 'CARDIOLOGIA' },
  { id: '01', descripcion: 'CONSULTA EXTERNA' },
  { id: '82', descripcion: 'HOSPITALIZACION GENERAL P4 T1' },
  { id: '09', descripcion: 'HOSPITALIZACION PISO 2 T1' },
  { id: '74', descripcion: 'HOSPITALIZACION PISO 3 T1' },
  { id: '75', descripcion: 'HOSPITALIZACION PISO 4 T1' },
  { id: '73', descripcion: 'HOSPITALIZACION PISO 4 T2' },
  { id: '70', descripcion: 'HOSPITALIZACION PISO 5 T2' },
  { id: '08', descripcion: 'IMÁGENES DIAGNÓSTICAS' },
  { id: '05', descripcion: 'LABORATORIO CLINICO' },
  { id: '07', descripcion: 'URGENCIAS' },
];

const AREA_KEY = 'clintos-area-funcional-seleccionada';

// Pub/sub propio además del evento "storage" -- mismo motivo que
// hooks/Bodega/bodega.js: acá se setea mientras el consumidor sigue montado
// en la misma pestaña (gate de login/Home), y "storage" no se dispara en la
// pestaña que escribió.
const listeners = new Set();

export function setAreaFuncionalSeleccionada(id) {
  try {
    window.localStorage.setItem(AREA_KEY, id);
  } catch {
    // localStorage puede no estar disponible (modo privado, SSR).
  }
  listeners.forEach((callback) => callback());
}

export function getAreaFuncionalIdSeleccionada() {
  try {
    return window.localStorage.getItem(AREA_KEY);
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

export function useAreaFuncionalId() {
  return useSyncExternalStore(subscribe, getAreaFuncionalIdSeleccionada, getServerSnapshot);
}

export function useAreaFuncionalSeleccionada() {
  const id = useAreaFuncionalId();
  return AREAS_FUNCIONALES_CATALOGO.find((a) => a.id === id) ?? null;
}
