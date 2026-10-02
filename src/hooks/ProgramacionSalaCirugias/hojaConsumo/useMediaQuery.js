import { useSyncExternalStore } from 'react';

// true mientras la pantalla cumple la media query. En el servidor (y en la hidratación)
// devuelve `false`, o sea el layout de escritorio.
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', notify);
      return () => mql.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
