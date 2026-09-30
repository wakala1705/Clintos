// Presentación de "Canastas de cirugía": mapas de tono/label, banners, filtros,
// KPIs y líneas de trazabilidad. Lógica pura (sin JSX) para poder probarla con
// node:test y compartirla entre los componentes de canastas/. Imports con
// extensión .js a propósito (node --test no resuelve sin ella).
//
// Esta pantalla solo RECIBE la canasta y registra consumo y devolución: no
// decide si una cirugía puede iniciar (esa lógica se quitó, 2026-09-30).
import {
  CANASTA_ESTADOS_RECIBIDOS, cantidadRecibida, fechaHoraTrazaLabel, resumenCanasta,
} from './mockCirugiaData.js';

// `violet: true` -> <Badge> no trae tono violeta; se agrega la clase global
// `cnc-badge-violet` (ver shared.css de la feature).
export const CANASTA_META = {
  'sin-solicitar': { tone: 'neutral' },
  'en-preparacion': { tone: 'neutral' },
  despachada: { tone: 'info' },
  recibida: { tone: 'success' },
  'con-novedades': { tone: 'warn' },
  'consumo-registrado': { tone: 'neutral', violet: true },
};

export function badgeProps(meta) {
  return { tone: meta.tone, className: meta.violet ? 'cnc-badge-violet' : '' };
}

export const ESTADO_FILTRO_OPTIONS = [
  { value: 'todas', label: 'Todos los estados' },
  { value: 'por-recibir', label: 'Despachadas por recibir' },
  { value: 'en-preparacion', label: 'En preparación' },
  { value: 'recibidas', label: 'Recibidas' },
  { value: 'consumo-pendiente', label: 'Consumo pendiente' },
];

// Cirugía ya realizada cuya canasta se recibió pero aún no tiene consumo y
// devolución registrados.
function tieneConsumoPendiente(cirugia) {
  return cirugia.estado === 'realizada' && ['recibida', 'con-novedades'].includes(resumenCanasta(cirugia).estado);
}

export function filtrarCanastas(cirugias, { busqueda = '', estado = 'todas' } = {}) {
  const texto = busqueda.trim().toLowerCase();
  return cirugias.filter((c) => {
    const e = resumenCanasta(c).estado;
    if (estado === 'por-recibir' && e !== 'despachada') return false;
    if (estado === 'en-preparacion' && e !== 'en-preparacion') return false;
    if (estado === 'recibidas' && !CANASTA_ESTADOS_RECIBIDOS.includes(e)) return false;
    if (estado === 'consumo-pendiente' && !tieneConsumoPendiente(c)) return false;
    if (!texto) return true;
    return [c.paciente.nombre, c.paciente.documento, c.procedimientoPrincipal, c.farmacia?.numeroPedido ?? '']
      .some((v) => v.toLowerCase().includes(texto));
  });
}

export function kpisCanastas(cirugias) {
  const estados = cirugias.map((c) => resumenCanasta(c).estado);
  return {
    recibidas: estados.filter((e) => CANASTA_ESTADOS_RECIBIDOS.includes(e)).length,
    porRecibir: estados.filter((e) => e === 'despachada').length,
    enPreparacion: estados.filter((e) => e === 'en-preparacion').length,
    consumoPendiente: cirugias.filter(tieneConsumoPendiente).length,
  };
}

// La primera cirugía (en el orden dado) con la canasta despachada por recibir,
// distinta de `omitirId` (la que ya está abierta en el detalle): alimenta la
// alerta "siguiente por recibir".
export function primeraPorRecibir(cirugias, omitirId = null) {
  return cirugias.find((c) => c.id !== omitirId && resumenCanasta(c).estado === 'despachada');
}

// Filtro de estado que activa cada KPI al hacer click (misma clave que
// ESTADO_FILTRO_OPTIONS).
export const KPI_FILTRO = {
  recibidas: 'recibidas',
  porRecibir: 'por-recibir',
  enPreparacion: 'en-preparacion',
  consumoPendiente: 'consumo-pendiente',
};

// Grupos de la lista, por prioridad de la tarea (recibir / legalizar primero).
// Conserva el orden de entrada (por hora) dentro de cada grupo y omite los
// vacíos.
export function agruparCanastas(cirugias) {
  const grupos = [
    { key: 'accion', titulo: 'Requiere acción', items: [] },
    { key: 'farmacia', titulo: 'Pendientes de farmacia', items: [] },
    { key: 'completadas', titulo: 'Completadas', items: [] },
  ];
  cirugias.forEach((c) => {
    const e = resumenCanasta(c).estado;
    if (e === 'despachada' || tieneConsumoPendiente(c)) grupos[0].items.push(c);
    else if (e === 'en-preparacion' || e === 'sin-solicitar') grupos[1].items.push(c);
    else grupos[2].items.push(c);
  });
  return grupos.filter((g) => g.items.length > 0);
}

// Banner bajo la cabecera del detalle: solo para lo que el badge de estado no
// dice por sí solo (novedades, preparación en curso, siguiente paso de una
// cirugía realizada). El estado "normal" lo comunica el badge y la pestaña.
// Describe la CANASTA, nunca si la cirugía puede iniciar. null si no aplica.
export function bannerCanasta(cirugia) {
  if (!['programada', 'urgencia', 'realizada'].includes(cirugia.estado)) return null;
  const { estado } = resumenCanasta(cirugia);
  if (cirugia.estado === 'realizada') {
    if (estado === 'consumo-registrado') return null;
    if (CANASTA_ESTADOS_RECIBIDOS.includes(estado)) {
      return { tone: 'info', texto: 'Cirugía realizada. Registra el consumo real y la devolución de insumos a farmacia.' };
    }
    return { tone: 'neutral', texto: 'Cirugía realizada, pero su canasta no fue recibida: no hay consumo que registrar.' };
  }
  if (cirugia.canasta.items.length === 0) return null;
  if (estado === 'en-preparacion') {
    return { tone: 'neutral', texto: 'Farmacia está preparando la canasta. Podrás recibirla cuando la despache.' };
  }
  if (estado === 'con-novedades') {
    return { tone: 'warn', texto: 'Canasta recibida con novedades: farmacia fue notificada.' };
  }
  return null;
}

// Unidades e insumos a devolver a farmacia según lo usado (sin entrada en
// `usados` = se usó todo lo recibido, nada que devolver).
export function resumenDevolucion(cirugia, usados = {}) {
  let unidades = 0;
  let insumos = 0;
  cirugia.canasta.items.forEach((i) => {
    const recibido = cantidadRecibida(i);
    const devolver = recibido - (usados[i.nombre] ?? recibido);
    if (devolver > 0) {
      unidades += devolver;
      insumos += 1;
    }
  });
  return { unidades, insumos };
}

export function lineaRecepcion(cirugia) {
  const r = cirugia.canasta.recepcion;
  if (!r) return 'Canasta recibida.';
  const base = `${r.conNovedades ? 'Recibida con novedades' : 'Recibida completa'} por ${r.usuario} · ${fechaHoraTrazaLabel(r.fecha)}`;
  return r.conNovedades ? `${base} · Farmacia notificada` : base;
}

export function lineaConsumo(cirugia) {
  const c = cirugia.canasta.consumo;
  const { unidades } = resumenDevolucion(cirugia, c.usados);
  return `Consumo registrado por ${c.usuario} · ${fechaHoraTrazaLabel(c.fecha)} · ${unidades} unidades enviadas a devolución`;
}
