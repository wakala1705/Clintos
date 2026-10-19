// @ts-check
// Validaciones del editor. Cada función devuelve el mensaje de error o una
// cadena vacía si todo está bien.
import { aMinutos } from './intervalos.js';

/** @typedef {import('./tipos.js').DiaHorario} DiaHorario */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */

/**
 * @param {DiaHorario} dia
 * @returns {string}
 */
export function errorDia(dia) {
  if (!dia.activo) return '';
  if (!dia.bloques.length) return 'Agrega al menos un bloque o desactiva el día.';
  if (dia.bloques.some((b) => aMinutos(b.fin) <= aMinutos(b.inicio))) {
    return 'La hora de fin debe ser posterior a la de inicio.';
  }
  const ordenados = [...dia.bloques].sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio));
  for (let i = 1; i < ordenados.length; i += 1) {
    if (aMinutos(ordenados[i].inicio) < aMinutos(ordenados[i - 1].fin)) {
      return 'Los bloques de un mismo día no pueden cruzarse.';
    }
  }
  return '';
}

/**
 * @param {HorarioSemanal} horario
 * @returns {string}
 */
export function errorVigencia(horario) {
  if (!horario.desde) return 'Elige desde qué fecha rige este horario.';
  if (horario.hasta !== null) {
    if (!horario.hasta) return 'Elige la fecha final o marca "Sin fecha de fin".';
    if (horario.hasta < horario.desde) return 'La fecha final debe ser igual o posterior a la inicial.';
  }
  return '';
}

/**
 * @param {HorarioSemanal} horario
 * @returns {boolean}
 */
export function horarioTieneErrores(horario) {
  return !!errorVigencia(horario) || horario.dias.some((d) => !!errorDia(d));
}

/**
 * Valida los campos de una excepción antes de guardarla.
 * @param {Pick<Excepcion, 'desde'|'hasta'|'todoElDia'|'inicio'|'fin'>} excepcion
 * @returns {string}
 */
export function errorExcepcion(excepcion) {
  if (!excepcion.desde || !excepcion.hasta) return 'Elige la fecha inicial y la final.';
  if (excepcion.hasta < excepcion.desde) return 'La fecha final debe ser igual o posterior a la inicial.';
  if (!excepcion.todoElDia && aMinutos(excepcion.fin) <= aMinutos(excepcion.inicio)) {
    return 'La hora de fin debe ser posterior a la de inicio.';
  }
  return '';
}
