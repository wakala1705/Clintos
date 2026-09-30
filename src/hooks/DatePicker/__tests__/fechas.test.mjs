import test from 'node:test';
import assert from 'node:assert/strict';
import {
  celdasMes, dentroDeRango, esISOValido, fechaCorta, finDeSemana, hoyISO, inicioDeSemana, sumarDias, sumarMeses, tituloMes,
} from '../fechas.js';

test('sumarDias cruza meses y años', () => {
  assert.equal(sumarDias('2026-09-30', 1), '2026-10-01');
  assert.equal(sumarDias('2026-01-01', -1), '2025-12-31');
  assert.equal(sumarDias('2026-09-30', 7), '2026-10-07');
});

test('sumarMeses conserva el día o el último del mes destino', () => {
  assert.equal(sumarMeses('2026-09-30', 1), '2026-10-30');
  assert.equal(sumarMeses('2026-01-31', 1), '2026-02-28');
  assert.equal(sumarMeses('2026-03-31', -1), '2026-02-28');
  assert.equal(sumarMeses('2026-12-15', 1), '2027-01-15');
});

test('semana de lunes a domingo', () => {
  assert.equal(inicioDeSemana('2026-09-30'), '2026-09-28'); // miércoles
  assert.equal(inicioDeSemana('2026-09-28'), '2026-09-28');
  assert.equal(inicioDeSemana('2026-10-04'), '2026-09-28'); // domingo
  assert.equal(finDeSemana('2026-09-30'), '2026-10-04');
});

test('celdasMes: 42 celdas que arrancan en lunes, con los días vecinos marcados como fuera', () => {
  const c = celdasMes('2026-09-15');
  assert.equal(c.length, 42);
  assert.equal(c[0].iso, '2026-08-31'); // septiembre 2026 arranca en martes
  assert.equal(c[0].fuera, true);
  assert.equal(c[1].iso, '2026-09-01');
  assert.equal(c[1].fuera, false);
  assert.equal(c.filter((x) => !x.fuera).length, 30);
  assert.equal(c[41].fuera, true);
});

test('celdasMes: mes que arranca en lunes no agrega días previos', () => {
  const c = celdasMes('2026-06-10'); // 1 jun 2026 = lunes
  assert.equal(c[0].iso, '2026-06-01');
  assert.equal(c[0].fuera, false);
});

test('dentroDeRango y esISOValido', () => {
  assert.equal(dentroDeRango('2026-09-30', '2026-09-01', '2026-09-30'), true);
  assert.equal(dentroDeRango('2026-10-01', '2026-09-01', '2026-09-30'), false);
  assert.equal(dentroDeRango('2026-10-01'), true);
  assert.equal(esISOValido('2026-09-30'), true);
  assert.equal(esISOValido('2026-02-30'), false);
  assert.equal(esISOValido('basura'), false);
  assert.equal(esISOValido(null), false);
});

test('tituloMes, fechaCorta y hoyISO', () => {
  assert.equal(tituloMes('2026-09-30'), 'Septiembre 2026');
  assert.equal(fechaCorta('2026-09-05'), '05/09/2026');
  assert.equal(esISOValido(hoyISO()), true);
});
