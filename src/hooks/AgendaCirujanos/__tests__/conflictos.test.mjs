import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cirugiasEnConflicto, conflictosNuevos, motivoConflicto, textoMotivo,
} from '../conflictos.js';
import { modeloDia } from '../disponibilidad.js';
import { horarioVacio } from '../horario.js';
import {
  cirugia, excepcion, horarioCon, HOY,
} from './fixtures.mjs';

// Lun/mié/vie 07:00–13:00 desde el 1 de octubre, sin fecha de fin.
const horario = horarioCon([0, 2, 4]);
const agenda = { horario, excepciones: [] };

test('una cirugía dentro del horario no es conflicto', () => {
  assert.deepEqual(cirugiasEnConflicto([cirugia()], agenda, HOY), []);
});

test('una cirugía que sobrepasa el horario es conflicto "fuera del horario"', () => {
  const c = cirugia({ horaInicio: '12:00', horaFin: '14:00' });
  const [conflicto] = cirugiasEnConflicto([c], agenda, HOY);
  assert.equal(conflicto.cirugia, c);
  assert.deepEqual(conflicto.motivo, { tipo: 'fuera-horario' });
});

test('un día apagado es conflicto', () => {
  const [conflicto] = cirugiasEnConflicto([cirugia({ fecha: '2026-10-15' })], agenda, HOY);
  assert.deepEqual(conflicto.motivo, { tipo: 'fuera-horario' });
});

test('motivo "bloqueo" gana al resto y nombra la excepción', () => {
  const conBloqueo = { horario, excepciones: [excepcion({ motivo: 'Congreso o capacitación' })] };
  const [conflicto] = cirugiasEnConflicto([cirugia()], conBloqueo, HOY);
  assert.deepEqual(conflicto.motivo, { tipo: 'bloqueo', motivo: 'Congreso o capacitación' });
});

test('un bloqueo que no toca la franja de la cirugía no cuenta como motivo ni como conflicto', () => {
  const franja = { horario, excepciones: [excepcion({ todoElDia: false, inicio: '10:00', fin: '12:00' })] };
  assert.deepEqual(cirugiasEnConflicto([cirugia({ horaInicio: '08:00', horaFin: '09:00' })], franja, HOY), []);
});

test('fuera de la vigencia: motivo "fuera-vigencia"', () => {
  const vencido = { horario: horarioCon([2], { hasta: '2026-10-13' }), excepciones: [] };
  const [conflicto] = cirugiasEnConflicto([cirugia()], vencido, HOY);
  assert.deepEqual(conflicto.motivo, { tipo: 'fuera-vigencia' });
});

test('solo cuentan las cirugías programadas o de urgencia', () => {
  const fuera = { fecha: '2026-10-15' };
  const cirugias = ['programada', 'urgencia', 'realizada', 'cancelada', 'incumplida']
    .map((estado, i) => cirugia({ ...fuera, id: `c${i}`, estado }));
  assert.deepEqual(
    cirugiasEnConflicto(cirugias, agenda, HOY).map((c) => c.cirugia.estado),
    ['programada', 'urgencia'],
  );
});

test('solo cuentan las cirugías desde hoy en adelante (hoy incluido)', () => {
  const sinAgenda = { horario: horarioVacio(HOY), excepciones: [] };
  const ayer = cirugia({ id: 'a', fecha: '2026-10-13' });
  const hoy = cirugia({ id: 'b', fecha: HOY });
  assert.deepEqual(cirugiasEnConflicto([ayer, hoy], sinAgenda, HOY).map((c) => c.cirugia.id), ['b']);
});

test('una cirugía a caballo entre dos bloques contiguos está cubierta; entre dos separados, no', () => {
  const contiguos = {
    ...horario,
    dias: horario.dias.map((d, i) => (i === 2 ? { activo: true, bloques: [{ inicio: '07:00', fin: '10:00' }, { inicio: '10:00', fin: '13:00' }] } : d)),
  };
  const c = cirugia({ horaInicio: '09:00', horaFin: '11:00' });
  assert.deepEqual(cirugiasEnConflicto([c], { horario: contiguos, excepciones: [] }, HOY), []);
  const separados = {
    ...horario,
    dias: horario.dias.map((d, i) => (i === 2 ? { activo: true, bloques: [{ inicio: '07:00', fin: '10:00' }, { inicio: '11:00', fin: '13:00' }] } : d)),
  };
  assert.equal(cirugiasEnConflicto([c], { horario: separados, excepciones: [] }, HOY).length, 1);
});

test('una apertura extra puede cubrir una cirugía que el horario no cubría', () => {
  const c = cirugia({ horaInicio: '14:00', horaFin: '15:00' });
  const apertura = excepcion({
    tipo: 'apertura', todoElDia: false, inicio: '13:00', fin: '16:00',
  });
  assert.equal(cirugiasEnConflicto([c], agenda, HOY).length, 1);
  assert.equal(cirugiasEnConflicto([c], { horario, excepciones: [apertura] }, HOY).length, 0);
});

test('conflictosNuevos devuelve solo lo que aparece con el cambio', () => {
  const ya = cirugia({ id: 'ya', fecha: '2026-10-15' }); // jueves apagado: ya estaba en conflicto
  const nueva = cirugia({ id: 'nueva' }); // miércoles 08:00, hoy cubierta
  const despues = { horario, excepciones: [excepcion()] }; // bloqueo todo el día el 14
  const nuevos = conflictosNuevos([ya, nueva], agenda, despues, HOY);
  assert.deepEqual(nuevos.map((c) => c.cirugia.id), ['nueva']);
});

test('conflictosNuevos con un cirujano sin agenda: la línea base es el horario vacío', () => {
  const c = cirugia();
  const antes = { horario: horarioVacio(HOY), excepciones: [] };
  assert.equal(cirugiasEnConflicto([c], antes, HOY).length, 1, 'sin agenda todo está fuera');
  assert.deepEqual(conflictosNuevos([c], antes, { horario, excepciones: [] }, HOY), [], 'configurar el horario no empeora nada');
  const soloLunes = horarioCon([0]);
  assert.deepEqual(conflictosNuevos([c], antes, { horario: soloLunes, excepciones: [] }, HOY), [], 'seguía fuera de agenda: no es nuevo');
});

test('motivoConflicto lee el modelo del día', () => {
  const modelo = modeloDia(HOY, horario, [excepcion({ motivo: 'Permiso' })]);
  assert.deepEqual(motivoConflicto(cirugia(), modelo), { tipo: 'bloqueo', motivo: 'Permiso' });
});

test('textoMotivo', () => {
  assert.equal(textoMotivo({ tipo: 'bloqueo', motivo: 'Vacaciones' }), 'Bloqueo: Vacaciones');
  assert.equal(textoMotivo({ tipo: 'fuera-vigencia' }), 'Fuera de la vigencia de la agenda');
  assert.equal(textoMotivo({ tipo: 'fuera-horario' }), 'Fuera del horario disponible');
});
