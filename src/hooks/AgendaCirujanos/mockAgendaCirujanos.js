// @ts-check
// Datos de ejemplo de "Agenda de cirujanos". Las fechas se calculan a partir
// de `hoy` para que los cuatro estados (configurada, por vencer, vencida y sin
// configurar) siempre aparezcan, sin importar qué día se abra la pantalla.
// Mismo criterio que mockCirugiaData.js: deterministas (nunca Math.random).
import { sumarDias } from './horario.js';

/** @typedef {import('./tipos.js').AgendaCirujano} AgendaCirujano */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */

/**
 * @param {Record<number, [string, string][]>} porDia bloques por índice de día (0 = lunes); los días ausentes quedan apagados
 * @param {string} desde
 * @param {string|null} hasta
 * @returns {HorarioSemanal}
 */
function horarioDe(porDia, desde, hasta) {
  return {
    desde,
    hasta,
    dias: Array.from({ length: 7 }, (_, i) => (porDia[i]
      ? { activo: true, bloques: porDia[i].map(([inicio, fin]) => ({ inicio, fin })) }
      : { activo: false, bloques: [{ inicio: '07:00', fin: '12:00' }] })),
  };
}

/**
 * @param {[string, string][]} bloques
 * @param {number[]} dias
 * @returns {Record<number, [string, string][]>}
 */
const diasCon = (bloques, dias) => Object.fromEntries(dias.map((d) => [d, bloques]));

const LUN_VIE = [0, 1, 2, 3, 4];

/**
 * Agendas de ejemplo, por `idMedico` del catálogo (MEDICOS_CATALOGO).
 * Los cirujanos que no aparecen acá quedan "Sin configurar".
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {AgendaCirujano[]}
 */
export function crearSemilla(hoy) {
  const d = (/** @type {number} */ n) => sumarDias(hoy, n);
  /** @type {{ idMedico: string, horario: HorarioSemanal, excepciones: Omit<Excepcion, 'id'>[] }[]} */
  const agendas = [
    // Configurada, medio tiempo.
    { idMedico: '02757/98', horario: horarioDe(diasCon([['07:00', '13:00']], [0, 2, 4]), d(-43), null), excepciones: [] },
    // Por vencer (la vigencia termina en 23 días).
    { idMedico: '6874047', horario: horarioDe(diasCon([['08:00', '16:00']], [1, 2, 3]), d(-43), d(23)), excepciones: [] },
    // Por vencer justo en el límite de 30 días.
    { idMedico: '72845103', horario: horarioDe(diasCon([['07:00', '19:00']], LUN_VIE), hoy, d(30)), excepciones: [] },
    // Configurada, con bloques partidos, una apertura extra y un congreso.
    {
      idMedico: '94512888',
      horario: horarioDe({
        0: [['07:00', '12:00'], ['14:00', '18:00']],
        1: [['07:00', '14:00']],
        2: [['07:00', '12:00'], ['14:00', '17:00']],
        3: [['07:00', '12:00']],
        4: [['07:00', '16:00']],
      }, d(-13), null),
      excepciones: [
        {
          tipo: 'apertura', motivo: 'Jornada adicional', desde: d(3), hasta: d(3), todoElDia: false, inicio: '08:00', fin: '12:00', nota: '',
        },
        {
          tipo: 'bloqueo', motivo: 'Congreso o capacitación', desde: d(26), hasta: d(28), todoElDia: true, inicio: '07:00', fin: '19:00', nota: 'Congreso Nacional de Cirugía Oncológica',
        },
      ],
    },
    // Configurada, jornada completa, con vacaciones próximas.
    {
      idMedico: '78036459',
      horario: horarioDe(diasCon([['07:00', '18:00']], LUN_VIE), d(-74), null),
      excepciones: [
        {
          tipo: 'bloqueo', motivo: 'Vacaciones', desde: d(6), hasta: d(10), todoElDia: true, inicio: '07:00', fin: '19:00', nota: '',
        },
      ],
    },
    // Configurada, mañanas.
    { idMedico: '1102812780', horario: horarioDe(diasCon([['07:00', '12:00']], LUN_VIE), d(-29), null), excepciones: [] },
    // Vencida.
    { idMedico: '73133878', horario: horarioDe(diasCon([['08:00', '14:00']], [0, 2]), d(-135), d(-14)), excepciones: [] },
    // Configurada, jornada completa.
    { idMedico: '2757886', horario: horarioDe(diasCon([['07:00', '18:00']], LUN_VIE), d(-73), null), excepciones: [] },
    // Configurada, de miércoles a viernes.
    { idMedico: '43876219', horario: horarioDe(diasCon([['09:00', '17:00']], [2, 3, 4]), d(-13), null), excepciones: [] },
  ];

  let siguienteId = 1;
  return agendas.map((a) => ({
    ...a,
    excepciones: a.excepciones.map((x) => ({ ...x, id: siguienteId++ })),
  }));
}
