import { cantidadDevuelta } from '../mockCirugiaData.js';

// Hoja de gasto quirúrgico: modelo, tarifas mock, cálculos, validaciones de
// cierre y store en memoria (sin persistencia real, ver spec).

export const HOJA_ESTADO_LABEL = { borrador: 'Borrador', cerrada: 'Cerrada' };

export const VIAS_OPTIONS = [
  { value: 'unica', label: 'Única' },
  { value: 'bilateral', label: 'Bilateral' },
  { value: 'distinta', label: 'Distinta vía' },
];

export const ROLES_HONORARIOS = ['Cirujano', 'Ayudante', 'Anestesiólogo', 'Instrumentadora', 'Circulante'];
export const CONTEO_ITEMS = ['Gasas', 'Compresas', 'Agujas', 'Instrumental (sets)'];

// ---------- Tarifas de ejemplo (COP) ----------
const TARIFA_HORA_ROL = {
  Cirujano: 450000, Ayudante: 180000, Anestesiólogo: 320000, Instrumentadora: 90000, Circulante: 60000,
};
const TARIFA_HORA_ROL_DEFECTO = 100000;
const TARIFA_HORA_EQUIPO = 80000;
const TARIFA_HORA_SALA = 250000;
const VALOR_INSUMO = {
  'Gasas estériles': 1800,
  'Trocar 5mm': 95000,
  'Trocar 10mm': 110000,
  'Pinza Maryland': 240000,
  'Sutura Vicryl 2-0': 18500,
  'Clips de titanio': 12000,
  'Aguja de Veress': 38000,
  'Bolsa de extracción': 52000,
  'Solución salina 1000ml': 6500,
  'Campo quirúrgico': 14000,
  'Guantes estériles talla 7': 3800,
  'Hoja de bisturí #11': 2400,
};
const VALOR_INSUMO_DEFECTO = 15000;
const VALOR_MEDICAMENTO = { Cefazolina: 9800, 'Ondansetrón': 4200 };
const VALOR_MEDICAMENTO_DEFECTO = 8000;

// ---------- Utilidades ----------
let secuencia = 1000;
export function nuevoId(prefijo) {
  secuencia += 1;
  return `${prefijo}-${secuencia}`;
}

export const actualizarFila = (rows, id, campo, valor) => rows.map((r) => (r.id === id ? { ...r, [campo]: valor } : r));
export const quitarFila = (rows, id) => rows.filter((r) => r.id !== id);

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
export const formatoCOP = (n) => COP.format(Number(n) || 0);

const MES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
// 'YYYY-MM-DDTHH:mm' -> 'DD.MES.AAAA - HH:mm'
export function fechaHoraHoja(iso) {
  const [fecha, hora] = iso.split('T');
  const [y, m, d] = fecha.split('-');
  return `${d}.${MES[Number(m) - 1]}.${y} - ${hora}`;
}

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const n0 = (v) => Number(v) || 0;

// ---------- Tiempos ----------
export function aMinutos(hhmm) {
  if (!/^\d{2}:\d{2}$/.test(hhmm ?? '')) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function minutosEntre(desde, hasta) {
  const a = aMinutos(desde);
  const b = aMinutos(hasta);
  if (a === null || b === null) return null;
  return b - a;
}

const noNegativo = (min) => (min !== null && min >= 0 ? min : null);

export function duracionesHoja(t) {
  return {
    sala: noNegativo(minutosEntre(t.ingresoSala, t.salidaSala)),
    anestesia: noNegativo(minutosEntre(t.inicioAnestesia, t.finCirugia)),
    cirugia: noNegativo(minutosEntre(t.inicioCirugia, t.finCirugia)),
  };
}

export function duracionTexto(min) {
  if (min === null || min === undefined) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// ---------- Valores ----------
export const valorPorTiempo = ({ minutos, tarifaHora }) => Math.round((n0(minutos) / 60) * n0(tarifaHora));
// Derechos de sala: se facturan por bloques de 30 min iniciados.
export const valorDerechosSala = ({ minutos, tarifaHora }) => Math.round((Math.ceil(n0(minutos) / 30) * 30 / 60) * n0(tarifaHora));
export const devueltoInsumo = (i) => Math.max(n0(i.entregado) - n0(i.usado), 0);
export const valorInsumo = (i) => n0(i.usado) * n0(i.valorUnitario);
export const valorMedicamento = (m) => n0(m.cantidad) * n0(m.valorUnitario);

export function conteoEstado({ inicial, final }) {
  const a = num(inicial);
  const b = num(final);
  if (a === null || b === null) return 'pendiente';
  return a === b ? 'correcto' : 'discrepancia';
}

const suma = (rows, fn) => rows.reduce((t, r) => t + fn(r), 0);

export function totalesHoja(h) {
  const honorarios = suma(h.honorarios, valorPorTiempo);
  const insumos = suma(h.insumos, valorInsumo);
  const medicamentos = suma(h.medicamentos, valorMedicamento);
  const implantes = suma(h.implantes, (i) => n0(i.valor));
  const equipos = suma(h.equipos, valorPorTiempo);
  const derechosSala = valorDerechosSala(h.derechosSala);
  return {
    honorarios,
    insumos,
    medicamentos,
    implantes,
    equipos,
    derechosSala,
    total: honorarios + insumos + medicamentos + implantes + equipos + derechosSala,
  };
}

// ---------- Cierre ----------
export function validarCierre(h) {
  const errores = [];
  const err = (seccion, mensaje) => errores.push({ seccion, mensaje });

  const t = h.tiempos;
  const orden = [t.ingresoSala, t.inicioAnestesia, t.inicioCirugia, t.finCirugia, t.salidaSala];
  if (orden.some((v) => aMinutos(v) === null)) {
    err('tiempos', 'Completa los 5 tiempos de la cirugía.');
  } else if (orden.some((v, i) => i > 0 && aMinutos(v) < aMinutos(orden[i - 1]))) {
    err('tiempos', 'Los tiempos deben ir en orden: ingreso a sala, inicio de anestesia, inicio y fin de cirugía, salida de sala.');
  }

  if (!h.anestesia.tipo) err('anestesia', 'Selecciona el tipo de anestesia.');

  if (h.procedimientos.length === 0 || h.procedimientos.some((p) => !p.cups.trim() || !p.dxPos.trim())) {
    err('procedimientos', 'Cada procedimiento necesita código CUPS y diagnóstico posoperatorio.');
  }

  if (!h.honorarios.some((f) => f.rol === 'Cirujano' && n0(f.minutos) > 0)) {
    err('honorarios', 'Registra el tiempo del cirujano.');
  }

  if (h.insumos.some((i) => num(i.usado) === null)) {
    err('insumos', 'Hay insumos sin cantidad usada: concilia todos los insumos.');
  } else if (h.insumos.some((i) => !i.manual && n0(i.usado) > n0(i.entregado))) {
    err('insumos', 'Un insumo tiene más cantidad usada que entregada.');
  }

  if (h.implantes.some((i) => !i.invima.trim() || !i.lote.trim())) {
    err('implantes', 'Cada implante necesita registro INVIMA y lote.');
  }

  if (h.conteo.some((c) => conteoEstado(c) !== 'correcto')) {
    err('conteo', 'El conteo quirúrgico debe estar completo y sin discrepancias.');
  }

  [['circulante', 'del circulante'], ['instrumentadora', 'de la instrumentadora'], ['cirujano', 'del cirujano']].forEach(([clave, quien]) => {
    if (!h.firmas[clave]) err('firmas', `Falta la firma ${quien}.`);
  });

  return errores;
}

export function cerrarHoja(hoja, ahoraISO) {
  const errores = validarCierre(hoja);
  if (errores.length > 0) return { ok: false, errores, hoja };
  return { ok: true, errores: [], hoja: { ...hoja, estado: 'cerrada', cerradaEn: ahoraISO } };
}

export const firmarHoja = (hoja, rol, ahoraISO) => ({ ...hoja, firmas: { ...hoja.firmas, [rol]: ahoraISO } });

// ---------- Construcción desde la cirugía ----------
export function construirHojaInicial(cirugia) {
  const duracion = Math.max(minutosEntre(cirugia.horaInicio, cirugia.horaFin) ?? 0, 0);
  return {
    numero: `HG-${cirugia.id}`,
    programacionId: cirugia.id,
    estado: 'borrador',
    cerradaEn: null,
    admision: '',
    tiempos: {
      ingresoSala: '',
      inicioAnestesia: '',
      inicioCirugia: cirugia.horaInicio ?? '',
      finCirugia: cirugia.horaFin ?? '',
      salidaSala: '',
    },
    anestesia: { tipo: '', asa: '', complejidad: '' },
    procedimientos: cirugia.procedimientos.map((p, i) => ({
      id: `proc-${i}`, nombre: p.nombre, cups: '', via: 'unica', dxPre: '', dxPos: '',
    })),
    honorarios: cirugia.personal.map((p, i) => ({
      id: `hon-${i}`, rol: p.rol, nombre: p.nombre, registro: '', minutos: duracion, tarifaHora: TARIFA_HORA_ROL[p.rol] ?? TARIFA_HORA_ROL_DEFECTO,
    })),
    insumos: cirugia.canasta.items
      .filter((i) => i.solicitudFarmacia === 'entregado')
      .map((i, idx) => {
        const entregado = i.recibido ?? i.cantidad;
        return {
          id: `ins-${idx}`,
          nombre: i.nombre,
          entregado,
          usado: Math.max(entregado - cantidadDevuelta(cirugia, i.nombre), 0),
          valorUnitario: VALOR_INSUMO[i.nombre] ?? VALOR_INSUMO_DEFECTO,
          manual: false,
        };
      }),
    medicamentos: (cirugia.farmacia?.medicamentos ?? []).map((m, i) => ({
      id: `med-${i}`, nombre: m.nombre, dosis: m.dosis ?? '', cantidad: 1, valorUnitario: VALOR_MEDICAMENTO[m.nombre] ?? VALOR_MEDICAMENTO_DEFECTO,
    })),
    implantes: [],
    equipos: (cirugia.equipos ?? []).map((e, i) => ({
      id: `eq-${i}`, nombre: e.nombre, identificacion: e.identificacion ?? '', minutos: duracion, tarifaHora: TARIFA_HORA_EQUIPO,
    })),
    derechosSala: { minutos: duracion, tarifaHora: TARIFA_HORA_SALA },
    conteo: CONTEO_ITEMS.map((item, i) => ({
      id: `con-${i}`, item, inicial: '', final: '', manual: false,
    })),
    observaciones: '',
    firmas: { circulante: null, instrumentadora: null, cirujano: null },
  };
}

// ---------- Store en memoria ----------
const hojasGuardadas = new Map();
export const obtenerHojaGuardada = (programacionId) => {
  const h = hojasGuardadas.get(programacionId);
  return h ? structuredClone(h) : null;
};
export const guardarHoja = (hoja) => {
  hojasGuardadas.set(hoja.programacionId, structuredClone(hoja));
};
