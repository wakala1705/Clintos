import { useEffect, useState } from 'react';

// Ajuste del sistema (Configuración → Clínico): "Restringir el inicio de cirugías
// por hora". Activo (default), una cirugía programada solo se puede iniciar desde
// MIN_ANTICIPO_INICIO minutos antes de su hora (ver motivoNoIniciable). Apagarlo
// permite iniciar cualquiera del día sin esperar, para simular el flujo completo
// en demo. Estado en memoria del módulo (se resetea al recargar, igual que el
// resto del mock) + evento para re-renderizar lo ya montado. Sin window (tests
// con node --test) solo cambia la variable.
const EVENT = 'clintos:restriccion-inicio-cirugia-change';
let activa = true;

export function restriccionInicioActiva() {
  return activa;
}

export function setRestriccionInicioActiva(valor) {
  activa = Boolean(valor);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: activa }));
  }
}

// Hook para componentes que muestran el resultado de motivoNoIniciable: se
// vuelven a renderizar cuando el ajuste cambia con la pantalla abierta.
export function useRestriccionInicioActiva() {
  const [valor, setValor] = useState(restriccionInicioActiva);
  useEffect(() => {
    const alCambiar = (e) => setValor(e.detail);
    window.addEventListener(EVENT, alCambiar);
    return () => window.removeEventListener(EVENT, alCambiar);
  }, []);
  return valor;
}
