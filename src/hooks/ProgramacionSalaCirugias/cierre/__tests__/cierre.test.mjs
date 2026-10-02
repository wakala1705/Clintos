import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoCierre, hojaRegistrada, precargaConsumoDesdeHoja } from '../cierre.js';

const item = (nombre, cantidad) => ({
  nombre, cantidad, solicitudFarmacia: 'entregado', despachado: cantidad, recibido: cantidad,
});
const cirugia = (extra = {}) => ({
  canasta: { items: [item('Gasas estériles', 10), item('Guantes', 4), item('Clips', 6)], ...extra },
});
const hoja = (materiales, estado = 'registrada') => ({ estado, materiales });
const mat = (nombre, consumido) => ({ nombre, consumido });

test('hojaRegistrada: solo el estado "registrada" cuenta (no el borrador ni null)', () => {
  assert.equal(hojaRegistrada(hoja([])), true);
  assert.equal(hojaRegistrada(hoja([], 'borrador')), false);
  assert.equal(hojaRegistrada(null), false);
});

test('precarga: toma lo consumido por nombre (sin mayúsculas) y no inventa lo demás', () => {
  const p = precargaConsumoDesdeHoja(cirugia(), hoja([mat('GASAS ESTÉRILES', '7'), mat('guantes', '4'), mat('Otro', '3')]));
  assert.deepEqual(p.usados, { 'Gasas estériles': 7, Guantes: 4 });
  assert.equal(p.coincidencias, 2);
  assert.equal(p.total, 3);
});

test('precarga: se limita a lo recibido y ignora consumos vacíos o inválidos', () => {
  const p = precargaConsumoDesdeHoja(cirugia(), hoja([mat('Gasas estériles', '99'), mat('Guantes', ''), mat('Clips', 'abc')]));
  assert.deepEqual(p.usados, { 'Gasas estériles': 10 });
  const negativo = precargaConsumoDesdeHoja(cirugia(), hoja([mat('Clips', '-2')]));
  assert.deepEqual(negativo.usados, { Clips: 0 });
});

test('precarga: sin hoja registrada (borrador o ninguna) no precarga nada', () => {
  assert.deepEqual(precargaConsumoDesdeHoja(cirugia(), hoja([mat('Gasas estériles', '7')], 'borrador')).usados, {});
  assert.deepEqual(precargaConsumoDesdeHoja(cirugia(), null), { usados: {}, coincidencias: 0, total: 3 });
});

test('precarga: un paquete con otro listado que la canasta no coincide con nada', () => {
  const p = precargaConsumoDesdeHoja(cirugia(), hoja([mat('Jeringa 20 cc', '1'), mat('Guantes # 7.5', '4')]));
  assert.equal(p.coincidencias, 0);
});

test('estadoCierre: completo solo con hoja registrada Y consumo registrado', () => {
  const consumo = { usuario: 'Ana', fecha: '2026-10-02T10:00', usados: {} };
  assert.deepEqual(estadoCierre(cirugia(), null).faltan, ['hoja de consumo', 'consumo y devolución']);
  assert.deepEqual(estadoCierre(cirugia(), hoja([])).faltan, ['consumo y devolución']);
  assert.deepEqual(estadoCierre(cirugia({ consumo }), null).faltan, ['hoja de consumo']);
  const completo = estadoCierre(cirugia({ consumo }), hoja([]));
  assert.equal(completo.completo, true);
  assert.deepEqual(completo.faltan, []);
});
