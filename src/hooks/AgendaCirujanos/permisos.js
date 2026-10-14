// @ts-check
// Quién puede configurar la agenda de quién: Programación de cirugía configura
// la de cualquier cirujano; un cirujano, solo la suya. Todavía no hay
// identidad de usuario en la sesión, así que el usuario lo provee el servicio
// (mock); la regla ya queda aislada y probada para cuando exista.

/** @typedef {import('./tipos.js').UsuarioAgenda} UsuarioAgenda */
/** @typedef {import('./tipos.js').FilaCirujano} FilaCirujano */

/**
 * @param {UsuarioAgenda} usuario
 * @param {string} idMedico
 * @returns {boolean}
 */
export function puedeEditarAgenda(usuario, idMedico) {
  if (usuario.rol === 'programacion') return true;
  return usuario.rol === 'cirujano' && usuario.idMedico === idMedico;
}

/**
 * Filas que ve el usuario: Programación ve todas; un cirujano, solo la suya.
 * @param {UsuarioAgenda} usuario
 * @param {FilaCirujano[]} filas
 * @returns {FilaCirujano[]}
 */
export function cirujanosVisibles(usuario, filas) {
  if (usuario.rol === 'programacion') return filas;
  return filas.filter((fila) => fila.cirujano.idMedico === usuario.idMedico);
}
