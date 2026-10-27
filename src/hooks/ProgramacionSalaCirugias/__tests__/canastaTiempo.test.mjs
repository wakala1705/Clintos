import test from 'node:test';
import assert from 'node:assert/strict';
import { alertaTiempoCanasta } from '../canastaPresentacion.js';

const AHORA = new Date(2026, 9, 27, 8, 45);

function cirugia(horaInicio, items, extra = {}) {
  return { estado: 'programada', fecha: '2026-10-27', horaInicio, canasta: { items }, ...extra };
}
const SIN = [{ cantidad: 2 }];
const PREPARANDO = [{ cantidad: 2, solicitudFarmacia: 'solicitado' }];
const DESPACHADA = [{ cantidad: 2, solicitudFarmacia: 'solicitado', despachado: 2 }];
const RECIBIDA = [{ cantidad: 2, solicitudFarmacia: 'recibido' }];

test('canasta recibida: sin indicador', () => {
  assert.equal(alertaTiempoCanasta(cirugia('09:00', RECIBIDA), AHORA), null);
  assert.equal(alertaTiempoCanasta(cirugia('07:00', RECIBIDA), AHORA), null);
});

test('sin solicitar: nada con más de 3 h, aviso bajo 3 h, alerta bajo 1 h', () => {
  assert.equal(alertaTiempoCanasta(cirugia('13:00', SIN), AHORA), null);
  assert.deepEqual(alertaTiempoCanasta(cirugia('10:30', SIN), AHORA), { tone: 'warn', texto: 'Faltan 1 h 45 min · sin solicitar' });
  assert.deepEqual(alertaTiempoCanasta(cirugia('09:30', SIN), AHORA), { tone: 'danger', texto: 'Faltan 45 min · sin solicitar' });
});

test('en preparación también alerta', () => {
  assert.deepEqual(alertaTiempoCanasta(cirugia('09:30', PREPARANDO), AHORA), { tone: 'danger', texto: 'Faltan 45 min · en preparación' });
});

test('despachada por recibir: solo avisa bajo 1 h', () => {
  assert.equal(alertaTiempoCanasta(cirugia('10:30', DESPACHADA), AHORA), null);
  assert.deepEqual(alertaTiempoCanasta(cirugia('09:25', DESPACHADA), AHORA), { tone: 'warn', texto: 'Faltan 40 min · por recibir' });
});

test('pasada la hora queda atrasada hasta recibir la canasta', () => {
  assert.deepEqual(alertaTiempoCanasta(cirugia('07:00', PREPARANDO), AHORA), { tone: 'danger', texto: 'Atrasada 1 h 45 min' });
  assert.deepEqual(alertaTiempoCanasta(cirugia('08:30', DESPACHADA), AHORA), { tone: 'danger', texto: 'Atrasada 15 min' });
});

test('no aplica a otro día, cirugías iniciadas ni cerradas', () => {
  assert.equal(alertaTiempoCanasta(cirugia('09:30', SIN, { fecha: '2026-10-28' }), AHORA), null);
  assert.equal(alertaTiempoCanasta(cirugia('09:30', SIN, { horaInicioReal: '09:20' }), AHORA), null);
  for (const estado of ['realizada', 'cancelada', 'incumplida']) {
    assert.equal(alertaTiempoCanasta(cirugia('07:00', SIN, { estado }), AHORA), null, estado);
  }
});
