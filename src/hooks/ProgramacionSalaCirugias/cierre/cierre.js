// Cierre de una cirugía realizada. "Registrar consumo" en la hoja de consumo es UNA sola
// acción: guarda la hoja y, en el mismo momento, registra el consumo de la canasta
// y genera la devolución a farmacia de lo no consumido (registrarConsumo en
// mockCirugiaData.js). Aquí vive la lógica pura de ese registro: qué se usó, qué se
// devuelve y cuándo se puede registrar. Sin React ni store.
import { cantidadRecibida, estaIniciada, resumenCanasta } from '../mockCirugiaData.js';

const normalizar = (texto) => String(texto ?? '').trim().toLowerCase();

export const hojaRegistrada = (hoja) => hoja?.estado === 'registrada';

// Lo usado por insumo de la canasta según la hoja registrada, por nombre de
// insumo (sin distinguir mayúsculas). Solo cuentan los materiales con consumo
// capturado; se limita a lo recibido. La hoja de algunos paquetes (p. ej.
// COLE-LAP) usa otro listado que la canasta: ahí `coincidencias` queda en 0 y
// no se precarga nada.
export function usadosDesdeMateriales(cirugia, materiales) {
  const items = cirugia.canasta?.items ?? [];
  const consumos = new Map(
    materiales
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

// Precarga de lo usado desde una hoja YA registrada (solo cuenta el estado
// "registrada", no el borrador).
export function precargaConsumoDesdeHoja(cirugia, hoja) {
  if (!hojaRegistrada(hoja)) return { usados: {}, coincidencias: 0, total: cirugia.canasta?.items?.length ?? 0 };
  return usadosDesdeMateriales(cirugia, hoja.materiales);
}

// Qué pasa al pulsar "Registrar consumo" en la hoja con `materiales` tal como están:
// - `bloqueo`: por qué no se puede registrar (null si se puede). El consumo se
//   registra con la cirugía realizada y la canasta recibida.
// - `generaDevolucion`: false si el consumo de la canasta ya estaba registrado (p. ej.
//   desde Canastas): entonces solo se guarda la hoja, sin una segunda devolución.
// - `usados`: lo usado por insumo de la canasta que la hoja informa (por nombre);
//   el resto de la canasta se registra como usado completo (nada que devolver),
//   igual que el valor por defecto de Canastas -- `sinDato` los cuenta.
// - `unidades`/`insumos`: lo que se devolverá a farmacia.
export function planRegistroConsumo(cirugia, materiales) {
  const { usados, coincidencias, total } = usadosDesdeMateriales(cirugia, materiales);
  let bloqueo = null;
  if (estaIniciada(cirugia)) bloqueo = 'Finaliza la cirugía para registrar el consumo. Mientras tanto guarda el borrador.';
  else if (cirugia.estado !== 'realizada') bloqueo = 'La cirugía debe estar realizada para registrar el consumo.';
  else if (!['recibida', 'con-novedades', 'consumo-registrado'].includes(resumenCanasta(cirugia).estado)) {
    bloqueo = 'La canasta debe estar recibida para registrar el consumo.';
  }
  const yaRegistrado = Boolean(cirugia.canasta?.consumo);
  let unidades = 0;
  let insumos = 0;
  (cirugia.canasta?.items ?? []).forEach((i) => {
    const devolver = cantidadRecibida(i) - (usados[i.nombre] ?? cantidadRecibida(i));
    if (devolver > 0) {
      unidades += devolver;
      insumos += 1;
    }
  });
  return {
    bloqueo,
    generaDevolucion: bloqueo === null && !yaRegistrado,
    yaRegistrado,
    usados,
    coincidencias,
    sinDato: total - coincidencias,
    unidades,
    insumos,
  };
}

// Estado del cierre: qué falta. "Registrar consumo" en la hoja hace los dos pasos a la vez, así que
// lo normal es que falten ambos ("registro de consumo") o ninguno; los casos sueltos vienen de haber
// registrado el consumo antes desde Canastas (falta la hoja).
export function estadoCierre(cirugia, hoja) {
  const hojaOk = hojaRegistrada(hoja);
  const consumoOk = Boolean(cirugia.canasta?.consumo);
  const faltan = [];
  if (!hojaOk && !consumoOk) faltan.push('registro de consumo');
  else if (!hojaOk) faltan.push('hoja de consumo');
  else if (!consumoOk) faltan.push('consumo y devolución');
  return {
    hojaRegistrada: hojaOk, consumoRegistrado: consumoOk, completo: faltan.length === 0, faltan,
  };
}
