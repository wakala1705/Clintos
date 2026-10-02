// Lógica pura del "Tablero de cirugías del día" (coordinación): agrupar por
// sala, minutos ocupados y KPIs. Sin React ni acceso al mock, para poder
// probarla aislada (ver __tests__/tablero.test.mjs).

// "Retrasada" no es un estado de la cirugía: es una programada/urgencia cuya
// hora de inicio ya pasó y que sigue sin cerrarse (realizada/cancelada/
// incumplida). Solo tiene sentido para el día de hoy.
const ESTADOS_ABIERTOS = ['programada', 'urgencia'];

function minutosDe(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function minutosCirugia(cirugia) {
  return minutosDe(cirugia.horaFin) - minutosDe(cirugia.horaInicio);
}

export function esRetrasada(cirugia, ahora) {
  if (!ESTADOS_ABIERTOS.includes(cirugia.estado)) return false;
  const [y, mo, d] = cirugia.fecha.split('-').map(Number);
  const [h, m] = cirugia.horaInicio.split(':').map(Number);
  return new Date(y, mo - 1, d, h, m) <= ahora;
}

// "3h 30m" / "45m" / "0m".
export function minutosLabel(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Una entrada por sala (en el orden recibido), con sus cirugías ordenadas por
// hora de inicio. Las canceladas siguen visibles en la columna pero no suman
// a `minutosOcupados` (no ocupan quirófano), mismo criterio que resumenAgenda.
export function agruparPorSala(cirugias, salas) {
  return salas.map((sala) => {
    const delasala = cirugias
      .filter((c) => c.salaId === sala.value)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    const minutosOcupados = delasala
      .filter((c) => c.estado !== 'cancelada')
      .reduce((acc, c) => acc + minutosCirugia(c), 0);
    return { sala, cirugias: delasala, minutosOcupados };
  });
}

// `ahora` solo se pasa cuando el día mostrado es hoy; sin él, retrasadas = 0.
export function kpisDelDia(cirugias, ahora) {
  const cuenta = (estado) => cirugias.filter((c) => c.estado === estado).length;
  return {
    total: cirugias.length,
    programadas: cuenta('programada'),
    urgencias: cuenta('urgencia'),
    realizadas: cuenta('realizada'),
    canceladas: cuenta('cancelada') + cuenta('incumplida'),
    retrasadas: ahora ? cirugias.filter((c) => esRetrasada(c, ahora)).length : 0,
  };
}
