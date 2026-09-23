// Motor mock de Clintos AI para Historia Clínica - Hospitalización. No hay
// backend de IA real: `answerPrompt` reconoce el texto exacto de las 4
// sugerencias + 6 preguntas frecuentes (ver suggestions.js) contra los datos
// reales del piso (`context.pacientes`, ya recortado por el filtro de área
// activo) y devuelve una respuesta tipada. Texto libre que no matchea nunca
// inventa un dato — cae al fallback honesto, acorde al aviso de
// "Clintos AI puede cometer errores" del footer del panel.
//
// Separación CONSULTAR/RESUMIR/EXPLICAR/BUSCAR (kind 'text'/'patient-list'/
// 'patient-summary'/'nav-options', nunca requieren confirmación) vs
// CREAR/EJECUTAR (kind 'confirm-action', pasa por preview + confirmación del
// usuario antes de "aplicarse") — ver AGENTS.md/brief "Comportamiento del
// agente": nunca se ejecuta una acción clínica sola.
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

function includesAll(haystack, ...needles) {
  return needles.every((n) => haystack.includes(n));
}

function includesAny(haystack, ...needles) {
  return needles.some((n) => haystack.includes(n));
}

// "María Fernanda González Restrepo" -> fragmento por el que alguien la
// nombraría de forma natural: primer nombre + primer apellido (misma regla
// que `iniciales()` en mockHospitalizadosData.js para nombres de 4 palabras).
function nombreCorto(paciente) {
  const palabras = normalize(paciente).split(' ').filter(Boolean);
  if (palabras.length >= 4) return `${palabras[0]} ${palabras[2]}`;
  return palabras.slice(0, 2).join(' ');
}

function matchPatientByName(promptNorm, pacientes) {
  return pacientes.find((p) => {
    // Nombre completo primero: cubre el prompt sintético "Resumen de <nombre
    // completo>" que dispara PatientResultList al hacer click en una fila
    // (ver ClintosAIPanel.handleSelectPatient) — ahí el nombre corto
    // (nombre+apellido) no queda contiguo dentro del nombre de 4 palabras.
    const full = normalize(p.paciente);
    if (full.length > 4 && promptNorm.includes(full)) return true;
    const corto = nombreCorto(p.paciente);
    return corto.length > 4 && promptNorm.includes(corto);
  });
}

function diasLabel(p) {
  return `${p.diasEstancia} ${p.diasEstancia === 1 ? 'día' : 'días'} hospitalizado${p.diasEstancia === 1 ? '' : 's'}`;
}

function patientListPayload(intro, pacientes, metaFn, followUp = '¿Quieres ver el detalle de alguno?') {
  return {
    kind: 'patient-list',
    intro,
    items: pacientes.map((p) => ({
      id: p.id, nombre: p.paciente, cama: p.cama, meta: metaFn(p),
    })),
    followUp,
  };
}

function buildSummary(p) {
  const pendientesTexto = p.pendientes.length === 0
    ? ['Sin pendientes clínicos']
    : p.pendientes.map((x) => `${x.tipoLabel}${x.detalle ? ` — ${x.detalle}` : ''}`);
  return {
    kind: 'patient-summary',
    pacienteId: p.id,
    nombre: p.paciente,
    estado: 'Hospitalizada',
    diagnostico: p.diagnostico,
    resumen: `${p.paciente.split(' ')[0]} lleva ${diasLabel(p)} en la cama ${p.cama} por ${p.diagnostico.toLowerCase()}. `
      + (p.evolucionPendiente ? 'Aún no tiene la nota de evolución del día registrada. ' : 'La evolución del día ya está registrada. ')
      + (p.resultadosCriticos > 0 ? 'Tiene resultados críticos sin revisar que conviene priorizar.' : 'No tiene resultados críticos pendientes.'),
    pendientes: pendientesTexto,
    fuentes: ['Evolución médica', 'Evolución de enfermería', 'Órdenes médicas', 'Resultados'],
  };
}

function confirmEvolucionesPayload(pendientes) {
  return {
    kind: 'confirm-action',
    title: 'Crear borradores de nota de evolución',
    description: `Voy a crear un borrador de nota de evolución para ${pendientes.length === 1 ? 'este paciente' : `estos ${pendientes.length} pacientes`}. Vas a poder revisar y editar cada borrador antes de firmarlo — no queda nada guardado en la historia hasta que lo confirmes ahí.`,
    items: pendientes.map((p) => ({ id: p.id, nombre: p.paciente, cama: p.cama })),
    confirmLabel: 'Crear borradores',
    cancelLabel: 'Cancelar',
  };
}

export function confirmResultPayload(count) {
  return {
    kind: 'text',
    tone: 'success',
    text: `Listo. Quedaron ${count} ${count === 1 ? 'borrador creado' : 'borradores creados'}. Puedes revisarlos y firmarlos desde la historia de cada paciente.`,
  };
}

const NAV_OPTIONS = [
  { label: 'Lista de Pacientes', href: '/lista-pacientes' },
  { label: 'Gestión de Camas', href: '/gestion-camas' },
  { label: 'Gestión de Enfermería', href: '/gestion-enfermeria' },
];

export function answerPrompt(rawText, context) {
  const { pacientes, areaLabel } = context;
  const text = normalize(rawText);

  const nombrado = matchPatientByName(text, pacientes);
  if (nombrado && (includesAny(text, 'resumen', 'resume', 'estado', 'explica'))) {
    return buildSummary(nombrado);
  }

  if (includesAll(text, 'crear', 'evolucion')) {
    const pendientes = pacientes.filter((p) => p.evolucionPendiente);
    if (pendientes.length === 0) {
      return { kind: 'text', text: 'No hay pacientes con evolución pendiente en este momento — nada que crear.' };
    }
    return confirmEvolucionesPayload(pendientes);
  }

  if (includesAll(text, 'resumir', 'pendiente')) {
    const conEvolucion = pacientes.filter((p) => p.evolucionPendiente).length;
    const conOrdenes = pacientes.reduce((n, p) => n + p.ordenesPorFirmar, 0);
    const conResultados = pacientes.reduce((n, p) => n + p.resultadosNuevos, 0);
    const criticos = pacientes.reduce((n, p) => n + p.resultadosCriticos, 0);
    return {
      kind: 'text',
      text: `De tus ${pacientes.length} pacientes${areaLabel ? ` (${areaLabel})` : ''}: ${conEvolucion} con evolución pendiente, `
        + `${conOrdenes} ${conOrdenes === 1 ? 'orden' : 'órdenes'} por firmar y ${conResultados} ${conResultados === 1 ? 'resultado nuevo' : 'resultados nuevos'}`
        + `${criticos > 0 ? ` (${criticos} ${criticos === 1 ? 'crítico' : 'críticos'})` : ''}.`,
    };
  }

  if (includesAll(text, 'evolucion', 'pendiente')) {
    const items = pacientes.filter((p) => p.evolucionPendiente);
    if (items.length === 0) return { kind: 'text', text: 'Ningún paciente tiene evolución pendiente en este momento.' };
    return patientListPayload(`Encontré ${items.length} ${items.length === 1 ? 'paciente' : 'pacientes'} con evolución pendiente.`, items, diasLabel);
  }

  if (includesAny(text, 'critico', 'criticos') && includesAny(text, 'resultado', 'hoy')) {
    const items = pacientes.filter((p) => p.resultadosCriticos > 0);
    if (items.length === 0) return { kind: 'text', text: 'No hay resultados críticos nuevos por ahora.' };
    return patientListPayload(
      `Encontré ${items.length} ${items.length === 1 ? 'paciente' : 'pacientes'} con resultados críticos nuevos.`,
      items,
      (p) => p.pendientes.find((x) => x.tipo === 'resultado' && x.critico)?.detalle ?? 'Resultado fuera de rango',
    );
  }

  if (includesAll(text, 'alta')) {
    const items = pacientes.filter((p) => p.altaProbable);
    if (items.length === 0) return { kind: 'text', text: 'No hay pacientes marcados con alta probable en este momento.' };
    return patientListPayload(`Encontré ${items.length} ${items.length === 1 ? 'paciente' : 'pacientes'} para posible alta.`, items, diasLabel);
  }

  if (includesAll(text, 'cuantos', 'pacientes')) {
    return {
      kind: 'text',
      text: `Tienes ${pacientes.length} ${pacientes.length === 1 ? 'paciente hospitalizado' : 'pacientes hospitalizados'}${areaLabel ? ` en ${areaLabel.toLowerCase()}` : ''} en este momento.`,
    };
  }

  if (includesAll(text, 'orden') && includesAny(text, 'firmar', 'pendiente')) {
    const items = pacientes.filter((p) => p.ordenesPorFirmar > 0);
    if (items.length === 0) return { kind: 'text', text: 'No hay órdenes pendientes por firmar en este momento.' };
    return patientListPayload(
      `Encontré ${items.length} ${items.length === 1 ? 'paciente' : 'pacientes'} con órdenes pendientes por firmar.`,
      items,
      (p) => `${p.ordenesPorFirmar} ${p.ordenesPorFirmar === 1 ? 'orden' : 'órdenes'} por firmar`,
    );
  }

  if (includesAny(text, 'estado de un paciente') || includesAll(text, 'explica', 'paciente')) {
    const p = nombrado ?? pacientes[0];
    if (!p) return { kind: 'text', text: 'No tengo pacientes para mostrar con el filtro actual.' };
    return buildSummary(p);
  }

  if (includesAny(text, 'navegar', 'otro modulo', 'otro módulo')) {
    return { kind: 'nav-options', text: '¿A qué módulo quieres ir?', options: NAV_OPTIONS };
  }

  return {
    kind: 'text',
    text: 'No tengo información suficiente para responder eso todavía. Prueba con una de las sugerencias de arriba o reformula tu pregunta.',
  };
}
