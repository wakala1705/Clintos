import { useEffect, useState } from 'react';

// Preferencia "Selección rápida vs. select tradicional" para los campos
// Sí/No del wizard CRECIMT2 (ver SiNoField.jsx). Vive en window (no
// localStorage, mismo criterio que window.__clintosVerificacionClinica en
// ConfigModal.jsx) para sobrevivir a la navegación dentro de la misma
// sesión sin introducir un mecanismo de persistencia nuevo. Default
// 'rapida': el formato de botones queda activo desde el día uno, sin que
// nadie tenga que entrar a Configuración a activarlo (encargo explícito).
const EVENT = 'clintos:field-selection-mode-change';

export function getFieldSelectionMode() {
  if (typeof window === 'undefined') return 'rapida';
  return window.__clintosFieldSelectionMode || 'rapida';
}

export function setFieldSelectionMode(mode) {
  window.__clintosFieldSelectionMode = mode;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: mode }));
}

// A diferencia de isVerificacionClinicaEnabled (una lectura puntual al
// momento de una acción), acá el valor debe re-renderizar los campos ya
// montados si el usuario cambia el ajuste con el wizard abierto — por eso
// este hook se suscribe al evento en vez de ser una función de una sola
// lectura.
export function useFieldSelectionMode() {
  const [mode, setMode] = useState(getFieldSelectionMode);

  useEffect(() => {
    function handleChange(e) {
      setMode(e.detail);
    }
    window.addEventListener(EVENT, handleChange);
    return () => window.removeEventListener(EVENT, handleChange);
  }, []);

  return mode;
}
