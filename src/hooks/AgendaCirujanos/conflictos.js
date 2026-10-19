// @ts-check
// Cirugías ya programadas que quedan fuera de la agenda de su cirujano. Solo
// se ADVIERTE: nada de esto cancela ni reprograma una cirugía.
import { aMinutos, cubre } from './intervalos.js';
import { modeloDia } from './disponibilidad.js';

/** @typedef {import('./disponibilidad.js').ModeloDia} ModeloDia */
/** @typedef {import('./tipos.js').AgendaEvaluable} AgendaEvaluable */
/** @typedef {import('./tipos.js').CirugiaAgenda} CirugiaAgenda */
/** @typedef {import('./tipos.js').Conflicto} Conflicto */
/** @typedef {import('./tipos.js').MotivoConflicto} MotivoConflicto */

// Solo estas cirugías, desde hoy en adelante, cuentan como conflicto.
export const ESTADOS_CONFLICTO = ['programada', 'urgencia'];

/**
 * Por qué una cirugía no está cubierta, en orden: un bloqueo que la solapa,
 * fecha fuera de la vigencia, fuera del horario disponible.
 * @param {CirugiaAgenda} cirugia
 * @param {ModeloDia} modelo
 * @returns {MotivoConflicto}
 */
export function motivoConflicto(cirugia, modelo) {
  const inicio = aMinutos(cirugia.horaInicio);
  const fin = aMinutos(cirugia.horaFin);
  const bloqueo = modelo.bloqueos.find((b) => b.intervalo[0] < fin && b.intervalo[1] > inicio);
  if (bloqueo) return { tipo: 'bloqueo', motivo: bloqueo.excepcion.motivo };
  if (!modelo.vigente) return { tipo: 'fuera-vigencia' };
  return { tipo: 'fuera-horario' };
}

/**
 * @param {MotivoConflicto} motivo
 * @returns {string}
 */
export function textoMotivo(motivo) {
  if (motivo.tipo === 'bloqueo') return `Bloqueo: ${motivo.motivo}`;
  if (motivo.tipo === 'fuera-vigencia') return 'Fuera de la vigencia de la agenda';
  return 'Fuera del horario disponible';
}

/**
 * @param {CirugiaAgenda[]} cirugias cirugías del cirujano (cualquier fecha/estado)
 * @param {AgendaEvaluable} agenda horario + excepciones a evaluar
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {Conflicto[]}
 */
export function cirugiasEnConflicto(cirugias, agenda, hoy) {
  /** @type {Conflicto[]} */
  const conflictos = [];
  cirugias.forEach((cirugia) => {
    if (!ESTADOS_CONFLICTO.includes(cirugia.estado) || cirugia.fecha < hoy) return;
    const modelo = modeloDia(cirugia.fecha, agenda.horario, agenda.excepciones);
    if (!cubre(modelo.efectivo, aMinutos(cirugia.horaInicio), aMinutos(cirugia.horaFin))) {
      conflictos.push({ cirugia, motivo: motivoConflicto(cirugia, modelo) });
    }
  });
  return conflictos;
}

/**
 * Conflictos que aparecen con el cambio y que antes no estaban: es lo que
 * advierte el modal al guardar.
 * @param {CirugiaAgenda[]} cirugias
 * @param {AgendaEvaluable} antes
 * @param {AgendaEvaluable} despues
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {Conflicto[]}
 */
export function conflictosNuevos(cirugias, antes, despues, hoy) {
  const previos = new Set(cirugiasEnConflicto(cirugias, antes, hoy).map((c) => c.cirugia.id));
  return cirugiasEnConflicto(cirugias, despues, hoy).filter((c) => !previos.has(c.cirugia.id));
}
