// @ts-check
// Catálogo y utilidades de las excepciones (bloqueos y aperturas extra).

/** @typedef {import('./tipos.js').BorradorExcepcion} BorradorExcepcion */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */
/** @typedef {import('./tipos.js').TipoExcepcion} TipoExcepcion */

/** @type {Record<TipoExcepcion, string[]>} */
export const MOTIVOS_EXCEPCION = {
  bloqueo: ['Vacaciones', 'Congreso o capacitación', 'Incapacidad', 'Permiso', 'Otro'],
  apertura: ['Jornada adicional', 'Reemplazo', 'Otro'],
};

/** @type {Record<TipoExcepcion, string>} */
export const ETIQUETA_TIPO = { bloqueo: 'Bloqueo', apertura: 'Apertura extra' };

/** @type {Record<TipoExcepcion, string>} */
export const AYUDA_TIPO = {
  bloqueo: 'El cirujano no estará disponible, aunque su horario semanal diga lo contrario.',
  apertura: 'El cirujano estará disponible además de su horario semanal.',
};

/**
 * Borrador de una excepción nueva: un bloqueo de todo el día, hoy.
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {BorradorExcepcion}
 */
export function excepcionNueva(hoy) {
  return {
    tipo: 'bloqueo',
    motivo: MOTIVOS_EXCEPCION.bloqueo[0],
    desde: hoy,
    hasta: hoy,
    todoElDia: true,
    inicio: '07:00',
    fin: '12:00',
    nota: '',
  };
}

/**
 * Cambia el tipo del borrador: el motivo vuelve al primero de ese tipo, un
 * bloqueo arranca "todo el día" y una apertura extra con franja horaria.
 * @param {BorradorExcepcion} borrador
 * @param {TipoExcepcion} tipo
 * @returns {BorradorExcepcion}
 */
export function cambiarTipoExcepcion(borrador, tipo) {
  if (borrador.tipo === tipo) return borrador;
  return { ...borrador, tipo, motivo: MOTIVOS_EXCEPCION[tipo][0], todoElDia: tipo === 'bloqueo' };
}

/**
 * Por fecha de inicio; a igual fecha, por orden de creación.
 * @param {Excepcion[]} excepciones
 * @returns {Excepcion[]}
 */
export function ordenarExcepciones(excepciones) {
  return [...excepciones].sort((a, b) => {
    if (a.desde !== b.desde) return a.desde < b.desde ? -1 : 1;
    return a.id - b.id;
  });
}
