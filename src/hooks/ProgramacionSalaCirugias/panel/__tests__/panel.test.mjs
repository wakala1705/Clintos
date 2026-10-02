import test from 'node:test';
import assert from 'node:assert/strict';
import {
  conteosFiltros, estadoVisual, filasACsv, filtrarFilas, kpisPanel, resumenOcupacion,
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
  assert.equal(cab, '"Hora","Sala","Paciente","Documento","Procedimiento","Anestesia","Cirujano","Duración (min)","Estado"');
  assert.equal(fila, '"07:00","Quirófano #1","Paciente 1","CC 1","Cole ""lap""","General","Dr. X","90","Finalizada"');
});
