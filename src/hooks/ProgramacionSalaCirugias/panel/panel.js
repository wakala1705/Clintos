// Lógica pura del "Panel general" de Cirugía (portada del módulo): estado
// visual de cada cirugía del día, KPIs, filtros de la tabla y exportación.
// Sin React ni acceso al mock (ver __tests__/panel.test.mjs).
import { minutosCirugia } from '../tablero/tablero.js';
import {
  addDias, fechaISO, lunesDeSemana, resumenCanasta,
} from '../mockCirugiaData.js';

// Jornada operativa asumida por sala para el % de ocupación: la misma que
// usa resumenAgenda (07:00-19:00) -- no hay un horario real de quirófano en
// el modelo.
const JORNADA_OPERATIVA_MIN = 12 * 60;

function minutosDe(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

// Rango de fechas que lista el panel: hoy, la semana en curso (lunes a
// domingo) o el mes en curso. `dias` escala la capacidad de la ocupación.
export const RANGOS_PANEL = {
  hoy: { label: 'Hoy', periodo: 'hoy' },
  semana: { label: 'Semana', periodo: 'esta semana' },
  mes: { label: 'Mes', periodo: 'este mes' },
};

export function rangoFechas(rango, base = new Date()) {
  if (rango === 'semana') {
    const lunes = lunesDeSemana(base);
    return { inicio: fechaISO(lunes), fin: fechaISO(addDias(lunes, 6)), dias: 7 };
  }
  if (rango === 'mes') {
    const primero = new Date(base.getFullYear(), base.getMonth(), 1);
    const ultimo = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { inicio: fechaISO(primero), fin: fechaISO(ultimo), dias: ultimo.getDate() };
  }
  const hoy = fechaISO(base);
  return { inicio: hoy, fin: hoy, dias: 1 };
}

// El modelo solo guarda programada/urgencia/realizada/cancelada/incumplida.
// "En curso" y "retrasada" se DERIVAN de la hora para el día de hoy: una
// cirugía abierta (programada/urgencia) está pendiente antes de su hora de
// inicio, en curso entre inicio y fin, y retrasada si ya pasó su hora de fin
// sin cerrarse. `ahora` es el reloj del render (ver ahoraDemo en el mock).
export function estadoVisual(cirugia, ahora) {
  if (cirugia.estado === 'cancelada') return 'cancelada';
  if (cirugia.estado === 'incumplida') return 'incumplida';
  if (cirugia.estado === 'realizada') return 'finalizada';
  // Otro día: una abierta de un día anterior quedó sin cerrar; una futura aún no empieza.
  const hoyISO = fechaISO(ahora);
  if (cirugia.fecha < hoyISO) return 'retrasada';
  if (cirugia.fecha > hoyISO) return 'pendiente';
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  if (minutosAhora < minutosDe(cirugia.horaInicio)) return 'pendiente';
  if (minutosAhora < minutosDe(cirugia.horaFin)) return 'en-curso';
  return 'retrasada';
}

// Qué estados visuales agrupa cada pestaña del filtro.
export const FILTROS_PANEL = {
  todas: null,
  pendientes: ['pendiente', 'retrasada'],
  'en-curso': ['en-curso'],
  finalizadas: ['finalizada'],
  canceladas: ['cancelada', 'incumplida'],
};

export function conteosFiltros(cirugias, ahora) {
  const estados = cirugias.map((c) => estadoVisual(c, ahora));
  const cuenta = (lista) => estados.filter((e) => lista.includes(e)).length;
  return {
    todas: cirugias.length,
    pendientes: cuenta(FILTROS_PANEL.pendientes),
    'en-curso': cuenta(FILTROS_PANEL['en-curso']),
    finalizadas: cuenta(FILTROS_PANEL.finalizadas),
    canceladas: cuenta(FILTROS_PANEL.canceladas),
  };
}

// Filas de la tabla: por hora de inicio, filtradas por pestaña y por texto
// (paciente, documento, procedimiento o cirujano).
export function filtrarFilas(cirugias, ahora, { filtro = 'todas', busqueda = '' } = {}) {
  const estados = FILTROS_PANEL[filtro] ?? null;
  const texto = busqueda.trim().toLowerCase();
  return cirugias
    .filter((c) => !estados || estados.includes(estadoVisual(c, ahora)))
    .filter((c) => {
      if (!texto) return true;
      return [c.paciente.nombre, c.paciente.documento, c.procedimientoPrincipal, c.cirujano]
        .some((v) => (v ?? '').toLowerCase().includes(texto));
    })
    .sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? '') || a.horaInicio.localeCompare(b.horaInicio));
}

// `salas` = las salas de la sede; solo las activas cuentan para el
// denominador (una sala en mantenimiento no ofrece horas). Las canceladas e
// incumplidas no ocupan quirófano.
export function resumenOcupacion(cirugias, salas, dias = 1) {
  const activas = salas.filter((s) => s.estado === 'Activo');
  const ocupadas = cirugias.filter((c) => !['cancelada', 'incumplida'].includes(c.estado));
  const minutos = ocupadas.reduce((acc, c) => acc + minutosCirugia(c), 0);
  const capacidad = activas.length * JORNADA_OPERATIVA_MIN * dias;
  const salasConCirugia = new Set(ocupadas.map((c) => c.salaId));
  return {
    salasOcupadas: activas.filter((s) => salasConCirugia.has(s.value)).length,
    salasTotal: activas.length,
    ocupacionPct: capacidad > 0 ? Math.min(100, Math.round((minutos / capacidad) * 100)) : 0,
  };
}

export function kpisPanel(cirugias, ahora, salas, dias = 1) {
  const enCurso = cirugias.filter((c) => estadoVisual(c, ahora) === 'en-curso');
  return {
    programadas: cirugias.length,
    enCurso: enCurso.length,
    salasEnCurso: new Set(enCurso.map((c) => c.salaId)).size,
    finalizadas: cirugias.filter((c) => c.estado === 'realizada').length,
    canceladas: cirugias.filter((c) => ['cancelada', 'incumplida'].includes(c.estado)).length,
    ...resumenOcupacion(cirugias, salas, dias),
  };
}

// Columnas de canasta de la tabla. "Vinculada": la canasta de insumos asignada a
// la cirugía (sin ítems = sin canasta). "Pedida": en qué punto va su pedido a
// farmacia (resumenCanasta); 'sin-solicitar' = todavía no se pidió.
export function canastaVinculada(cirugia) {
  const items = cirugia.canasta?.items ?? [];
  return items.length > 0 ? { nombre: cirugia.canasta.nombre, items: items.length } : null;
}

export const CANASTA_PEDIDA_LABEL = {
  'sin-solicitar': 'No pedida',
  'en-preparacion': 'En preparación',
  despachada: 'Despachada',
  'despacho-parcial': 'Despacho parcial',
  recibida: 'Recibida',
  'con-novedades': 'Con novedades',
  'consumo-registrado': 'Consumo registrado',
};

// null si no hay canasta vinculada (no hay nada que pedir).
export function canastaPedida(cirugia) {
  if (!canastaVinculada(cirugia)) return null;
  const { estado } = resumenCanasta(cirugia);
  return {
    estado,
    label: CANASTA_PEDIDA_LABEL[estado],
  };
}

export const ESTADO_VISUAL_LABEL = {
  pendiente: 'Pendiente',
  'en-curso': 'En curso',
  retrasada: 'Retrasada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
  incumplida: 'Incumplida',
};

// CSV de lo que muestra la tabla (con BOM y ";" no hace falta: Excel en
// español abre bien UTF-8 con BOM y coma si los textos van entre comillas).
export function filasACsv(cirugias, ahora, salaLabel) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const cabecera = ['Hora', 'Sala', 'Paciente', 'Documento', 'Procedimiento', 'Anestesia', 'Cirujano', 'Duración (min)', 'Canasta vinculada', 'Canasta pedida', 'Estado'];
  const filas = cirugias.map((c) => [
    c.horaInicio, salaLabel(c.salaId), c.paciente.nombre, c.paciente.documento, c.procedimientoPrincipal,
    c.tipoAnestesia, c.cirujano, minutosCirugia(c),
    canastaVinculada(c) ? 'Vinculada' : 'No vinculada', canastaPedida(c)?.label ?? '—', ESTADO_VISUAL_LABEL[estadoVisual(c, ahora)],
  ]);
  return `﻿${[cabecera, ...filas].map((f) => f.map(esc).join(',')).join('\r\n')}`;
}
