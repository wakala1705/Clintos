// @ts-check
// Estado de la agenda de un cirujano (columna "Estado de agenda" del listado).
import { diasEntre, sumarDias } from './horario.js';

/** @typedef {import('./tipos.js').EstadoAgenda} EstadoAgenda */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */

/** Días antes del fin de la vigencia desde los que se avisa "Por vencer". */
export const DIAS_POR_VENCER = 30;

/** @type {Record<EstadoAgenda, string>} */
export const ESTADO_AGENDA_LABEL = {
  configurada: 'Configurada',
  'por-vencer': 'Por vencer',
  vencida: 'Vencida',
  'sin-configurar': 'Sin configurar',
};

/**
 * `sin-configurar`: no hay horario. `vencida`: la vigencia terminó antes de
 * hoy. `por-vencer`: termina hoy o dentro de los próximos 30 días.
 * `configurada`: el resto, incluido "sin fecha de fin".
 * @param {HorarioSemanal|null} horario
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {EstadoAgenda}
 */
export function estadoAgenda(horario, hoy) {
  if (!horario) return 'sin-configurar';
  if (!horario.hasta) return 'configurada';
  if (horario.hasta < hoy) return 'vencida';
  if (horario.hasta <= sumarDias(hoy, DIAS_POR_VENCER)) return 'por-vencer';
  return 'configurada';
}

/**
 * Días que faltan para que termine la vigencia, o null si no tiene fecha de
 * fin (o no hay horario).
 * @param {HorarioSemanal|null} horario
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {number|null}
 */
export function diasParaVencer(horario, hoy) {
  if (!horario || !horario.hasta) return null;
  return diasEntre(hoy, horario.hasta);
}

/**
 * La excepción vigente o futura que empieza primero (columna "Próxima
 * excepción"). Las ya terminadas no cuentan.
 * @param {Excepcion[]} excepciones
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {Excepcion|null}
 */
export function proximaExcepcion(excepciones, hoy) {
  const vigentes = excepciones
    .filter((x) => x.hasta >= hoy)
    .sort((a, b) => (a.desde < b.desde ? -1 : a.desde > b.desde ? 1 : 0));
  return vigentes[0] ?? null;
}
