// @ts-check
// Disponibilidad efectiva de un cirujano: horario base + aperturas − bloqueos.
import {
  aMinutos, restarIntervalos, unirIntervalos,
} from './intervalos.js';
import { diaSemana, FIN_JORNADA, INICIO_JORNADA } from './horario.js';

/** @typedef {import('./intervalos.js').Intervalo} Intervalo */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */
/** @typedef {import('./tipos.js').Bloque} Bloque */

/**
 * @typedef {{ intervalo: Intervalo, excepcion: Excepcion }} ExcepcionDelDia
 * @typedef {{ base: Intervalo[], aperturas: ExcepcionDelDia[], bloqueos: ExcepcionDelDia[],
 *   efectivo: Intervalo[], vigente: boolean }} ModeloDia
 */

/**
 * @param {Bloque} b
 * @returns {boolean}
 */
const esBloqueValido = (b) => aMinutos(b.fin) > aMinutos(b.inicio);

/**
 * Franja que cubre una excepción en cada uno de sus días.
 * @param {Excepcion} x
 * @returns {Intervalo}
 */
export function rangoExcepcion(x) {
  return x.todoElDia ? [INICIO_JORNADA, FIN_JORNADA] : [aMinutos(x.inicio), aMinutos(x.fin)];
}

/**
 * Qué hay en un día concreto. `efectivo` = (base + aperturas) − bloqueos. Las
 * aperturas extra cuentan aunque el día caiga fuera de la vigencia.
 * @param {string} fecha 'YYYY-MM-DD'
 * @param {HorarioSemanal|null} horario
 * @param {Excepcion[]} excepciones
 * @returns {ModeloDia}
 */
export function modeloDia(fecha, horario, excepciones) {
  const vigente = !!horario
    && fecha >= horario.desde
    && (horario.hasta === null || horario.hasta === '' || fecha <= horario.hasta);
  const dia = horario ? horario.dias[diaSemana(fecha)] : null;
  /** @type {Intervalo[]} */
  const base = vigente && dia && dia.activo
    ? unirIntervalos(dia.bloques.filter(esBloqueValido).map((b) => [aMinutos(b.inicio), aMinutos(b.fin)]))
    : [];

  const delDia = excepciones.filter((x) => fecha >= x.desde && fecha <= x.hasta);
  const aperturas = delDia
    .filter((x) => x.tipo === 'apertura')
    .map((x) => ({ intervalo: rangoExcepcion(x), excepcion: x }));
  const bloqueos = delDia
    .filter((x) => x.tipo === 'bloqueo')
    .map((x) => ({ intervalo: rangoExcepcion(x), excepcion: x }));

  const conAperturas = unirIntervalos([...base, ...aperturas.map((a) => a.intervalo)]);
  const efectivo = restarIntervalos(conAperturas, unirIntervalos(bloqueos.map((b) => b.intervalo)));
  return {
    base, aperturas, bloqueos, efectivo, vigente,
  };
}

/**
 * Minutos disponibles (dentro de la jornada operativa) en un conjunto de fechas.
 * @param {string[]} fechas
 * @param {HorarioSemanal|null} horario
 * @param {Excepcion[]} excepciones
 * @returns {number}
 */
export function minutosDisponibles(fechas, horario, excepciones) {
  return fechas.reduce((total, fecha) => total + modeloDia(fecha, horario, excepciones).efectivo
    .reduce((suma, [i, f]) => suma + Math.max(0, Math.min(f, FIN_JORNADA) - Math.max(i, INICIO_JORNADA)), 0), 0);
}

/**
 * Horas por semana del horario base (columna del listado): suma de los bloques
 * válidos de los días activos, sin considerar vigencia ni excepciones.
 * @param {HorarioSemanal} horario
 * @returns {number} minutos
 */
export function minutosSemanales(horario) {
  return horario.dias.reduce((total, dia) => total + (dia.activo
    ? dia.bloques.filter(esBloqueValido).reduce((suma, b) => suma + aMinutos(b.fin) - aMinutos(b.inicio), 0)
    : 0), 0);
}
