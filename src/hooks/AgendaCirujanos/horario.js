// @ts-check
// Fechas ISO y operaciones inmutables sobre el horario semanal. Toda función
// devuelve un horario nuevo: el borrador del editor nunca se muta en sitio.
import { JORNADAS, MINUTOS_FRANJA, parseISO } from '../ProgramacionSalaCirugias/gestion/agenda.js';
import { aMinutos, deMinutos } from './intervalos.js';

/** @typedef {import('./tipos.js').Bloque} Bloque */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */

// Jornada operativa configurable: la misma 07:00–19:00 de la agenda de salas
// (JORNADAS.operativa), en minutos.
export const INICIO_JORNADA = JORNADAS.operativa.desde * MINUTOS_FRANJA;
export const FIN_JORNADA = JORNADAS.operativa.hasta * MINUTOS_FRANJA;

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DIAS_SEMANA_CORTO = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** @type {Bloque} */
export const BLOQUE_POR_DEFECTO = { inicio: '07:00', fin: '12:00' };

const pad2 = (/** @type {number} */ n) => String(n).padStart(2, '0');

/**
 * @param {Date} date
 * @returns {string} 'YYYY-MM-DD' en hora local
 */
export function aISO(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * @param {string} fecha 'YYYY-MM-DD'
 * @param {number} n días (puede ser negativo)
 * @returns {string}
 */
export function sumarDias(fecha, n) {
  const d = parseISO(fecha);
  d.setDate(d.getDate() + n);
  return aISO(d);
}

/**
 * @param {string} fecha 'YYYY-MM-DD'
 * @returns {number} 0 = lunes … 6 = domingo
 */
export function diaSemana(fecha) {
  return (parseISO(fecha).getDay() + 6) % 7;
}

/**
 * @param {string} fecha 'YYYY-MM-DD'
 * @returns {string} el lunes de la semana de `fecha`
 */
export function lunesDe(fecha) {
  return sumarDias(fecha, -diaSemana(fecha));
}

/**
 * @param {string} desde 'YYYY-MM-DD'
 * @param {string} hasta 'YYYY-MM-DD'
 * @returns {number} días de `desde` a `hasta` (negativo si `hasta` es anterior)
 */
export function diasEntre(desde, hasta) {
  return Math.round((parseISO(hasta).getTime() - parseISO(desde).getTime()) / 86400000);
}

/**
 * Opciones de hora cada 30 min, de `desdeMin` a `hastaMin` inclusive, con la
 * forma que espera FormSelect.
 * @param {number} desdeMin
 * @param {number} hastaMin
 * @returns {{ value: string, label: string }[]}
 */
export function opcionesHora(desdeMin, hastaMin) {
  const opciones = [];
  for (let m = desdeMin; m <= hastaMin; m += MINUTOS_FRANJA) {
    opciones.push({ value: deMinutos(m), label: deMinutos(m) });
  }
  return opciones;
}

/**
 * Horario de partida para un cirujano sin agenda: los 7 días apagados.
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {HorarioSemanal}
 */
export function horarioVacio(hoy) {
  return {
    desde: hoy,
    hasta: null,
    dias: Array.from({ length: 7 }, () => ({ activo: false, bloques: [{ ...BLOQUE_POR_DEFECTO }] })),
  };
}

/**
 * @param {HorarioSemanal} horario
 * @param {number} origen índice del día a copiar
 * @param {number[]} destinos índices que reciben los bloques (se activan)
 * @returns {HorarioSemanal}
 */
export function copiarDia(horario, origen, destinos) {
  const bloques = horario.dias[origen].bloques;
  return {
    ...horario,
    dias: horario.dias.map((d, i) => (
      i !== origen && destinos.includes(i)
        ? { activo: true, bloques: bloques.map((b) => ({ ...b })) }
        : d)),
  };
}

/**
 * Enciende o apaga un día. Al encender uno sin bloques se le pone el de
 * partida; al apagar se conservan los bloques por si se vuelve a encender.
 * @param {HorarioSemanal} horario
 * @param {number} indice
 * @param {boolean} activo
 * @returns {HorarioSemanal}
 */
export function alternarDia(horario, indice, activo) {
  return {
    ...horario,
    dias: horario.dias.map((d, i) => {
      if (i !== indice) return d;
      const bloques = activo && d.bloques.length === 0 ? [{ ...BLOQUE_POR_DEFECTO }] : d.bloques;
      return { activo, bloques };
    }),
  };
}

/**
 * Bloque que se propone al "Agregar bloque": arranca donde termina el último
 * (dentro de la jornada) y dura 2 h como máximo.
 * @param {Bloque[]} bloques
 * @returns {Bloque}
 */
export function bloqueSiguiente(bloques) {
  const ultimoFin = bloques.length ? Math.max(...bloques.map((b) => aMinutos(b.fin))) : INICIO_JORNADA;
  const inicio = Math.min(Math.max(ultimoFin, INICIO_JORNADA), FIN_JORNADA - 60);
  const fin = Math.min(inicio + 120, FIN_JORNADA);
  return { inicio: deMinutos(inicio), fin: deMinutos(fin) };
}

/**
 * @param {HorarioSemanal} horario
 * @param {number} indice
 * @returns {HorarioSemanal}
 */
export function agregarBloque(horario, indice) {
  return {
    ...horario,
    dias: horario.dias.map((d, i) => (
      i === indice ? { ...d, bloques: [...d.bloques, bloqueSiguiente(d.bloques)] } : d)),
  };
}

/**
 * @param {HorarioSemanal} horario
 * @param {number} indice
 * @param {number} posicion
 * @returns {HorarioSemanal}
 */
export function quitarBloque(horario, indice, posicion) {
  return {
    ...horario,
    dias: horario.dias.map((d, i) => (
      i === indice ? { ...d, bloques: d.bloques.filter((_, j) => j !== posicion) } : d)),
  };
}

/**
 * @param {HorarioSemanal} horario
 * @param {number} indice
 * @param {number} posicion
 * @param {'inicio'|'fin'} campo
 * @param {string} valor 'HH:mm'
 * @returns {HorarioSemanal}
 */
export function cambiarBloque(horario, indice, posicion, campo, valor) {
  return {
    ...horario,
    dias: horario.dias.map((d, i) => (
      i === indice
        ? { ...d, bloques: d.bloques.map((b, j) => (j === posicion ? { ...b, [campo]: valor } : b)) }
        : d)),
  };
}

/**
 * Marca o desmarca "Sin fecha de fin". Al desmarcar propone 90 días de
 * vigencia desde `desde` (o deja la fecha vacía si aún no hay `desde`).
 * @param {HorarioSemanal} horario
 * @param {boolean} sinFin
 * @returns {HorarioSemanal}
 */
export function alternarSinFecha(horario, sinFin) {
  if (sinFin) return { ...horario, hasta: null };
  return { ...horario, hasta: horario.desde ? sumarDias(horario.desde, 90) : '' };
}

/**
 * @param {HorarioSemanal} a
 * @param {HorarioSemanal} b
 * @returns {boolean}
 */
export function horariosIguales(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
