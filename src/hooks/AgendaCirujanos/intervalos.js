// @ts-check
// Aritmética de intervalos de tiempo, en minutos desde las 00:00. Cada
// intervalo es [inicio, fin) y se tratan como inmutables: ninguna función
// modifica sus argumentos.

/** @typedef {[number, number]} Intervalo */

/**
 * @param {string} hora 'HH:mm'
 * @returns {number}
 */
export function aMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/**
 * @param {number} min
 * @returns {string} 'HH:mm'
 */
export function deMinutos(min) {
  const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

/**
 * Une los intervalos que se solapan o se tocan y los devuelve ordenados.
 * @param {Intervalo[]} intervalos
 * @returns {Intervalo[]}
 */
export function unirIntervalos(intervalos) {
  const ordenados = intervalos
    .map((iv) => /** @type {Intervalo} */ ([iv[0], iv[1]]))
    .sort((a, b) => a[0] - b[0]);
  /** @type {Intervalo[]} */
  const salida = [];
  ordenados.forEach((iv) => {
    const ultimo = salida[salida.length - 1];
    if (ultimo && iv[0] <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], iv[1]);
    else salida.push(iv);
  });
  return salida;
}

/**
 * Resta de `a` todo lo que cubran los intervalos de `b`.
 * @param {Intervalo[]} a
 * @param {Intervalo[]} b
 * @returns {Intervalo[]}
 */
export function restarIntervalos(a, b) {
  /** @type {Intervalo[]} */
  let resto = a.map((iv) => [iv[0], iv[1]]);
  b.forEach(([bi, bf]) => {
    /** @type {Intervalo[]} */
    const siguiente = [];
    resto.forEach(([ri, rf]) => {
      if (bf <= ri || bi >= rf) {
        siguiente.push([ri, rf]);
        return;
      }
      if (bi > ri) siguiente.push([ri, bi]);
      if (bf < rf) siguiente.push([bf, rf]);
    });
    resto = siguiente;
  });
  return resto;
}

/**
 * ¿Un único intervalo de la lista contiene toda la franja [inicio, fin]?
 * @param {Intervalo[]} intervalos
 * @param {number} inicio
 * @param {number} fin
 * @returns {boolean}
 */
export function cubre(intervalos, inicio, fin) {
  return intervalos.some(([i, f]) => i <= inicio && f >= fin);
}
