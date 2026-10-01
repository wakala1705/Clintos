'use client';

import { createContext, useContext } from 'react';

// Estado de plegado/tono de las secciones de la hoja de gasto. Lo provee el modal
// (`plegadas` = { [id]: boolean }, `tonos` = { [id]: 'ok' | 'error' }) para no pasar
// props por las 10 secciones.
export const SeccionesContext = createContext({
  plegadas: {},
  tonos: {},
  alternar: () => {},
});

export function useSeccion(id) {
  const { plegadas, tonos, alternar } = useContext(SeccionesContext);
  return {
    abierta: !plegadas?.[id],
    alternar: () => alternar?.(id),
    tono: tonos?.[id] ?? 'default',
  };
}
