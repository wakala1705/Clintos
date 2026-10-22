// Filtros del modal de Facturación masiva que viajan por query string a
// /facturacion/autorizaciones y /facturacion/citas. Devuelve solo los que
// traen valor (un parámetro repetido toma el primero).
const CLAVES = ['tercero', 'regimen', 'contrato', 'pyp', 'desde', 'hasta'];

export function filtrosDesdeQuery(query) {
  const filtros = {};
  CLAVES.forEach((k) => {
    const v = Array.isArray(query[k]) ? query[k][0] : query[k];
    if (v) filtros[k] = v;
  });
  return filtros;
}
