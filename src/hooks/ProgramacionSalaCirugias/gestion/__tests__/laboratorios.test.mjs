import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluarSolicitud } from '../gestion.js';
import { aplicarLaboratorios, datosLaboratorioDesdeEvapre, resultadosDeEvapre } from '../laboratorios.js';

const campos = [
  { key: 'hb', label: 'HB' },
  { key: 'inr', label: 'INR' },
  { key: 'otrosQuimica', label: 'Otros (quimica sanguinea)' },
];
const registro = (valores) => ({
  id: 'evapre-1', fecha: '07.OCT.2026', numero: '0201295702', contenido: { valores },
});
const solicitud = () => ({
  id: 'SC-1',
  checklist: {
    orden: { estado: 'ok', obligatorio: true, detalle: '' },
    autorizacion: { estado: 'ok', obligatorio: true, detalle: '' },
    valoracion: { estado: 'ok', obligatorio: true, detalle: '' },
    laboratorios: { estado: 'pendiente', obligatorio: true, detalle: 'TSH pendiente.' },
    imagenes: { estado: 'ok', obligatorio: true, detalle: '' },
  },
});

test('resultadosDeEvapre: solo los campos con valor, en el orden de la plantilla', () => {
  const r = resultadosDeEvapre(registro({ hb: ' 13,8 g/dL ', inr: '', otrosQuimica: 'TSH 1,8' }), campos);
  assert.deepEqual(r, [
    { key: 'hb', label: 'HB', valor: '13,8 g/dL' },
    { key: 'otrosQuimica', label: 'Otros (quimica sanguinea)', valor: 'TSH 1,8' },
  ]);
});

test('datosLaboratorioDesdeEvapre: sin resultados no se puede adjuntar', () => {
  assert.equal(datosLaboratorioDesdeEvapre(registro({ hb: '  ' }), campos), null);
  assert.equal(datosLaboratorioDesdeEvapre({ id: 'x', fecha: '07.OCT.2026', numero: '1' }, campos), null);
});

test('datosLaboratorioDesdeEvapre: fecha ISO y vínculo con la EVAPRE', () => {
  const d = datosLaboratorioDesdeEvapre(registro({ hb: '13,8' }), campos);
  assert.equal(d.fecha, '2026-10-07');
  assert.deepEqual(d.evapre, { id: 'evapre-1', numero: '0201295702' });
});

test('aplicarLaboratorios: completa el paso, cita la EVAPRE y no muta la original', () => {
  const original = solicitud();
  const d = datosLaboratorioDesdeEvapre(registro({ hb: '13,8', inr: '1,0' }), campos);
  const s = aplicarLaboratorios(original, d);
  assert.equal(s.checklist.laboratorios.estado, 'ok');
  assert.match(s.checklist.laboratorios.detalle, /EVAPRE N° 0201295702 \(07\/10\/2026\): 2 registros/);
  assert.equal(s.checklist.laboratorios.registro.resultados.length, 2);
  assert.equal(original.checklist.laboratorios.estado, 'pendiente');
});

test('con laboratorios adjuntos la solicitud queda lista para programar', () => {
  const d = datosLaboratorioDesdeEvapre(registro({ hb: '13,8' }), campos);
  assert.equal(evaluarSolicitud(solicitud()).estado, 'pendientes');
  assert.equal(evaluarSolicitud(aplicarLaboratorios(solicitud(), d)).estado, 'lista');
});
