import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES_PERSONAL, rolesObligatoriosFaltantes } from '../personalCirugia.js';

test('ningún rol es obligatorio: cirujano y anestesiólogo no bloquean el paso', () => {
  assert.deepEqual(ROLES_PERSONAL.filter((r) => r.obligatorio), []);
});

test('rolesObligatoriosFaltantes: sin roles obligatorios nunca hay faltantes', () => {
  assert.deepEqual(rolesObligatoriosFaltantes([]), []);
  assert.deepEqual(rolesObligatoriosFaltantes(undefined), []);
  assert.deepEqual(rolesObligatoriosFaltantes([{ rol: 'Ayudante', nombre: 'B' }]), []);
});
