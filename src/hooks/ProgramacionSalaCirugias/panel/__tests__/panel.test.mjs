import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canastaPedida, canastaVinculada, conteosFiltros, estadoVisual, filasACsv, filtrarFilas, kpisPanel, rangoFechas, resumenOcupacion,
} from '../panel.js';

const c = (id, salaId, estado, horaInicio, horaFin, extra = {}) => ({
  id,
  salaId,
  estado,
  horaInicio,
  horaFin,
  fecha: '2026-10-02',
  paciente: { nombre: `Paciente ${id}`, documento: `CC ${id}` },
  procedimientoPrincipal: 'Procedimiento',
  cirujano: 'Dr. X',
  ...extra,
});
const AHORA = new Date(2026, 9, 2, 8, 45);
const SALAS = [
  { value: 'a', estado: 'Activo' },
  { value: 'b', estado: 'Activo' },
  { value: 'm', estado: 'Mantenimiento' },
];

test('estadoVisual: deriva pendiente / en curso / retrasada de la hora', () => {
  assert.equal(estadoVisual(c('1', 'a', 'programada', '09:00', '10:00'), AHORA), 'pendiente');
  assert.equal(estadoVisual(c('2', 'a', 'programada', '08:00', '09:30'), AHORA), 'en-curso');
  assert.equal(estadoVisual(c('3', 'a', 'urgencia', '08:45', '09:30'), AHORA), 'en-curso');
  assert.equal(estadoVisual(c('4', 'a', 'programada', '07:00', '08:45'), AHORA), 'retrasada');
  assert.equal(estadoVisual(c('5', 'a', 'programada', '07:00', '08:00'), AHORA), 'retrasada');
});

test('estadoVisual: los estados cerrados no dependen de la hora', () => {
  assert.equal(estadoVisual(c('1', 'a', 'realizada', '09:00', '10:00'), AHORA), 'finalizada');
  assert.equal(estadoVisual(c('2', 'a', 'cancelada', '07:00', '08:00'), AHORA), 'cancelada');
  assert.equal(estadoVisual(c('3', 'a', 'incumplida', '07:00', '08:00'), AHORA), 'incumplida');
});

const LISTA = [
  c('1', 'a', 'realizada', '07:00', '08:00'),
  c('2', 'a', 'programada', '08:00', '09:30'), // en curso
  c('3', 'b', 'programada', '10:00', '11:00'), // pendiente
  c('4', 'b', 'urgencia', '06:00', '07:00'), // retrasada
  c('5', 'a', 'cancelada', '12:00', '13:00'),
  c('6', 'b', 'incumplida', '13:00', '14:00'),
];

test('conteosFiltros: cuenta cada pestaña', () => {
  assert.deepEqual(conteosFiltros(LISTA, AHORA), {
    todas: 6, pendientes: 2, 'en-curso': 1, finalizadas: 1, canceladas: 2,
  });
});

test('filtrarFilas: por pestaña, ordenadas por hora', () => {
  assert.deepEqual(filtrarFilas(LISTA, AHORA).map((x) => x.id), ['4', '1', '2', '3', '5', '6']);
  assert.deepEqual(filtrarFilas(LISTA, AHORA, { filtro: 'pendientes' }).map((x) => x.id), ['4', '3']);
  assert.deepEqual(filtrarFilas(LISTA, AHORA, { filtro: 'canceladas' }).map((x) => x.id), ['5', '6']);
  assert.deepEqual(filtrarFilas(LISTA, AHORA, { filtro: 'en-curso' }).map((x) => x.id), ['2']);
});

test('filtrarFilas: busca en paciente, documento, procedimiento y cirujano', () => {
  const lista = [
    c('1', 'a', 'programada', '09:00', '10:00', { procedimientoPrincipal: 'Hernia inguinal' }),
    c('2', 'a', 'programada', '10:00', '11:00', { cirujano: 'Dra. Paula' }),
  ];
  assert.deepEqual(filtrarFilas(lista, AHORA, { busqueda: 'hernia' }).map((x) => x.id), ['1']);
  assert.deepEqual(filtrarFilas(lista, AHORA, { busqueda: ' PAULA ' }).map((x) => x.id), ['2']);
  assert.deepEqual(filtrarFilas(lista, AHORA, { busqueda: 'cc 2' }).map((x) => x.id), ['2']);
  assert.deepEqual(filtrarFilas(lista, AHORA, { busqueda: 'zzz' }), []);
});

test('resumenOcupacion: solo salas activas, sin canceladas ni incumplidas', () => {
  const r = resumenOcupacion([
    c('1', 'a', 'programada', '07:00', '13:00'), // 360 min
    c('2', 'a', 'cancelada', '14:00', '16:00'),
    c('3', 'b', 'incumplida', '07:00', '09:00'),
  ], SALAS);
  assert.deepEqual(r, { salasOcupadas: 1, salasTotal: 2, ocupacionPct: 25 }); // 360 / (2*720)
});

test('resumenOcupacion: sin cirugías ni salas activas no divide por cero; tope 100', () => {
  assert.deepEqual(resumenOcupacion([], SALAS), { salasOcupadas: 0, salasTotal: 2, ocupacionPct: 0 });
  assert.equal(resumenOcupacion([], [{ value: 'm', estado: 'Mantenimiento' }]).ocupacionPct, 0);
  assert.equal(resumenOcupacion([c('1', 'a', 'programada', '00:00', '23:00')], [{ value: 'a', estado: 'Activo' }]).ocupacionPct, 100);
});

test('kpisPanel: totales, en curso con sus salas, finalizadas y canceladas', () => {
  const k = kpisPanel(LISTA, AHORA, SALAS);
  assert.equal(k.programadas, 6);
  assert.equal(k.enCurso, 1);
  assert.equal(k.salasEnCurso, 1);
  assert.equal(k.finalizadas, 1);
  assert.equal(k.canceladas, 2);
  assert.equal(k.salasTotal, 2);
});

test('filasACsv: cabecera, comillas escapadas y estado visual', () => {
  const csv = filasACsv(
    [c('1', 'a', 'realizada', '07:00', '08:30', { procedimientoPrincipal: 'Cole "lap"', tipoAnestesia: 'General' })],
    AHORA,
    () => 'Quirófano #1',
  );
  const [cab, fila] = csv.replace('﻿', '').split('\r\n');
  assert.equal(cab, '"Hora","Sala","Paciente","Documento","Procedimiento","Anestesia","Cirujano","Duración (min)","Canasta vinculada","Canasta pedida","Estado"');
  assert.equal(fila, '"07:00","Quirófano #1","Paciente 1","CC 1","Cole ""lap""","General","Dr. X","90","No vinculada","—","Finalizada"');
});

test('canastaVinculada/canastaPedida: sin canasta, sin pedir y pedida a farmacia', () => {
  const sin = c('1', 'a', 'programada', '07:00', '08:00');
  assert.equal(canastaVinculada(sin), null);
  assert.equal(canastaPedida(sin), null);

  const items = [{ nombre: 'Gasas', cantidad: 2, estado: 'disponible' }];
  const sinPedir = c('2', 'a', 'programada', '07:00', '08:00', { canasta: { nombre: 'Canasta X', items } });
  assert.deepEqual(canastaVinculada(sinPedir), { nombre: 'Canasta X', items: 1 });
  assert.deepEqual(canastaPedida(sinPedir), { estado: 'sin-solicitar', label: 'No pedida' });

  const pedida = c('3', 'a', 'programada', '07:00', '08:00', {
    canasta: { nombre: 'Canasta X', items: [{ ...items[0], solicitudFarmacia: 'solicitado', preparado: false }] },
    farmacia: { numeroPedido: '4590' },
  });
  assert.deepEqual(canastaPedida(pedida), { estado: 'en-preparacion', label: 'En preparación' });
});

test('rangoFechas: hoy, semana (lunes a domingo) y mes', () => {
  assert.deepEqual(rangoFechas('hoy', AHORA), { inicio: '2026-10-02', fin: '2026-10-02', dias: 1 });
  assert.deepEqual(rangoFechas('semana', AHORA), { inicio: '2026-09-28', fin: '2026-10-04', dias: 7 });
  assert.deepEqual(rangoFechas('mes', AHORA), { inicio: '2026-10-01', fin: '2026-10-31', dias: 31 });
});

test('estadoVisual: un día anterior abierto es retrasada y uno futuro es pendiente', () => {
  assert.equal(estadoVisual(c('1', 'a', 'programada', '09:00', '10:00', { fecha: '2026-10-01' }), AHORA), 'retrasada');
  assert.equal(estadoVisual(c('2', 'a', 'programada', '07:00', '08:00', { fecha: '2026-10-03' }), AHORA), 'pendiente');
});

test('resumenOcupacion: la capacidad escala con los días del rango', () => {
  const una = [c('1', 'a', 'programada', '07:00', '19:00')];
  assert.equal(resumenOcupacion(una, SALAS, 1).ocupacionPct, 50);
  assert.equal(resumenOcupacion(una, SALAS, 7).ocupacionPct, 7);
});
