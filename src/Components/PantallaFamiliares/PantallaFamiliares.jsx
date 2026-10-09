'use client';

import { useSyncExternalStore } from 'react';
import AccesoClave from './AccesoClave/AccesoClave';
import ListaFamiliares from './ListaFamiliares/ListaFamiliares';
import { leerAcceso, suscribirAcceso } from '@/hooks/PantallaFamiliares/acceso';

// "Pantalla de familiares": se abre en el televisor de la sala de espera
// (ruta propia, sin menú ni barra superior). Pide una clave (DEMO, ver
// hooks/PantallaFamiliares/acceso.js) y luego proyecta la lista. En el servidor
// siempre muestra la clave; el acceso guardado se aplica ya en el cliente.
// `tema` ('oscuro' | 'claro'), `incrustada` (dentro de un modal) y `onCerrar`
// se pasan tal cual a la clave y a la lista.
export default function PantallaFamiliares({ tema = 'oscuro', incrustada = false, onCerrar = null }) {
  const autorizado = useSyncExternalStore(suscribirAcceso, leerAcceso, () => false);
  const props = { tema, incrustada, onCerrar };
  return autorizado ? <ListaFamiliares {...props} /> : <AccesoClave {...props} />;
}
