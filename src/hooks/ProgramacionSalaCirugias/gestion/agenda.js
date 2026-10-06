// Lógica pura de la agenda de salas del modal "Programar cirugía": 48 franjas
// de 30 min que cubren el día completo (índice 0 = 00:00). La "jornada" es solo
// una ventana de visualización sobre esas mismas franjas, así que cambiar de
// jornada no mueve ni recalcula nada. Sin React ni fecha del sistema. Los
// bloques ocupados salen de las cirugías reales de la agenda.

export const FRANJAS = 48;
export const MINUTOS_FRANJA = 30;

// Ventanas visibles [desde, hasta) en índices de franja. La operativa
// (07:00-19:00) es la misma jornada que usa el resumen de agenda de
// Programación para calcular la ocupación.
export const JORNADAS = {
  '24h': { desde: 0, hasta: FRANJAS, label: '24 horas' },
  operativa: { desde: 14, hasta: 38, label: 'Jornada operativa' },
};

const pad2 = (n) => String(n).padStart(2, '0');

export function horaFranja(indice) {
  const total = indice * MINUTOS_FRANJA;
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

// "HH:mm" -> índice de franja.
export const franjaDeHora = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return (h * 60 + m) / MINUTOS_FRANJA;
};

export const rangoLabel = (inicio, dur) => `${horaFranja(inicio)}–${horaFranja(inicio + dur)}`;

export function duracionLabel(dur) {
  const min = dur * MINUTOS_FRANJA;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

const ESTADOS_QUE_LIBERAN = ['cancelada', 'incumplida'];

// Bloques de una sala a partir de sus cirugías del día (las canceladas e
// incumplidas no ocupan). Una cirugía cuya hora de fin no es posterior a la de
// inicio (cruza la medianoche) se extiende hasta el final del día. Una sala en
// mantenimiento queda no disponible todo el día.
export function bloquesDeSala(cirugias, salaEnMantenimiento = false) {
  if (salaEnMantenimiento) {
    return [{
      inicio: 0, dur: FRANJAS, tipo: 'no-disponible', titulo: 'Sala en mantenimiento', cirujano: '',
    }];
  }
  return cirugias
    .filter((c) => !ESTADOS_QUE_LIBERAN.includes(c.estado))
    .map((c) => {
      const inicio = Math.floor(franjaDeHora(c.horaInicio));
      const finHora = Math.ceil(franjaDeHora(c.horaFin));
      const fin = finHora > inicio ? finHora : FRANJAS;
      return {
        inicio,
        dur: fin - inicio,
        tipo: 'ocupado',
        titulo: c.procedimientoPrincipal,
        cirujano: c.cirujano,
      };
    })
    .filter((b) => b.dur > 0);
}

export function mapaOcupado(bloques) {
  const mapa = Array(FRANJAS).fill(false);
  bloques.forEach((b) => {
    for (let i = b.inicio; i < Math.min(FRANJAS, b.inicio + b.dur); i += 1) mapa[i] = true;
  });
  return mapa;
}

export function cabe(mapa, inicio, dur) {
  if (inicio < 0 || inicio + dur > FRANJAS) return false;
  for (let i = inicio; i < inicio + dur; i += 1) if (mapa[i]) return false;
  return true;
}

// Primera franja de la sala donde entra una cirugía de `dur`, buscando solo
// dentro de la ventana; -1 si no hay.
export function primeraLibre(mapa, dur, ventana = JORNADAS['24h']) {
  for (let i = ventana.desde; i + dur <= ventana.hasta; i += 1) if (cabe(mapa, i, dur)) return i;
  return -1;
}

// Como primeraLibre, pero con la ventana de 24 h prefiere la jornada operativa
// (al reubicar, 00:00 no es un destino razonable si hay lugar a media mañana).
function primeraLibrePreferida(mapa, dur, ventana) {
  if (ventana === JORNADAS['24h']) {
    const operativa = primeraLibre(mapa, dur, JORNADAS.operativa);
    if (operativa !== -1) return operativa;
  }
  return primeraLibre(mapa, dur, ventana);
}

// Primera sala/franja libre. Una cirugía nueva se ubica primero dentro de la
// jornada operativa (nadie quiere arrancar a las 00:00 por defecto) y solo si
// ahí no hay espacio, en cualquier hora del día. null si ninguna.
export function ubicarEnPrimeraLibre(salas, dur) {
  for (const ventana of [JORNADAS.operativa, JORNADAS['24h']]) {
    for (const s of salas) {
      const inicio = primeraLibre(s.mapa, dur, ventana);
      if (inicio !== -1) return { colId: s.id, inicio };
    }
  }
  return null;
}

// Mantiene la selección si sigue cabiendo (otra fecha, otra duración); si no,
// la reubica en la primera franja libre de su sala y, de último, de cualquier
// sala. `ventana` limita dónde se busca; null si no hay espacio.
export function reubicar(salas, seleccion, dur, ventana = JORNADAS['24h']) {
  if (seleccion) {
    const sala = salas.find((s) => s.id === seleccion.colId);
    const dentro = seleccion.inicio >= ventana.desde && seleccion.inicio + dur <= ventana.hasta;
    if (sala && dentro && cabe(sala.mapa, seleccion.inicio, dur)) return seleccion;
    if (sala) {
      const libre = primeraLibrePreferida(sala.mapa, dur, ventana);
      if (libre !== -1) return { colId: sala.id, inicio: libre };
    }
  }
  if (ventana === JORNADAS['24h']) return ubicarEnPrimeraLibre(salas, dur);
  for (const s of salas) {
    const inicio = primeraLibre(s.mapa, dur, ventana);
    if (inicio !== -1) return { colId: s.id, inicio };
  }
  return null;
}

export const solapan = (a, b) => a.inicio < b.inicio + b.dur && b.inicio < a.inicio + a.dur;

// 'disponible' | 'cruce' según los rangos ocupados del recurso.
export function disponibilidad(ocupado, inicio, dur) {
  return ocupado.some((r) => solapan(r, { inicio, dur })) ? 'cruce' : 'disponible';
}
