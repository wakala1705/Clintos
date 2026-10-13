// Estado en memoria compartido entre las pantallas del flujo (Gestión de
// cirugías -> Registrar orden externa; la programación la hace el wizard de Programación). Es un prototipo:
// vive en el módulo JS del cliente, así que sobrevive a la navegación entre
// rutas pero no a recargar la página.
import { crearSolicitudesMock } from './mockSolicitudes.js';
import { aplicarValoracion } from './valoracion.js';
import { aplicarResultados } from './laboratorios.js';
import { aplicarOrden } from './ordenMedica.js';
import { aplicarAutorizacion } from './autorizacion.js';

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

// Registra la valoración preanestésica de una solicitud (paso 3 del chequeo).
export function registrarValoracion(id, datos) {
  solicitudes = getSolicitudes().map((s) => (s.id === id ? aplicarValoracion(s, datos) : s));
}

// Registra la autorización de la EPS de una solicitud (paso Autorización del chequeo).
export function registrarAutorizacion(id, datos) {
  solicitudes = getSolicitudes().map((s) => (s.id === id ? aplicarAutorizacion(s, datos) : s));
}

// Vincula una orden médica de HC a una solicitud (paso 1 del chequeo).
export function vincularOrden(id, datos) {
  solicitudes = getSolicitudes().map((s) => (s.id === id ? aplicarOrden(s, datos) : s));
}

// Vincula los resultados de una EVAPRE (`clave`: 'laboratorios' | 'imagenes') a una solicitud (paso 4 del chequeo).
export function vincularResultados(id, clave, datos) {
  solicitudes = getSolicitudes().map((s) => (s.id === id ? aplicarResultados(s, clave, datos) : s));
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
