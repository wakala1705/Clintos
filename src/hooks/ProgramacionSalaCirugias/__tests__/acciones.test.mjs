import test from 'node:test';
import assert from 'node:assert/strict';
import {
  actualizarCirugia, cancelarSolicitudInsumos, cantidadDevuelta, cerrarConFaltante, despacharCanasta,
  registrarConsumo, registrarRecepcion, resumenCanasta, solicitarInsumosFarmacia,
  fetchCanastasDia, fechaISO,
} from '../mockCirugiaData.js';

const HOY = fechaISO(new Date());
const cirugia = async (id, salaId = 'qx-1') => (await fetchCanastasDia({ fecha: HOY, salaId })).find((c) => c.id === id);

test('registrarRecepcion: rechaza recibir más de lo despachado y no cambia nada', async () => {
  assert.throws(
    () => registrarRecepcion('12356', { recibidos: { 'Gasas estériles': 6 }, usuario: 'Ana' }),
    /Gasas estériles: lo recibido debe estar entre 0 y 5/,
  );
  assert.equal(resumenCanasta(await cirugia('12356')).estado, 'despacho-parcial');
});

test('registrarRecepcion: exige que farmacia haya despachado', () => {
  assert.throws(() => registrarRecepcion('12358', { recibidos: {}, usuario: 'Ana' }), /todavía no fue despachada/);
});

test('despacho parcial: recibir lo despachado deja la solicitud abierta y acumula', async () => {
  const c = registrarRecepcion('12356', { recibidos: { 'Gasas estériles': 3 }, usuario: 'Ana' });
  assert.equal(resumenCanasta(c).estado, 'despacho-parcial');
  const gasas = c.canasta.items.find((i) => i.nombre === 'Gasas estériles');
  assert.equal(gasas.solicitudFarmacia, 'solicitado');
  assert.equal(gasas.recibido, 3);
  assert.equal(c.canasta.recepcion, undefined);
  assert.equal(c.canasta.recepciones.length, 1);
  // Lo que falta por recibir es lo despachado (5) menos lo ya recibido (3).
  assert.throws(
    () => registrarRecepcion('12356', { recibidos: { 'Gasas estériles': 3 }, usuario: 'Ana' }),
    /Gasas estériles: lo recibido debe estar entre 0 y 2/,
  );
});

test('cerrarConFaltante: exige haber recibido todo lo despachado', () => {
  assert.throws(() => cerrarConFaltante('12356', { usuario: 'Ana' }), /Recibe primero lo que farmacia ya despachó/);
  assert.throws(() => cerrarConFaltante('12359', { usuario: 'Ana' }), /despacho parcial/);
});

test('cerrarConFaltante: cierra con novedades, origen farmacia y trazabilidad', () => {
  registrarRecepcion('12356', { recibidos: {}, usuario: 'Ana' });
  assert.throws(() => cerrarConFaltante('12356', { usuario: 'Ana', motivo: 'inventado' }), /motivo de la novedad no es válido/);
  const c = cerrarConFaltante('12356', { usuario: 'Ana', nota: '  Sin stock  ' });
  assert.equal(resumenCanasta(c).estado, 'con-novedades');
  const gasas = c.canasta.items.find((i) => i.nombre === 'Gasas estériles');
  assert.deepEqual([gasas.despachado, gasas.recibido], [5, 5]);
  assert.equal(gasas.novedad, 'Farmacia despachó 5 de 6');
  assert.equal(c.canasta.items.every((i) => i.solicitudFarmacia === 'entregado'), true);
  assert.equal(c.canasta.recepcion.cierreConFaltante, true);
  assert.equal(c.canasta.recepcion.origen, 'farmacia');
  assert.equal(c.canasta.recepcion.motivo, 'faltante-farmacia');
  assert.equal(c.canasta.recepcion.nota, 'Sin stock');
  assert.equal(c.canasta.recepcion.fecha, `${HOY}T08:45`);
});

test('registrarRecepcion: despachada completa, sin faltantes → recibida sin novedades', () => {
  const c = registrarRecepcion('12359', { recibidos: {}, usuario: 'Ana' });
  assert.equal(resumenCanasta(c).estado, 'recibida');
  assert.equal(c.canasta.recepcion.conNovedades, false);
  assert.equal(c.canasta.items.some((i) => i.novedad), false);
});

test('despacharCanasta + registrarRecepcion sin faltantes → recibida', () => {
  const despachada = despacharCanasta('12357');
  assert.equal(resumenCanasta(despachada).estado, 'despachada');
  const c = registrarRecepcion('12357', { recibidos: {}, usuario: 'Ana' });
  assert.equal(resumenCanasta(c).estado, 'recibida');
  assert.equal(c.canasta.recepcion.conNovedades, false);
});

test('registrarConsumo: valida topes y exige cirugía realizada', () => {
  assert.throws(() => registrarConsumo('12356', { usados: {}, usuario: 'Ana' }), /al finalizar la cirugía/);
  assert.throws(
    () => registrarConsumo('12353', { usados: { 'Gasas estériles': 11 }, usuario: 'Ana' }),
    /Gasas estériles: lo usado debe estar entre 0 y 10/,
  );
});

test('registrarConsumo: crea la devolución con recibido − usado y queda consumo-registrado', () => {
  const c = registrarConsumo('12353', { usados: { 'Gasas estériles': 6, 'Trocar 5mm': 1 }, usuario: 'Ana' });
  assert.equal(resumenCanasta(c).estado, 'consumo-registrado');
  assert.equal(c.canasta.consumo.usuario, 'Ana');
  assert.equal(c.canasta.consumo.fecha, `${HOY}T08:45`);
  assert.equal(c.canasta.consumo.usados['Gasas estériles'], 6);
  assert.equal(c.devoluciones.length, 1);
  assert.deepEqual(
    c.devoluciones[0].items.map((i) => [i.nombre, i.cantidad]),
    [['Trocar 5mm', 1], ['Gasas estériles', 4]],
  );
  assert.equal(cantidadDevuelta(c, 'Gasas estériles'), 4);
});

test('cancelar la solicitud borra preparado/despachado; volver a pedir → en-preparacion', () => {
  const causal = { idCausal: '1', descripcion: 'Cambio de plan' };
  const cancelada = cancelarSolicitudInsumos('12358', { causal });
  assert.equal(resumenCanasta(cancelada).estado, 'sin-solicitar');
  assert.equal(cancelada.canasta.items.some((i) => 'preparado' in i || 'despachado' in i), false);
  assert.equal(resumenCanasta(solicitarInsumosFarmacia('12358')).estado, 'en-preparacion');
});

test('pedir insumos a una cirugía sin número de pedido le asigna el siguiente', () => {
  const causal = { idCausal: '1', descripcion: 'Cambio de plan' };
  const previa = cancelarSolicitudInsumos('12358', { causal });
  actualizarCirugia('12358', { farmacia: { ...previa.farmacia, numeroPedido: '—' } });
  const c = solicitarInsumosFarmacia('12358');
  assert.match(c.farmacia.numeroPedido, /^[0-9]+$/);
  assert.ok(Number(c.farmacia.numeroPedido) > 4596);
  // Con número ya asignado no se reasigna.
  const otra = cancelarSolicitudInsumos('12358', { causal });
  assert.equal(solicitarInsumosFarmacia('12358').farmacia.numeroPedido, otra.farmacia.numeroPedido);
});

test('despacho parcial (demo) y luego el saldo: se cierra recibiendo y no se puede anular con insumos recibidos', () => {
  const causal = { idCausal: '1', descripcion: 'Cambio de plan' };
  assert.equal(resumenCanasta(despacharCanasta('12358', { parcial: true })).estado, 'despacho-parcial');
  registrarRecepcion('12358', { recibidos: {}, usuario: 'Ana' });
  assert.throws(() => cancelarSolicitudInsumos('12358', { causal }), /ya se recibieron insumos/);
  assert.equal(resumenCanasta(despacharCanasta('12358')).estado, 'despachada');
  const c = registrarRecepcion('12358', { recibidos: {}, usuario: 'Ana' });
  assert.equal(resumenCanasta(c).estado, 'recibida');
  assert.equal(c.canasta.items.every((i) => i.recibido === i.cantidad), true);
  assert.equal(c.canasta.recepciones.length, 2);
});
