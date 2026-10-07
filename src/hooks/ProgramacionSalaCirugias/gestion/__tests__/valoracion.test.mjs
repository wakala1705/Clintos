import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluarSolicitud } from '../gestion.js';
import {
  aplicarValoracion, conceptoDesdeAsa, datosDesdeEvapre, fechaCorta, fechaISODeRegistro, validarValoracion,
} from '../valoracion.js';

const base = {
  fecha: '2026-10-07', anestesiologo: 'Dra. Paula Mendoza', asa: 'II', concepto: 'apto', observaciones: '',
};
const solicitud = () => ({
  id: 'SC-1',
  checklist: {
    orden: { estado: 'ok', obligatorio: true, detalle: '' },
    autorizacion: { estado: 'ok', obligatorio: true, detalle: '' },
    valoracion: { estado: 'pendiente', obligatorio: true, detalle: 'Sin valoración preanestésica registrada.' },
    laboratorios: { estado: 'ok', obligatorio: true, detalle: '' },
    imagenes: { estado: 'no-requerido', obligatorio: false, detalle: '' },
  },
});

test('fechaCorta: ISO -> DD/MM/AAAA', () => {
  assert.equal(fechaCorta('2026-10-07'), '07/10/2026');
});

test('validar: faltan todos los campos obligatorios', () => {
  const e = validarValoracion({
    fecha: '', anestesiologo: '', asa: '', concepto: '', observaciones: '',
  });
  assert.deepEqual(Object.keys(e).sort(), ['anestesiologo', 'asa', 'concepto', 'fecha']);
});

test('validar: apto sin observaciones es válido', () => {
  assert.deepEqual(validarValoracion(base), {});
});

test('validar: con condiciones o no apto exigen observaciones', () => {
  assert.ok(validarValoracion({ ...base, concepto: 'condiciones' }).observaciones);
  assert.ok(validarValoracion({ ...base, concepto: 'no-apto', observaciones: '   ' }).observaciones);
  assert.deepEqual(validarValoracion({ ...base, concepto: 'no-apto', observaciones: 'Cardiopatía descompensada' }), {});
});

test('aplicar apto: el paso queda completo y la solicitud puede quedar lista', () => {
  const s = aplicarValoracion(solicitud(), base);
  assert.equal(s.checklist.valoracion.estado, 'ok');
  assert.match(s.checklist.valoracion.detalle, /ASA II/);
  assert.match(s.checklist.valoracion.detalle, /07\/10\/2026/);
  assert.equal(evaluarSolicitud(s).estado, 'lista');
});

test('aplicar con condiciones: completo y las condiciones van en el detalle', () => {
  const s = aplicarValoracion(solicitud(), { ...base, concepto: 'condiciones', observaciones: 'Control de tensión' });
  assert.equal(s.checklist.valoracion.estado, 'ok');
  assert.match(s.checklist.valoracion.detalle, /Control de tensión/);
});

test('aplicar no apto: rechazada y la solicitud queda bloqueada', () => {
  const s = aplicarValoracion(solicitud(), { ...base, concepto: 'no-apto', asa: 'IV', observaciones: 'Cardiopatía descompensada' });
  assert.equal(s.checklist.valoracion.estado, 'rechazada');
  assert.match(s.checklist.valoracion.detalle, /No apto/);
  assert.equal(evaluarSolicitud(s).estado, 'bloqueada');
});

test('aplicar no muta la solicitud original y conserva el resto del chequeo', () => {
  const original = solicitud();
  const s = aplicarValoracion(original, base);
  assert.equal(original.checklist.valoracion.estado, 'pendiente');
  assert.equal(s.checklist.orden, original.checklist.orden);
  assert.equal(s.checklist.valoracion.registro.asa, 'II');
});

test('fechaISODeRegistro: DD.MES.AAAA -> ISO', () => {
  assert.equal(fechaISODeRegistro('07.OCT.2026'), '2026-10-07');
  assert.equal(fechaISODeRegistro('30.SEP.2026'), '2026-09-30');
});

test('conceptoDesdeAsa: I-II apto, III-IV con condiciones, V-VI no apto, sin ASA vacío', () => {
  assert.equal(conceptoDesdeAsa('II'), 'apto');
  assert.equal(conceptoDesdeAsa('III'), 'condiciones');
  assert.equal(conceptoDesdeAsa('V'), 'no-apto');
  assert.equal(conceptoDesdeAsa(''), '');
});

const evapre = (asa) => ({
  id: 'evapre-1', fecha: '07.OCT.2026', hora: '09:30 AM', numero: '0201295702', autor: 'VARGAS LOZANO JUAN PABLO',
  contenido: { valores: { estadoFisicoAsa: asa } },
});

test('datosDesdeEvapre: ASA II -> apto, sin observaciones, con vínculo', () => {
  const d = datosDesdeEvapre(evapre('II'));
  assert.deepEqual(d, {
    fecha: '2026-10-07', anestesiologo: 'VARGAS LOZANO JUAN PABLO', asa: 'II', concepto: 'apto', observaciones: '',
    evapre: { id: 'evapre-1', numero: '0201295702' },
  });
  assert.deepEqual(validarValoracion(d), {});
});

test('datosDesdeEvapre: ASA III -> con condiciones y observación válida', () => {
  const d = datosDesdeEvapre(evapre('III'));
  assert.equal(d.concepto, 'condiciones');
  assert.deepEqual(validarValoracion(d), {});
});

test('datosDesdeEvapre: sin ASA no se puede vincular', () => {
  assert.equal(datosDesdeEvapre(evapre('')), null);
});

test('aplicarValoracion con EVAPRE: el detalle cita el número del registro', () => {
  const s = aplicarValoracion(solicitud(), datosDesdeEvapre(evapre('II')));
  assert.equal(s.checklist.valoracion.estado, 'ok');
  assert.match(s.checklist.valoracion.detalle, /EVAPRE N° 0201295702/);
  assert.equal(s.checklist.valoracion.registro.evapre.id, 'evapre-1');
});
