import { cantidadDevuelta } from '../mockCirugiaData.js';

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

export function duracionTexto(min) {
  if (min === null || min === undefined) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// ---------- Insumos y conteo ----------
export const devueltoInsumo = (i) => Math.max(n0(i.entregado) - n0(i.usado), 0);

export const insumosPorConciliar = (insumos) => insumos.filter((i) => i.conciliado === false).length;
export const conciliarTodos = (insumos) => insumos.map((i) => ({ ...i, conciliado: true }));
// 'todo': se usó todo lo entregado; 'nada': no se usó nada. Ambos concilian la fila.
export const marcarInsumo = (insumo, modo) => ({
  ...insumo,
  usado: modo === 'todo' ? n0(insumo.entregado) : 0,
  conciliado: true,
});

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
  } else if (insumosPorConciliar(h.insumos) > 0) {
    err('insumos', `Concilia los insumos entregados (${insumosPorConciliar(h.insumos)} por conciliar).`);
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
    anestesia: { tipo: '', asa: '', complejidad: '' },
    procedimientos: cirugia.procedimientos.map((p, i) => ({
      id: `proc-${i}`, nombre: p.nombre, cups: '', via: 'unica', dxPre: '', dxPos: '',
    })),
    personal: cirugia.personal.map((p, i) => ({
      id: `per-${i}`, rol: p.rol, nombre: p.nombre, registro: '',
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
          lote: '',
          conciliado: false,
          manual: false,
        };
      }),
    medicamentos: (cirugia.farmacia?.medicamentos ?? []).map((m, i) => ({
      id: `med-${i}`, nombre: m.nombre, dosis: m.dosis ?? '', cantidad: 1,
    })),
    implantes: [],
    equipos: (cirugia.equipos ?? []).map((e, i) => ({
      id: `eq-${i}`, nombre: e.nombre, identificacion: e.identificacion ?? '', minutos: duracion,
    })),
    conteo: CONTEO_ITEMS.map((item, i) => ({
      id: `con-${i}`, item, inicial: '', previoCierre: '', final: '', nota: '', manual: false,
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
