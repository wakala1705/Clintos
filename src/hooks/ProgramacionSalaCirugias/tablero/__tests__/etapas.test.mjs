import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ETAPAS_VISIBLES, agruparPorEtapa, etapaDe, resolverMovimiento,
} from '../etapas.js';

const c = (id, estado, extra = {}) => ({
  id, estado, horaInicio: '07:00', ...extra,
});

test('etapaDe: usa la guardada o la deduce', () => {
  assert.equal(etapaDe(c('1', 'programada')), 'programada');
  assert.equal(etapaDe(c('2', 'programada', { horaInicioReal: '07:05' })), 'en-quirofano');
  assert.equal(etapaDe(c('3', 'realizada')), 'finalizado');
  assert.equal(etapaDe(c('4', 'programada', { etapa: 'en-preparacion' })), 'en-preparacion');
  assert.equal(etapaDe(c('6', 'programada', { etapa: 'admitido' })), 'programada'); // etapa oculta
  assert.equal(etapaDe(c('5', 'programada', { etapa: 'inventada' })), 'programada');
});

test('agruparPorEtapa: 6 columnas, sin canceladas/incumplidas, por hora', () => {
  const grupos = agruparPorEtapa([
    c('1', 'programada', { horaInicio: '09:00' }),
    c('2', 'programada', { horaInicio: '07:00' }),
    c('3', 'cancelada'),
    c('4', 'incumplida'),
    c('5', 'urgencia', { etapa: 'en-preparacion' }),
  ]);
  assert.equal(grupos.length, ETAPAS_VISIBLES.length);
  assert.equal(grupos.length, 6);
  assert.deepEqual(grupos[0].cirugias.map((x) => x.id), ['2', '1']);
  assert.deepEqual(grupos[1].cirugias.map((x) => x.id), ['5']); // En preparación
  assert.equal(grupos.flatMap((g) => g.cirugias).length, 3);
});

test('resolverMovimiento: libre salvo donde hay un dato que registrar', () => {
  const prog = c('1', 'programada');
  assert.equal(resolverMovimiento(prog, 'programada').tipo, 'ninguno');
  assert.equal(resolverMovimiento(prog, 'admitido').tipo, 'bloqueado'); // etapa oculta
  assert.equal(resolverMovimiento(prog, 'en-preparacion').tipo, 'directo');
  assert.equal(resolverMovimiento(prog, 'en-quirofano').tipo, 'iniciar');
  assert.equal(resolverMovimiento(prog, 'derivado').tipo, 'derivar');
  const bloq = resolverMovimiento(prog, 'finalizado');
  assert.equal(bloq.tipo, 'bloqueado');
  assert.match(bloq.motivo, /En quirófano/);
});

test('resolverMovimiento: en curso y realizada', () => {
  const enCurso = c('1', 'programada', { horaInicioReal: '07:05' });
  assert.equal(resolverMovimiento(enCurso, 'finalizado').tipo, 'finalizar');
  assert.equal(resolverMovimiento(enCurso, 'en-preparacion').tipo, 'directo'); // retroceder es libre
  const hecha = c('2', 'realizada', { horaInicioReal: '07:05', etapa: 'en-recuperacion' });
  assert.equal(resolverMovimiento(hecha, 'finalizado').tipo, 'directo');
  assert.equal(resolverMovimiento(hecha, 'en-quirofano').tipo, 'directo');
});

test('resolverMovimiento: cancelada no se mueve', () => {
  assert.equal(resolverMovimiento(c('1', 'cancelada'), 'admitido').tipo, 'bloqueado');
});
