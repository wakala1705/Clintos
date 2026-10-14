import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  agregarExcepcion, eliminarExcepcion, guardarHorario, listarCirugiasDeCirujano, listarCirujanos,
  obtenerAgenda, obtenerCirujano, restablecerAgendas, USUARIO_ACTUAL,
} from '../agendaCirujanosService.js';
import { crearSemilla } from '../mockAgendaCirujanos.js';
import { estadoAgenda } from '../estadoAgenda.js';
import { cirugiasEnConflicto } from '../conflictos.js';
import { contarPorEstado } from '../listado.js';
import { horarioCon, HOY } from './fixtures.mjs';

beforeEach(() => restablecerAgendas(HOY));

const ABRAHAM = '02757/98';
const ANGEL = '78714413'; // sin configurar

test('el usuario mock es Programación', () => {
  assert.deepEqual(USUARIO_ACTUAL, { rol: 'programacion' });
});

test('la semilla cubre los cuatro estados con datos relativos a hoy', () => {
  const filas = crearSemilla(HOY).map((a) => ({ cirujano: { idMedico: a.idMedico }, agenda: a }));
  const estados = new Set(filas.map((f) => estadoAgenda(f.agenda.horario, HOY)));
  assert.deepEqual([...estados].sort(), ['configurada', 'por-vencer', 'vencida']);
  assert.ok(crearSemilla(HOY).every((a) => a.excepciones.every((x) => Number.isInteger(x.id))));
  const ids = crearSemilla(HOY).flatMap((a) => a.excepciones.map((x) => x.id));
  assert.equal(new Set(ids).size, ids.length, 'ids de excepción únicos');
});

test('listarCirujanos: los 12 cirujanos de SEDE NORTE ordenados por nombre, con los 4 estados', async () => {
  const filas = await listarCirujanos({ sede: 'SEDE NORTE' });
  assert.equal(filas.length, 12);
  const nombres = filas.map((f) => f.cirujano.nombre);
  assert.deepEqual(nombres, [...nombres].sort((a, b) => a.localeCompare(b, 'es')));
  const conteo = contarPorEstado(filas, HOY);
  assert.equal(conteo.todos, 12);
  assert.ok(conteo.configurada > 0 && conteo['por-vencer'] > 0 && conteo.vencida > 0 && conteo['sin-configurar'] > 0);
});

test('listarCirujanos: otra sede no trae cirujanos; la sede no distingue tildes ni mayúsculas', async () => {
  assert.deepEqual(await listarCirujanos({ sede: 'SEDE CENTRO' }), []);
  assert.equal((await listarCirujanos({ sede: 'sede norte' })).length, 12);
});

test('obtenerCirujano', async () => {
  assert.equal((await obtenerCirujano(ABRAHAM))?.nombre, 'ABRAHAM GANEM BECHARA');
  assert.equal(await obtenerCirujano('no-existe'), null);
});

test('obtenerAgenda de un cirujano sin agenda: sin horario ni excepciones', async () => {
  assert.deepEqual(await obtenerAgenda(ANGEL), { idMedico: ANGEL, horario: null, excepciones: [] });
});

test('guardarHorario persiste y no comparte referencias con el store', async () => {
  const horario = horarioCon([1, 3]);
  const guardada = await guardarHorario(ANGEL, horario);
  assert.deepEqual(guardada.horario, horario);
  horario.dias[1].bloques[0].fin = '08:00';
  guardada.horario.dias[3].bloques[0].fin = '08:00';
  const releida = await obtenerAgenda(ANGEL);
  assert.equal(releida.horario?.dias[1].bloques[0].fin, '13:00');
  assert.equal(releida.horario?.dias[3].bloques[0].fin, '13:00');
});

test('guardarHorario conserva las excepciones del cirujano', async () => {
  const antes = await obtenerAgenda('94512888');
  assert.ok(antes.excepciones.length > 0);
  const despues = await guardarHorario('94512888', horarioCon([0]));
  assert.deepEqual(despues.excepciones, antes.excepciones);
});

test('agregarExcepcion asigna ids únicos y eliminarExcepcion la quita', async () => {
  const datos = {
    tipo: 'bloqueo', motivo: 'Permiso', desde: HOY, hasta: HOY, todoElDia: true, inicio: '07:00', fin: '19:00', nota: '',
  };
  const a1 = await agregarExcepcion(ANGEL, datos);
  const a2 = await agregarExcepcion(ANGEL, { ...datos, motivo: 'Otro' });
  assert.equal(a2.excepciones.length, 2);
  const [x1, x2] = a2.excepciones;
  assert.notEqual(x1.id, x2.id);
  assert.equal(a1.excepciones[0].id, x1.id);
  const sinPrimera = await eliminarExcepcion(ANGEL, x1.id);
  assert.deepEqual(sinPrimera.excepciones.map((x) => x.motivo), ['Otro']);
  assert.deepEqual((await obtenerAgenda(ANGEL)).excepciones.map((x) => x.motivo), ['Otro']);
});

test('eliminarExcepcion con un id inexistente no cambia nada', async () => {
  const antes = await obtenerAgenda('94512888');
  const despues = await eliminarExcepcion('94512888', 987654);
  assert.deepEqual(despues.excepciones, antes.excepciones);
});

test('listarCirugiasDeCirujano trae todas sus cirugías y solo las suyas', async () => {
  const cirugias = await listarCirugiasDeCirujano(ABRAHAM);
  assert.ok(cirugias.length > 0);
  assert.ok(cirugias.every((c) => c.cirujano === 'ABRAHAM GANEM BECHARA'));
  assert.deepEqual(await listarCirugiasDeCirujano('no-existe'), []);
});

test('integración: con el horario de la semilla, las cirugías futuras de un cirujano se evalúan', async () => {
  const [cirugias, agenda] = await Promise.all([listarCirugiasDeCirujano(ABRAHAM), obtenerAgenda(ABRAHAM)]);
  const conflictos = cirugiasEnConflicto(cirugias, agenda, '2026-10-14');
  assert.ok(conflictos.every((c) => c.cirugia.fecha >= '2026-10-14'));
  assert.ok(conflictos.every((c) => ['programada', 'urgencia'].includes(c.cirugia.estado)));
});
