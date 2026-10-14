// @ts-check
// Filtros y conteos del listado de cirujanos.
import { estadoAgenda } from './estadoAgenda.js';

/** @typedef {import('./tipos.js').EstadoAgenda} EstadoAgenda */
/** @typedef {import('./tipos.js').FilaCirujano} FilaCirujano */

/**
 * Minúsculas y sin tildes, para buscar "angel" y encontrar "Ángel".
 * @param {string} texto
 * @returns {string}
 */
export function normalizarTexto(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * @param {FilaCirujano[]} filas
 * @param {{ estado: 'todos'|EstadoAgenda, busqueda: string }} filtros
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {FilaCirujano[]}
 */
export function filtrarCirujanos(filas, { estado, busqueda }, hoy) {
  const consulta = normalizarTexto(busqueda.trim());
  return filas.filter((fila) => (
    (estado === 'todos' || estadoAgenda(fila.agenda.horario, hoy) === estado)
    && normalizarTexto(fila.cirujano.nombre).includes(consulta)));
}

/**
 * Cantidad de cirujanos por estado, para los chips de filtro.
 * @param {FilaCirujano[]} filas
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {Record<'todos'|EstadoAgenda, number>}
 */
export function contarPorEstado(filas, hoy) {
  const conteo = {
    todos: filas.length, configurada: 0, 'por-vencer': 0, vencida: 0, 'sin-configurar': 0,
  };
  filas.forEach((fila) => { conteo[estadoAgenda(fila.agenda.horario, hoy)] += 1; });
  return conteo;
}
