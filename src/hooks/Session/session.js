import { useSyncExternalStore } from 'react';

const ACTIVE_MODULE_KEY = 'clintos-active-module';

export function setActiveModule(moduleId) {
  try {
    window.localStorage.setItem(ACTIVE_MODULE_KEY, moduleId);
  } catch {
    // localStorage puede no estar disponible (modo privado, SSR) -- no bloquea el login.
  }
}

export function getActiveModule() {
  try {
    return window.localStorage.getItem(ACTIVE_MODULE_KEY);
  } catch {
    return null;
  }
}

function subscribe(callback) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getClientSnapshot() {
  return getActiveModule() ?? 'asistencial';
}

function getServerSnapshot() {
  return 'asistencial';
}

// useSyncExternalStore (no useState+useEffect) evita el mismatch de
// hidratación al leer localStorage: React usa getServerSnapshot durante el
// render inicial y resincroniza al valor real apenas hidrata, sin el
// re-render en cascada que dispara un setState dentro de un efecto.
export function useActiveModule() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

const MODULE_LABELS = {
  administrador: 'Administrador',
  asistencial: 'Asistencial',
  contable: 'Contable',
  nomina: 'Nómina',
};

export function useActiveModuleLabel() {
  const activeModule = useActiveModule();
  return MODULE_LABELS[activeModule] ?? MODULE_LABELS.asistencial;
}
