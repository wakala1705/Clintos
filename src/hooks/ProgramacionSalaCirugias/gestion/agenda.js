// Lógica pura de la agenda de salas de "Programar cirugía": 16 franjas de 30
// min entre 07:00 y 15:00 (índice 0 = 07:00). Sin React ni fecha del sistema.

export const FRANJAS = 16;
export const MINUTOS_FRANJA = 30;
const INICIO_MIN = 7 * 60;

const pad2 = (n) => String(n).padStart(2, '0');

export function horaFranja(indice) {
  const total = INICIO_MIN + indice * MINUTOS_FRANJA;
  return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

export const rangoLabel = (inicio, dur) => `${horaFranja(inicio)}–${horaFranja(inicio + dur)}`;

export function duracionLabel(dur) {
  const min = dur * MINUTOS_FRANJA;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// Bloques de ejemplo por sala; el día los corre 0-2 franjas para que cambiar
// de fecha se note. tipo: ocupado | no-disponible.
const BASE = {
  s1: [
    {
      inicio: 2, dur: 4, tipo: 'ocupado', titulo: 'Colecistectomía laparoscópica', cirujano: 'Dr. Andrés Villamizar',
    },
    {
      inicio: 9, dur: 3, tipo: 'ocupado', titulo: 'Herniorrafia umbilical', cirujano: 'Dra. Marcela Echeverri',
    },
  ],
  s2: [
    {
      inicio: 0, dur: 3, tipo: 'ocupado', titulo: 'Artroscopia de rodilla', cirujano: 'Dr. Mauricio Salamanca',
    },
    {
      inicio: 5, dur: 2, tipo: 'no-disponible', titulo: 'Mantenimiento programado', cirujano: '',
    },
    {
      inicio: 10, dur: 4, tipo: 'ocupado', titulo: 'Cesárea programada', cirujano: 'Dra. Natalia Escobar',
    },
  ],
  s3: [
    {
      inicio: 3, dur: 5, tipo: 'ocupado', titulo: 'Facoemulsificación bilateral', cirujano: 'Dr. Ricardo Naranjo',
    },
    {
      inicio: 12, dur: 4, tipo: 'no-disponible', titulo: 'Limpieza profunda', cirujano: '',
    },
  ],
};

export function bloquesDeSala(salaId, fechaISO) {
  const dia = Number(fechaISO.slice(8, 10));
  const corrimiento = dia % 3;
  return (BASE[salaId] ?? [])
    .map((b) => ({ ...b, inicio: b.inicio + corrimiento }))
    .filter((b) => b.inicio + b.dur <= FRANJAS);
}

export function mapaOcupado(bloques) {
  const mapa = Array(FRANJAS).fill(false);
  bloques.forEach((b) => {
    for (let i = b.inicio; i < b.inicio + b.dur; i += 1) mapa[i] = true;
  });
  return mapa;
}

export function cabe(mapa, inicio, dur) {
  if (inicio < 0 || inicio + dur > FRANJAS) return false;
  for (let i = inicio; i < inicio + dur; i += 1) if (mapa[i]) return false;
  return true;
}

// Primera franja de la sala donde entra una cirugía de `dur`; -1 si no hay.
export function primeraLibre(mapa, dur) {
  for (let i = 0; i + dur <= FRANJAS; i += 1) if (cabe(mapa, i, dur)) return i;
  return -1;
}

// Al cambiar la duración: se queda donde está si cabe; si no, va a la primera
// franja libre de la misma sala; null si la sala no tiene espacio.
export function reubicar(mapa, inicio, nuevaDur) {
  if (cabe(mapa, inicio, nuevaDur)) return inicio;
  const libre = primeraLibre(mapa, nuevaDur);
  return libre === -1 ? null : libre;
}

export const solapan = (a, b) => a.inicio < b.inicio + b.dur && b.inicio < a.inicio + a.dur;

// 'disponible' | 'cruce' según los rangos ocupados del recurso.
export function disponibilidad(ocupado, inicio, dur) {
  return ocupado.some((r) => solapan(r, { inicio, dur })) ? 'cruce' : 'disponible';
}
