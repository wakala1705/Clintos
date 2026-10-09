import test from 'node:test';
import assert from 'node:assert/strict';
import { filasFamiliares, nombreAbreviado, paginar } from '../familiares.js';

const c = (id, nombre, estado, hora, extra = {}) => ({
  id, estado, horaInicio: hora, paciente: { nombre, documento: 'CC 1' }, ...extra,
});

test('nombreAbreviado: primer nombre + inicial de un apellido', () => {
  assert.equal(nombreAbreviado('Laura Gómez'), 'Laura G.');
  assert.equal(nombreAbreviado('Marta Elena Cifuentes'), 'Marta C.');
  assert.equal(nombreAbreviado('Claudia Patricia Ospina Henao'), 'Claudia O.');
  assert.equal(nombreAbreviado('  juan   pérez '), 'juan P.');
  assert.equal(nombreAbreviado('Madonna'), 'Madonna');
  assert.equal(nombreAbreviado(''), '');
  assert.equal(nombreAbreviado(undefined), '');
});

test('filasFamiliares: sin programadas ni canceladas, con código y estado en palabras', () => {
  const filas = filasFamiliares([
    c('1', 'Ana Pérez', 'programada', '07:00'),
    c('2', 'Luis Gómez', 'programada', '08:00', { etapa: 'en-preparacion' }),
    c('3', 'Sara Díaz', 'cancelada', '09:00', { etapa: 'en-preparacion' }),
    c('4', 'Omar Ruiz', 'incumplida', '09:00'),
  ]);
  assert.equal(filas.length, 1);
  assert.deepEqual(
    { codigo: filas[0].codigo, nombre: filas[0].nombre, hora: filas[0].hora, label: filas[0].label },
    { codigo: '2', nombre: 'Luis G.', hora: '08:00', label: 'En preparación' },
  );
});

test('filasFamiliares: no expone datos clínicos, documento ni sala', () => {
  const [fila] = filasFamiliares([
    c('9', 'Ana Pérez', 'programada', '07:00', {
      etapa: 'en-quirofano', salaId: 'qx-1', procedimientoPrincipal: 'Mastectomía', cirujano: 'Dra. X', dxIngreso: 'C50',
    }),
  ]);
  const texto = JSON.stringify(fila);
  ['Mastectomía', 'Dra. X', 'C50', 'qx-1', 'CC 1'].forEach((t) => assert.ok(!texto.includes(t), t));
});

test('filasFamiliares: realizada = finalizada; derivación en neutro sin destino', () => {
  const filas = filasFamiliares([
    c('1', 'Ana Pérez', 'realizada', '07:00'),
    c('2', 'Luis Gómez', 'realizada', '08:00', { etapa: 'derivado', derivacion: 'uci' }),
  ]);
  assert.equal(filas.find((f) => f.id === '1').label, 'Cirugía finalizada');
  const der = filas.find((f) => f.id === '2');
  assert.equal(der.label, 'Con el equipo médico');
  assert.ok(!JSON.stringify(der).toLowerCase().includes('uci'));
});

test('filasFamiliares: primero las activas, luego las cerradas, cada grupo por hora', () => {
  const filas = filasFamiliares([
    c('1', 'A Uno', 'realizada', '07:00'),
    c('2', 'B Dos', 'programada', '11:00', { etapa: 'en-recuperacion' }),
    c('3', 'C Tres', 'programada', '09:00', { etapa: 'en-quirofano', horaInicioReal: '09:05' }),
    c('4', 'D Cuatro', 'realizada', '06:00', { etapa: 'derivado' }),
  ]);
  assert.deepEqual(filas.map((f) => f.id), ['3', '2', '4', '1']);
});

test('paginar: páginas de tamaño fijo y siempre al menos una', () => {
  assert.deepEqual(paginar([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(paginar([1, 2], 2), [[1, 2]]);
  assert.deepEqual(paginar([], 7), [[]]);
});
