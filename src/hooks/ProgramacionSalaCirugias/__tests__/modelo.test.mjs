import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HORA_DEMO, MOTIVOS_NOVEDAD, ahoraDemo, cantidadDespachada, cantidadDevolvible, cantidadRecibida, fechaHoraTrazaLabel,
  fechaISO, iniciaEnLabel, novedadItem, origenDiferencia, resumenCanasta, unidadesPorRecibir, unidadesSaldo,
} from '../mockCirugiaData.js';

const item = (extra = {}) => ({ nombre: 'Gasas', cantidad: 4, ...extra });
const solicitado = (extra = {}) => item({ solicitudFarmacia: 'solicitado', ...extra });
const entregado = (extra = {}) => item({ solicitudFarmacia: 'entregado', ...extra });
// `canasta` recibe los metadatos (recepcion, consumo).
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

test('resumenCanasta: despachada solo si farmacia despachó TODO lo solicitado', () => {
  const todos = cirugia([solicitado({ despachado: 4 }), solicitado({ nombre: 'B', despachado: 4 })]);
  assert.equal(resumenCanasta(todos).estado, 'despachada');
  const nada = cirugia([solicitado({}), solicitado({ nombre: 'B' })]);
  assert.equal(resumenCanasta(nada).estado, 'en-preparacion');
});

test('resumenCanasta: despacho parcial si algo se despachó pero queda saldo', () => {
  const menos = cirugia([solicitado({ despachado: 4 }), solicitado({ nombre: 'B', despachado: 3 })]);
  assert.equal(resumenCanasta(menos).estado, 'despacho-parcial');
  const falta = cirugia([solicitado({ despachado: 4 }), solicitado({ nombre: 'B' })]);
  assert.equal(resumenCanasta(falta).estado, 'despacho-parcial');
  assert.equal(unidadesSaldo(menos), 1);
  assert.equal(unidadesPorRecibir(menos), 7);
  const recibido = cirugia([solicitado({ despachado: 4, recibido: 4 }), solicitado({ nombre: 'B', despachado: 3, recibido: 1 })]);
  assert.equal(unidadesPorRecibir(recibido), 2);
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

test('ahoraDemo: hoy a la hora de demostración fija', () => {
  assert.equal(HORA_DEMO, '08:45');
  const d = ahoraDemo();
  assert.equal(fechaISO(d), fechaISO(new Date()));
  assert.equal(d.getHours() * 60 + d.getMinutes(), 8 * 60 + 45);
  assert.equal(d.getSeconds(), 0);
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

test('origenDiferencia distingue farmacia, entrega y ambos', () => {
  const par = (despachado, recibido) => ({ item: item({ despachado }), recibido });
  assert.equal(origenDiferencia([par(4, 4)]), null);
  assert.equal(origenDiferencia([par(3, 3)]), 'farmacia');
  assert.equal(origenDiferencia([par(4, 3)]), 'entrega');
  assert.equal(origenDiferencia([par(3, 3), par(4, 2)]), 'ambos');
  assert.equal(MOTIVOS_NOVEDAD.some((m) => m.value === 'faltante-farmacia'), true);
});
