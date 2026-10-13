import test from 'node:test';
import assert from 'node:assert/strict';
import {
  contarPorEstado, enmascararDocumento, evaluarSolicitud, filtrarSolicitudes, mensajeFaltantes, ordenarPorPrioridad,
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

test('filtra por búsqueda sin tildes, diagnóstico y estado; cuenta por estado', () => {
  const lista = [sol(), sol({ valoracion: item('pendiente') }, { id: 'y', primeraVez: true })];
  const base = {
    busqueda: '', origen: '', diagnostico: '', estado: 'todas',
  };
  assert.equal(filtrarSolicitudes(lista, { ...base, busqueda: 'oftalmologia' }).length, 0);
  assert.equal(filtrarSolicitudes(lista, { ...base, busqueda: 'CATARATA' }).length, 2);
  assert.equal(filtrarSolicitudes(lista, { ...base, busqueda: '41667' }).length, 2);
  assert.equal(filtrarSolicitudes(lista, { ...base, diagnostico: 'primera-vez' }).length, 1);
  assert.equal(filtrarSolicitudes(lista, { ...base, diagnostico: 'recurrente' }).length, 1);
  assert.equal(filtrarSolicitudes([sol({}, { origen: 'internacion' }), sol()], { ...base, origen: 'internacion' }).length, 1);
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
  assert.equal(accionItem('autorizacion', 'vencida'), 'Registrar renovación');
  assert.equal(accionItem('orden', 'pendiente'), 'Vincular orden médica');
  assert.equal(accionItem('imagenes', 'no-requerido'), null);
});

test('ordenarPorPrioridad: prioritarias, luego primera vez, luego el resto (estable)', () => {
  const ids = (l) => l.map((s) => s.id);
  const lista = [
    { id: 'a' },
    { id: 'b', primeraVez: true },
    { id: 'c', prioritaria: true },
    { id: 'd', prioritaria: true, primeraVez: true },
    { id: 'e' },
    { id: 'f', primeraVez: true },
  ];
  assert.deepEqual(ids(ordenarPorPrioridad(lista)), ['d', 'c', 'b', 'f', 'a', 'e']);
  assert.deepEqual(ids(lista), ['a', 'b', 'c', 'd', 'e', 'f']);
});

test('capitalizarNombre: título con conectores en minúscula', async () => {
  const { capitalizarNombre } = await import('../gestion.js');
  assert.equal(capitalizarNombre('CAMILO GRONDONA'), 'Camilo Grondona');
  assert.equal(capitalizarNombre('JOSE MARIO PORTO VALIENTE'), 'Jose Mario Porto Valiente');
  assert.equal(capitalizarNombre('CIRUGÍA DE TÓRAX'), 'Cirugía de Tórax');
  assert.equal(capitalizarNombre(undefined), '');
});

test('autorización registrada: completa el paso y el wizard precarga N° y usuario', async () => {
  const { aplicarAutorizacion, validarAutorizacion, formatoFechaHora } = await import('../autorizacion.js');
  const { datosWizardDesdeSolicitud } = await import('../programacion.js');
  const { getSolicitudes } = await import('../store.js');
  assert.equal(validarAutorizacion({ numero: '  ' }).numero, 'Ingresa el N° de autorización.');
  assert.deepEqual(validarAutorizacion({ numero: 'AUT-1' }), {});
  assert.equal(formatoFechaHora(new Date(2026, 9, 13, 14, 5)), '13.OCT.2026 - 14:05');
  const base = getSolicitudes().find((s) => s.checklist.autorizacion.estado === 'pendiente');
  const r = aplicarAutorizacion(base, {
    numero: ' AUT-2026-00456 ', archivo: { nombre: 'aut.pdf' }, registradoPor: { nombre: 'Camilo Grondona', rol: 'Administrador' }, fechaRegistro: '13.OCT.2026 - 14:05',
  });
  assert.equal(r.checklist.autorizacion.estado, 'ok');
  assert.match(r.checklist.autorizacion.detalle, /AUT-2026-00456 registrada por Camilo Grondona \(Administrador\)/);
  assert.equal(base.checklist.autorizacion.estado, 'pendiente');
  const w = datosWizardDesdeSolicitud(r);
  assert.equal(w.noAutorizacion, 'AUT-2026-00456');
  assert.equal(w.quienAutoriza, 'Camilo Grondona (Administrador)');
});

test('wizard: la Clase sale del origen de la solicitud', async () => {
  const { datosWizardDesdeSolicitud } = await import('../programacion.js');
  const { getSolicitudes } = await import('../store.js');
  const ce = getSolicitudes().find((s) => s.origen === 'consulta-externa');
  const inter = getSolicitudes().find((s) => s.origen === 'internacion');
  assert.equal(datosWizardDesdeSolicitud(ce).clase, 'CE');
  assert.equal(datosWizardDesdeSolicitud(inter).clase, 'Quirófano');
});
