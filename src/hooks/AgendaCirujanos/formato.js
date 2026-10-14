// @ts-check
// Textos de fechas y horas para la UI de la agenda de cirujanos. Las fechas
// con hora (listado de cirugías en conflicto) usan `fechaHoraRangoLabel` de
// mockCirugiaData ("14.OCT.2026 - 08:00 – 09:00"), no este módulo.
import { aMinutos } from './intervalos.js';
import { sumarDias } from './horario.js';

/** @typedef {import('./tipos.js').DiaHorario} DiaHorario */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * @param {number} min
 * @returns {string} "7 h", "7,5 h"
 */
export function formatoHoras(min) {
  const horas = min / 60;
  return `${Number.isInteger(horas) ? horas : horas.toFixed(1).replace('.', ',')} h`;
}

/**
 * @param {number} n
 * @returns {string} "1 cirugía", "3 cirugías"
 */
export function cantidadCirugias(n) {
  return `${n} ${n === 1 ? 'cirugía' : 'cirugías'}`;
}

/**
 * Resumen de los bloques válidos de un día: "07:00–12:00 · 14:00–18:00 (9 h)".
 * Cadena vacía si el día no tiene ningún bloque válido.
 * @param {DiaHorario} dia
 * @returns {string}
 */
export function resumenDia(dia) {
  const validos = dia.bloques
    .filter((b) => aMinutos(b.fin) > aMinutos(b.inicio))
    .sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio));
  if (!validos.length) return '';
  const total = validos.reduce((suma, b) => suma + aMinutos(b.fin) - aMinutos(b.inicio), 0);
  return `${validos.map((b) => `${b.inicio}–${b.fin}`).join(' · ')} (${formatoHoras(total)})`;
}

/**
 * @param {string} fecha 'YYYY-MM-DD'
 * @returns {string} "14/10/2026"
 */
export function fechaLabel(fecha) {
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * @param {string} fecha 'YYYY-MM-DD'
 * @returns {string} "14 oct"
 */
export function fechaCorta(fecha) {
  const [, m, d] = fecha.split('-').map(Number);
  return `${d} ${MESES_CORTOS[m - 1]}`;
}

/**
 * Rango y franja de una excepción: "14/10/2026 – 16/10/2026 · Todo el día" o
 * "17/10/2026 · 08:00–12:00".
 * @param {Pick<Excepcion, 'desde'|'hasta'|'todoElDia'|'inicio'|'fin'>} excepcion
 * @returns {string}
 */
export function rangoExcepcionLabel(excepcion) {
  const fechas = excepcion.hasta !== excepcion.desde
    ? `${fechaLabel(excepcion.desde)} – ${fechaLabel(excepcion.hasta)}`
    : fechaLabel(excepcion.desde);
  return `${fechas} · ${excepcion.todoElDia ? 'Todo el día' : `${excepcion.inicio}–${excepcion.fin}`}`;
}

/**
 * Rango de la semana que empieza en `lunes`: "12 – 18 oct 2026" o, si cruza
 * de mes, "28 sep – 4 oct 2026".
 * @param {string} lunes 'YYYY-MM-DD'
 * @returns {string}
 */
export function rangoSemanaLabel(lunes) {
  const domingo = sumarDias(lunes, 6);
  const [, mi, di] = lunes.split('-').map(Number);
  const [yf, mf, df] = domingo.split('-').map(Number);
  return `${di}${mi !== mf ? ` ${MESES_CORTOS[mi - 1]}` : ''} – ${df} ${MESES_CORTOS[mf - 1]} ${yf}`;
}
