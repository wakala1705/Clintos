// Lógica pura de "Revisión de programaciones vencidas" (ver spec
// 2026-09-25-revision-programaciones-vencidas-design.md): cirugías en estado
// 'programada' con fecha anterior a hoy. Sin imports a propósito -- ni
// siquiera de mockCirugiaData.js -- para poder verificarla con `node` suelto
// y para que el mock no dependa de la pantalla.

// `prioridad` define el orden por defecto del listado: primero lo más costoso
// de dejar abierto (insumos pedidos que nadie usó ni devolvió).
export const INCONSISTENCIAS = {
  insumos: {
    id: 'insumos', label: 'Insumos comprometidos', hint: 'Pedido de insumos sin traslado a cirugía', tone: 'danger', prioridad: 0,
  },
  trasladado: {
    id: 'trasladado', label: 'Trasladado sin cierre', hint: 'Paciente trasladado, falta cerrar la programación', tone: 'info', prioridad: 1,
  },
  'sin-actividad': {
    id: 'sin-actividad', label: 'Sin actividad', hint: 'Sin pedido ni traslado registrados', tone: 'neutral', prioridad: 2,
  },
};

export const INCONSISTENCIA_ORDEN = ['insumos', 'trasladado', 'sin-actividad'];

// Se evalúa en orden, gana la primera regla que cumple: un traslado implica
// que el paciente llegó a cirugía aunque también tenga pedido de insumos.
export function clasificarInconsistencia(cirugia) {
  if (cirugia.traslado) return 'trasladado';
  if (cirugia.farmacia?.numeroPedido) return 'insumos';
  return 'sin-actividad';
}

export function contarPorTipo(cirugias) {
  const conteo = {
    total: cirugias.length, insumos: 0, trasladado: 0, 'sin-actividad': 0,
  };
  cirugias.forEach((c) => { conteo[clasificarInconsistencia(c)] += 1; });
  return conteo;
}

export function filtrarVencidas(cirugias, {
  tipo = 'todas', salaId = 'todas', busqueda = '', desde = '', hasta = '',
}) {
  const q = busqueda.trim().toLowerCase();
  return cirugias.filter((c) => {
    if (tipo !== 'todas' && clasificarInconsistencia(c) !== tipo) return false;
    if (salaId !== 'todas' && c.salaId !== salaId) return false;
    if (desde && c.fecha < desde) return false;
    if (hasta && c.fecha > hasta) return false;
    if (q) {
      const texto = [c.paciente.nombre, c.paciente.documento, c.numeroProgramacion ?? c.id, c.consecutivo ?? '']
        .join(' ').toLowerCase();
      if (!texto.includes(q)) return false;
    }
    return true;
  });
}

function minutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

// Módulo 1440: una cirugía que cruza la medianoche (calcularHoraFin en el mock
// rueda de día con % 1440, así que horaFin puede ser menor que horaInicio)
// igual da una duración positiva.
export function duracionMin(cirugia) {
  return (minutos(cirugia.horaFin) - minutos(cirugia.horaInicio) + 1440) % 1440;
}

const COMPARADORES = {
  inconsistencia: (a, b) => INCONSISTENCIAS[clasificarInconsistencia(a)].prioridad
    - INCONSISTENCIAS[clasificarInconsistencia(b)].prioridad,
  paciente: (a, b) => a.paciente.nombre.localeCompare(b.paciente.nombre, 'es'),
  fecha: (a, b) => `${a.fecha}T${a.horaInicio}`.localeCompare(`${b.fecha}T${b.horaInicio}`),
  sala: (a, b) => a.salaId.localeCompare(b.salaId, 'es'),
  duracion: (a, b) => duracionMin(a) - duracionMin(b),
};

// `orden` null = orden por defecto del spec (prioridad de tipo, luego la más
// antigua primero). Con columna elegida, la fecha desempata.
export function ordenarVencidas(cirugias, orden) {
  const copia = [...cirugias];
  if (!orden) {
    return copia.sort((a, b) => COMPARADORES.inconsistencia(a, b) || COMPARADORES.fecha(a, b));
  }
  const signo = orden.direccion === 'desc' ? -1 : 1;
  return copia.sort((a, b) => signo * COMPARADORES[orden.columna](a, b) || COMPARADORES.fecha(a, b));
}

export function antiguedadLabel(fechaISO, hoyISO) {
  const dias = Math.round((new Date(`${hoyISO}T00:00:00`) - new Date(`${fechaISO}T00:00:00`)) / 86400000);
  if (dias < 1) return 'vencida hoy';
  if (dias === 1) return 'vencida hace 1 día';
  if (dias < 30) return `vencida hace ${dias} días`;
  if (dias < 365) {
    const meses = Math.floor(dias / 30);
    return meses === 1 ? 'vencida hace 1 mes' : `vencida hace ${meses} meses`;
  }
  const anios = Math.floor(dias / 365);
  return anios === 1 ? 'vencida hace 1 año' : `vencida hace ${anios} años`;
}

export function paginar(items, pagina, porPagina) {
  const inicio = (pagina - 1) * porPagina;
  return items.slice(inicio, inicio + porPagina);
}
