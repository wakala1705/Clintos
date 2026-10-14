import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cambiarTipoExcepcion, excepcionNueva, MOTIVOS_EXCEPCION, ordenarExcepciones,
} from '../excepciones.js';
import { rangoExcepcionLabel } from '../formato.js';
import { errorExcepcion } from '../validaciones.js';
import { excepcion, HOY } from './fixtures.mjs';

test('excepcionNueva: un bloqueo de todo el día, hoy, que ya es válido', () => {
  const x = excepcionNueva(HOY);
  assert.equal(x.tipo, 'bloqueo');
  assert.equal(x.motivo, 'Vacaciones');
  assert.equal(x.desde, HOY);
  assert.equal(x.hasta, HOY);
  assert.equal(x.todoElDia, true);
  assert.equal(x.nota, '');
  assert.equal(errorExcepcion(x), '');
});

test('cambiarTipoExcepcion: motivo al primero del tipo; bloqueo = todo el día, apertura = franja', () => {
  const aApertura = cambiarTipoExcepcion(excepcionNueva(HOY), 'apertura');
  assert.equal(aApertura.tipo, 'apertura');
  assert.equal(aApertura.motivo, MOTIVOS_EXCEPCION.apertura[0]);
  assert.equal(aApertura.todoElDia, false);
  const deVuelta = cambiarTipoExcepcion(aApertura, 'bloqueo');
  assert.equal(deVuelta.motivo, 'Vacaciones');
  assert.equal(deVuelta.todoElDia, true);
});

test('cambiarTipoExcepcion al mismo tipo no cambia nada (conserva el motivo elegido)', () => {
  const elegido = { ...excepcionNueva(HOY), motivo: 'Permiso' };
  assert.equal(cambiarTipoExcepcion(elegido, 'bloqueo'), elegido);
});

test('cada tipo tiene motivos y el último es "Otro"', () => {
  assert.equal(MOTIVOS_EXCEPCION.bloqueo.at(-1), 'Otro');
  assert.equal(MOTIVOS_EXCEPCION.apertura.at(-1), 'Otro');
  assert.equal(MOTIVOS_EXCEPCION.bloqueo.length, 5);
});

test('ordenarExcepciones: por fecha de inicio y luego por id, sin mutar la entrada', () => {
  const a = excepcion({ id: 3, desde: '2026-11-01', hasta: '2026-11-02' });
  const b = excepcion({ id: 1, desde: '2026-10-20', hasta: '2026-10-20' });
  const c = excepcion({ id: 2, desde: '2026-10-20', hasta: '2026-10-21' });
  const entrada = [a, b, c];
  assert.deepEqual(ordenarExcepciones(entrada).map((x) => x.id), [1, 2, 3]);
  assert.deepEqual(entrada.map((x) => x.id), [3, 1, 2]);
});

test('rangoExcepcionLabel', () => {
  assert.equal(
    rangoExcepcionLabel(excepcion({ desde: '2026-10-14', hasta: '2026-10-16' })),
    '14/10/2026 – 16/10/2026 · Todo el día',
  );
  assert.equal(
    rangoExcepcionLabel(excepcion({
      desde: '2026-10-17', hasta: '2026-10-17', todoElDia: false, inicio: '08:00', fin: '12:00',
    })),
    '17/10/2026 · 08:00–12:00',
  );
});
