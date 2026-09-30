// Presentación de "Canastas de cirugía": mapas de tono/label, banners, filtros,
// KPIs y líneas de trazabilidad. Lógica pura (sin JSX) para poder probarla con
// node:test y compartirla entre los componentes de canastas/. Imports con
// extensión .js a propósito (node --test no resuelve sin ella).
import {
  CANASTA_ESTADOS_RECIBIDOS, bloqueoInicio, cantidadRecibida, fechaHoraTrazaLabel, gateCirugia, resumenCanasta,
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

export const GATE_META = {
  lista: { label: 'Lista para iniciar', tone: 'success' },
  bloqueada: { label: 'Inicio bloqueado', tone: 'danger' },
  'urgencia-puede-autorizar': { label: 'Urgencia · puede autorizar inicio', tone: 'neutral', violet: true },
  'urgencia-autorizada': { label: 'Inicio autorizado por urgencia', tone: 'neutral', violet: true },
  realizada: { label: 'Cirugía realizada', tone: 'neutral' },
};

// Valor del campo "Farmacia" del detalle.
export const CANASTA_FARMACIA_LABEL = {
  'sin-solicitar': 'Sin solicitar',
  'en-preparacion': 'En preparación',
  despachada: 'Despachada',
  recibida: 'Entregada',
  'con-novedades': 'Entregada',
  'consumo-registrado': 'Entregada',
};

export function badgeProps(meta) {
  return { tone: meta.tone, className: meta.violet ? 'cnc-badge-violet' : '' };
}

export const ESTADO_FILTRO_OPTIONS = [
  { value: 'todas', label: 'Todos los estados' },
  { value: 'por-recibir', label: 'Despachadas por recibir' },
  { value: 'en-preparacion', label: 'En preparación' },
  { value: 'recibidas', label: 'Recibidas' },
  { value: 'bloqueadas', label: 'Inicio bloqueado' },
];

export function filtrarCanastas(cirugias, { busqueda = '', estado = 'todas' } = {}) {
  const texto = busqueda.trim().toLowerCase();
  return cirugias.filter((c) => {
    const e = resumenCanasta(c).estado;
    if (estado === 'por-recibir' && e !== 'despachada') return false;
    if (estado === 'en-preparacion' && e !== 'en-preparacion') return false;
    if (estado === 'recibidas' && !CANASTA_ESTADOS_RECIBIDOS.includes(e)) return false;
    if (estado === 'bloqueadas' && !bloqueoInicio(c)) return false;
    if (!texto) return true;
    return [c.paciente.nombre, c.paciente.documento, c.procedimientoPrincipal, c.farmacia?.numeroPedido ?? '']
      .some((v) => v.toLowerCase().includes(texto));
  });
}

// "Inicio bloqueado" cuenta solo la compuerta `bloqueada` (una urgencia que
// aún puede autorizarse no es un bloqueo firme), igual que el artboard.
export function kpisCanastas(cirugias) {
  const estados = cirugias.map((c) => resumenCanasta(c).estado);
  return {
    recibidas: estados.filter((e) => CANASTA_ESTADOS_RECIBIDOS.includes(e)).length,
    porRecibir: estados.filter((e) => e === 'despachada').length,
    enPreparacion: estados.filter((e) => e === 'en-preparacion').length,
    bloqueadas: cirugias.filter((c) => gateCirugia(c) === 'bloqueada').length,
  };
}

// Banner de estado bajo la cabecera del detalle. null si la cirugía ya no
// aplica (cancelada/incumplida).
export function bannerCanasta(cirugia) {
  const gate = gateCirugia(cirugia);
  const { estado } = resumenCanasta(cirugia);
  switch (gate) {
    case 'realizada':
      return estado === 'consumo-registrado'
        ? { tone: 'neutral', bloqueado: false, texto: 'Cirugía realizada. El consumo y la devolución de insumos ya fueron registrados.' }
        : { tone: 'info', bloqueado: false, texto: 'Cirugía realizada. Registra el consumo real y la devolución de insumos a farmacia.' };
    case 'lista':
      return estado === 'con-novedades'
        ? { tone: 'warn', bloqueado: false, texto: 'Canasta recibida con novedades: la cirugía puede iniciar y farmacia fue notificada.' }
        : { tone: 'success', bloqueado: false, texto: 'Canasta recibida completa: la cirugía puede iniciar.' };
    case 'urgencia-autorizada': {
      const a = cirugia.canasta.autorizacionUrgencia;
      return {
        tone: 'violet',
        bloqueado: false,
        texto: `Inicio autorizado por urgencia (${a.usuario} · ${fechaHoraTrazaLabel(a.fecha)}). Recibe la canasta en cuanto farmacia la despache.`,
      };
    }
    case 'urgencia-puede-autorizar':
      return { tone: 'violet', bloqueado: false, texto: 'Cirugía de urgencia: puedes autorizar el inicio sin la canasta. La excepción queda registrada.' };
    case 'bloqueada':
      return { tone: 'danger', bloqueado: true, texto: 'Inicio bloqueado: confirma la recepción de la canasta para habilitar la cirugía.' };
    default:
      return null;
  }
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

export function lineaAutorizacion(cirugia) {
  const a = cirugia.canasta.autorizacionUrgencia;
  return `Excepción registrada por ${a.usuario} · ${fechaHoraTrazaLabel(a.fecha)}. La recepción sigue pendiente.`;
}

export function lineaConsumo(cirugia) {
  const c = cirugia.canasta.consumo;
  const { unidades } = resumenDevolucion(cirugia, c.usados);
  return `Consumo registrado por ${c.usuario} · ${fechaHoraTrazaLabel(c.fecha)} · ${unidades} unidades enviadas a devolución`;
}
