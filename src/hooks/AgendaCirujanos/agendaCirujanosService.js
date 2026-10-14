// @ts-check
// Capa de servicio de "Agenda de cirujanos". Hoy lee y escribe un store en
// memoria (se reinicia al recargar, igual que mockCirugiaData.js); cuando
// exista el backend, solo cambia la implementación de estas funciones: la UI
// llama únicamente a lo que se exporta acá y siempre recibe una Promise.
//
// El store se REEMPLAZA, nunca se muta, y todo lo que entra o sale se clona,
// así que un componente no puede alterar el store sin pasar por el servicio.
import { MEDICOS_CATALOGO, SEDES, fetchAgendaRango } from '../ProgramacionSalaCirugias/mockCirugiaData.js';
import { crearSemilla } from './mockAgendaCirujanos.js';
import { aISO } from './horario.js';
import { normalizarTexto } from './listado.js';

/** @typedef {import('./tipos.js').AgendaCirujano} AgendaCirujano */
/** @typedef {import('./tipos.js').Cirujano} Cirujano */
/** @typedef {import('./tipos.js').CirugiaAgenda} CirugiaAgenda */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */
/** @typedef {import('./tipos.js').FilaCirujano} FilaCirujano */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */
/** @typedef {import('./tipos.js').UsuarioAgenda} UsuarioAgenda */

const LATENCIA_MS = 150;

/**
 * Usuario de la sesión. Hoy no hay identidad de usuario: se asume Programación
 * de cirugía (configura a cualquier cirujano). Con backend sale del token.
 * @type {UsuarioAgenda}
 */
export const USUARIO_ACTUAL = { rol: 'programacion' };

/**
 * @template T
 * @param {T} valor
 * @returns {Promise<T>}
 */
function conLatencia(valor) {
  return new Promise((resolve) => { setTimeout(() => resolve(valor), LATENCIA_MS); });
}

/** @returns {string} hoy en 'YYYY-MM-DD' (hora local) */
export function hoyISO() {
  return aISO(new Date());
}

/** @type {AgendaCirujano[]} */
let agendas = crearSemilla(hoyISO());
let siguienteIdExcepcion = 1000;

/**
 * Solo para tests: vuelve a la semilla de `hoy`.
 * @param {string} hoy 'YYYY-MM-DD'
 */
export function restablecerAgendas(hoy) {
  agendas = crearSemilla(hoy);
  siguienteIdExcepcion = 1000;
}

/** @returns {Cirujano[]} */
function cirujanosDelCatalogo() {
  return MEDICOS_CATALOGO
    .filter((m) => m.descripcion === 'Cirujano')
    .map((m) => ({ idMedico: m.idMedico, nombre: m.nombre, sede: m.sede }));
}

/**
 * Las sedes de cirugías y del catálogo de médicos usan ids distintos
 * ('02' vs '01' para Sede Norte), así que se resuelve por nombre, solo acá.
 * @param {string} sede nombre, p. ej. 'SEDE NORTE'
 * @returns {string|undefined} id de sede de las cirugías
 */
function sedeIdDeCirugias(sede) {
  return SEDES.find((s) => normalizarTexto(s.label).includes(normalizarTexto(sede)))?.value;
}

/**
 * @param {string} idMedico
 * @returns {AgendaCirujano}
 */
function agendaDe(idMedico) {
  return agendas.find((a) => a.idMedico === idMedico) ?? { idMedico, horario: null, excepciones: [] };
}

/**
 * @param {string} idMedico
 * @param {Partial<AgendaCirujano>} cambios
 * @returns {AgendaCirujano}
 */
function reemplazarAgenda(idMedico, cambios) {
  const nueva = { ...agendaDe(idMedico), ...cambios, idMedico };
  agendas = agendas.some((a) => a.idMedico === idMedico)
    ? agendas.map((a) => (a.idMedico === idMedico ? nueva : a))
    : [...agendas, nueva];
  return nueva;
}

/**
 * Cirujanos de una sede con el resumen de su agenda, ordenados por nombre.
 * @param {{ sede: string }} filtros nombre de la sede, p. ej. 'SEDE NORTE'
 * @returns {Promise<FilaCirujano[]>}
 */
export function listarCirujanos({ sede }) {
  const filas = cirujanosDelCatalogo()
    .filter((c) => normalizarTexto(c.sede) === normalizarTexto(sede))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .map((cirujano) => ({ cirujano, agenda: structuredClone(agendaDe(cirujano.idMedico)) }));
  return conLatencia(filas);
}

/**
 * @param {string} idMedico
 * @returns {Promise<Cirujano|null>}
 */
export function obtenerCirujano(idMedico) {
  return conLatencia(cirujanosDelCatalogo().find((c) => c.idMedico === idMedico) ?? null);
}

/**
 * @param {string} idMedico
 * @returns {Promise<AgendaCirujano>} sin horario si el cirujano no tiene agenda
 */
export function obtenerAgenda(idMedico) {
  return conLatencia(structuredClone(agendaDe(idMedico)));
}

/**
 * @param {string} idMedico
 * @param {HorarioSemanal} horario
 * @returns {Promise<AgendaCirujano>}
 */
export function guardarHorario(idMedico, horario) {
  return conLatencia(structuredClone(reemplazarAgenda(idMedico, { horario: structuredClone(horario) })));
}

/**
 * @param {string} idMedico
 * @param {Omit<Excepcion, 'id'>} excepcion
 * @returns {Promise<AgendaCirujano>} la agenda con la excepción ya agregada (con su id)
 */
export function agregarExcepcion(idMedico, excepcion) {
  const nueva = { ...structuredClone(excepcion), id: siguienteIdExcepcion };
  siguienteIdExcepcion += 1;
  const actual = agendaDe(idMedico);
  return conLatencia(structuredClone(reemplazarAgenda(idMedico, { excepciones: [...actual.excepciones, nueva] })));
}

/**
 * @param {string} idMedico
 * @param {number} idExcepcion
 * @returns {Promise<AgendaCirujano>}
 */
export function eliminarExcepcion(idMedico, idExcepcion) {
  const actual = agendaDe(idMedico);
  return conLatencia(structuredClone(reemplazarAgenda(idMedico, {
    excepciones: actual.excepciones.filter((x) => x.id !== idExcepcion),
  })));
}

/**
 * Todas las cirugías del cirujano, de cualquier fecha y estado. Lee el store
 * vivo de cirugías: lo que se programe o reprograme en otra pantalla se
 * refleja sin recargar.
 * @param {string} idMedico
 * @returns {Promise<CirugiaAgenda[]>}
 */
export function listarCirugiasDeCirujano(idMedico) {
  const cirujano = cirujanosDelCatalogo().find((c) => c.idMedico === idMedico);
  const sedeId = cirujano ? sedeIdDeCirugias(cirujano.sede) : undefined;
  if (!cirujano || !sedeId) return conLatencia([]);
  return fetchAgendaRango({
    sedeId, salaId: 'todas', inicio: '0000-01-01', fin: '9999-12-31', cirujano: cirujano.nombre,
  });
}
