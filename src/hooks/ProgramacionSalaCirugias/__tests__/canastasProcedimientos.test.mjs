import test from 'node:test';
import assert from 'node:assert/strict';
import { PROCEDIMIENTOS_CANASTA, procedimientosCoincidentes, procedimientosDeComplejidad } from '../canastasProcedimientos.js';
import { CANASTAS_GENERICAS, INSUMOS_CATALOGO } from '../mockCirugiaData.js';

test('cada complejidad trae varios procedimientos oncológicos', () => {
  for (const c of ['Baja', 'Media', 'Alta']) {
    assert.ok(procedimientosDeComplejidad(c).length >= 3, c);
  }
  assert.deepEqual(CANASTAS_GENERICAS.map((g) => g.procedimientos.length > 0), [true, true, true]);
});

test('cada procedimiento tiene una canasta distinta, con códigos únicos por insumo', () => {
  const firmas = PROCEDIMIENTOS_CANASTA.map((p) => p.items.map((i) => `${i.nombre}x${i.cantidad}`).sort().join('|'));
  assert.equal(new Set(firmas).size, PROCEDIMIENTOS_CANASTA.length);
  assert.equal(new Set(PROCEDIMIENTOS_CANASTA.map((p) => p.id)).size, PROCEDIMIENTOS_CANASTA.length);
  for (const p of PROCEDIMIENTOS_CANASTA) {
    assert.equal(new Set(p.items.map((i) => i.codigo)).size, p.items.length, p.id);
    assert.ok(p.items.every((i) => i.codigo && i.nombre && i.cantidad > 0), p.id);
  }
});

test('los insumos de las canastas por procedimiento se pueden buscar en el catálogo', () => {
  const codigos = new Set(INSUMOS_CATALOGO.map((i) => i.codigo));
  for (const p of PROCEDIMIENTOS_CANASTA) assert.ok(p.items.every((i) => codigos.has(i.codigo)), p.id);
});

test('procedimientosCoincidentes: un nombre contiene al otro, sin tildes ni mayúsculas', () => {
  assert.deepEqual(procedimientosCoincidentes(['TIROIDECTOMIA TOTAL']), ['onco-tiroidectomia']);
  assert.deepEqual(procedimientosCoincidentes(['Hemicolectomía derecha laparoscópica']), ['onco-hemicolectomia-lap']);
  assert.deepEqual(procedimientosCoincidentes(['Apendicectomía']), []);
  assert.deepEqual(procedimientosCoincidentes([]), []);
});
