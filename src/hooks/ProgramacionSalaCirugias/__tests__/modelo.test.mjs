import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bloqueoInicio, cantidadDespachada, cantidadDevolvible, cantidadRecibida, fechaHoraTrazaLabel,
  gateCirugia, iniciaEnLabel, novedadItem, resumenCanasta,
} from '../mockCirugiaData.js';

const item = (extra = {}) => ({ nombre: 'Gasas', cantidad: 4, ...extra });
const solicitado = (extra = {}) => item({ solicitudFarmacia: 'solicitado', ...extra });
const entregado = (extra = {}) => item({ solicitudFarmacia: 'entregado', ...extra });
// `canasta` recibe los metadatos (recepcion, consumo, autorizacionUrgencia).
const cirugia = (items, { estado = 'programada', ...canasta } = {}) => ({
  id: 'x', estado, fecha: '2026-09-29', horaInicio: '09:30', canasta: { nombre: 'c', items, ...canasta },
});

test('resumenCanasta: sin solicitar', () => {
  const r = resumenCanasta(cirugia([item(), item({ nombre: 'B' })]));
  assert.equal(r.estado, 'sin-solicitar');
  assert.equal(r.total, 2);
});

test('resumenCanasta: en preparación cuenta los preparados', () => {
  const r = resumenCanasta(cirugia([solicitado({ preparado: true }), solicitado({ nombre: 'B' })]));
  assert.equal(r.estado, 'en-preparacion');
  assert.equal(r.preparados, 1);
  assert.equal(r.porRecibir, 2);
});

test('resumenCanasta: despachada solo si TODOS los solicitados tienen despachado', () => {
  const todos = cirugia([solicitado({ despachado: 4 }), solicitado({ nombre: 'B', despachado: 3 })]);
  assert.equal(resumenCanasta(todos).estado, 'despachada');
  const falta = cirugia([solicitado({ despachado: 4 }), solicitado({ nombre: 'B' })]);
  assert.equal(resumenCanasta(falta).estado, 'en-preparacion');
});

test('resumenCanasta: recibida, con novedades y consumo registrado', () => {
  assert.equal(resumenCanasta(cirugia([entregado()])).estado, 'recibida');
  assert.equal(
    resumenCanasta(cirugia([entregado()], { recepcion: { usuario: 'u', fecha: '2026-09-29T08:10', conNovedades: true } })).estado,
    'con-novedades',
  );
  assert.equal(
    resumenCanasta(cirugia([entregado()], { consumo: { usuario: 'u', fecha: '2026-09-29T10:00', usados: {} } })).estado,
    'consumo-registrado',
  );
});

test('cantidadDespachada/cantidadRecibida caen a `cantidad` en ítems legados', () => {
  assert.equal(cantidadDespachada(item()), 4);
  assert.equal(cantidadDespachada(item({ despachado: 3 })), 3);
  assert.equal(cantidadRecibida(item()), 4);
  assert.equal(cantidadRecibida(item({ recibido: 2 })), 2);
});

test('cantidadDevolvible parte de lo recibido, no de lo solicitado', () => {
  const c = cirugia([entregado({ recibido: 3 })]);
  assert.equal(cantidadDevolvible(c, c.canasta.items[0]), 3);
});

test('gateCirugia cubre los 6 valores', () => {
  const pend = [solicitado()];
  assert.equal(gateCirugia(cirugia(pend)), 'bloqueada');
  assert.equal(gateCirugia(cirugia(pend, { estado: 'urgencia' })), 'urgencia-puede-autorizar');
  assert.equal(
    gateCirugia(cirugia(pend, { estado: 'urgencia', autorizacionUrgencia: { usuario: 'u', fecha: '2026-09-29T08:00' } })),
    'urgencia-autorizada',
  );
  assert.equal(gateCirugia(cirugia([entregado()])), 'lista');
  assert.equal(gateCirugia(cirugia([entregado()], { estado: 'urgencia' })), 'lista');
  assert.equal(gateCirugia(cirugia(pend, { estado: 'realizada' })), 'realizada');
  assert.equal(gateCirugia(cirugia(pend, { estado: 'cancelada' })), 'no-aplica');
});

test('canasta sin ítems: no hay nada que recibir, la cirugía no se bloquea', () => {
  assert.equal(gateCirugia(cirugia([])), 'lista');
  assert.equal(gateCirugia(cirugia([], { estado: 'urgencia' })), 'lista');
  assert.equal(bloqueoInicio(cirugia([])), false);
  assert.equal(bloqueoInicio(cirugia([], { estado: 'urgencia' })), false);
  // Una cirugía ya realizada sigue siendo 'realizada' aunque no tenga canasta.
  assert.equal(gateCirugia(cirugia([], { estado: 'realizada' })), 'realizada');
});

test('bloqueoInicio: bloqueada y urgencia sin autorizar', () => {
  assert.equal(bloqueoInicio(cirugia([solicitado()])), true);
  assert.equal(bloqueoInicio(cirugia([solicitado()], { estado: 'urgencia' })), true);
  assert.equal(
    bloqueoInicio(cirugia([solicitado()], { estado: 'urgencia', autorizacionUrgencia: { usuario: 'u', fecha: '2026-09-29T08:00' } })),
    false,
  );
  assert.equal(bloqueoInicio(cirugia([entregado()])), false);
  assert.equal(bloqueoInicio(cirugia([solicitado()], { estado: 'realizada' })), false);
});

test('novedadItem describe faltantes de farmacia y de la entrega', () => {
  assert.equal(novedadItem(item({ despachado: 4 }), 4), '');
  assert.equal(novedadItem(item({ despachado: 3 }), 3), 'Farmacia despachó 3 de 4');
  assert.equal(novedadItem(item({ despachado: 4 }), 3), 'Faltan 1 en la entrega');
  assert.equal(novedadItem(item({ despachado: 3 }), 2), 'Farmacia despachó 3 de 4 · Faltan 1 en la entrega');
});

test('fechaHoraTrazaLabel usa DD.MES.AAAA - HH:mm', () => {
  assert.equal(fechaHoraTrazaLabel('2026-09-29T08:10'), '29.SEP.2026 - 08:10');
  assert.equal(fechaHoraTrazaLabel('2026-08-01T17:05'), '01.AGO.2026 - 17:05');
});

test('iniciaEnLabel', () => {
  const ahora = new Date(2026, 8, 29, 8, 45);
  const en = (horaInicio, extra = {}) => iniciaEnLabel({ estado: 'programada', fecha: '2026-09-29', horaInicio, ...extra }, ahora);
  assert.equal(en('09:30'), 'Inicia en 45 min');
  assert.equal(en('12:00'), 'Inicia en 3 h 15 min');
  assert.equal(en('11:45'), 'Inicia en 3 h');
  assert.equal(en('08:00'), 'Hora de inicio superada');
  assert.equal(en('09:30', { estado: 'realizada' }), 'Finalizada');
  assert.equal(en('09:30', { fecha: '2026-09-30' }), '30/09/2026');
});
