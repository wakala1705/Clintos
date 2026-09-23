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

// Delay de "escribiendo..." de este informe puntual (encargo explícito, "dale
// un delay mas largo") — bastante mayor que THINKING_DELAY_MS (550ms, ver
// ClintosAIPanel.jsx) para que un informe largo se sienta "generado", no
// devuelto al instante como una consulta simple. Viaja en el propio payload
// de la respuesta (`thinkingMs`) en vez de ser un parámetro de ask(), porque
// solo se conoce una vez que el motor decidió qué responder — pushTurnWithAnswer
// lo lee ahí y cae a THINKING_DELAY_MS si no viene (el resto de las
// respuestas del motor no lo trae).
const INFORME_GERENCIAL_THINKING_MS = 2600;

// Contenido Markdown real (encargo explícito) — renderizado por
// react-markdown+remark-gfm en MessageBubble.jsx (encabezados/negritas/
// tablas/líneas), no como texto plano. Ejemplo fijo de "resultados
// operativos" (no depende de `pacientes`/mock del piso): mismo criterio
// honesto que el resto del motor — nunca pretende ser un análisis real del
// archivo adjunto, ver el disclaimer que antecede este texto en
// buildInformeGerencial más abajo.
const INFORME_GERENCIAL_MD = `# Informe Gerencial

### Resultados Operativos — Septiembre 2026

**Periodo:** 1–30 de septiembre de 2026
**Documento analizado:** Informe Operativo — Septiembre 2026

---

## Resumen ejecutivo

Durante septiembre de 2026, la institución registró un **crecimiento del 8,4 % en el volumen total de atenciones**, pasando de 11.518 a 12.486 atenciones frente al mes anterior.

Este crecimiento estuvo acompañado por una **mayor utilización de la capacidad operativa**. La ocupación promedio de las agendas pasó del 87 % al 91 %, mientras que el tiempo promedio de espera aumentó de **31 a 38 minutos**.

El comportamiento indica que el incremento de la demanda está generando presión sobre la capacidad disponible, especialmente en determinadas especialidades.

Al mismo tiempo, las cancelaciones e inasistencias aumentaron de 6,9 % a 7,8 %. En hospitalización, la ocupación pasó del 84 % al 86 %, con 412 ingresos y 397 egresos durante el periodo.

La satisfacción general del paciente se mantuvo estable en un nivel de **4,3/5**, aunque el tiempo de espera aparece entre los principales temas mencionados en los comentarios recibidos.

### En una frase

**La institución está atendiendo más pacientes, pero el crecimiento está acompañado por una mayor presión sobre agendas y tiempos de espera.**

---

## 1. Indicadores clave

| Indicador                     | Agosto | Septiembre |   Variación |
| ----------------------------- | -----: | ---------: | ----------: |
| Atenciones realizadas         | 11.518 |     12.486 |  **+8,4 %** |
| Consultas externas            |  8.214 |      8.963 |  **+9,1 %** |
| Ocupación de agenda           |   87 % |       91 % |   **+4 pp** |
| Tiempo promedio de espera     | 31 min |     38 min | **+22,6 %** |
| Cancelaciones / inasistencias |  6,9 % |      7,8 % | **+0,9 pp** |
| Ocupación hospitalaria        |   84 % |       86 % |   **+2 pp** |
| Satisfacción del paciente     |  4,2/5 |      4,3/5 |    **+0,1** |

---

# 2. Hallazgos principales

### 01 — Crecimiento de la demanda

El volumen total de atenciones aumentó **8,4 %** durante septiembre.

El crecimiento se concentró principalmente en consultas externas, que pasaron de 8.214 a 8.963 atenciones.

Esto representa un aumento significativo de actividad que debe analizarse junto con la capacidad disponible.

---

### 02 — Aumento de los tiempos de espera

El tiempo promedio de espera pasó de **31 a 38 minutos**, un incremento del 22,6 %.

El comportamiento es especialmente relevante porque ocurre simultáneamente con una ocupación de agenda del 91 %.

Las especialidades con mayores tiempos registrados fueron:

* **Cardiología:** 46 minutos
* **Ginecología:** 43 minutos
* **Medicina interna:** 41 minutos
* **Ortopedia:** 39 minutos

Estos datos sugieren que el problema no está distribuido de manera uniforme entre las especialidades.

---

### 03 — Mayor utilización de las agendas

La ocupación promedio de agenda aumentó de **87 % a 91 %**.

Cardiología presentó la mayor ocupación registrada, con **96 %**, seguida de Ginecología con 94 % y Medicina general con 93 %.

Una ocupación elevada puede contribuir a una menor capacidad de absorción de variaciones en la demanda y retrasos durante la jornada.

---

### 04 — Incremento de cancelaciones e inasistencias

Las cancelaciones e inasistencias pasaron de 6,9 % a 7,8 %.

Durante septiembre se registraron:

* **524 cancelaciones**
* **512 inasistencias**

Además, el área de agenda reportó un aumento de solicitudes de reprogramación durante las últimas dos semanas del periodo.

Este comportamiento representa una oportunidad para revisar los procesos de confirmación, recordatorio y reprogramación de citas.

---

### 05 — Hospitalización mantiene una ocupación elevada

La ocupación hospitalaria pasó de 84 % a 86 %.

Durante septiembre se registraron:

* **146 camas habilitadas**
* **412 ingresos**
* **397 egresos**
* **3,9 días de estancia promedio**

Aunque la capacidad se mantuvo estable, el incremento de ocupación debe seguirse junto con los indicadores de ingresos, egresos y disponibilidad de camas.

---

# 3. Análisis de experiencia del paciente

Se recibieron **1.842 respuestas** de encuestas durante septiembre, con una satisfacción promedio de **4,3/5**.

Los principales temas identificados fueron:

| Tema                   | Menciones |
| ---------------------- | --------: |
| Atención del personal  |       612 |
| Facilidad para agendar |       384 |
| Tiempo de espera       |       341 |
| Información recibida   |       279 |
| Instalaciones          |       226 |

Aunque la valoración general es positiva, el **tiempo de espera representa el tercer tema con mayor número de menciones**.

Esto resulta relevante al analizarlo conjuntamente con el incremento de 31 a 38 minutos registrado durante el periodo.

---

# 4. Riesgos identificados

### 🔴 Incremento de tiempos de espera

El indicador presenta un aumento significativo frente al mes anterior y coincide con una ocupación elevada de agenda.

### 🟠 Saturación de determinadas especialidades

Cardiología, Ginecología y Medicina interna presentan simultáneamente niveles elevados de ocupación y tiempos de espera.

### 🟠 Incremento de inasistencias

El crecimiento de cancelaciones e inasistencias reduce la utilización efectiva de los espacios disponibles y puede generar mayor necesidad de reprogramación.

### 🟡 Presión futura sobre hospitalización

La ocupación hospitalaria aumentó 2 puntos porcentuales. Si la tendencia continúa, podría requerirse seguimiento más frecuente de disponibilidad de camas.

---

# 5. Recomendaciones

## Prioridad 1 — Analizar tiempos de espera

Desagregar el indicador por:

**sede → especialidad → profesional → franja horaria**

El objetivo es identificar dónde se concentra el incremento y determinar si corresponde a demanda, distribución de agenda o retrasos operativos.

---

## Prioridad 2 — Revisar capacidad de las especialidades con mayor presión

Analizar especialmente:

* Cardiología
* Ginecología
* Medicina interna
* Ortopedia

Se recomienda comparar demanda, capacidad disponible, duración de consulta y comportamiento de las agendas antes de definir ajustes operativos.

---

## Prioridad 3 — Fortalecer la gestión de citas

Evaluar mecanismos de:

* Confirmación automática.
* Recordatorios.
* Reprogramación.
* Liberación anticipada de espacios.
* Seguimiento de pacientes con antecedentes de inasistencia.

---

## Prioridad 4 — Crear seguimiento gerencial semanal

Se recomienda consolidar un tablero con:

**Volumen de atención · Ocupación de agenda · Tiempo de espera · Cancelaciones · Inasistencias · Ocupación hospitalaria · Disponibilidad de camas · Satisfacción**

Esto permitiría identificar cambios antes del cierre mensual.

---

# 6. Próximos pasos sugeridos

| Acción                                                | Responsable sugerido | Horizonte   |
| ----------------------------------------------------- | --------------------- | ----------- |
| Analizar tiempos de espera por especialidad y horario | Operaciones           | 1 semana    |
| Revisar agendas de especialidades con mayor ocupación | Coordinación médica   | 1–2 semanas |
| Analizar causas de cancelaciones e inasistencias      | Experiencia / Agenda  | 2 semanas   |
| Crear tablero de seguimiento semanal                  | Operaciones / BI      | 2–3 semanas |
| Revisar evolución de indicadores                      | Dirección             | Mensual     |

---

## Conclusión

Septiembre presenta un **crecimiento importante de la actividad asistencial**, pero también evidencia una mayor presión sobre la capacidad operativa.

El principal punto de seguimiento es el incremento del tiempo promedio de espera, particularmente en especialidades con ocupaciones superiores al 90 %.

Antes de plantear una ampliación de capacidad, se recomienda analizar la distribución actual de la demanda, la configuración de agendas y los factores que están generando retrasos.

**La información disponible permite identificar dónde profundizar el análisis, pero no determina por sí sola la causa raíz de los incrementos observados.**

---

### Indicadores que Kora recomienda monitorear

**Tiempo de espera · Ocupación de agenda · Inasistencias · Reprogramaciones · Ocupación hospitalaria · Disponibilidad de camas · Satisfacción del paciente**`;

// Demo de "contexto general" (@/Components/Kora/Kora, sin piso ni paciente) —
// encargo explícito: mostrar cómo respondería Kora a una tarea de oficina
// (generar un informe a partir de un documento adjunto), no acotada a datos
// clínicos. El disclaimer antecede al informe (no al final: el usuario debe
// saber que es ilustrativo ANTES de leer las cifras, no después) — mismo
// criterio honesto que "⚠ Revisar antes de guardar" en DraftCard/
// buildDraftText, nunca se presenta contenido simulado como si fuera un
// análisis real del archivo adjunto.
function buildInformeGerencial(attachmentName) {
  return {
    kind: 'text',
    thinkingMs: INFORME_GERENCIAL_THINKING_MS,
    text: `*Ejemplo ilustrativo generado a partir de "${attachmentName}" — Kora todavía no tiene un motor de lectura de documentos conectado, así que esto no es un análisis real de ese archivo.*\n\n${INFORME_GERENCIAL_MD}`,
  };
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
  const {
    pacientes, areaLabel, selectedPaciente, attachmentName,
  } = context;
  const text = normalize(rawText);

  // "Informe gerencial" (demo de `generalContext`, ver
  // @/Components/Kora/Kora) — sin card de sugerencia propia (encargo
  // explícito: oculta), solo se llega escribiéndolo en el composer. Antes que
  // el resto del matching: sin documento adjunto, Kora pide el insumo que le
  // falta en vez de inventar un informe sin fuente (mismo criterio honesto
  // que el resto del motor, nunca fabrica algo que no tiene de dónde sacar).
  if (includesAll(text, 'informe', 'gerencial') || includesAll(text, 'reporte', 'gerencial')) {
    if (!attachmentName) {
      return {
        kind: 'text',
        text: 'Para generar el informe gerencial necesito un documento de referencia. Adjúntalo con el ícono 📎 y vuelve a pedírmelo.',
      };
    }
    return buildInformeGerencial(attachmentName);
  }

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
