// Datos de prueba compartidos por los tests de AgendaCirujanos (no es un test:
// el script `npm test` solo recoge *.test.mjs).
import { horarioVacio } from '../horario.js';

// Miércoles. La semana del 12 al 18 de octubre de 2026 es la de referencia.
export const HOY = '2026-10-14';

/**
 * Horario con los días indicados activos (índices 0 = lunes) y un bloque por día.
 * @param {number[]} dias
 * @param {{ inicio?: string, fin?: string, desde?: string, hasta?: string|null }} [opciones]
 */
export function horarioCon(dias, {
  inicio = '07:00', fin = '13:00', desde = '2026-10-01', hasta = null,
} = {}) {
  const base = horarioVacio(desde);
  return {
    ...base,
    hasta,
    dias: base.dias.map((d, i) => (dias.includes(i) ? { activo: true, bloques: [{ inicio, fin }] } : d)),
  };
}

/** @param {Record<string, unknown>} [parche] */
export function excepcion(parche = {}) {
  return {
    id: 1,
    tipo: 'bloqueo',
    motivo: 'Vacaciones',
    desde: '2026-10-14',
    hasta: '2026-10-14',
    todoElDia: true,
    inicio: '07:00',
    fin: '19:00',
    nota: '',
    ...parche,
  };
}

/** @param {Record<string, unknown>} [parche] */
export function cirugia(parche = {}) {
  return {
    id: 'c1',
    fecha: '2026-10-14',
    horaInicio: '08:00',
    horaFin: '09:00',
    estado: 'programada',
    cirujano: 'ANIBAL ENRIQUE BADEL RODRIGUEZ',
    paciente: { nombre: 'Paciente Uno' },
    procedimientoPrincipal: 'Biopsia',
    ...parche,
  };
}
