import test from 'node:test';
import assert from 'node:assert/strict';
import {
  JORNADAS, bloquesDeSala, cabe, disponibilidad, franjaDeHora, horaFranja, mapaOcupado, primeraLibre, reubicar,
  ubicarEnPrimeraLibre,
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
  assert.deepEqual(ubicarEnPrimeraLibre(salas, 4), { salaId: 'a', inicio: 18 });
  // Sin espacio operativo en ninguna sala: cae al resto del día.
  const llenas = [sala('a', [{ inicio: 14, dur: 24 }])];
  assert.deepEqual(ubicarEnPrimeraLibre(llenas, 2), { salaId: 'a', inicio: 0 });
  assert.equal(ubicarEnPrimeraLibre([{ id: 'a', mapa: Array(48).fill(true) }], 1), null);
});

test('reubicar: conserva, mueve en la sala, respeta la ventana o devuelve null', () => {
  const salas = [sala('a', [{ inicio: 16, dur: 2 }]), sala('b')];
  assert.deepEqual(reubicar(salas, { salaId: 'a', inicio: 20 }, 4), { salaId: 'a', inicio: 20 });
  assert.deepEqual(reubicar(salas, { salaId: 'a', inicio: 14 }, 4), { salaId: 'a', inicio: 18 });
  // Al pasar a jornada operativa, una selección fuera de la ventana se acomoda dentro.
  assert.deepEqual(reubicar(salas, { salaId: 'a', inicio: 2 }, 2, JORNADAS.operativa), { salaId: 'a', inicio: 14 });
  assert.equal(reubicar([{ id: 'a', mapa: Array(48).fill(true) }], null, 1, JORNADAS.operativa), null);
});

test('disponibilidad detecta cruces', () => {
  assert.equal(disponibilidad([{ inicio: 16, dur: 4 }], 19, 2), 'cruce');
  assert.equal(disponibilidad([{ inicio: 16, dur: 4 }], 20, 2), 'disponible');
});
