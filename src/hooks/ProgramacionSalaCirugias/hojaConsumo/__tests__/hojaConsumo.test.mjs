import test from 'node:test';
import assert from 'node:assert/strict';
import {
  paqueteDeCirugia, construirHojaConsumo, materialManual, calcularDevuelto, excedeEntregado,
  materialesConExceso, totales, dxDeIngreso, formatearMiles, fechaDDMMAAAA,
  obtenerHojaConsumo, guardarHojaConsumo, materialesConConsumo, consumoCompleto, marcarTodoConsumido, pasoConsumo,
} from '../hojaConsumo.js';

const cirugia = (extra = {}) => ({
  id: 'c1',
  tipoCirugia: 'Programada',
  canasta: { nombre: 'Colecistectomía estándar', items: [{ nombre: 'X', cantidad: 9 }] },
  personal: [
    { rol: 'Cirujano', nombre: 'Dr. Juan García' },
    { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
    { rol: 'Circulante', nombre: 'Luis Ramírez' },
  ],
  ...extra,
});

test('paqueteDeCirugia: la canasta de colecistectomía usa el paquete COLE-LAP con 13 materiales', () => {
  const p = paqueteDeCirugia(cirugia());
  assert.equal(p.nombre, 'COLE-LAP');
  assert.equal(p.materiales.length, 13);
  assert.equal(p.materiales.find((m) => m.nombre === 'Clips quirúrgico').receta, true);
});

test('paqueteDeCirugia: una canasta sin paquete propio usa sus ítems', () => {
  const p = paqueteDeCirugia(cirugia({ canasta: { nombre: 'Hernia inguinal estándar', items: [{ nombre: 'Malla', cantidad: 1 }] } }));
  assert.equal(p.nombre, 'Hernia inguinal estándar');
  assert.deepEqual(p.materiales, [{ nombre: 'Malla', cantidad: 1, receta: false }]);
});

test('construirHojaConsumo: tipo, equipo desde el personal y materiales sin consumo', () => {
  const h = construirHojaConsumo(cirugia({ tipoCirugia: 'Urgencia' }));
  assert.equal(h.tipo, 'emergencia');
  assert.equal(h.equipo.cirujano, 'Dr. Juan García');
  assert.equal(h.equipo.ayudante, '');
  assert.equal(h.materiales[0].consumido, '');
  assert.equal(h.materiales[0].manual, false);
  assert.equal(construirHojaConsumo(cirugia()).tipo, 'programado');
});

test('calcularDevuelto: entregado − consumido; null sin consumo', () => {
  assert.equal(calcularDevuelto({ entregado: '4', consumido: '1' }), 3);
  assert.equal(calcularDevuelto({ entregado: '4', consumido: '0' }), 4);
  assert.equal(calcularDevuelto({ entregado: '4', consumido: '' }), null);
  assert.equal(calcularDevuelto({ entregado: '', consumido: '1' }), null);
  assert.equal(calcularDevuelto({ entregado: '1', consumido: '9' }), null);
});

test('excedeEntregado / materialesConExceso: solo consumido > entregado', () => {
  assert.equal(excedeEntregado({ entregado: '2', consumido: '3' }), true);
  assert.equal(excedeEntregado({ entregado: '2', consumido: '2' }), false);
  assert.equal(excedeEntregado({ entregado: '2', consumido: '' }), false);
  const mats = [{ entregado: '2', consumido: '3' }, { entregado: '2', consumido: '1' }];
  assert.equal(materialesConExceso(mats).length, 1);
});

test('totales: ítems y sumas; el devuelto ignora filas sin consumo', () => {
  const t = totales([
    { entregado: '2', consumido: '1' },
    { entregado: '4', consumido: '' },
    { entregado: '1', consumido: '1' },
  ]);
  assert.deepEqual(t, { items: 3, entregado: 7, consumido: 2, devuelto: 1 });
});

test('materialManual: fila editable con 1 unidad entregada', () => {
  const m = materialManual();
  assert.equal(m.manual, true);
  assert.equal(m.entregado, '1');
  assert.equal(m.nombre, '');
});

test('dxDeIngreso: separa código y descripción; texto libre o vacío', () => {
  assert.deepEqual(dxDeIngreso('K810 - COLECITITIS AGUDA'), { codigo: 'K810', descripcion: 'COLECITITIS AGUDA' });
  assert.deepEqual(dxDeIngreso('Apendicitis aguda'), { codigo: '—', descripcion: 'Apendicitis aguda' });
  assert.deepEqual(dxDeIngreso(undefined), { codigo: '—', descripcion: '—' });
});

test('formatearMiles y fechaDDMMAAAA', () => {
  assert.equal(formatearMiles('CC 52.123.456'), '52.123.456');
  assert.equal(formatearMiles('1234'), '1.234');
  assert.equal(formatearMiles(''), '—');
  assert.equal(fechaDDMMAAAA('2026-08-31'), '31/08/2026');
  assert.equal(fechaDDMMAAAA(undefined), '—');
});

test('store: guarda una copia y la devuelve sin compartir referencias', () => {
  const h = construirHojaConsumo(cirugia({ id: 'store-1' }));
  guardarHojaConsumo(h);
  h.equipo.cirujano = 'cambiado';
  const g = obtenerHojaConsumo('store-1');
  assert.equal(g.equipo.cirujano, 'Dr. Juan García');
  assert.equal(obtenerHojaConsumo('no-existe'), null);
});

test('materialesConConsumo / consumoCompleto: exige consumo válido en todos y sin exceso', () => {
  const ok = [{ entregado: '2', consumido: '0' }, { entregado: '1', consumido: '1' }];
  assert.equal(materialesConConsumo(ok).length, 2);
  assert.equal(consumoCompleto(ok), true);
  assert.equal(consumoCompleto([...ok, { entregado: '1', consumido: '' }]), false);
  assert.equal(consumoCompleto([...ok, { entregado: '1', consumido: '3' }]), false);
  assert.equal(consumoCompleto([]), false);
});

test('marcarTodoConsumido: consumido = entregado; no toca filas sin cantidad válida', () => {
  const r = marcarTodoConsumido([
    { id: 'a', entregado: '4', consumido: '1' },
    { id: 'b', entregado: '', consumido: '2' },
    { id: 'c', entregado: 'x', consumido: '' },
  ]);
  assert.equal(r[0].consumido, '4');
  assert.equal(r[1].consumido, '2');
  assert.equal(r[2].consumido, '');
});

test('pasoConsumo: suma/resta 1 entre 0 y el tope; vacío cuenta como 0', () => {
  assert.equal(pasoConsumo('', 1, 3), '1');
  assert.equal(pasoConsumo('2', 1, 3), '3');
  assert.equal(pasoConsumo('3', 1, 3), '3');
  assert.equal(pasoConsumo('1', -1, 3), '0');
  assert.equal(pasoConsumo('0', -1, 3), '0');
  assert.equal(pasoConsumo('', -1, 3), '0');
  assert.equal(pasoConsumo('5', 1, null), '6');
});
