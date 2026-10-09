// Acceso por clave a la "Pantalla de familiares". Es solo una DEMO (encargo
// explícito): la clave vive en el cliente y no protege nada de verdad -- sirve
// para que la pantalla no se abra por accidente. Con backend, la validación
// pasa al servidor. El acceso se recuerda en sessionStorage (se pierde al
// cerrar la pestaña/el navegador del televisor, y hay que volver a ingresarla).

export const CLAVE_DEMO = 'clintos2026';
const STORAGE_KEY = 'pantalla-familiares:acceso';

const oyentes = new Set();
// Respaldo cuando sessionStorage no está disponible.
let accesoEnMemoria = false;

export function validarClave(clave) {
  return String(clave ?? '').trim() === CLAVE_DEMO;
}

// Snapshot para useSyncExternalStore: sin sessionStorage (SSR, ventana privada
// o bloqueado) devuelve false.
export function leerAcceso() {
  if (accesoEnMemoria) return true;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function guardarAcceso() {
  accesoEnMemoria = true;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Sin storage: el acceso vale solo hasta que se recargue la pantalla.
  }
  oyentes.forEach((fn) => fn());
}

export function suscribirAcceso(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}
