// @ts-check
// Solo definiciones de tipo (JSDoc) de la feature "Agenda de cirujanos". Sin
// código en runtime: los demás módulos las importan con
// `/** @typedef {import('./tipos.js').Bloque} Bloque */`.
//
// Convenciones: fechas 'YYYY-MM-DD', horas 'HH:mm', días de la semana con
// índice 0 = lunes. Las funciones puras reciben `hoy` por parámetro y nunca
// llaman a `new Date()`.

/** @typedef {{ inicio: string, fin: string }} Bloque */
/** @typedef {{ activo: boolean, bloques: Bloque[] }} DiaHorario */

/**
 * `hasta === null` significa "sin fecha de fin". `hasta === ''` solo existe
 * mientras se edita (casilla "Sin fecha de fin" desmarcada y fecha aún sin
 * elegir): `errorVigencia` lo marca y el horario no se puede guardar.
 * `dias` siempre tiene 7 elementos.
 * @typedef {{ desde: string, hasta: string|null, dias: DiaHorario[] }} HorarioSemanal
 */

/** @typedef {'bloqueo'|'apertura'} TipoExcepcion */

/**
 * `todoElDia` cubre la jornada operativa completa (07:00–19:00); `inicio` y
 * `fin` solo importan cuando `todoElDia` es false.
 * @typedef {{ id: number, tipo: TipoExcepcion, motivo: string, desde: string, hasta: string,
 *   todoElDia: boolean, inicio: string, fin: string, nota: string }} Excepcion
 */

/** @typedef {Omit<Excepcion, 'id'>} BorradorExcepcion */

/** @typedef {{ idMedico: string, horario: HorarioSemanal|null, excepciones: Excepcion[] }} AgendaCirujano */
/** @typedef {{ idMedico: string, nombre: string, sede: string }} Cirujano */
/** @typedef {{ cirujano: Cirujano, agenda: AgendaCirujano }} FilaCirujano */

/** @typedef {'configurada'|'por-vencer'|'vencida'|'sin-configurar'} EstadoAgenda */

/**
 * Subconjunto estructural de la cirugía de `mockCirugiaData` que usa la lógica.
 * @typedef {{ id: string, fecha: string, horaInicio: string, horaFin: string, estado: string,
 *   cirujano?: string, paciente?: { nombre: string }, procedimientoPrincipal?: string }} CirugiaAgenda
 */

/** @typedef {{ tipo: 'bloqueo', motivo: string }|{ tipo: 'fuera-vigencia' }|{ tipo: 'fuera-horario' }} MotivoConflicto */
/** @typedef {{ cirugia: CirugiaAgenda, motivo: MotivoConflicto }} Conflicto */

/** @typedef {{ horario: HorarioSemanal|null, excepciones: Excepcion[] }} AgendaEvaluable */

/** @typedef {{ rol: 'programacion'|'cirujano', idMedico?: string }} UsuarioAgenda */

export {};
