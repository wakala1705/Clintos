// Estado en memoria compartido entre las pantallas del flujo (Gestión de
// cirugías -> Registrar orden externa; la programación la hace el wizard de Programación). Es un prototipo:
// vive en el módulo JS del cliente, así que sobrevive a la navegación entre
// rutas pero no a recargar la página.
import { crearSolicitudesMock } from './mockSolicitudes.js';

let solicitudes = null;
let aviso = null;

export function getSolicitudes() {
  if (!solicitudes) solicitudes = crearSolicitudesMock(new Date());
  return solicitudes;
}

export function getSolicitud(id) {
  return getSolicitudes().find((s) => s.id === id) ?? null;
}

export function siguienteId() {
  const max = getSolicitudes().reduce((m, s) => Math.max(m, Number(s.id.split('-')[1])), 1000);
  return `SC-${max + 1}`;
}

export function agregarSolicitud(solicitud) {
  solicitudes = [solicitud, ...getSolicitudes()];
}

// Una solicitud programada sale de la lista de chequeo.
export function marcarProgramada(id) {
  solicitudes = getSolicitudes().filter((s) => s.id !== id);
}

// Mensaje de una sola lectura para la lista (toast tras volver de otra pantalla).
export function setAviso(mensaje) {
  aviso = mensaje;
}

export function consumirAviso() {
  const a = aviso;
  aviso = null;
  return a;
}
