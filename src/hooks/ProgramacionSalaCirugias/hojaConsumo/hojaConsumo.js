// Hoja de consumo · Centro quirúrgico: material entregado por el paquete, consumido y
// devuelto en una cirugía. Lógica pura (sin JSX) + store en memoria por programación
// (sin backend, mismo criterio que tenía la hoja de gasto anterior).

// Paquetes con código propio. Una cirugía cuyo paquete (`canasta.nombre`) no está acá usa los
// ítems de su canasta tal cual. `receta: true` = el material se factura contra receta médica.
export const PAQUETES = {
  'Colecistectomía estándar': {
    codigo: 'COLE-LAP',
    materiales: [
      { nombre: 'Jeringa 20 cc', cantidad: 1 },
      { nombre: 'Jeringa 10 cc', cantidad: 1 },
      { nombre: 'Guantes # 6.5', cantidad: 2 },
      { nombre: 'Guantes # 7', cantidad: 2 },
      { nombre: 'Guantes # 7.5', cantidad: 4 },
      { nombre: 'Guantes # 8', cantidad: 2 },
      { nombre: 'Aguja peridural # 18', cantidad: 1 },
      { nombre: 'Dren Pen Ross 1/2', cantidad: 2 },
      { nombre: 'Bisturí # 15', cantidad: 1 },
      { nombre: 'Clips quirúrgico', cantidad: 6, receta: true },
      { nombre: 'Sutura Vicryl # 0', cantidad: 1 },
      { nombre: 'Sutura Vicryl # 1', cantidad: 1 },
      { nombre: 'Sutura Nylon # 3/0', cantidad: 1 },
    ],
  },
};

let secuencia = 0;
const nuevoId = (prefijo) => {
  secuencia += 1;
  return `${prefijo}-${secuencia}`;
};

// Paquete de la cirugía: { nombre, materiales: [{ nombre, cantidad, receta? }] }.
export function paqueteDeCirugia(cirugia) {
  const nombreCanasta = cirugia?.canasta?.nombre ?? '';
  const conocido = PAQUETES[nombreCanasta];
  if (conocido) return { nombre: conocido.codigo, materiales: conocido.materiales };
  return {
    nombre: nombreCanasta || 'Sin paquete',
    materiales: (cirugia?.canasta?.items ?? []).map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, receta: Boolean(i.receta) })),
  };
}

const rolDe = (cirugia, rol) => cirugia?.personal?.find((p) => p.rol === rol)?.nombre ?? '';

export function construirHojaConsumo(cirugia) {
  return {
    programacionId: cirugia.id,
    estado: 'borrador',
    tipo: cirugia.tipoCirugia === 'Urgencia' ? 'emergencia' : 'programado',
    equipo: {
      anestesiologo: rolDe(cirugia, 'Anestesiólogo'),
      cirujano: rolDe(cirugia, 'Cirujano'),
      ayudante: rolDe(cirugia, 'Ayudante'),
      instrumentista: rolDe(cirugia, 'Instrumentadora'),
      circulante: rolDe(cirugia, 'Circulante'),
    },
    tiempos: { inicioAnest: '', inicioOperac: '', termOperac: '' },
    materiales: paqueteDeCirugia(cirugia).materiales.map((m) => ({
      id: nuevoId('mat'),
      nombre: m.nombre,
      entregado: String(m.cantidad),
      consumido: '',
      receta: Boolean(m.receta),
      manual: false,
    })),
  };
}

export const materialManual = () => ({
  id: nuevoId('mat'), nombre: '', entregado: '1', consumido: '', receta: false, manual: true,
});

// '' (sin dato) -> null; el resto -> número (NaN si no es numérico).
const aNumero = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

// Devuelto = entregado − consumido. Null mientras no haya consumo digitado, si algo no es válido
// o si el consumo supera lo entregado (esa fila es un error, no un devuelto negativo).
export function calcularDevuelto(m) {
  const consumido = aNumero(m.consumido);
  const entregado = aNumero(m.entregado);
  if (consumido === null || entregado === null || Number.isNaN(consumido) || Number.isNaN(entregado)) return null;
  return consumido > entregado ? null : entregado - consumido;
}

export const excedeEntregado = (m) => {
  const consumido = aNumero(m.consumido);
  const entregado = aNumero(m.entregado);
  return consumido !== null && entregado !== null && consumido > entregado;
};

export const materialesConExceso = (materiales) => materiales.filter(excedeEntregado);

// Atajo "Todo consumido": consumido = entregado en cada material con una cantidad entregada válida.
export const marcarTodoConsumido = (materiales) => materiales.map((m) => {
  const entregado = aNumero(m.entregado);
  return entregado === null || Number.isNaN(entregado) || entregado < 0 ? m : { ...m, consumido: String(entregado) };
});

// Stepper de consumo: siguiente valor (como texto) al sumar o restar 1, entre 0 y `max`
// (`max` null = sin tope). Un valor vacío cuenta como 0.
export function pasoConsumo(valor, delta, max = null) {
  const actual = aNumero(valor);
  const base = actual === null || Number.isNaN(actual) ? 0 : actual;
  const tope = max === null || max === undefined || Number.isNaN(Number(max)) ? Infinity : Number(max);
  return String(Math.min(Math.max(base + delta, 0), tope));
}

// Materiales con un consumo válido digitado (incluye 0): numérico, ≥ 0 y sin exceder lo entregado.
export const materialesConConsumo = (materiales) => materiales.filter((m) => {
  const consumido = aNumero(m.consumido);
  return consumido !== null && !Number.isNaN(consumido) && consumido >= 0 && !excedeEntregado(m);
});

// Todos los materiales tienen consumo registrado y ninguno excede lo entregado.
export const consumoCompleto = (materiales) => (
  materiales.length > 0 && materialesConConsumo(materiales).length === materiales.length
);

export function totales(materiales) {
  const suma = (valores) => valores.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
  return {
    items: materiales.length,
    entregado: suma(materiales.map((m) => aNumero(m.entregado))),
    consumido: suma(materiales.map((m) => aNumero(m.consumido))),
    devuelto: suma(materiales.map(calcularDevuelto)),
  };
}

// "K359 - APENDICITIS AGUDA" -> { codigo: 'K359', descripcion: 'APENDICITIS AGUDA' }.
// Sin código reconocible el texto va entero como descripción.
export function dxDeIngreso(texto) {
  const t = (texto ?? '').trim();
  if (!t) return { codigo: '—', descripcion: '—' };
  const m = t.match(/^([A-Z]\d[A-Z0-9.]*)\s*-\s*(.+)$/i);
  return m ? { codigo: m[1].toUpperCase(), descripcion: m[2] } : { codigo: '—', descripcion: t };
}

// 'CC 52.123.456' / '52123456' -> '52.123.456' (puntos de mil). Sin dígitos: '—'.
export function formatearMiles(texto) {
  const digitos = String(texto ?? '').replace(/\D/g, '');
  return digitos ? digitos.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '—';
}

// 'YYYY-MM-DD' -> 'DD/MM/AAAA'.
export function fechaDDMMAAAA(iso) {
  const [y, m, d] = String(iso ?? '').split('-');
  return y && m && d ? `${d}/${m}/${y}` : '—';
}

// ---------- Store en memoria ----------
const hojasGuardadas = new Map();
export const obtenerHojaConsumo = (programacionId) => {
  const h = hojasGuardadas.get(programacionId);
  return h ? structuredClone(h) : null;
};
export const guardarHojaConsumo = (hoja) => {
  hojasGuardadas.set(hoja.programacionId, structuredClone(hoja));
};

// Registra un tiempo de la cirugía real en su hoja (la crea como borrador si aún
// no existe): al iniciar -> 'inicioOperac'; al finalizar -> 'termOperac'.
export function registrarTiempoEnHoja(cirugia, clave, hora) {
  const hoja = obtenerHojaConsumo(cirugia.id) ?? construirHojaConsumo(cirugia);
  guardarHojaConsumo({ ...hoja, tiempos: { ...hoja.tiempos, [clave]: hora } });
}

// ---------- Tiempo transcurrido de la operación ----------

// 'HH:mm' -> segundos desde medianoche.
export function horaASegundos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return (h * 60 + m) * 60;
}

// Segundos entre el inicio de cirugía y su fin; sin fin, hasta `ahoraSeg` (segundos desde
// medianoche, el reloj de la pantalla). null sin inicio; negativo si el fin es anterior al inicio.
export function segundosTranscurridos(inicio, fin, ahoraSeg) {
  if (!inicio) return null;
  return (fin ? horaASegundos(fin) : ahoraSeg) - horaASegundos(inicio);
}

const dos = (n) => String(n).padStart(2, '0');

// 2415 -> '00:40:15' (reloj en vivo).
export function formatoReloj(seg) {
  const s = Math.max(0, Math.floor(seg));
  return `${dos(Math.floor(s / 3600))}:${dos(Math.floor((s % 3600) / 60))}:${dos(s % 60)}`;
}

// 3900 -> '1 h 05 min'; 2400 -> '40 min' (duración ya cerrada o estimada).
export function formatoDuracionMin(seg) {
  const min = Math.round(Math.max(0, seg) / 60);
  const h = Math.floor(min / 60);
  return h > 0 ? `${h} h ${dos(min % 60)} min` : `${min} min`;
}

// Minutos entre dos 'HH:mm' (p. ej. la duración estimada de la programación).
export const minutosEntreHoras = (inicio, fin) => (horaASegundos(fin) - horaASegundos(inicio)) / 60;
