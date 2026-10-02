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
  assert.deepEqual(estadoCierre(cirugia(), null).faltan, ['registro de consumo']);
  assert.deepEqual(estadoCierre(cirugia(), hoja([])).faltan, ['consumo y devolución']);
  assert.deepEqual(estadoCierre(cirugia({ consumo }), null).faltan, ['hoja de consumo']);
  const completo = estadoCierre(cirugia({ consumo }), hoja([]));
  assert.equal(completo.completo, true);
  assert.deepEqual(completo.faltan, []);
});

import { planRegistroConsumo, usadosDesdeMateriales } from '../cierre.js';

const realizada = (extra = {}) => ({ ...cirugia(extra), estado: 'realizada' });

test('usadosDesdeMateriales: funciona con el borrador (sin exigir hoja registrada)', () => {
  const u = usadosDesdeMateriales(cirugia(), [mat('Gasas estériles', '7')]);
  assert.deepEqual(u.usados, { 'Gasas estériles': 7 });
});

test('planRegistroConsumo: realizada con canasta recibida genera la devolución de lo no consumido', () => {
  const p = planRegistroConsumo(realizada({ recepcion: { usuario: 'Ana', fecha: '2026-10-02T06:48', conNovedades: false } }), [mat('Gasas estériles', '7'), mat('Guantes', '1')]);
  assert.equal(p.bloqueo, null);
  assert.equal(p.generaDevolucion, true);
  assert.equal(p.unidades, 3 + 3); // 10-7 y 4-1
  assert.equal(p.insumos, 2);
  assert.equal(p.sinDato, 1); // Clips: la hoja no lo informa -> usado completo
});

test('planRegistroConsumo: bloquea si la cirugía no está realizada o la canasta no se recibió', () => {
  const recepcion = { usuario: 'Ana', fecha: '2026-10-02T06:48', conNovedades: false };
  assert.match(planRegistroConsumo(cirugia({ recepcion }), []).bloqueo, /realizada/);
  const sinRecibir = { estado: 'realizada', canasta: { items: [{ nombre: 'Gasas', cantidad: 2, solicitudFarmacia: 'solicitado' }] } };
  assert.match(planRegistroConsumo(sinRecibir, []).bloqueo, /recibida/);
});

test('planRegistroConsumo: con el consumo ya registrado (p. ej. desde Canastas) no genera otra devolución', () => {
  const consumo = { usuario: 'Ana', fecha: '2026-10-02T10:00', usados: {} };
  const p = planRegistroConsumo(realizada({ recepcion: { usuario: 'Ana', fecha: 'x', conNovedades: false }, consumo }), [mat('Gasas estériles', '7')]);
  assert.equal(p.bloqueo, null);
  assert.equal(p.yaRegistrado, true);
  assert.equal(p.generaDevolucion, false);
});
