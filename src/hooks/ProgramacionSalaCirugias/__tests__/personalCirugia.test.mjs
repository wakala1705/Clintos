import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES_PERSONAL, rolesObligatoriosFaltantes } from '../personalCirugia.js';

test('cirujano y anestesiólogo son los obligatorios', () => {
  assert.deepEqual(ROLES_PERSONAL.filter((r) => r.obligatorio).map((r) => r.rol), ['Cirujano', 'Anestesiólogo']);
});

test('rolesObligatoriosFaltantes: lista lo que falta, ignora opcionales', () => {
  assert.deepEqual(rolesObligatoriosFaltantes([]), ['Cirujano', 'Anestesiólogo']);
  assert.deepEqual(rolesObligatoriosFaltantes(undefined), ['Cirujano', 'Anestesiólogo']);
  assert.deepEqual(rolesObligatoriosFaltantes([{ rol: 'Cirujano', nombre: 'A' }, { rol: 'Ayudante', nombre: 'B' }]), ['Anestesiólogo']);
  assert.deepEqual(rolesObligatoriosFaltantes([{ rol: 'Cirujano', nombre: 'A' }, { rol: 'Anestesiólogo', nombre: 'C' }]), []);
});
