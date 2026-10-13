import test from 'node:test';
import assert from 'node:assert/strict';
import { cirugiaCoincide, cirujanosDeSede, fetchAgendaRango } from '../mockCirugiaData.js';

const base = { sedeId: '02', inicio: '2000-01-01', fin: '2100-01-01' };

test('cirugiaCoincide: sala concreta, cirujano y "todas" las salas', () => {
  const c = { sedeId: '02', salaId: 'qx-1', cirujano: 'Dra. Marcela Ospina', fecha: '2026-10-13', estado: 'programada' };
  assert.equal(cirugiaCoincide(c, { ...base, salaId: 'qx-1' }), true);
  assert.equal(cirugiaCoincide(c, { ...base, salaId: 'qx-2' }), false);
  assert.equal(cirugiaCoincide(c, { ...base, salaId: 'todas', cirujano: 'Dra. Marcela Ospina' }), true);
  assert.equal(cirugiaCoincide(c, { ...base, salaId: 'todas', cirujano: 'Dr. Otro' }), false);
  assert.equal(cirugiaCoincide(c, { ...base, salaId: 'qx-1', estado: 'realizada' }), false);
  assert.equal(cirugiaCoincide(c, { sedeId: '99', salaId: 'todas', inicio: base.inicio, fin: base.fin }), false);
});

test('cirujanosDeSede: nombres únicos y ordenados', () => {
  const nombres = cirujanosDeSede('02');
  assert.ok(nombres.length > 1);
  assert.equal(new Set(nombres).size, nombres.length);
  assert.deepEqual(nombres, [...nombres].sort((a, b) => a.localeCompare(b, 'es')));
});

test('la agenda de un cirujano cruza salas y solo trae sus cirugías', async () => {
  const todos = await fetchAgendaRango({ ...base, salaId: 'todas' });
  const nombre = cirujanosDeSede('02').find((n) => new Set(todos.filter((c) => c.cirujano === n).map((c) => c.salaId)).size > 1)
    ?? cirujanosDeSede('02')[0];
  const suyas = await fetchAgendaRango({ ...base, salaId: 'todas', cirujano: nombre });
  assert.ok(suyas.length > 0);
  assert.ok(suyas.every((c) => c.cirujano === nombre));
  assert.equal(suyas.length, todos.filter((c) => c.cirujano === nombre).length);
});
