import { cantidadDevuelta, estadoInsumo } from '../mockCirugiaData.js';

// Hoja de gasto quirúrgico: registro de consumo en sala (sin dinero). Modelo,
// cálculos, validaciones de cierre y store en memoria (sin persistencia real,
// ver spec).

export const HOJA_ESTADO_LABEL = { borrador: 'Borrador', cerrada: 'Cerrada' };

export const VIAS_OPTIONS = [
  { value: 'unica', label: 'Única' },
  { value: 'bilateral', label: 'Bilateral' },
  { value: 'distinta', label: 'Distinta vía' },
];

export const ROLES_PERSONAL = ['Cirujano', 'Ayudante', 'Anestesiólogo', 'Instrumentadora', 'Circulante'];
export const CONTEO_ITEMS = ['Gasas', 'Compresas', 'Agujas', 'Instrumental (sets)'];

// ---------- Utilidades ----------
let secuencia = 1000;
export function nuevoId(prefijo) {
  secuencia += 1;
  return `${prefijo}-${secuencia}`;
}

export const actualizarFila = (rows, id, campo, valor) => rows.map((r) => (r.id === id ? { ...r, [campo]: valor } : r));
export const quitarFila = (rows, id) => rows.filter((r) => r.id !== id);

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
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

const dos = (n) => String(n).padStart(2, '0');

// Hora actual en 24 h, 'HH:mm'.
export const horaAhora = (date = new Date()) => `${dos(date.getHours())}:${dos(date.getMinutes())}`;

// Máscara progresiva para un input de texto: solo dígitos (máx. 4) y ':' tras los 2 primeros.
export function formatearHora(texto) {
  const d = String(texto ?? '').replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
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

// Hitos de la cirugía en orden cronológico.
export const HITOS_TIEMPOS = [
  { key: 'ingresoSala', label: 'Ingreso a sala' },
  { key: 'inicioAnestesia', label: 'Inicio de anestesia' },
  { key: 'inicioCirugia', label: 'Inicio de cirugía' },
  { key: 'finCirugia', label: 'Fin de cirugía' },
  { key: 'salidaSala', label: 'Salida de sala' },
];

// Key del primer hito sin hora válida, o null si todos están registrados.
export function siguienteHito(tiempos) {
  const h = HITOS_TIEMPOS.find((x) => aMinutos(tiempos?.[x.key]) === null);
  return h ? h.key : null;
}

// Keys de hitos válidos cuya hora es menor a la del último hito válido previo.
export function hitosFueraDeOrden(tiempos) {
  const fuera = [];
  let previo = null;
  HITOS_TIEMPOS.forEach((h) => {
    const min = aMinutos(tiempos?.[h.key]);
    if (min === null) return;
    if (previo !== null && min < previo) fuera.push(h.key);
    previo = min;
  });
  return fuera;
}

export function duracionTexto(min) {
  if (min === null || min === undefined) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// ---------- Insumos y conteo ----------
export const devueltoInsumo = (i) => Math.max(n0(i.entregado) - n0(i.usado), 0);

// Conteo quirúrgico en 3 momentos: inicial, previo a cierre (opcional) y final.
export function conteoEstado({ inicial, previoCierre, final }) {
  const a = num(inicial);
  const b = num(final);
  if (a === null || b === null) return 'pendiente';
  const p = num(previoCierre);
  return a === b && (p === null || p === a) ? 'correcto' : 'discrepancia';
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

  if (!h.personal.some((p) => p.rol === 'Cirujano' && p.nombre.trim())) {
    err('personal', 'Registra al cirujano.');
  }

  if (h.insumos.some((i) => num(i.usado) === null)) {
    err('insumos', 'Hay insumos sin cantidad usada: concilia todos los insumos.');
  } else if (h.insumos.some((i) => !i.manual && n0(i.usado) > n0(i.entregado))) {
    err('insumos', 'Un insumo tiene más cantidad usada que entregada.');
  }

  if (h.implantes.some((i) => !i.invima.trim() || !i.lote.trim())) {
    err('implantes', 'Cada implante necesita registro INVIMA y lote.');
  }

  const estados = h.conteo.map((c) => conteoEstado(c));
  if (estados.includes('pendiente')) {
    err('conteo', 'Completa el conteo quirúrgico.');
  } else if (h.conteo.some((c, i) => estados[i] === 'discrepancia' && !(c.nota ?? '').trim())) {
    err('conteo', 'Documenta con una nota la discrepancia del conteo.');
  }

  [['circulante', 'del circulante'], ['instrumentadora', 'de la instrumentadora'], ['cirujano', 'del cirujano']].forEach(([clave, quien]) => {
    if (!h.firmas[clave]) err('firmas', `Falta la firma ${quien}.`);
  });

  return errores;
}

const SECCIONES_PROGRESO = ['tiempos', 'procedimientos', 'personal', 'insumos', 'implantes', 'conteo', 'firmas'];

// Progreso por sección verificable; los errores de anestesia cuentan contra tiempos.
export function progresoHoja(h) {
  const conError = new Set(validarCierre(h).map((e) => (e.seccion === 'anestesia' ? 'tiempos' : e.seccion)));
  const porSeccion = Object.fromEntries(SECCIONES_PROGRESO.map((s) => [s, !conError.has(s)]));
  return {
    completas: SECCIONES_PROGRESO.filter((s) => porSeccion[s]).length,
    total: SECCIONES_PROGRESO.length,
    porSeccion,
  };
}

// Resumen de conteos del registro (sin dinero).
export function resumenRegistro(h) {
  const estados = h.conteo.map((c) => conteoEstado(c));
  let conteo = 'correcto';
  if (estados.includes('discrepancia')) conteo = 'discrepancia';
  else if (estados.includes('pendiente')) conteo = 'pendiente';
  return {
    insumosItems: h.insumos.length,
    insumosUnidadesUsadas: h.insumos.reduce((t, i) => t + n0(i.usado), 0),
    insumosUnidadesDevueltas: h.insumos.reduce((t, i) => t + devueltoInsumo(i), 0),
    medicamentos: h.medicamentos.length,
    implantes: h.implantes.length,
    equipos: h.equipos.length,
    conteo,
    duraciones: duracionesHoja(h.tiempos),
  };
}

// PIN simulado: 4 dígitos. La verificación real depende de la autenticación del producto.
export const pinValido = (pin) => typeof pin === 'string' && /^\d{4}$/.test(pin);

export function cerrarHoja(hoja, ahoraISO) {
  const errores = validarCierre(hoja);
  if (errores.length > 0) return { ok: false, errores, hoja };
  return { ok: true, errores: [], hoja: { ...hoja, estado: 'cerrada', cerradaEn: ahoraISO } };
}

export function reabrirHoja(hoja, motivo, ahoraISO) {
  const m = (motivo ?? '').trim();
  if (!m) return { ok: false, error: 'Escribe el motivo de la reapertura.', hoja };
  return {
    ok: true,
    hoja: {
      ...hoja,
      estado: 'borrador',
      cerradaEn: null,
      firmas: { circulante: null, instrumentadora: null, cirujano: null },
      reaperturas: [...hoja.reaperturas, { motivo: m, en: ahoraISO }],
    },
  };
}

export const firmarHoja = (hoja, rol, ahoraISO) => ({ ...hoja, firmas: { ...hoja.firmas, [rol]: ahoraISO } });

// ---------- Construcción desde la cirugía ----------
// Datos de farmacia de un ítem de la canasta (sin id). Si no está entregado,
// entregado/usado quedan en 0 y la fila espera la entrega en Canastas.
function datosFarmaciaInsumo(cirugia, item) {
  const entregado = item.solicitudFarmacia === 'entregado' ? (item.recibido ?? item.cantidad) : 0;
  return { entregado, estadoFarmacia: estadoInsumo(cirugia, item) };
}

function filaInsumo(cirugia, item) {
  const { entregado, estadoFarmacia } = datosFarmaciaInsumo(cirugia, item);
  return {
    nombre: item.nombre,
    entregado,
    usado: entregado > 0 ? Math.max(entregado - cantidadDevuelta(cirugia, item.nombre), 0) : 0,
    manual: false,
    estadoFarmacia,
  };
}

// Tipo de anestesia, ASA y complejidad cargados en la programación (nivel
// superior del registro, o en el snapshot del asistente). '' si no hay.
export function anestesiaDeCirugia(cirugia) {
  const w = cirugia?.wizardDatos;
  return {
    tipo: cirugia?.tipoAnestesia ?? w?.tipoAnestesia ?? '',
    asa: cirugia?.asa ?? w?.asa ?? '',
    complejidad: cirugia?.complejidad ?? w?.complejidad ?? '',
  };
}

export function construirHojaInicial(cirugia) {
  const duracion = Math.max(minutosEntre(cirugia.horaInicio, cirugia.horaFin) ?? 0, 0);
  return {
    numero: `HG-${cirugia.id}`,
    programacionId: cirugia.id,
    estado: 'borrador',
    cerradaEn: null,
    reaperturas: [],
    admision: '',
    programado: { inicio: cirugia.horaInicio ?? '', fin: cirugia.horaFin ?? '' },
    tiempos: { ingresoSala: '', inicioAnestesia: '', inicioCirugia: '', finCirugia: '', salidaSala: '' },
    anestesia: anestesiaDeCirugia(cirugia),
    anestesiaProgramada: anestesiaDeCirugia(cirugia),
    procedimientos: cirugia.procedimientos.map((p, i) => ({
      id: `proc-${i}`, nombre: p.nombre, cups: '', via: 'unica', dxPre: '', dxPos: '',
    })),
    personal: cirugia.personal.map((p, i) => ({
      id: `per-${i}`, rol: p.rol, nombre: p.nombre, registro: '',
    })),
    insumos: cirugia.canasta.items.map((i, idx) => ({ id: `ins-${idx}`, ...filaInsumo(cirugia, i) })),
    medicamentos: (cirugia.farmacia?.medicamentos ?? []).map((m, i) => ({
      id: `med-${i}`, nombre: m.nombre, dosis: m.dosis ?? '', cantidad: 1,
    })),
    implantes: [],
    equipos: (cirugia.equipos ?? []).map((e, i) => ({
      id: `eq-${i}`, nombre: e.nombre, tipo: e.tipo ?? '', identificacion: e.identificacion ?? '', minutos: duracion,
    })),
    conteo: CONTEO_ITEMS.map((item, i) => ({
      id: `con-${i}`, item, inicial: '', previoCierre: '', final: '', nota: '', manual: false,
    })),
    observaciones: '',
    firmas: { circulante: null, instrumentadora: null, cirujano: null },
  };
}

// Refleja en una hoja ya creada lo que cambió en el detalle de la cirugía
// (personal, equipos, canasta). Solo agrega o actualiza datos de solo lectura;
// nunca quita ni pisa lo editado en la hoja. No muta; una hoja cerrada se devuelve igual.
export function sincronizarConCirugia(hoja, cirugia) {
  if (hoja.estado === 'cerrada') return hoja;

  const claves = new Set(hoja.personal.map((p) => `${p.rol}|${p.nombre}`));
  const personal = [...hoja.personal];
  (cirugia.personal ?? []).forEach((p) => {
    const k = `${p.rol}|${p.nombre}`;
    if (claves.has(k)) return;
    claves.add(k);
    personal.push({ id: nuevoId('per'), rol: p.rol, nombre: p.nombre, registro: '' });
  });

  const claveEquipo = (e) => e.identificacion || e.nombre;
  const equipos = hoja.equipos.map((e) => ({ ...e }));
  const duracion = Math.max(minutosEntre(cirugia.horaInicio, cirugia.horaFin) ?? 0, 0);
  (cirugia.equipos ?? []).forEach((e) => {
    const existente = equipos.find((x) => claveEquipo(x) === claveEquipo(e));
    if (existente) {
      if (!existente.tipo && e.tipo) existente.tipo = e.tipo;
      return;
    }
    equipos.push({
      id: nuevoId('eq'), nombre: e.nombre, tipo: e.tipo ?? '', identificacion: e.identificacion ?? '', minutos: duracion,
    });
  });

  const insumos = hoja.insumos.map((i) => ({ ...i }));
  cirugia.canasta.items.forEach((item) => {
    const fila = insumos.find((i) => !i.manual && i.nombre === item.nombre);
    if (fila) {
      Object.assign(fila, datosFarmaciaInsumo(cirugia, item));
    } else {
      insumos.push({ id: nuevoId('ins'), ...filaInsumo(cirugia, item) });
    }
  });

  // Anestesia: un campo vacío o igual a lo heredado la vez anterior sigue a la
  // programación; si la circulante lo cambió a otra cosa, se respeta.
  const programada = anestesiaDeCirugia(cirugia);
  const previa = hoja.anestesiaProgramada ?? {};
  const actual = hoja.anestesia ?? {};
  const anestesia = { ...actual };
  Object.keys(programada).forEach((campo) => {
    const valor = actual[campo] ?? '';
    if (valor === '' || valor === (previa[campo] ?? '')) anestesia[campo] = programada[campo];
  });

  return { ...hoja, personal, equipos, insumos, anestesia, anestesiaProgramada: programada };
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
