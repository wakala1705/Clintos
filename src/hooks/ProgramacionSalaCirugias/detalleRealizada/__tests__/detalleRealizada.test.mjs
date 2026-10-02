import test from 'node:test';
import assert from 'node:assert/strict';
import { balanceInsumos, hitosCierre } from '../detalleRealizada.js';

const entregado = (nombre, cantidad) => ({
  nombre, cantidad, solicitudFarmacia: 'entregado', despachado: cantidad, recibido: cantidad,
});

const base = () => ({
  canasta: {
    items: [entregado('Gasas', 10), entregado('Guantes', 4), { nombre: 'Clips', cantidad: 6 }],
    recepcion: { usuario: 'Ana', fecha: '2026-10-02T06:48', conNovedades: false },
  },
  farmacia: { fechaSolicitud: '2026-10-01T14:30' },
});

test('balanceInsumos: sin consumo registrado, `usado` queda null y no cuenta los no entregados', () => {
  const b = balanceInsumos(base());
  assert.equal(b.consumoRegistrado, false);
  assert.deepEqual(b.filas.map((f) => f.nombre), ['Gasas', 'Guantes']);
  assert.equal(b.entregado, 14);
  assert.equal(b.usado, null);
  assert.equal(b.devuelto, 0);
  assert.equal(b.filas[0].usado, null);
});

test('balanceInsumos: con consumo y devolución suma usado y devuelto por insumo', () => {
  const c = base();
  c.canasta.consumo = { usuario: 'Ana', fecha: '2026-10-02T10:00', usados: { Gasas: 7, Guantes: 4 } };
  c.devoluciones = [{
    consecutivo: 1, usuario: 'Ana', fecha: '2026-10-02T10:05', items: [{ nombre: 'Gasas', cantidad: 3 }],
  }];
  const b = balanceInsumos(c);
  assert.equal(b.consumoRegistrado, true);
  assert.equal(b.usado, 11);
  assert.equal(b.devuelto, 3);
  assert.deepEqual(b.filas[0], {
    nombre: 'Gasas', entregado: 10, usado: 7, devuelto: 3,
  });
});

test('balanceInsumos: una cirugía sin canasta no falla', () => {
  const b = balanceInsumos({});
  assert.deepEqual(b, {
    filas: [], consumoRegistrado: false, entregado: 0, usado: null, devuelto: 0,
  });
});

test('hitosCierre: marca como pendiente lo que falta (consumo)', () => {
  const h = hitosCierre(base());
  assert.deepEqual(h.map((x) => [x.key, x.estado]), [
    ['solicitud', 'hecho'], ['recepcion', 'hecho'], ['hoja', 'pendiente'], ['consumo', 'pendiente'],
  ]);
  assert.equal(h[1].usuario, 'Ana');
  assert.equal(h[1].label, 'Canasta recibida');
});

test('hitosCierre: con novedades, consumo y devoluciones, en orden', () => {
  const c = base();
  c.canasta.recepcion.conNovedades = true;
  c.canasta.consumo = { usuario: 'Luis', fecha: '2026-10-02T10:00', usados: {} };
  c.devoluciones = [
    { consecutivo: 7, usuario: 'Luis', fecha: '2026-10-02T10:05', items: [] },
    { consecutivo: 8, usuario: 'Luis', fecha: '2026-10-02T11:00', items: [] },
  ];
  const h = hitosCierre(c, { estado: 'registrada', registradaEn: '2026-10-02T09:50', materiales: [] });
  assert.deepEqual(h.map((x) => x.key), ['solicitud', 'recepcion', 'hoja', 'consumo', 'devolucion-7', 'devolucion-8']);
  assert.equal(h[2].fecha, '2026-10-02T09:50');
  assert.equal(h[1].label, 'Canasta recibida con novedades');
  assert.ok(h.every((x) => x.estado === 'hecho'));
  assert.equal(h[4].label, 'Devolución a farmacia · N.º 7');
});

test('hitosCierre: sin recepción ni farmacia deja recepción y consumo pendientes', () => {
  const h = hitosCierre({ canasta: { items: [] } });
  assert.deepEqual(h.map((x) => [x.key, x.estado]), [['recepcion', 'pendiente'], ['hoja', 'pendiente'], ['consumo', 'pendiente']]);
});
