// Lógica pura de la vista "Por estado" del Tablero del día: las etapas por las
// que pasa una cirugía el día de su realización (ver `etapa` en
// mockCirugiaData.js) y las reglas de movimiento entre ellas. `etapa` es un
// campo aparte de `estado` (programada/urgencia/realizada/cancelada/
// incumplida), que describe el ciclo de la agenda, no dónde está el paciente.
// Sin React ni acceso al mock, para probarla aislada (ver __tests__/etapas.test.mjs).

export const ETAPAS = [
  { id: 'programada', label: 'Programada' },
  // Oculta del tablero por ahora (hay 6 columnas, no 7): llegar al hospital ya
  // queda implícito al pasar a "En preparación". Poner `oculta: false` la reactiva.
  { id: 'admitido', label: 'Admitido', oculta: true },
  { id: 'en-preparacion', label: 'En preparación' },
  { id: 'en-quirofano', label: 'En quirófano' },
  { id: 'finalizado', label: 'Finalizado' },
  { id: 'en-recuperacion', label: 'En recuperación' },
  { id: 'derivado', label: 'Derivación' },
];

export const ETAPA_IDS = ETAPAS.map((e) => e.id);
// Las que realmente se muestran y a las que se puede mover una cirugía.
export const ETAPAS_VISIBLES = ETAPAS.filter((e) => !e.oculta);
export const ETAPA_LABEL = Object.fromEntries(ETAPAS.map((e) => [e.id, e.label]));

// Destinos de la derivación al terminar la recuperación.
export const DESTINOS_DERIVACION = [
  { value: 'alta', label: 'Alta' },
  { value: 'uci', label: 'UCI' },
  { value: 'hospitalizacion', label: 'Hospitalización' },
];
export const DERIVACION_LABEL = Object.fromEntries(DESTINOS_DERIVACION.map((d) => [d.value, d.label]));

// Canceladas e incumplidas no están en el flujo del día: no aparecen en el tablero.
const ESTADOS_FUERA = ['cancelada', 'incumplida'];

export function enTableroPorEstado(cirugia) {
  return !ESTADOS_FUERA.includes(cirugia.estado);
}

// Etapa de una cirugía. Sin `etapa` guardada se deduce de lo que ya se sabe:
// realizada -> finalizado, con hora real de inicio -> en quirófano, el resto
// sigue "programada".
export function etapaDe(cirugia) {
  // Una etapa oculta no tiene columna: sus cirugías caen en "programada".
  if (ETAPAS_VISIBLES.some((e) => e.id === cirugia.etapa)) return cirugia.etapa;
  if (cirugia.estado === 'realizada') return 'finalizado';
  if (cirugia.horaInicioReal) return 'en-quirofano';
  return 'programada';
}

// Una entrada por etapa (en orden), con sus cirugías por fecha y hora de inicio.
export function agruparPorEtapa(cirugias) {
  const visibles = cirugias.filter(enTableroPorEstado);
  return ETAPAS_VISIBLES.map((etapa) => ({
    etapa,
    cirugias: visibles
      .filter((c) => etapaDe(c) === etapa.id)
      .sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? '') || a.horaInicio.localeCompare(b.horaInicio)),
  }));
}

// Qué hacer al soltar una tarjeta en `destino`. El movimiento es manual y
// libre (adelante o atrás, para corregir errores) salvo donde hay un dato
// real que registrar:
//   'ninguno'   -> ya está en esa etapa
//   'directo'   -> solo cambia la etapa
//   'iniciar'   -> abre "Iniciar cirugía" (hora real de inicio)
//   'finalizar' -> abre "Finalizar cirugía" (hora real de fin)
//   'derivar'   -> pide el destino de la derivación
//   'bloqueado' -> no se puede (`motivo`)
export function resolverMovimiento(cirugia, destino) {
  if (!ETAPAS_VISIBLES.some((e) => e.id === destino)) return { tipo: 'bloqueado', motivo: 'Etapa no válida.' };
  if (!enTableroPorEstado(cirugia)) return { tipo: 'bloqueado', motivo: 'La cirugía está cancelada o incumplida.' };
  if (etapaDe(cirugia) === destino) return { tipo: 'ninguno' };
  if (destino === 'derivado') return { tipo: 'derivar' };
  const realizada = cirugia.estado === 'realizada';
  if (destino === 'en-quirofano' && !cirugia.horaInicioReal && !realizada) return { tipo: 'iniciar' };
  if (destino === 'finalizado' && !realizada) {
    if (cirugia.horaInicioReal) return { tipo: 'finalizar' };
    return {
      tipo: 'bloqueado',
      motivo: 'Para finalizar la cirugía primero debe iniciarse: muévela a "En quirófano".',
    };
  }
  return { tipo: 'directo' };
}
