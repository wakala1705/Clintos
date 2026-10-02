import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ENTRADAS_HISTORICAS, conteosEstado, entradasDesdeDevoluciones, filtrarEntradas, ordenarEntradas,
  totalesEntradas, unidadesEntrada,
} from '../entradasAsistenciales.js';

const devolucion = (consecutivo, extra = {}) => ({
  consecutivo,
  usuario: 'Camilo Grondona',
  fecha: '2026-10-02T17:43',
  estado: 'confirmada',
  items: [{ nombre: 'Sutura Prolene 2-0', codigo: 'DM000123', cantidad: 1, manejaLote: true, noLote: 'L26A0001' }],
  cirugia: { id: '12355', sala: 'Quirófano #1', paciente: 'Camila Duarte', documento: 'CC 40.556.812' },
  ...extra,
});

test('entradasDesdeDevoluciones: una entrada por devolución, con consecutivo ENT-000001', () => {
  const [e] = entradasDesdeDevoluciones([devolucion(1)]);
  assert.equal(e.consecutivo, 'ENT-000001');
  assert.equal(e.origen, 'Cirugía');
  assert.equal(e.referencia, 'Programación 12355');
  assert.equal(e.paciente, 'CAMILA DUARTE');
  assert.equal(e.fecha, '2026-10-02');
  assert.equal(e.hora, '17:43');
  assert.equal(e.estado, 'confirmada');
  assert.equal(e.items[0].noLote, 'L26A0001');
});

test('entradasDesdeDevoluciones: una devolución anulada queda anulada', () => {
  const [e] = entradasDesdeDevoluciones([devolucion(2, { estado: 'anulada' })]);
  assert.equal(e.estado, 'anulada');
});

test('ordenarEntradas: más recientes primero y no muta el original', () => {
  const lista = [
    { consecutivo: 'ENT-1', fecha: '2026-10-01', hora: '09:00' },
    { consecutivo: 'ENT-2', fecha: '2026-10-02', hora: '08:00' },
    { consecutivo: 'ENT-3', fecha: '2026-10-02', hora: '17:00' },
  ];
  assert.deepEqual(ordenarEntradas(lista).map((e) => e.consecutivo), ['ENT-3', 'ENT-2', 'ENT-1']);
  assert.equal(lista[0].consecutivo, 'ENT-1');
});

test('filtrarEntradas: por estado, origen y texto (consecutivo, referencia, paciente, documento)', () => {
  const e = ENTRADAS_HISTORICAS;
  assert.equal(filtrarEntradas(e).length, e.length);
  assert.ok(filtrarEntradas(e, { estado: 'anulada' }).every((x) => x.estado === 'anulada'));
  assert.ok(filtrarEntradas(e, { origen: 'Urgencias' }).every((x) => x.origen === 'Urgencias'));
  assert.deepEqual(filtrarEntradas(e, { busqueda: ' ent-100412 ' }).map((x) => x.id), ['ENT-100412']);
  assert.ok(filtrarEntradas(e, { busqueda: 'programación 12340' }).length === 1);
  assert.deepEqual(filtrarEntradas(e, { busqueda: 'zzzz' }), []);
});

test('conteosEstado y totalesEntradas: las anuladas no cuentan como devueltas', () => {
  const lista = [
    { estado: 'confirmada', items: [{ cantidad: 2 }, { cantidad: 3 }] },
    { estado: 'anulada', items: [{ cantidad: 9 }] },
    { estado: 'confirmada', items: [{ cantidad: 1 }] },
  ];
  assert.deepEqual(conteosEstado(lista), { todos: 3, confirmada: 2, anulada: 1 });
  assert.deepEqual(totalesEntradas(lista), { entradas: 2, insumos: 3, unidades: 6 });
  assert.equal(unidadesEntrada(lista[0]), 5);
});

test('el histórico de ejemplo es consistente: consecutivos únicos y ítems con cantidad', () => {
  const ids = ENTRADAS_HISTORICAS.map((e) => e.consecutivo);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ENTRADAS_HISTORICAS.every((e) => e.items.length > 0 && e.items.every((i) => i.cantidad > 0)));
});
