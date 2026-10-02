import test from 'node:test';
import assert from 'node:assert/strict';
import {
  agruparPorSala, esRetrasada, kpisDelDia, minutosCirugia, minutosLabel,
} from '../tablero.js';

const c = (id, salaId, estado, horaInicio, horaFin, fecha = '2026-10-02') => ({
  id, salaId, estado, horaInicio, horaFin, fecha,
});
const AHORA = new Date(2026, 9, 2, 8, 45);

test('minutosCirugia y minutosLabel', () => {
  assert.equal(minutosCirugia(c('1', 'a', 'programada', '07:00', '08:30')), 90);
  assert.equal(minutosLabel(0), '0m');
  assert.equal(minutosLabel(45), '45m');
  assert.equal(minutosLabel(120), '2h');
  assert.equal(minutosLabel(210), '3h 30m');
});

test('esRetrasada: solo programada/urgencia cuya hora de inicio ya pasó', () => {
  assert.equal(esRetrasada(c('1', 'a', 'programada', '07:00', '08:00'), AHORA), true);
  assert.equal(esRetrasada(c('2', 'a', 'urgencia', '08:45', '09:30'), AHORA), true);
  assert.equal(esRetrasada(c('3', 'a', 'programada', '09:00', '10:00'), AHORA), false);
  assert.equal(esRetrasada(c('4', 'a', 'realizada', '07:00', '08:00'), AHORA), false);
  assert.equal(esRetrasada(c('5', 'a', 'cancelada', '07:00', '08:00'), AHORA), false);
  assert.equal(esRetrasada(c('6', 'a', 'incumplida', '07:00', '08:00'), AHORA), false);
});

test('agruparPorSala: ordena por hora, mantiene orden de salas y no cuenta canceladas en minutos', () => {
  const salas = [{ value: 'a' }, { value: 'b' }, { value: 'c' }];
  const grupos = agruparPorSala([
    c('2', 'a', 'programada', '10:00', '11:00'),
    c('1', 'a', 'programada', '07:00', '08:30'),
    c('3', 'a', 'cancelada', '12:00', '13:00'),
    c('4', 'b', 'urgencia', '09:00', '09:30'),
  ], salas);
  assert.deepEqual(grupos.map((g) => g.sala.value), ['a', 'b', 'c']);
  assert.deepEqual(grupos[0].cirugias.map((x) => x.id), ['1', '2', '3']);
  assert.equal(grupos[0].minutosOcupados, 150);
  assert.equal(grupos[1].minutosOcupados, 30);
  assert.deepEqual(grupos[2].cirugias, []);
  assert.equal(grupos[2].minutosOcupados, 0);
});

test('kpisDelDia: cuenta por estado y retrasadas solo con `ahora`', () => {
  const lista = [
    c('1', 'a', 'programada', '07:00', '08:00'),
    c('2', 'a', 'programada', '10:00', '11:00'),
    c('3', 'a', 'urgencia', '08:00', '09:00'),
    c('4', 'b', 'realizada', '07:00', '08:00'),
    c('5', 'b', 'cancelada', '07:00', '08:00'),
    c('6', 'b', 'incumplida', '07:00', '08:00'),
  ];
  assert.deepEqual(kpisDelDia(lista, AHORA), {
    total: 6, programadas: 2, urgencias: 1, realizadas: 1, canceladas: 2, retrasadas: 2,
  });
  assert.equal(kpisDelDia(lista).retrasadas, 0);
  assert.equal(kpisDelDia([]).total, 0);
});
