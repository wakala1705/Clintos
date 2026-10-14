import test from 'node:test';
import assert from 'node:assert/strict';
import {
  diasParaVencer, estadoAgenda, proximaExcepcion,
} from '../estadoAgenda.js';
import { contarPorEstado, filtrarCirujanos, normalizarTexto } from '../listado.js';
import { cirujanosVisibles, puedeEditarAgenda } from '../permisos.js';
import { excepcion, horarioCon, HOY } from './fixtures.mjs';

test('estadoAgenda: sin horario, sin fecha de fin y fecha lejana', () => {
  assert.equal(estadoAgenda(null, HOY), 'sin-configurar');
  assert.equal(estadoAgenda(horarioCon([0], { hasta: null }), HOY), 'configurada');
  assert.equal(estadoAgenda(horarioCon([0], { hasta: '2026-12-31' }), HOY), 'configurada');
});

test('estadoAgenda: límites exactos de "por vencer" (hoy y hoy + 30 días)', () => {
  assert.equal(estadoAgenda(horarioCon([0], { hasta: '2026-10-13' }), HOY), 'vencida');
  assert.equal(estadoAgenda(horarioCon([0], { hasta: HOY }), HOY), 'por-vencer');
  assert.equal(estadoAgenda(horarioCon([0], { hasta: '2026-11-13' }), HOY), 'por-vencer');
  assert.equal(estadoAgenda(horarioCon([0], { hasta: '2026-11-14' }), HOY), 'configurada');
});

test('diasParaVencer', () => {
  assert.equal(diasParaVencer(null, HOY), null);
  assert.equal(diasParaVencer(horarioCon([0], { hasta: null }), HOY), null);
  assert.equal(diasParaVencer(horarioCon([0], { hasta: '2026-10-15' }), HOY), 1);
  assert.equal(diasParaVencer(horarioCon([0], { hasta: '2026-10-13' }), HOY), -1);
});

test('proximaExcepcion: la que empieza primero entre las vigentes o futuras', () => {
  const pasada = excepcion({ id: 1, desde: '2026-10-01', hasta: '2026-10-02' });
  const lejana = excepcion({ id: 2, desde: '2026-11-09', hasta: '2026-11-11' });
  const enCurso = excepcion({ id: 3, desde: '2026-10-12', hasta: '2026-10-16' });
  assert.equal(proximaExcepcion([], HOY), null);
  assert.equal(proximaExcepcion([pasada], HOY), null);
  assert.equal(proximaExcepcion([lejana, pasada, enCurso], HOY)?.id, 3);
  assert.equal(proximaExcepcion([lejana, pasada], HOY)?.id, 2);
});

const fila = (idMedico, nombre, horario) => ({
  cirujano: { idMedico, nombre, sede: 'SEDE NORTE' },
  agenda: { idMedico, horario, excepciones: [] },
});
const FILAS = [
  fila('1', 'ANGEL MARIA PARRA LIÑAN', null),
  fila('2', 'ANIBAL ENRIQUE BADEL RODRIGUEZ', horarioCon([0])),
  fila('3', 'AMAURY RAFAEL GARCIA BURGOS', horarioCon([0], { hasta: '2026-11-01' })),
  fila('4', 'CARLOS MANUEL PEREIRA BETANCOURT', horarioCon([0], { hasta: '2026-09-30' })),
];

test('normalizarTexto quita tildes y mayúsculas', () => {
  assert.equal(normalizarTexto('Ángel María Parra Liñan'), 'angel maria parra linan');
});

test('filtrarCirujanos: la búsqueda no distingue tildes ni mayúsculas', () => {
  const buscar = (busqueda) => filtrarCirujanos(FILAS, { estado: 'todos', busqueda }, HOY).map((f) => f.cirujano.idMedico);
  assert.deepEqual(buscar('ángel'), ['1']);
  assert.deepEqual(buscar('LINAN'), ['1']);
  assert.deepEqual(buscar('  ani  '), ['2'], 'recorta espacios antes de buscar');
  assert.deepEqual(buscar('an'), ['1', '2', '4'], 'busca en cualquier parte del nombre (ANGEL, ANIBAL, MANUEL)');
  assert.deepEqual(buscar(''), ['1', '2', '3', '4']);
  assert.deepEqual(buscar('zzz'), []);
});

test('filtrarCirujanos: combina estado y búsqueda', () => {
  const ids = (estado, busqueda = '') => filtrarCirujanos(FILAS, { estado, busqueda }, HOY).map((f) => f.cirujano.idMedico);
  assert.deepEqual(ids('sin-configurar'), ['1']);
  assert.deepEqual(ids('configurada'), ['2']);
  assert.deepEqual(ids('por-vencer'), ['3']);
  assert.deepEqual(ids('vencida'), ['4']);
  assert.deepEqual(ids('vencida', 'amaury'), []);
});

test('contarPorEstado alimenta los chips', () => {
  assert.deepEqual(contarPorEstado(FILAS, HOY), {
    todos: 4, configurada: 1, 'por-vencer': 1, vencida: 1, 'sin-configurar': 1,
  });
  assert.deepEqual(contarPorEstado([], HOY), {
    todos: 0, configurada: 0, 'por-vencer': 0, vencida: 0, 'sin-configurar': 0,
  });
});

test('permisos: Programación edita a todos; un cirujano solo a sí mismo', () => {
  assert.equal(puedeEditarAgenda({ rol: 'programacion' }, '1'), true);
  assert.equal(puedeEditarAgenda({ rol: 'cirujano', idMedico: '2' }, '2'), true);
  assert.equal(puedeEditarAgenda({ rol: 'cirujano', idMedico: '2' }, '1'), false);
  assert.equal(puedeEditarAgenda({ rol: 'cirujano' }, '1'), false);
});

test('cirujanosVisibles', () => {
  assert.equal(cirujanosVisibles({ rol: 'programacion' }, FILAS).length, 4);
  assert.deepEqual(cirujanosVisibles({ rol: 'cirujano', idMedico: '3' }, FILAS).map((f) => f.cirujano.idMedico), ['3']);
  assert.deepEqual(cirujanosVisibles({ rol: 'cirujano', idMedico: '99' }, FILAS), []);
});
