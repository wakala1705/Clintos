// Cierre de una cirugía realizada = DOS pasos que hacen personas distintas:
//   1. Hoja de consumo (centro quirúrgico: documento clínico y de facturación,
//      ver hojaConsumo.js).
//   2. Consumo y devolución de la canasta (logística de farmacia, ver
//      registrarConsumo en mockCirugiaData.js).
// La hoja registrada PRECARGA lo usado del paso 2 (el usuario lo confirma o
// corrige); no lo registra por su cuenta. Lógica pura, sin React ni store.
import { cantidadRecibida } from '../mockCirugiaData.js';

const normalizar = (texto) => String(texto ?? '').trim().toLowerCase();

export const hojaRegistrada = (hoja) => hoja?.estado === 'registrada';

// Lo usado por insumo de la canasta según la hoja registrada, por nombre de
// insumo (sin distinguir mayúsculas). Solo cuentan los materiales con consumo
// capturado; se limita a lo recibido. La hoja de algunos paquetes (p. ej.
// COLE-LAP) usa otro listado que la canasta: ahí `coincidencias` queda en 0 y
// no se precarga nada.
export function precargaConsumoDesdeHoja(cirugia, hoja) {
  const items = cirugia.canasta?.items ?? [];
  if (!hojaRegistrada(hoja)) return { usados: {}, coincidencias: 0, total: items.length };
  const consumos = new Map(
    hoja.materiales
      .filter((m) => String(m.consumido ?? '').trim() !== '' && Number.isFinite(Number(m.consumido)))
      .map((m) => [normalizar(m.nombre), Number(m.consumido)]),
  );
  const usados = {};
  items.forEach((i) => {
    const consumido = consumos.get(normalizar(i.nombre));
    if (consumido === undefined) return;
    usados[i.nombre] = Math.min(cantidadRecibida(i), Math.max(0, Math.trunc(consumido)));
  });
  return { usados, coincidencias: Object.keys(usados).length, total: items.length };
}

// Estado del cierre: qué pasos están hechos y cuáles faltan, en orden.
export function estadoCierre(cirugia, hoja) {
  const hojaOk = hojaRegistrada(hoja);
  const consumoOk = Boolean(cirugia.canasta?.consumo);
  const faltan = [];
  if (!hojaOk) faltan.push('hoja de consumo');
  if (!consumoOk) faltan.push('consumo y devolución');
  return {
    hojaRegistrada: hojaOk, consumoRegistrado: consumoOk, completo: faltan.length === 0, faltan,
  };
}
