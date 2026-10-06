import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bloquesDeSala, cabe, disponibilidad, horaFranja, mapaOcupado, primeraLibre, reubicar,
} from '../agenda.js';
import { armarChecklist, esAmbulatorio } from '../ordenes.js';
import { evaluarSolicitud } from '../gestion.js';

test('horaFranja y cabe', () => {
  assert.equal(horaFranja(0), '07:00');
  assert.equal(horaFranja(16), '15:00');
  const mapa = mapaOcupado([{ inicio: 2, dur: 2 }]);
  assert.equal(cabe(mapa, 0, 2), true);
  assert.equal(cabe(mapa, 1, 2), false);
  assert.equal(cabe(mapa, 15, 2), false);
});

test('reubicar: se queda si cabe, si no va a la primera libre, o null', () => {
  const mapa = mapaOcupado([{ inicio: 2, dur: 2 }]);
  assert.equal(reubicar(mapa, 4, 4), 4);
  assert.equal(reubicar(mapa, 0, 4), 4);
  assert.equal(primeraLibre(mapa, 2), 0);
  assert.equal(reubicar(Array(16).fill(true), 0, 1), null);
});

test('disponibilidad detecta cruces', () => {
  assert.equal(disponibilidad([{ inicio: 2, dur: 4 }], 5, 2), 'cruce');
  assert.equal(disponibilidad([{ inicio: 2, dur: 4 }], 6, 2), 'disponible');
});

test('bloques del día caben en la jornada', () => {
  ['2026-10-06', '2026-10-07', '2026-10-08'].forEach((f) => {
    bloquesDeSala('s2', f).forEach((b) => assert.ok(b.inicio + b.dur <= 16));
  });
});

test('armarChecklist: orden adjunta, imágenes solo si se requieren', () => {
  const procs = [{ nombre: 'X', requiereImagenes: false, cobertura: 'cubierto' }];
  const c = armarChecklist({
    historia: { valoracion: 'ok', laboratorios: 'ok' }, procedimientos: procs, ordenAdjunta: true, eps: 'Sura',
  });
  assert.equal(c.orden.estado, 'ok');
  assert.equal(c.imagenes.estado, 'no-requerido');
  const ev = evaluarSolicitud({ checklist: c });
  assert.deepEqual([ev.completos, ev.total, ev.estado], [3, 4, 'pendientes']);
  const sin = armarChecklist({ procedimientos: [{ ...procs[0], requiereImagenes: true }], ordenAdjunta: false, eps: 'Sura' });
  assert.equal(sin.orden.estado, 'pendiente');
  assert.equal(sin.imagenes.obligatorio, true);
});

test('esAmbulatorio', () => {
  assert.equal(esAmbulatorio({ origen: 'internacion' }), false);
  assert.equal(esAmbulatorio({ origen: 'externa' }), true);
  assert.equal(esAmbulatorio({ origen: 'consulta-externa' }), true);
});
