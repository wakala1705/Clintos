import test from 'node:test';
import assert from 'node:assert/strict';
import { minutosDisponibles, minutosSemanales, modeloDia } from '../disponibilidad.js';
import { alternarDia, cambiarBloque, horarioVacio } from '../horario.js';
import { excepcion, horarioCon, HOY } from './fixtures.mjs';

// Miércoles 14 = índice 2. Horario base: lun/mié/vie 07:00–13:00 desde el 1 de octubre.
const horario = horarioCon([0, 2, 4]);

test('modeloDia: día activo dentro de la vigencia devuelve su base', () => {
  const m = modeloDia(HOY, horario, []);
  assert.equal(m.vigente, true);
  assert.deepEqual(m.base, [[420, 780]]);
  assert.deepEqual(m.efectivo, [[420, 780]]);
});

test('modeloDia: día apagado o sin horario no tiene disponibilidad', () => {
  assert.deepEqual(modeloDia('2026-10-15', horario, []).efectivo, []);
  assert.deepEqual(modeloDia(HOY, null, []).efectivo, []);
  assert.equal(modeloDia(HOY, null, []).vigente, false);
});

test('modeloDia: fuera de la vigencia no hay base', () => {
  const acotado = horarioCon([2], { desde: '2026-10-15' });
  assert.equal(modeloDia(HOY, acotado, []).vigente, false);
  const vencido = horarioCon([2], { hasta: '2026-10-13' });
  assert.deepEqual(modeloDia(HOY, vencido, []).efectivo, []);
  assert.equal(modeloDia('2026-10-13', vencido, []).vigente, true);
  assert.equal(modeloDia('2026-10-14', horarioCon([2], { hasta: '2026-10-14' }), []).vigente, true, 'el último día es vigente');
});

test('modeloDia: mientras se edita (hasta vacío) la vista previa no se rompe', () => {
  assert.equal(modeloDia(HOY, { ...horario, hasta: '' }, []).vigente, true);
});

test('modeloDia: un bloqueo de todo el día vacía la jornada', () => {
  const m = modeloDia(HOY, horario, [excepcion()]);
  assert.deepEqual(m.efectivo, []);
  assert.equal(m.bloqueos.length, 1);
  assert.deepEqual(m.bloqueos[0].intervalo, [420, 1140]);
});

test('modeloDia: un bloqueo con franja parte el horario', () => {
  const m = modeloDia(HOY, horario, [excepcion({ todoElDia: false, inicio: '09:00', fin: '10:00' })]);
  assert.deepEqual(m.efectivo, [[420, 540], [600, 780]]);
});

test('modeloDia: una apertura extra suma disponibilidad aunque el día esté apagado', () => {
  const apertura = excepcion({
    tipo: 'apertura', motivo: 'Jornada adicional', desde: '2026-10-15', hasta: '2026-10-15', todoElDia: false, inicio: '08:00', fin: '12:00',
  });
  const m = modeloDia('2026-10-15', horario, [apertura]);
  assert.deepEqual(m.base, []);
  assert.deepEqual(m.efectivo, [[480, 720]]);
  assert.equal(m.aperturas.length, 1);
});

test('modeloDia: una apertura contigua al horario se une con él', () => {
  const apertura = excepcion({
    tipo: 'apertura', todoElDia: false, inicio: '13:00', fin: '15:00',
  });
  assert.deepEqual(modeloDia(HOY, horario, [apertura]).efectivo, [[420, 900]]);
});

test('modeloDia: el bloqueo gana a la apertura', () => {
  const apertura = excepcion({
    id: 1, tipo: 'apertura', todoElDia: false, inicio: '14:00', fin: '16:00',
  });
  const bloqueo = excepcion({ id: 2, todoElDia: false, inicio: '15:00', fin: '17:00' });
  assert.deepEqual(modeloDia(HOY, horario, [apertura, bloqueo]).efectivo, [[420, 780], [840, 900]]);
});

test('modeloDia: una excepción de varios días aplica en cada uno, con la misma franja', () => {
  const x = excepcion({
    desde: '2026-10-12', hasta: '2026-10-14', todoElDia: false, inicio: '07:00', fin: '09:00',
  });
  assert.deepEqual(modeloDia('2026-10-12', horario, [x]).efectivo, [[540, 780]]);
  assert.deepEqual(modeloDia('2026-10-14', horario, [x]).efectivo, [[540, 780]]);
  assert.deepEqual(modeloDia('2026-10-16', horario, [x]).efectivo, [[420, 780]]);
});

test('modeloDia: ignora bloques inválidos (fin <= inicio)', () => {
  const malo = cambiarBloque(alternarDia(horarioVacio('2026-10-01'), 2, true), 2, 0, 'fin', '07:00');
  assert.deepEqual(modeloDia(HOY, malo, []).efectivo, []);
});

test('modeloDia: une bloques contiguos del mismo día', () => {
  const dosBloques = {
    ...horario,
    dias: horario.dias.map((d, i) => (i === 2 ? { activo: true, bloques: [{ inicio: '07:00', fin: '10:00' }, { inicio: '10:00', fin: '13:00' }] } : d)),
  };
  assert.deepEqual(modeloDia(HOY, dosBloques, []).efectivo, [[420, 780]]);
});

test('minutosDisponibles suma la semana y respeta bloqueos', () => {
  const semana = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18'];
  assert.equal(minutosDisponibles(semana, horario, []), 3 * 360);
  assert.equal(minutosDisponibles(semana, horario, [excepcion()]), 2 * 360);
  assert.equal(minutosDisponibles(semana, null, []), 0);
});

test('minutosDisponibles recorta a la jornada operativa', () => {
  const apertura = excepcion({
    tipo: 'apertura', desde: '2026-10-17', hasta: '2026-10-17', todoElDia: false, inicio: '18:00', fin: '19:00',
  });
  assert.equal(minutosDisponibles(['2026-10-17'], null, [apertura]), 60);
});

test('minutosSemanales suma solo días activos con bloques válidos', () => {
  assert.equal(minutosSemanales(horario), 3 * 360);
  assert.equal(minutosSemanales(horarioVacio(HOY)), 0);
  const conInvalido = cambiarBloque(horario, 0, 0, 'fin', '07:00');
  assert.equal(minutosSemanales(conInvalido), 2 * 360);
});
