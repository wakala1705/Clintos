import test from 'node:test';
import assert from 'node:assert/strict';
import {
  JORNADAS, desplazarHabiles, fechasDeVista, rangoFechasLabel, tresDiasHabiles, bloquesDeSala, cabe, disponibilidad, franjaDeHora, horaFranja, mapaOcupado, primeraLibre, reubicar,
  ubicarEnPrimeraLibre, rangoFinCirugia, acotarFin, FIN_MAXIMO,
} from '../agenda.js';

const cir = (horaInicio, horaFin, extra = {}) => ({
  horaInicio, horaFin, estado: 'programada', procedimientoPrincipal: 'X', cirujano: 'Dr. Y', ...extra,
});
const sala = (id, bloques = []) => ({ id, mapa: mapaOcupado(bloques) });

test('franjas: el día completo, hora <-> índice', () => {
  assert.equal(horaFranja(0), '00:00');
  assert.equal(horaFranja(14), '07:00');
  assert.equal(horaFranja(48), '24:00');
  assert.equal(franjaDeHora('09:30'), 19);
  assert.deepEqual([JORNADAS.operativa.desde, JORNADAS.operativa.hasta], [14, 38]);
});

test('bloquesDeSala: omite canceladas y extiende lo que cruza la medianoche', () => {
  const b = bloquesDeSala([
    cir('06:00', '08:00'),
    cir('09:30', '11:00'),
    cir('10:00', '12:00', { estado: 'cancelada' }),
    cir('23:00', '00:30'), // el fin cae "antes" del inicio: llega hasta el final del día
  ]);
  assert.deepEqual(b.map((x) => [x.inicio, x.dur]), [[12, 4], [19, 3], [46, 2]]);
  const mant = bloquesDeSala([], true);
  assert.deepEqual([mant[0].tipo, mant[0].dur], ['no-disponible', 48]);
});

test('cabe / primeraLibre respetan la ventana', () => {
  const mapa = mapaOcupado([{ inicio: 14, dur: 2 }]);
  assert.equal(cabe(mapa, 12, 2), true);
  assert.equal(cabe(mapa, 15, 2), false);
  assert.equal(cabe(mapa, 47, 2), false);
  assert.equal(primeraLibre(mapa, 3), 0);
  assert.equal(primeraLibre(mapa, 3, JORNADAS.operativa), 16);
  assert.equal(primeraLibre(Array(48).fill(true), 1), -1);
});

test('una cirugía nueva se ubica primero en la jornada operativa', () => {
  const salas = [sala('a', [{ inicio: 14, dur: 4 }]), sala('b')];
  assert.deepEqual(ubicarEnPrimeraLibre(salas, 4), { colId: 'a', inicio: 18 });
  // Sin espacio operativo en ninguna sala: cae al resto del día.
  const llenas = [sala('a', [{ inicio: 14, dur: 24 }])];
  assert.deepEqual(ubicarEnPrimeraLibre(llenas, 2), { colId: 'a', inicio: 0 });
  assert.equal(ubicarEnPrimeraLibre([{ id: 'a', mapa: Array(48).fill(true) }], 1), null);
});

test('reubicar: conserva, mueve en la sala, respeta la ventana o devuelve null', () => {
  const salas = [sala('a', [{ inicio: 16, dur: 2 }]), sala('b')];
  assert.deepEqual(reubicar(salas, { colId: 'a', inicio: 20 }, 4), { colId: 'a', inicio: 20 });
  assert.deepEqual(reubicar(salas, { colId: 'a', inicio: 14 }, 4), { colId: 'a', inicio: 18 });
  // Al pasar a jornada operativa, una selección fuera de la ventana se acomoda dentro.
  assert.deepEqual(reubicar(salas, { colId: 'a', inicio: 2 }, 2, JORNADAS.operativa), { colId: 'a', inicio: 14 });
  assert.equal(reubicar([{ id: 'a', mapa: Array(48).fill(true) }], null, 1, JORNADAS.operativa), null);
});

test('disponibilidad detecta cruces', () => {
  assert.equal(disponibilidad([{ inicio: 16, dur: 4 }], 19, 2), 'cruce');
  assert.equal(disponibilidad([{ inicio: 16, dur: 4 }], 20, 2), 'disponible');
});

test('3 días hábiles: hoy + 2 siguientes, saltando el fin de semana', () => {
  assert.deepEqual(tresDiasHabiles('2026-10-06'), ['2026-10-06', '2026-10-07', '2026-10-08']);
  assert.deepEqual(tresDiasHabiles('2026-10-08'), ['2026-10-08', '2026-10-09', '2026-10-12']);
  assert.deepEqual(tresDiasHabiles('2026-10-10'), ['2026-10-12', '2026-10-13', '2026-10-14']); // sábado
  assert.equal(desplazarHabiles('2026-10-12', -3), '2026-10-07');
  assert.equal(desplazarHabiles('2026-10-06', 3), '2026-10-09');
});

test('fechasDeVista y rango', () => {
  assert.deepEqual(fechasDeVista(false, '2026-10-09').slice(0, 2), ['2026-10-05', '2026-10-06']);
  assert.equal(fechasDeVista(false, '2026-10-11')[6], '2026-10-11');
  assert.equal(rangoFechasLabel('2026-10-06', '2026-10-08'), '6 - 8 Oct 2026');
  assert.equal(rangoFechasLabel('2026-10-29', '2026-11-02'), '29 Oct - 2 Nov 2026');
});

const en = (id, horaInicio, horaFin, extra = {}) => cir(horaInicio, horaFin, {
  id, salaId: 's1', fecha: '2026-10-28', ...extra,
});

test('rangoFinCirugia: mínimo una franja, máximo donde empieza la siguiente', () => {
  const a = en('a', '07:00', '09:00');
  const b = en('b', '11:00', '12:00');
  const r = rangoFinCirugia(a, [a, b]);
  assert.deepEqual(r, { inicio: 14, fin: 18, min: 15, max: 22 });
  assert.equal(acotarFin(30, r), 22);
  assert.equal(acotarFin(3, r), 15);
  assert.equal(acotarFin(20, r), 20);
});

test('rangoFinCirugia: ignora otra sala, otro día, canceladas e incumplidas', () => {
  const a = en('a', '07:00', '09:00');
  const otras = [
    en('b', '10:00', '11:00', { salaId: 's2' }),
    en('c', '10:00', '11:00', { fecha: '2026-10-29' }),
    en('d', '10:00', '11:00', { estado: 'cancelada' }),
    en('e', '10:00', '11:00', { estado: 'incumplida' }),
  ];
  assert.equal(rangoFinCirugia(a, [a, ...otras]).max, FIN_MAXIMO);
});

test('rangoFinCirugia: sí bloquean las de urgencia y las realizadas', () => {
  const a = en('a', '07:00', '09:00');
  assert.equal(rangoFinCirugia(a, [a, en('b', '10:00', '11:00', { estado: 'urgencia' })]).max, 20);
  assert.equal(rangoFinCirugia(a, [a, en('c', '09:30', '10:00', { estado: 'realizada' })]).max, 19);
});

test('rangoFinCirugia: una cirugía que ya se cruzaba no puede estirarse pero sí acortarse', () => {
  const a = en('a', '07:00', '10:00');
  const b = en('b', '09:00', '10:00');
  const r = rangoFinCirugia(a, [a, b]);
  assert.equal(r.max, r.fin);
  assert.equal(r.min, 15);
});

test('rangoFinCirugia: cruza la medianoche -> null; contigua no se puede estirar', () => {
  assert.equal(rangoFinCirugia(en('a', '23:00', '02:00'), []), null);
  const a = en('a', '07:00', '09:00');
  assert.equal(rangoFinCirugia(a, [a, en('b', '09:00', '10:00')]).max, 18);
});
