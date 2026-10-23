import test from 'node:test';
import assert from 'node:assert/strict';
import { inicialesPaciente } from '../gestion.js';

test('2 nombres + 2 apellidos: primer nombre y primer apellido', () => {
  assert.equal(inicialesPaciente('María Fernanda Ríos Duarte'), 'MR');
});

test('3 palabras o menos: primera y segunda', () => {
  assert.equal(inicialesPaciente('Sofía Restrepo'), 'SR');
  assert.equal(inicialesPaciente('Juan Pablo Gómez'), 'JP');
});

test('una sola palabra o vacío', () => {
  assert.equal(inicialesPaciente('Camila'), 'C');
  assert.equal(inicialesPaciente(''), '');
  assert.equal(inicialesPaciente(undefined), '');
});
