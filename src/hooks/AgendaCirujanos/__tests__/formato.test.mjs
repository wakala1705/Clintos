import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cantidadCirugias, fechaCorta, fechaLabel, formatoHoras, rangoSemanaLabel, resumenDia,
} from '../formato.js';

test('cantidadCirugias: singular y plural', () => {
  assert.equal(cantidadCirugias(1), '1 cirugía');
  assert.equal(cantidadCirugias(0), '0 cirugías');
  assert.equal(cantidadCirugias(3), '3 cirugías');
});

test('formatoHoras: enteras sin decimales y medias con coma', () => {
  assert.equal(formatoHoras(420), '7 h');
  assert.equal(formatoHoras(450), '7,5 h');
  assert.equal(formatoHoras(0), '0 h');
});

test('resumenDia: bloques ordenados y total', () => {
  const dia = { activo: true, bloques: [{ inicio: '14:00', fin: '18:00' }, { inicio: '07:00', fin: '12:00' }] };
  assert.equal(resumenDia(dia), '07:00–12:00 · 14:00–18:00 (9 h)');
});

test('resumenDia: ignora bloques inválidos y devuelve vacío si no queda ninguno', () => {
  assert.equal(resumenDia({ activo: true, bloques: [{ inicio: '10:00', fin: '09:00' }] }), '');
  assert.equal(resumenDia({ activo: true, bloques: [] }), '');
  assert.equal(
    resumenDia({ activo: true, bloques: [{ inicio: '10:00', fin: '09:00' }, { inicio: '07:00', fin: '08:30' }] }),
    '07:00–08:30 (1,5 h)',
  );
});

test('fechaLabel y fechaCorta', () => {
  assert.equal(fechaLabel('2026-10-04'), '04/10/2026');
  assert.equal(fechaCorta('2026-10-04'), '4 oct');
  assert.equal(fechaCorta('2026-12-31'), '31 dic');
});

test('rangoSemanaLabel: mismo mes y cruce de mes', () => {
  assert.equal(rangoSemanaLabel('2026-10-12'), '12 – 18 oct 2026');
  assert.equal(rangoSemanaLabel('2026-09-28'), '28 sep – 4 oct 2026');
  assert.equal(rangoSemanaLabel('2026-12-28'), '28 dic – 3 ene 2027');
});
