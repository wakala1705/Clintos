import test from 'node:test';
import assert from 'node:assert/strict';
import {
  errorDia, errorExcepcion, errorVigencia, horarioTieneErrores,
} from '../validaciones.js';
import {
  alternarDia, alternarSinFecha, cambiarBloque, horarioVacio,
} from '../horario.js';
import { horarioCon, HOY } from './fixtures.mjs';

const b = (inicio, fin) => ({ inicio, fin });

test('errorDia: un día apagado nunca tiene error', () => {
  assert.equal(errorDia({ activo: false, bloques: [] }), '');
  assert.equal(errorDia({ activo: false, bloques: [b('10:00', '09:00')] }), '');
});

test('errorDia: activo sin bloques', () => {
  assert.equal(errorDia({ activo: true, bloques: [] }), 'Agrega al menos un bloque o desactiva el día.');
});

test('errorDia: fin igual o anterior al inicio', () => {
  const msg = 'La hora de fin debe ser posterior a la de inicio.';
  assert.equal(errorDia({ activo: true, bloques: [b('10:00', '10:00')] }), msg);
  assert.equal(errorDia({ activo: true, bloques: [b('10:00', '09:00')] }), msg);
});

test('errorDia: bloques que se cruzan (aunque vengan desordenados)', () => {
  const msg = 'Los bloques de un mismo día no pueden cruzarse.';
  assert.equal(errorDia({ activo: true, bloques: [b('07:00', '12:00'), b('11:00', '14:00')] }), msg);
  assert.equal(errorDia({ activo: true, bloques: [b('11:00', '14:00'), b('07:00', '12:00')] }), msg);
});

test('errorDia: bloques que solo se tocan o están separados son válidos', () => {
  assert.equal(errorDia({ activo: true, bloques: [b('07:00', '12:00'), b('12:00', '14:00')] }), '');
  assert.equal(errorDia({ activo: true, bloques: [b('07:00', '12:00'), b('14:00', '18:00')] }), '');
});

test('errorVigencia', () => {
  assert.equal(errorVigencia(horarioVacio(HOY)), '');
  assert.equal(errorVigencia({ ...horarioVacio(HOY), desde: '' }), 'Elige desde qué fecha rige este horario.');
  assert.equal(
    errorVigencia({ ...horarioVacio(HOY), hasta: '' }),
    'Elige la fecha final o marca "Sin fecha de fin".',
  );
  assert.equal(
    errorVigencia({ ...horarioVacio(HOY), hasta: '2026-10-13' }),
    'La fecha final debe ser posterior a la inicial.',
  );
  assert.equal(errorVigencia({ ...horarioVacio(HOY), hasta: HOY }), '', 'un solo día es válido');
  assert.equal(errorVigencia(alternarSinFecha(horarioVacio(HOY), false)), '');
});

test('horarioTieneErrores mira la vigencia y todos los días', () => {
  assert.equal(horarioTieneErrores(horarioVacio(HOY)), false);
  assert.equal(horarioTieneErrores(horarioCon([0, 2])), false);
  assert.equal(horarioTieneErrores({ ...horarioVacio(HOY), hasta: '' }), true);
  const malo = cambiarBloque(alternarDia(horarioVacio(HOY), 3, true), 3, 0, 'fin', '07:00');
  assert.equal(horarioTieneErrores(malo), true);
});

test('errorExcepcion', () => {
  const ok = {
    desde: '2026-10-14', hasta: '2026-10-14', todoElDia: true, inicio: '07:00', fin: '19:00',
  };
  assert.equal(errorExcepcion(ok), '');
  assert.equal(errorExcepcion({ ...ok, desde: '' }), 'Elige la fecha inicial y la final.');
  assert.equal(errorExcepcion({ ...ok, hasta: '' }), 'Elige la fecha inicial y la final.');
  assert.equal(
    errorExcepcion({ ...ok, hasta: '2026-10-13' }),
    'La fecha final debe ser igual o posterior a la inicial.',
  );
  assert.equal(
    errorExcepcion({ ...ok, todoElDia: false, inicio: '10:00', fin: '09:00' }),
    'La hora de fin debe ser posterior a la de inicio.',
  );
  assert.equal(errorExcepcion({ ...ok, todoElDia: true, inicio: '10:00', fin: '09:00' }), '', 'la franja no importa con todo el día');
});
