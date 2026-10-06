import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contarPorEstado, enmascararDocumento, evaluarSolicitud, filtrarSolicitudes, mensajeFaltantes,
} from '../gestion.js';

const item = (estado, obligatorio = true) => ({ estado, obligatorio, detalle: '' });
const sol = (over = {}, extra = {}) => ({
  id: 'x',
  paciente: { nombre: 'Rosa Elena', numeroDocumento: '41.667.230' },
  procedimiento: 'Catarata',
  eps: 'Sura',
  especialidad: 'Oftalmología',
  fechaTentativa: '2026-10-10',
  checklist: {
    orden: item('ok'),
    autorizacion: item('ok'),
    valoracion: item('ok'),
    laboratorios: item('ok'),
    imagenes: item('no-requerido', false),
    ...over,
  },
  ...extra,
});

test('lista: todos los obligatorios en ok', () => {
  const e = evaluarSolicitud(sol());
  assert.equal(e.estado, 'lista');
  assert.deepEqual([e.completos, e.total], [4, 4]);
});

test('un opcional pendiente no bloquea ni cuenta', () => {
  const e = evaluarSolicitud(sol({ imagenes: item('pendiente', false) }));
  assert.equal(e.estado, 'lista');
  assert.equal(e.total, 4);
  assert.equal(e.opcionalesPendientes.length, 1);
});

test('pendientes: falta un obligatorio', () => {
  const e = evaluarSolicitud(sol({ valoracion: item('pendiente') }));
  assert.equal(e.estado, 'pendientes');
  assert.equal(e.faltantes[0].key, 'valoracion');
  assert.match(mensajeFaltantes(e), /Valoración preanestésica \(pendiente\)/);
});

test('bloqueada: un vencido prima sobre pendientes', () => {
  const e = evaluarSolicitud(sol({ autorizacion: item('vencida'), valoracion: item('pendiente') }));
  assert.equal(e.estado, 'bloqueada');
  assert.equal(e.faltantes.length, 2);
});

test('enmascara el documento dejando 4 dígitos', () => {
  assert.equal(enmascararDocumento('CC', '1.020.345.817'), 'CC ••••5817');
});

test('filtra por búsqueda sin tildes, eps y estado; cuenta por estado', () => {
  const lista = [sol(), sol({ valoracion: item('pendiente') }, { id: 'y', eps: 'Sanitas' })];
  const base = {
    busqueda: '', origen: '', eps: '', especialidad: '', estado: 'todas',
  };
  assert.equal(filtrarSolicitudes(lista, { ...base, busqueda: 'oftalmologia' }).length, 0);
  assert.equal(filtrarSolicitudes(lista, { ...base, busqueda: 'CATARATA' }).length, 2);
  assert.equal(filtrarSolicitudes(lista, { ...base, busqueda: '41667' }).length, 2);
  assert.equal(filtrarSolicitudes(lista, { ...base, eps: 'Sanitas' }).length, 1);
  assert.equal(filtrarSolicitudes([sol({}, { origen: 'externa' }), sol()], { ...base, origen: 'externa' }).length, 1);
  assert.equal(filtrarSolicitudes(lista, { ...base, estado: 'pendientes' }).length, 1);
  assert.equal(filtrarSolicitudes(lista, { ...base, estado: 'pendientes' }, { ignorarEstado: true }).length, 2);
  assert.deepEqual(contarPorEstado(lista), {
    todas: 2, lista: 1, pendientes: 1, bloqueada: 0,
  });
});

test('estadoEstudios resume los dos subítems; accionItem según estado', async () => {
  const { estadoEstudios, accionItem } = await import('../gestion.js');
  const base = { laboratorios: item('ok'), imagenes: item('no-requerido', false) };
  assert.equal(estadoEstudios(base), 'ok');
  assert.equal(estadoEstudios({ ...base, imagenes: item('pendiente', false) }), 'pendiente');
  assert.equal(estadoEstudios({ ...base, laboratorios: item('vencida') }), 'vencida');
  assert.equal(estadoEstudios({ laboratorios: item('no-requerido', false), imagenes: item('no-requerido', false) }), 'no-requerido');
  assert.equal(accionItem('autorizacion', 'vencida'), 'Solicitar renovación');
  assert.equal(accionItem('orden', 'pendiente'), 'Registrar orden médica');
  assert.equal(accionItem('imagenes', 'no-requerido'), null);
});
