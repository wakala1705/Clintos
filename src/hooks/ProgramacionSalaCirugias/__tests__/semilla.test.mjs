import test from 'node:test';
import assert from 'node:assert/strict';
import { obtenerHojaConsumo, registrarTiempoEnHoja } from '../hojaConsumo/hojaConsumo.js';
import {
  crearCirugia, estaIniciada, fechaISO, fetchCanastasDia, finalizarCirugia, iniciarCirugia, resumenCanasta,
} from '../mockCirugiaData.js';

const HOY = fechaISO(new Date());

test('sala qx-1 de hoy: los casos del diseño (+ una despachada completa), por hora', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  assert.deepEqual(items.map((c) => c.id), ['12353', '12356', '12359', '12355', '12357']);
  assert.deepEqual(
    items.map((c) => resumenCanasta(c).estado),
    ['recibida', 'despacho-parcial', 'despachada', 'con-novedades', 'en-preparacion'],
  );
});

test('sala qx-1 de hoy: ninguna cirugía se solapa con otra', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  items.slice(1).forEach((c, i) => {
    assert.ok(items[i].horaFin <= c.horaInicio, `${items[i].id} termina ${items[i].horaFin} y ${c.id} empieza ${c.horaInicio}`);
  });
});

test('despachada sin novedades (12359): todo lo despachado es lo solicitado', async () => {
  const c = (await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' })).find((x) => x.id === '12359');
  assert.equal(c.canasta.items.every((i) => i.despachado === i.cantidad && i.preparado === true), true);
});

test('la cirugía realizada sigue en el listado (su canasta está abierta para consumo)', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  assert.equal(items.find((c) => c.id === '12353').estado, 'realizada');
});

test('sala qx-2: histerectomía en preparación, la urgencia y la resección combinada sin solicitar', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-2' });
  assert.deepEqual(items.map((c) => [c.id, resumenCanasta(c).estado]), [['12358', 'en-preparacion'], ['12354', 'sin-solicitar'], ['12361', 'sin-solicitar']]);
});

test('canasta preparada parcialmente: 3 preparados de la canasta de la resección ileocecal', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  const r = resumenCanasta(items.find((c) => c.id === '12357'));
  assert.equal(r.preparados, 3);
  assert.ok(r.total > 5, 'la canasta de una resección laparoscópica tiene más de 5 insumos');
});

test('una cirugía nueva no repite el id de ninguna semilla', async () => {
  const nueva = crearCirugia({ salaId: 'qx-1', fecha: HOY, horaInicio: '19:00', horaFin: '20:00', paciente: { nombre: 'X', documento: 'CC 1' } });
  const ids = (await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' })).map((c) => c.id);
  assert.equal(ids.filter((id) => id === nueva.id).length <= 1, true);
  assert.equal(['12353', '12354', '12355', '12356', '12357', '12358', '12359'].includes(nueva.id), false);
});

test('iniciar cirugía: 12414 (canasta recibida) se inicia; sin canasta recibida, no', async () => {
  const hoy = await fetchCanastasDia({ fecha: HOY, salaId: 'proc-menores' });
  const lista = hoy.map((c) => c.id);
  assert.equal(lista.includes('12414'), true);
  const iniciada = iniciarCirugia('12414', { horaInicioReal: '08:50' });
  assert.equal(iniciada.horaInicioReal, '08:50');
  assert.equal(estaIniciada(iniciada), true);
  assert.equal(iniciada.estado, 'programada');
  assert.throws(() => iniciarCirugia('12414', { horaInicioReal: '08:50' }), /ya está en curso/);
  assert.throws(() => iniciarCirugia('12415', { horaInicioReal: '10:00' }), /canasta debe estar recibida/);
});

test('finalizar cirugía: exige estar en curso, hora válida y cierra como realizada con la hora real', () => {
  assert.throws(() => finalizarCirugia('12415', { horaFinReal: '11:00' }), /solo se puede finalizar una cirugía en curso/i);
  // 12416 (gastroenterología) viene iniciada a las 08:05 en la semilla.
  assert.throws(() => finalizarCirugia('12416', { horaFinReal: '07:50' }), /anterior a la de inicio/);
  const fin = finalizarCirugia('12416', { horaFinReal: '08:40' });
  assert.equal(fin.estado, 'realizada');
  assert.equal(fin.horaFinReal, '08:40');
  assert.equal(fin.horaInicioReal, '08:05');
  assert.equal(estaIniciada(fin), false);
});

test('registrarTiempoEnHoja: crea la hoja y deja inicio y fin en sus tiempos', () => {
  const c = { id: 'hoja-t-1', tipoCirugia: 'Programada', canasta: { nombre: 'X', items: [] }, personal: [] };
  registrarTiempoEnHoja(c, 'inicioOperac', '08:05');
  registrarTiempoEnHoja(c, 'termOperac', '08:40');
  const hoja = obtenerHojaConsumo('hoja-t-1');
  assert.equal(hoja.tiempos.inicioOperac, '08:05');
  assert.equal(hoja.tiempos.termOperac, '08:40');
  assert.equal(hoja.estado, 'borrador');
});

test('insumos oncológicos: sin nombres repetidos y todas las cirugías sembradas con canasta', async () => {
  const todas = [];
  for (const salaId of ['qx-1', 'qx-2', 'proc-menores', 'gastroenterologia', 'hemodinamia']) {
    todas.push(...await fetchCanastasDia({ fecha: HOY, salaId }));
  }
  todas.forEach((c) => {
    const nombres = c.canasta.items.map((i) => i.nombre);
    assert.equal(new Set(nombres).size, nombres.length, `${c.id} tiene insumos repetidos`);
  });
  const port = todas.find((c) => c.id === '12414');
  assert.ok(port.canasta.items.length >= 15);
  assert.ok(port.canasta.items.some((i) => i.nombre.startsWith('Introductor desprendible')));
});

test('iniciar cirugía: registra el inicio de anestesia y no admite una anestesia posterior a la cirugía', () => {
  // 12414 ya se inició en un test anterior: se prueba sobre otra cirugía con canasta recibida.
  const base = { salaId: 'qx-1', fecha: HOY, horaInicio: '08:30', horaFin: '09:30', paciente: { nombre: 'X', documento: 'CC 9' } };
  const nueva = crearCirugia({
    ...base,
    canasta: { nombre: 'C', items: [{ nombre: 'Gasas', cantidad: 1, solicitudFarmacia: 'entregado', despachado: 1, recibido: 1 }], recepcion: { conNovedades: false } },
  });
  assert.throws(() => iniciarCirugia(nueva.id, { horaInicioReal: '08:45', horaInicioAnest: '08:50' }), /anestesia no puede iniciar después/);
  const c = iniciarCirugia(nueva.id, { horaInicioReal: '08:45', horaInicioAnest: '08:30' });
  assert.equal(c.horaInicioAnest, '08:30');
  assert.equal(c.horaInicioReal, '08:45');
});
