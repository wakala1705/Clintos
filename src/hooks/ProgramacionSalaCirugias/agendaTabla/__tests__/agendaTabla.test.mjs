import test from 'node:test';
import assert from 'node:assert/strict';
import { ordenarCirugiasAgenda } from '../agendaTabla.js';

const c = (id, fecha, horaInicio, salaId = 'qx-1') => ({ id, fecha, horaInicio, salaId });

test('ordena por fecha, hora y sala', () => {
  const lista = [
    c('d', '2026-10-20', '07:00', 'qx-2'),
    c('c', '2026-10-20', '07:00', 'qx-1'),
    c('b', '2026-10-20', '06:30'),
    c('a', '2026-10-19', '11:00'),
  ];
  assert.deepEqual(ordenarCirugiasAgenda(lista).map((x) => x.id), ['a', 'b', 'c', 'd']);
});

test('no muta la lista original', () => {
  const lista = [c('b', '2026-10-20', '07:00'), c('a', '2026-10-19', '07:00')];
  ordenarCirugiasAgenda(lista);
  assert.deepEqual(lista.map((x) => x.id), ['b', 'a']);
});
