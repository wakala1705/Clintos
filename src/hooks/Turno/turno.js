import { useSyncExternalStore } from 'react';
import { UNIDADES_DISPONIBLES, TURNOS_DISPONIBLES } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';

// Turno operativo activo (unidad/sector + turno elegidos en IniciarTurnoModal,
// Panel General de Enfermería) -- mismo patrón pub/sub que hooks/Sede/sede.js y
// hooks/AreaFuncional/areaFuncional.js (localStorage + listeners propios, ver
// ese comentario para el motivo del listener aparte del evento "storage"). A
// diferencia de esos dos, acá sí hay una acción explícita de "cerrar" (no solo
// "cambiar de selección"), por eso abrirTurno/cerrarTurno en vez de un simple
// setter, y el valor puede estar ausente (turno cerrado / nunca abierto).
const TURNO_KEY = 'clintos-turno-activo';

const listeners = new Set();

// "|" como separador (no ":"): la hora de apertura se guarda en ISO
// (Date#toISOString), que ya trae ":" adentro -- un split(':') la habría
// partido mal.
export function abrirTurno({ unidad, turno }) {
  try {
    window.localStorage.setItem(TURNO_KEY, `${unidad}|${turno}|${new Date().toISOString()}`);
  } catch {
    // localStorage puede no estar disponible (modo privado, SSR).
  }
  listeners.forEach((callback) => callback());
}

export function cerrarTurno() {
  try {
    window.localStorage.removeItem(TURNO_KEY);
  } catch {
    // localStorage puede no estar disponible (modo privado, SSR).
  }
  listeners.forEach((callback) => callback());
}

function getTurnoActivoRaw() {
  try {
    return window.localStorage.getItem(TURNO_KEY);
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

// "HH:MM" 24h -> "hh:mm a. m./p. m." a partir de un Date real -- mismo
// formato y misma regla de medianoche/mediodía que rangoHorarioLabel en
// hooks/GestionTurnos/mockTurnosData.js, pero sobre un timestamp real (hora
// de apertura del turno) en vez del horario "de catálogo" del tipo de turno.
function horaAmPmDeFecha(fecha) {
  const h = fecha.getHours();
  const m = fecha.getMinutes();
  const periodo = h < 12 ? 'a. m.' : 'p. m.';
  const h12 = (h % 12) || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${periodo}`;
}

// Devuelve null si no hay turno abierto (o si el id guardado ya no existe en
// el catálogo, ej. un turno desactivado desde Gestión de turnos) -- el raw
// string de localStorage es la única snapshot que useSyncExternalStore
// necesita cachear; el lookup en los catálogos y el formateo de fecha se
// hacen acá afuera, no dentro de getTurnoActivoRaw, para no devolver un
// objeto nuevo en cada llamada.
export function useTurnoActivo() {
  const raw = useSyncExternalStore(subscribe, getTurnoActivoRaw, getServerSnapshot);
  if (!raw) return null;
  const [unidadId, turnoId, horaAperturaIso] = raw.split('|');
  const unidad = UNIDADES_DISPONIBLES.find((u) => u.value === unidadId);
  const turno = TURNOS_DISPONIBLES.find((t) => t.value === turnoId);
  if (!unidad || !turno) return null;
  const horaApertura = horaAperturaIso ? new Date(horaAperturaIso) : null;
  const horaAperturaLabel = horaApertura ? horaAmPmDeFecha(horaApertura) : null;
  return {
    unidad, turno, horaApertura, horaAperturaLabel,
  };
}
