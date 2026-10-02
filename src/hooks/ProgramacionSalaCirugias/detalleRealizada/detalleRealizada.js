// Lógica pura del detalle de una cirugía REALIZADA: balance de insumos
// (entregado / usado / devuelto) y línea de tiempo del cierre. Sin React; usa
// solo las funciones de cantidades del mock (ver __tests__/).
import { cantidadDevuelta, cantidadRecibida } from '../mockCirugiaData.js';

// Cantidades por insumo de la canasta. `usado` es null mientras el consumo no
// se registra (no se asume que se usó todo): la UI muestra "—".
export function balanceInsumos(cirugia) {
  const items = cirugia.canasta?.items ?? [];
  const consumo = cirugia.canasta?.consumo ?? null;
  const filas = items
    .filter((i) => (i.solicitudFarmacia ?? 'sin-solicitar') === 'entregado' || (i.recibido ?? 0) > 0)
    .map((i) => ({
      nombre: i.nombre,
      entregado: cantidadRecibida(i),
      usado: consumo ? (consumo.usados?.[i.nombre] ?? 0) : null,
      devuelto: cantidadDevuelta(cirugia, i.nombre),
    }));
  const suma = (campo) => filas.reduce((t, f) => t + (f[campo] ?? 0), 0);
  return {
    filas,
    consumoRegistrado: consumo !== null,
    entregado: suma('entregado'),
    usado: consumo ? suma('usado') : null,
    devuelto: suma('devuelto'),
  };
}

// Hitos del cierre administrativo de la cirugía, en orden. Los que ya
// ocurrieron llevan quién y cuándo (`hecho`); recepción y consumo, si faltan,
// salen como `pendiente`. No hay registro de quién marcó la cirugía como
// realizada, así que no es un hito.
export function hitosCierre(cirugia) {
  const hitos = [];
  const { canasta, farmacia } = cirugia;
  if (farmacia?.fechaSolicitud) {
    hitos.push({
      key: 'solicitud', estado: 'hecho', label: 'Insumos solicitados a farmacia', usuario: null, fecha: farmacia.fechaSolicitud,
    });
  }
  if (canasta?.recepcion) {
    hitos.push({
      key: 'recepcion',
      estado: 'hecho',
      label: canasta.recepcion.conNovedades ? 'Canasta recibida con novedades' : 'Canasta recibida',
      usuario: canasta.recepcion.usuario,
      fecha: canasta.recepcion.fecha,
    });
  } else {
    hitos.push({
      key: 'recepcion', estado: 'pendiente', label: 'Canasta por recibir', usuario: null, fecha: null,
    });
  }
  if (canasta?.consumo) {
    hitos.push({
      key: 'consumo', estado: 'hecho', label: 'Consumo registrado', usuario: canasta.consumo.usuario, fecha: canasta.consumo.fecha,
    });
  } else {
    hitos.push({
      key: 'consumo', estado: 'pendiente', label: 'Consumo por registrar', usuario: null, fecha: null,
    });
  }
  (cirugia.devoluciones ?? []).forEach((d) => {
    hitos.push({
      key: `devolucion-${d.consecutivo}`,
      estado: 'hecho',
      label: `Devolución a farmacia · N.º ${d.consecutivo}`,
      usuario: d.usuario,
      fecha: d.fecha,
    });
  });
  return hitos;
}
