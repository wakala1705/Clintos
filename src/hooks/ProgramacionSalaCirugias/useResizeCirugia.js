'use client';

import { useEffect, useRef, useState } from 'react';
import { acotarFin } from './gestion/agenda';
import { rangoRedimensionCirugia } from './mockCirugiaData';

// Arrastre del borde inferior de una card de la agenda (AgendaSemana): cambia
// la hora de fin en pasos de una franja (30 min, `alturaFranja` px). El rango
// permitido se pide al arrancar el arrastre (rangoRedimensionCirugia mira la
// sala completa, no solo la lista filtrada) y el resultado se acota a él, así
// la card se detiene sola donde empieza la siguiente cirugía.
//
// Devuelve `vivo` ({ fin, original } en franjas mientras se arrastra, null si
// no: la card resta `original` de `fin` para saber cuántas franjas creció) y
// los props del tirador. Soltar con el fin sin cambios no guarda nada; Escape
// o cancelar el puntero (p. ej. gesto del sistema en táctil) revierten.
export default function useResizeCirugia({ cirugia, alturaFranja = 30, onResize }) {
  const [vivo, setVivo] = useState(null);
  const arrastre = useRef(null);
  const activo = vivo !== null;

  useEffect(() => {
    if (!activo) return undefined;
    function onKeyDown(e) {
      if (e.key !== 'Escape') return;
      arrastre.current = null;
      setVivo(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activo]);

  function finDesdePuntero(e) {
    const { y0, rango } = arrastre.current;
    return acotarFin(rango.fin + Math.round((e.clientY - y0) / alturaFranja), rango);
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    // El tirador vive dentro de una card clicable: ni seleccionar ni arrastrar texto.
    e.stopPropagation();
    e.preventDefault();
    const rango = rangoRedimensionCirugia(cirugia.id);
    if (!rango) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { y0: e.clientY, rango };
    setVivo({ fin: rango.fin, original: rango.fin });
  }
  function onPointerMove(e) {
    if (!arrastre.current) return;
    const fin = finDesdePuntero(e);
    const { rango } = arrastre.current;
    setVivo((prev) => (prev && prev.fin === fin ? prev : { fin, original: rango.fin }));
  }
  function onPointerUp(e) {
    if (!arrastre.current) return;
    const fin = finDesdePuntero(e);
    const { rango } = arrastre.current;
    arrastre.current = null;
    setVivo(null);
    if (fin !== rango.fin) onResize?.(cirugia, fin);
  }
  function onPointerCancel() {
    arrastre.current = null;
    setVivo(null);
  }

  return {
    vivo,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      // Evita que el clic sintetizado tras soltar seleccione la card.
      onClick: (e) => e.stopPropagation(),
    },
  };
}
