// Lógica pura de "Gestión de cirugías": evalúa la lista de chequeo previa a
// programar una cirugía y filtra el listado. Sin React ni fechas del sistema
// (los datos de ejemplo viven en mockSolicitudes.js).

// Orden fijo de los ítems evaluables. El paso 4 del checklist ("Estudios
// requeridos") agrupa `laboratorios` e `imagenes`.
export const ITEMS = ['orden', 'autorizacion', 'valoracion', 'laboratorios', 'imagenes'];

export const ITEM_LABEL = {
  orden: 'Orden médica',
  autorizacion: 'Autorización de la EPS',
  valoracion: 'Valoración preanestésica',
  laboratorios: 'Laboratorios',
  imagenes: 'Estudios de imágenes',
};

export const ESTADO_ITEM_LABEL = {
  ok: 'Completo',
  pendiente: 'Pendiente',
  rechazada: 'Rechazada',
  vencida: 'Vencida',
  'no-requerido': 'No requerido',
};

export const ESTADO_GENERAL_LABEL = {
  lista: 'Lista para programar',
  pendientes: 'Con pendientes',
  bloqueada: 'Bloqueada',
};

const esBloqueante = (item) => item.estado === 'rechazada' || item.estado === 'vencida';

// Un estudio "no requerido" nunca cuenta como obligatorio, aunque el dato
// llegue mal marcado.
const esObligatorio = (item) => item.obligatorio && item.estado !== 'no-requerido';

// Estado de una solicitud:
//   bloqueada  -> algún ítem rechazado o vencido (prima sobre lo demás)
//   lista      -> todos los obligatorios en 'ok'
//   pendientes -> falta al menos un obligatorio
// `faltantes` lista cada obligatorio no completo (para el mensaje del pie del
// panel); un opcional pendiente no bloquea ni se cuenta.
export function evaluarSolicitud(solicitud) {
  const items = ITEMS.map((key) => ({ key, ...solicitud.checklist[key] }));
  const obligatorios = items.filter(esObligatorio);
  const completos = obligatorios.filter((i) => i.estado === 'ok');
  const faltantes = obligatorios.filter((i) => i.estado !== 'ok');
  const bloqueados = items.filter(esBloqueante);

  let estado = 'pendientes';
  if (bloqueados.length > 0) estado = 'bloqueada';
  else if (faltantes.length === 0) estado = 'lista';

  const total = obligatorios.length;
  return {
    estado,
    completos: completos.length,
    total,
    porcentaje: total === 0 ? 100 : Math.round((completos.length / total) * 100),
    faltantes,
    bloqueados,
    opcionalesPendientes: items.filter((i) => !esObligatorio(i) && i.estado === 'pendiente'),
  };
}

// ("CC", "1.020.345.817") -> "CC ••••5817": solo se ve el final del documento.
export function enmascararDocumento(tipo, numero) {
  const digitos = String(numero).replace(/\D/g, '');
  return `${tipo} ••••${digitos.slice(-4)}`;
}

const normalizar = (s) => String(s ?? '')
  .normalize('NFD')
  .replace(/\p{M}/gu, '')
  .toLowerCase()
  .trim();

// Filtros: busqueda (paciente, documento o procedimiento), origen, eps,
// especialidad y el estado general. Con `ignorarEstado` se
// obtiene la base sobre la que se cuentan los indicadores.
export function filtrarSolicitudes(solicitudes, filtros, { ignorarEstado = false } = {}) {
  const q = normalizar(filtros.busqueda);
  return solicitudes.filter((s) => {
    if (filtros.eps && s.eps !== filtros.eps) return false;
    if (filtros.especialidad && s.especialidad !== filtros.especialidad) return false;
    if (filtros.origen && s.origen !== filtros.origen) return false;
    if (q) {
      const doc = String(s.paciente.numeroDocumento).replace(/\D/g, '');
      const hay = [s.paciente.nombre, doc, s.procedimiento].some((t) => normalizar(t).includes(q));
      if (!hay) return false;
    }
    if (!ignorarEstado && filtros.estado !== 'todas') {
      if (evaluarSolicitud(s).estado !== filtros.estado) return false;
    }
    return true;
  });
}

// Orden de la lista de Gestión de cirugías: 1) prioritarias primero, 2) dentro
// de cada grupo, diagnóstico de primera vez primero. Sort estable: a igual
// prioridad se conserva el orden original. No muta el arreglo recibido.
export function ordenarPorPrioridad(solicitudes) {
  const peso = (s) => (s.prioritaria ? 2 : 0) + (s.primeraVez ? 1 : 0);
  return [...solicitudes].sort((a, b) => peso(b) - peso(a));
}

export function contarPorEstado(solicitudes) {
  const conteo = {
    todas: solicitudes.length, lista: 0, pendientes: 0, bloqueada: 0,
  };
  solicitudes.forEach((s) => { conteo[evaluarSolicitud(s).estado] += 1; });
  return conteo;
}

// Texto del pie del panel cuando no se puede programar.
export function mensajeFaltantes(evaluacion) {
  const lista = evaluacion.faltantes.map((i) => {
    const estado = ESTADO_ITEM_LABEL[i.estado].toLowerCase();
    return `${ITEM_LABEL[i.key]} (${estado})`;
  });
  return `Para programar falta: ${lista.join(', ')}.`;
}

// Tono clinical-status de cada estado (ver tokens --clinical-status-* en
// ProgramacionSalaCirugias.css).
export const TONO_ITEM = {
  ok: 'complete',
  pendiente: 'pending',
  rechazada: 'rejected',
  vencida: 'rejected',
  'no-requerido': 'notrequired',
};

export const TONO_GENERAL = {
  lista: 'complete',
  pendientes: 'pending',
  bloqueada: 'rejected',
};

// Estado resumido del paso 4 "Estudios requeridos" a partir de sus dos
// subítems: un rechazo/vencimiento prima, luego pendiente, luego completo.
export function estadoEstudios(checklist) {
  const subitems = [checklist.laboratorios, checklist.imagenes];
  const activos = subitems.filter((i) => i.estado !== 'no-requerido');
  if (activos.length === 0) return 'no-requerido';
  const bloqueante = activos.find(esBloqueante);
  if (bloqueante) return bloqueante.estado;
  return activos.some((i) => i.estado === 'pendiente') ? 'pendiente' : 'ok';
}

// Acción contextual de cada ítem del panel, según su estado. null = sin acción.
export function accionItem(key, estado) {
  if (estado === 'no-requerido') return null;
  const completo = estado === 'ok';
  switch (key) {
    case 'orden':
      return completo ? 'Ver orden' : 'Registrar orden médica';
    case 'autorizacion':
      if (completo) return 'Ver autorización';
      return estado === 'pendiente' ? 'Solicitar autorización' : 'Solicitar renovación';
    case 'valoracion':
      return completo ? 'Ver valoración' : 'Registrar valoración';
    default:
      return completo ? 'Ver resultados' : 'Adjuntar resultados';
  }
}
