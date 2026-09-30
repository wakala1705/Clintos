import test from 'node:test';
import assert from 'node:assert/strict';
import {
  crearCirugia, fechaISO, fetchCanastasDia, resumenCanasta,
} from '../mockCirugiaData.js';

const HOY = fechaISO(new Date());

test('sala qx-1 de hoy: los casos del diseño (+ una despachada completa), por hora', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  assert.deepEqual(items.map((c) => c.id), ['12353', '12356', '12359', '12357', '12355', '12358']);
  assert.deepEqual(
    items.map((c) => resumenCanasta(c).estado),
    ['recibida', 'despachada', 'despachada', 'en-preparacion', 'con-novedades', 'en-preparacion'],
  );
});

test('sala qx-1 de hoy: ninguna cirugía se solapa con otra', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  items.slice(1).forEach((c, i) => {
    assert.ok(items[i].horaFin <= c.horaInicio, `${items[i].id} termina ${items[i].horaFin} y ${c.id} empieza ${c.horaInicio}`);
  });
});

test('despachada sin novedades (12359): todo lo despachado es lo solicitado', async () => {
  const c = (await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' })).find((x) => x.id === '12359');
  assert.equal(c.canasta.items.every((i) => i.despachado === i.cantidad && i.preparado === true), true);
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

test('una cirugía nueva no repite el id de ninguna semilla', async () => {
  const nueva = crearCirugia({ salaId: 'qx-1', fecha: HOY, horaInicio: '19:00', horaFin: '20:00', paciente: { nombre: 'X', documento: 'CC 1' } });
  const ids = (await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' })).map((c) => c.id);
  assert.equal(ids.filter((id) => id === nueva.id).length <= 1, true);
  assert.equal(['12353', '12354', '12355', '12356', '12357', '12358', '12359'].includes(nueva.id), false);
});
