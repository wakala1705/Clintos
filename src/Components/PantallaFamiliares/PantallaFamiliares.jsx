'use client';

import ListaFamiliares from './ListaFamiliares/ListaFamiliares';

// "Pantalla de familiares": se abre en el televisor de la sala de espera
// (ruta propia, sin menú ni barra superior) y proyecta la lista directamente,
// sin pedir clave. `tema` ('oscuro' | 'claro'), `incrustada` (dentro de un
// modal) y `onCerrar` se pasan tal cual a la lista.
export default function PantallaFamiliares({ tema = 'oscuro', incrustada = false, onCerrar = null }) {
  return <ListaFamiliares tema={tema} incrustada={incrustada} onCerrar={onCerrar} />;
}
