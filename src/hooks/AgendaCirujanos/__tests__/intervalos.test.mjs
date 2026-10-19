import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aMinutos, cubre, deMinutos, restarIntervalos, unirIntervalos,
} from '../intervalos.js';

test('aMinutos / deMinutos son inversas', () => {
  assert.equal(aMinutos('07:30'), 450);
  assert.equal(aMinutos('00:00'), 0);
  assert.equal(deMinutos(450), '07:30');
  assert.equal(deMinutos(aMinutos('19:00')), '19:00');
  assert.equal(deMinutos(5), '00:05');
});

test('unirIntervalos: une los que se tocan y los que se solapan', () => {
  assert.deepEqual(unirIntervalos([[420, 480], [480, 540]]), [[420, 540]]);
  assert.deepEqual(unirIntervalos([[0, 10], [5, 20], [30, 40]]), [[0, 20], [30, 40]]);
});

test('unirIntervalos: ordena la entrada y no la modifica', () => {
  const entrada = [[600, 660], [420, 480]];
  assert.deepEqual(unirIntervalos(entrada), [[420, 480], [600, 660]]);
  assert.deepEqual(entrada, [[600, 660], [420, 480]]);
  assert.deepEqual(unirIntervalos([]), []);
});

test('unirIntervalos: un intervalo contenido en otro no lo agranda', () => {
  assert.deepEqual(unirIntervalos([[420, 720], [480, 540]]), [[420, 720]]);
});

test('restarIntervalos: un hueco en el medio divide el intervalo', () => {
  assert.deepEqual(restarIntervalos([[420, 720]], [[480, 540]]), [[420, 480], [540, 720]]);
});

test('restarIntervalos: recorta bordes y elimina lo cubierto por completo', () => {
  assert.deepEqual(restarIntervalos([[420, 720]], [[400, 480]]), [[480, 720]]);
  assert.deepEqual(restarIntervalos([[420, 720]], [[600, 800]]), [[420, 600]]);
  assert.deepEqual(restarIntervalos([[420, 720]], [[400, 800]]), []);
});

test('restarIntervalos: lo que no se solapa (incluso si solo se toca) no cambia nada', () => {
  assert.deepEqual(restarIntervalos([[420, 480]], [[480, 540]]), [[420, 480]]);
  assert.deepEqual(restarIntervalos([[420, 480]], [[300, 420]]), [[420, 480]]);
  assert.deepEqual(restarIntervalos([[420, 480]], []), [[420, 480]]);
});

test('restarIntervalos: varios recortes seguidos', () => {
  assert.deepEqual(
    restarIntervalos([[420, 1080]], [[480, 540], [600, 660]]),
    [[420, 480], [540, 600], [660, 1080]],
  );
});

test('cubre: exige que UN solo intervalo contenga toda la franja', () => {
  assert.equal(cubre([[420, 720]], 480, 540), true);
  assert.equal(cubre([[420, 720]], 420, 720), true);
  assert.equal(cubre([[420, 720]], 400, 540), false);
  assert.equal(cubre([[420, 480], [540, 720]], 450, 600), false);
  assert.equal(cubre([], 450, 500), false);
});
