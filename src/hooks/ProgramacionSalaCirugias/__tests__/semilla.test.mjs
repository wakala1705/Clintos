import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fechaISO, fetchCanastasDia, gateCirugia, resumenCanasta,
} from '../mockCirugiaData.js';

const HOY = fechaISO(new Date());

test('sala qx-1 de hoy: los 5 casos del diseño, por hora', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  assert.deepEqual(items.map((c) => c.id), ['12353', '12356', '12355', '12357', '12358']);
  assert.deepEqual(
    items.map((c) => resumenCanasta(c).estado),
    ['recibida', 'despachada', 'con-novedades', 'en-preparacion', 'en-preparacion'],
  );
  assert.deepEqual(
    items.map(gateCirugia),
    ['realizada', 'bloqueada', 'lista', 'urgencia-puede-autorizar', 'bloqueada'],
  );
});

test('la cirugía realizada sigue en el listado (su canasta está abierta para consumo)', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  assert.equal(items.find((c) => c.id === '12353').estado, 'realizada');
});

test('sala qx-2: la urgencia sin solicitar', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-2' });
  assert.deepEqual(items.map((c) => [c.id, resumenCanasta(c).estado]), [['12354', 'sin-solicitar']]);
});

test('canasta preparada parcialmente: 3 de 5 preparados en la urgencia', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  const r = resumenCanasta(items.find((c) => c.id === '12357'));
  assert.deepEqual([r.preparados, r.total], [3, 5]);
});
