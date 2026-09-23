// Motor mock de Clintos AI para Historia Clínica - Hospitalización. No hay
// backend de IA real: `answerPrompt` reconoce el texto exacto de las
// acciones/preguntas sugeridas (ver suggestions.js) contra los datos reales
// del piso (`context.pacientes`, ya recortado por el filtro de área activo)
// y devuelve una respuesta tipada. Texto libre que no matchea nunca inventa
// un dato — cae al fallback honesto, acorde al aviso de "Clintos AI puede
// cometer errores" del footer del panel.
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

// Nombre corto para mostrar en el turno de "usuario" cuando se hace click en
// un paciente de una lista (ver PatientResultList.jsx/ClintosAIPanel.jsx) —
// mismo criterio que nombreCorto() de arriba pero sin normalizar a
// minúsculas/sin tildes (nombreCorto es solo para comparar texto, esto es
// para texto visible). Evita mostrar el nombre completo de 4 palabras como
// si el usuario lo hubiera tecleado tal cual — hallazgo de la auditoría UX
// de este panel (heurística 2, "correspondencia con el mundo real"): un
// click no es lo mismo que escribir una pregunta larga.
export function nombreVisible(paciente) {
  const palabras = paciente.split(' ').filter(Boolean);
  if (palabras.length >= 4) return `${palabras[0]} ${palabras[2]}`;
  return palabras.join(' ');
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

function patientListPayload(intro, pacientes, metaFn, followUp = '¿Quieres que revise alguno de estos pacientes?') {
  return {
    kind: 'patient-list',
    intro,
    items: pacientes.map((p) => ({
      id: p.id, nombre: p.paciente, cama: p.cama, meta: metaFn(p),
    })),
    followUp,
  };
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
// Fecha corta ("23 sep") para las fuentes de un resumen (ver
// PatientSummaryCard/SourcesDisclosure, brief "Fuentes y trazabilidad") —
// todos los pendientes del mock ocurren "hoy" (min/horas atrás, nunca días),
// así que usar la fecha de hoy en las 4 fuentes es honesto dentro del propio
// modelo de datos, no un dato inventado.
function fechaCorta() {
  const hoy = new Date();
  return `${hoy.getDate()} ${MESES[hoy.getMonth()]}`;
}

// Fuentes de un resumen — "Historia clínica" siempre (todo resumen parte de
// ella), Evolución/Órdenes siempre, "Resultados" solo si el paciente
// realmente tiene resultados nuevos (nunca se cita una fuente vacía).
function fuentesDe(p) {
  const fecha = fechaCorta();
  const base = ['Historia clínica', 'Evolución médica', 'Evolución de enfermería', 'Órdenes médicas'];
  if (p.resultadosNuevos > 0) base.push('Resultados');
  return base.map((label) => ({ label, fecha }));
}

function buildSummary(p) {
  const pendientesTexto = p.pendientes.length === 0
    ? ['Sin pendientes clínicos']
    : p.pendientes.map((x) => `${x.tipoLabel}${x.detalle ? ` — ${x.detalle}` : ''}`);
  return {
    kind: 'patient-summary',
    pacienteId: p.id,
    nombre: p.paciente,
    cama: p.cama,
    estado: 'Hospitalizada',
    diagnostico: p.diagnostico,
    resumen: `${p.paciente.split(' ')[0]} lleva ${diasLabel(p)} en la cama ${p.cama} por ${p.diagnostico.toLowerCase()}. `
      + (p.evolucionPendiente ? 'Aún no tiene la nota de evolución del día registrada. ' : 'La evolución del día ya está registrada. ')
      + (p.resultadosCriticos > 0 ? 'Tiene resultados críticos sin revisar que conviene priorizar.' : 'No tiene resultados críticos pendientes.'),
    pendientes: pendientesTexto,
    fuentes: fuentesDe(p),
  };
}

function confirmEvolucionesPayload(pendientes) {
  return {
    kind: 'confirm-action',
    title: 'Preparar borradores de evolución',
    // 2 líneas (identificación + propuesta), no un párrafo — mismo formato
    // del ejemplo del brief ("He identificado..." / "Puedo preparar...").
    lines: [
      `He identificado ${pendientes.length} ${pendientes.length === 1 ? 'paciente' : 'pacientes'} con evolución pendiente.`,
      'Puedo preparar un borrador para cada paciente utilizando la información registrada. Vas a poder revisar y editar cada uno antes de guardarlo — no queda nada en la historia hasta que lo confirmes ahí.',
    ],
    // Objetos completos (no solo id/nombre/cama): ClintosAIPanel los necesita
    // enteros para generar el contenido de cada borrador al confirmar (ver
    // buildDraftText más abajo).
    items: pendientes,
    confirmLabel: 'Preparar borradores',
    cancelLabel: 'Cancelar',
  };
}

// Contenido de ejemplo de un borrador de evolución — plantilla genérica que
// solo usa datos que el mock ya modela (diagnóstico, pendiente real); nunca
// inventa signos vitales, resultados de laboratorio ni hallazgos que no
// existan en PACIENTES_PISO. El "⚠ Revisar antes de guardar" del card deja
// claro que esto es un punto de partida, no una nota clínica terminada.
export function buildDraftText(p) {
  const primerNombre = p.paciente.split(' ')[0];
  const pendienteEvolucion = p.pendientes.find((x) => x.tipo === 'evolucion');
  return `Paciente ${primerNombre} continúa hospitalizado/a en cama ${p.cama} en manejo por ${p.diagnostico.toLowerCase()}. `
    + 'Evoluciona sin cambios significativos en las últimas horas, hemodinámicamente estable. '
    + 'Se continúa esquema terapéutico actual y monitoreo según indicación médica. '
    + `Pendiente: ${pendienteEvolucion ? 'completar valoración y firmar nota del turno' : 'sin pendientes adicionales de evolución'}.`;
}

const NAV_OPTIONS = [
  { label: 'Lista de Pacientes', href: '/lista-pacientes' },
  { label: 'Gestión de Camas', href: '/gestion-camas' },
  { label: 'Gestión de Enfermería', href: '/gestion-enfermeria' },
];

// Preguntas contextuales a UN paciente puntual (ver PATIENT_SUGGESTIONS en
// suggestions.js, brief "Contexto dinámico") — solo se consultan cuando hay
// un paciente seleccionado en la tabla; nunca reemplazan el matching general
// de abajo (si no hay selección, esas 4 frases igual pueden responderse por
// las reglas generales de "evolución pendiente"/"resultado"/"orden").
function answerForSelectedPatient(text, p) {
  // "Resumir evolución" — a diferencia de "Explícame el estado" (resumen
  // completo), esto queda acotado solo a la evolución del día.
  if (includesAll(text, 'resumir', 'evolucion')) {
    return {
      kind: 'text',
      text: p.evolucionPendiente
        ? `${nombreVisible(p.paciente)} todavía no tiene la nota de evolución del día registrada.`
        : `${nombreVisible(p.paciente)} ya tiene la evolución del día registrada, sin cambios relevantes reportados.`,
    };
  }
  if (includesAll(text, 'orden') && includesAny(text, 'pendiente', 'ver')) {
    const ordenes = p.pendientes.filter((x) => x.tipo === 'orden');
    if (ordenes.length === 0) return { kind: 'text', text: `${nombreVisible(p.paciente)} no tiene órdenes pendientes por firmar.` };
    return {
      kind: 'text',
      text: `${nombreVisible(p.paciente)} tiene ${ordenes.length} ${ordenes.length === 1 ? 'orden pendiente' : 'órdenes pendientes'}: ${ordenes.map((o) => o.detalle).join('; ')}.`,
    };
  }
  if (includesAll(text, 'revisar', 'resultado')) {
    const resultados = p.pendientes.filter((x) => x.tipo === 'resultado');
    if (resultados.length === 0) return { kind: 'text', text: `${nombreVisible(p.paciente)} no tiene resultados nuevos por revisar.` };
    return {
      kind: 'text',
      text: `${nombreVisible(p.paciente)} tiene ${resultados.length} ${resultados.length === 1 ? 'resultado nuevo' : 'resultados nuevos'}: ${resultados.map((r) => r.detalle).join('; ')}.`,
    };
  }
  if (includesAll(text, 'medicamento')) {
    return {
      kind: 'text',
      text: `No tengo el esquema de medicamentos de ${nombreVisible(p.paciente)} disponible todavía — esa fuente no está conectada en esta vista.`,
    };
  }
  return null;
}

export function answerPrompt(rawText, context) {
  const { pacientes, areaLabel, selectedPaciente } = context;
  const text = normalize(rawText);

  if (selectedPaciente) {
    const respuesta = answerForSelectedPatient(text, selectedPaciente);
    if (respuesta) return respuesta;
  }

  const nombrado = matchPatientByName(text, pacientes);
  if (nombrado && (includesAny(text, 'resumen', 'resume', 'estado', 'explica'))) {
    return buildSummary(nombrado);
  }

  if (includesAll(text, 'preparar', 'evolucion') || includesAll(text, 'crear', 'evolucion')) {
    const pendientes = pacientes.filter((p) => p.evolucionPendiente);
    if (pendientes.length === 0) {
      return { kind: 'text', text: 'No hay pacientes con evolución pendiente en este momento — nada que preparar.' };
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
    return patientListPayload(`He encontrado ${items.length} ${items.length === 1 ? 'paciente' : 'pacientes'} con evolución pendiente.`, items, diasLabel);
  }

  if (includesAny(text, 'critico', 'criticos') && includesAny(text, 'resultado', 'hoy')) {
    const items = pacientes.filter((p) => p.resultadosCriticos > 0);
    if (items.length === 0) return { kind: 'text', text: 'No hay resultados críticos nuevos por ahora.' };
    return patientListPayload(
      `He encontrado ${items.length} ${items.length === 1 ? 'paciente' : 'pacientes'} con resultados críticos nuevos.`,
      items,
      (p) => p.pendientes.find((x) => x.tipo === 'resultado' && x.critico)?.detalle ?? 'Resultado fuera de rango',
    );
  }

  if (includesAny(text, 'alta')) {
    const items = pacientes.filter((p) => p.altaProbable);
    if (items.length === 0) return { kind: 'text', text: 'No hay pacientes marcados con alta probable en este momento.' };
    return patientListPayload(`He encontrado ${items.length} ${items.length === 1 ? 'paciente' : 'pacientes'} para posible alta.`, items, diasLabel);
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
      `He encontrado ${items.length} ${items.length === 1 ? 'paciente' : 'pacientes'} con órdenes pendientes por firmar.`,
      items,
      (p) => `${p.ordenesPorFirmar} ${p.ordenesPorFirmar === 1 ? 'orden' : 'órdenes'} por firmar`,
    );
  }

  if (includesAny(text, 'estado de un paciente') || includesAll(text, 'explica', 'paciente')) {
    const p = nombrado ?? selectedPaciente ?? pacientes[0];
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
