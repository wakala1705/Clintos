// Historial de cama — datos de ejemplo para el modal "Historial" (acción del
// menú "⋯" de cada cama, ver HistorialCamaModal.jsx). A diferencia de
// mockMantenimientoData.js (semilla curada de 8 registros, con su propia
// tabla), acá hace falta una historia por CADA una de las 199 camas del
// inventario (mockCamasData.js) — generarHistorialCama(cama) arma una
// cadena determinística de eventos (sin Math.random, mismo criterio que
// generateCamas) a partir del `id` de la cama, terminando siempre en el
// `estado` actual de esa cama (usando paciente/reserva/motivo/
// mantenimientoTipo reales cuando la cama ya los trae, para que el último
// evento coincida con lo que se ve en el resto del Bed Board).

import {
  ESTADOS, PACIENTES_BUSCABLES, ADMISIONES_BUSCABLES, MOTIVOS_BLOQUEO,
} from './mockCamasData';

const USUARIOS = ['JBRAVOG', 'AGILISUR', 'MRAMIREZ', 'LCASTROV', 'DGOMEZP', 'PTORRESM'];

const MOTIVOS_LIMPIEZA = ['Alta', 'Cambio de paciente', 'Limpieza profunda programada', 'Protocolo de aislamiento'];
// Reusa el catálogo real de "Bloquear cama" (BloquearCamaModal.jsx, vía
// mockCamasData.js) en vez de mantener una lista propia — single source of
// truth, ya que ambas listas describían exactamente lo mismo.
const MOTIVOS_BLOQUEO_POOL = MOTIVOS_BLOQUEO.map((m) => m.label);
const MOTIVOS_MANTENIMIENTO = ['Mantenimiento preventivo programado', 'Reparación de cabecera', 'Cambio de colchón'];
const MOTIVOS_RESERVA = ['Ingreso programado', 'Procedimiento quirúrgico', 'Traslado interno'];

// Vocabulario fijo del filtro "Evento" — más granular que "Estado" (ej.
// "Cama liberada" y "Limpieza iniciada" resultan ambos en distintos pasos de
// un mismo ciclo hacia limpieza), para que los 2 filtros no sean redundantes.
export const EVENTOS_HISTORIAL = [
  { value: 'todos', label: 'Todos los eventos' },
  { value: 'registro', label: 'Cama registrada' },
  { value: 'reserva-creada', label: 'Reserva creada' },
  { value: 'reserva-cancelada', label: 'Reserva cancelada' },
  { value: 'asignacion-paciente', label: 'Asignación de paciente' },
  { value: 'limpieza-iniciada', label: 'Limpieza iniciada' },
  { value: 'limpieza-finalizada', label: 'Limpieza finalizada' },
  { value: 'mantenimiento-iniciado', label: 'Mantenimiento iniciado' },
  { value: 'cama-bloqueada', label: 'Cama bloqueada' },
  { value: 'cama-desactivada', label: 'Cama desactivada' },
  { value: 'cama-activada', label: 'Cama activada' },
];
export const EVENTO_LABEL = Object.fromEntries(EVENTOS_HISTORIAL.slice(1).map((e) => [e.value, e.label]));

// Mismos estados confirmados que MENU_ACCIONES/CTA_PRINCIPAL en
// mockCamasData.js — Inactiva se sumó ahí (Activar/desactivar cama, encargo
// #30) así que se suma acá también; Aislamiento sigue fuera (reglas de
// negocio sin confirmar, mismo criterio que esas tablas).
const ESTADOS_CONFIRMADOS = ['libre', 'ocupada', 'reservada', 'limpieza', 'mantenimiento', 'bloqueada', 'inactiva'];
export const ESTADOS_HISTORIAL = ESTADOS.filter((e) => e.value === 'todos' || ESTADOS_CONFIRMADOS.includes(e.value));

export const FECHA_PRESETS_HISTORIAL = [
  { value: 'todos', label: 'Todo el historial' },
  { value: 'hoy', label: 'Hoy' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
];

// "Hoy" fijo del historial (mismo día que HOY_ADMISION en mockCamasData.js)
// — ancla determinística para los presets de Fecha, nunca Date.now() (este
// modal es una foto fija al abrirse, no un feed en vivo como Actividad
// reciente, ver ACTIVIDAD_INICIAL).
export const AHORA_HISTORIAL = new Date(2026, 7, 20, 9, 0).getTime();

function fechaHistorial(dia, hora, minuto = 0) {
  return new Date(2026, 7, dia, hora, minuto).getTime();
}

// "20/08/2026 08:35" — formato literal del encargo (distinto del "26 Ago"
// de mockMantenimientoData.js: acá se pidió dd/mm/yyyy explícito).
export function formatFechaHistorial(ts) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`;
}

// Semilla determinística por cama (nunca Math.random, mismo criterio que
// generateCamas en mockCamasData.js) — el número de "CAM-0007" alimenta
// pick() para variar usuario/motivo/hora sin perder reproducibilidad entre
// recargas.
function seedDeCama(cama) {
  return parseInt(cama.id.replace('CAM-', ''), 10) || 1;
}
function pick(pool, seed, salt) {
  return pool[(seed + salt) % pool.length];
}

// Arma la cadena de eventos (sin id/fecha todavía, ver mapeo final) según el
// estado ACTUAL de la cama — cada rama termina justo en ese estado, usando
// los datos reales de la cama (paciente/reserva/motivo/mantenimientoTipo)
// cuando existen en vez de inventar uno nuevo.
function construirCadena(cama, seed) {
  const usuarioA = pick(USUARIOS, seed, 0);
  const usuarioB = pick(USUARIOS, seed, 1);
  const usuarioC = pick(USUARIOS, seed, 2);
  const horaBase = 7 + (seed % 10);

  const registro = {
    dia: 14, hora: horaBase, evento: 'registro', estado: 'libre', usuario: usuarioA,
  };

  switch (cama.estado) {
    case 'ocupada': {
      const paciente = cama.paciente ?? pick(PACIENTES_BUSCABLES, seed, 3);
      const admisionId = cama.paciente?.admisionId ?? pick(ADMISIONES_BUSCABLES, seed, 3).admisionId;
      return [
        registro,
        {
          dia: 20, hora: horaBase, evento: 'asignacion-paciente', estado: 'ocupada', usuario: usuarioB, paciente: paciente.nombre, admisionId,
        },
      ];
    }
    case 'reservada': {
      const motivo = cama.reserva?.motivo ?? pick(MOTIVOS_RESERVA, seed, 2);
      return [
        registro,
        {
          dia: 19, hora: horaBase, evento: 'reserva-creada', estado: 'reservada', usuario: usuarioB, motivo,
        },
      ];
    }
    case 'limpieza': {
      const paciente = pick(PACIENTES_BUSCABLES, seed, 3);
      const admisionId = pick(ADMISIONES_BUSCABLES, seed, 3).admisionId;
      const motivo = pick(MOTIVOS_LIMPIEZA, seed, 1);
      return [
        registro,
        {
          dia: 18, hora: horaBase, evento: 'asignacion-paciente', estado: 'ocupada', usuario: usuarioB, paciente: paciente.nombre, admisionId,
        },
        {
          dia: 20, hora: horaBase, evento: 'limpieza-iniciada', estado: 'limpieza', usuario: usuarioC, motivo,
        },
      ];
    }
    case 'mantenimiento': {
      const motivo = cama.mantenimientoTipo ?? pick(MOTIVOS_MANTENIMIENTO, seed, 1);
      return [
        registro,
        {
          dia: 20, hora: horaBase, evento: 'mantenimiento-iniciado', estado: 'mantenimiento', usuario: usuarioB, motivo,
        },
      ];
    }
    case 'bloqueada': {
      const motivo = cama.motivo ?? pick(MOTIVOS_BLOQUEO_POOL, seed, 1);
      return [
        registro,
        {
          dia: 20, hora: horaBase, evento: 'cama-bloqueada', estado: 'bloqueada', usuario: usuarioB, motivo,
        },
      ];
    }
    // Motivo real de cama.motivo (encargo #30, DesactivarCamaModal lo pide
    // obligatorio) — nunca un motivo inventado como en las otras ramas, acá
    // siempre hay uno capturado por el usuario.
    case 'inactiva': {
      return [
        registro,
        {
          dia: 20, hora: horaBase, evento: 'cama-desactivada', estado: 'inactiva', usuario: usuarioB, motivo: cama.motivo,
        },
      ];
    }
    case 'libre':
    default: {
      const motivoReserva = pick(MOTIVOS_RESERVA, seed, 2);
      const motivoLimpieza = pick(MOTIVOS_LIMPIEZA, seed, 1);
      return [
        registro,
        {
          dia: 17, hora: horaBase, evento: 'reserva-creada', estado: 'reservada', usuario: usuarioB, motivo: motivoReserva,
        },
        {
          dia: 18, hora: horaBase, evento: 'reserva-cancelada', estado: 'libre', usuario: usuarioC,
        },
        {
          dia: 19, hora: horaBase, evento: 'limpieza-iniciada', estado: 'limpieza', usuario: usuarioB, motivo: motivoLimpieza,
        },
        {
          dia: 19, hora: horaBase + 1, evento: 'limpieza-finalizada', estado: 'libre', usuario: usuarioA,
        },
      ];
    }
  }
}

export function generarHistorialCama(cama) {
  const seed = seedDeCama(cama);
  return construirCadena(cama, seed).map((e, idx) => ({
    id: `HIST-${cama.id}-${idx}`,
    fecha: fechaHistorial(e.dia, e.hora, e.minuto ?? 0),
    evento: e.evento,
    estado: e.estado,
    usuario: e.usuario,
    paciente: e.paciente ?? null,
    admisionId: e.admisionId ?? null,
    motivo: e.motivo ?? null,
  }));
}
