import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANASTA_META, badgeProps, bannerCanasta, filtrarCanastas, kpisCanastas, lineaConsumo, lineaRecepcion,
  primeraPorRecibir, resumenDevolucion,
} from '../canastaPresentacion.js';

const item = (extra = {}) => ({ nombre: 'Gasas', cantidad: 4, ...extra });
const cirugia = (items, { estado = 'programada', ...resto } = {}) => ({
  id: 'x',
  estado,
  fecha: '2026-09-29',
  horaInicio: '09:30',
  paciente: { nombre: 'Juan Rodríguez', documento: 'CC 71.334.902' },
  procedimientoPrincipal: 'Hernioplastia',
  farmacia: { numeroPedido: '4593' },
  canasta: { nombre: 'c', items, ...resto },
});
const pend = () => item({ solicitudFarmacia: 'solicitado' });
const desp = () => item({ solicitudFarmacia: 'solicitado', despachado: 4 });
const ent = (extra = {}) => item({ solicitudFarmacia: 'entregado', ...extra });
const consumo = { usuario: 'Ana', fecha: '2026-09-29T10:00', usados: {} };

test('badgeProps: el tono violeta agrega la clase propia', () => {
  assert.deepEqual(badgeProps({ tone: 'success' }), { tone: 'success', className: '' });
  assert.deepEqual(badgeProps(CANASTA_META['consumo-registrado']), { tone: 'neutral', className: 'cnc-badge-violet' });
});

test('filtrarCanastas: por estado y por texto', () => {
  const lista = [
    cirugia([pend()]), // en preparación
    { ...cirugia([desp()]), id: 'y', paciente: { nombre: 'Laura Gómez', documento: 'CC 1' } },
    { ...cirugia([ent()]), id: 'z', paciente: { nombre: 'Ana', documento: 'CC 2' } },
    { ...cirugia([ent()], { estado: 'realizada' }), id: 'w', paciente: { nombre: 'Luis', documento: 'CC 3' } },
  ];
  const ids = (f) => filtrarCanastas(lista, f).map((c) => c.id);
  assert.deepEqual(ids({}), ['x', 'y', 'z', 'w']);
  assert.deepEqual(ids({ estado: 'en-preparacion' }), ['x']);
  assert.deepEqual(ids({ estado: 'por-recibir' }), ['y']);
  assert.deepEqual(ids({ estado: 'recibidas' }), ['z', 'w']);
  assert.deepEqual(ids({ estado: 'consumo-pendiente' }), ['w']);
  assert.deepEqual(ids({ busqueda: 'laura' }), ['y']);
  assert.deepEqual(ids({ busqueda: '4593' }), ['x', 'y', 'z', 'w']);
});

test('kpisCanastas: recibidas, por recibir, en preparación y consumo pendiente', () => {
  const lista = [
    cirugia([pend()]),
    cirugia([desp()]),
    cirugia([ent()]),
    cirugia([ent()], { estado: 'realizada' }), // recibida, consumo pendiente
    cirugia([ent()], { estado: 'realizada', consumo }), // ya legalizada
    cirugia([pend()], { estado: 'realizada' }), // realizada pero sin recibir: no es consumo pendiente
  ];
  assert.deepEqual(kpisCanastas(lista), {
    recibidas: 3, porRecibir: 1, enPreparacion: 2, consumoPendiente: 1,
  });
});

test('primeraPorRecibir: la primera cirugía con canasta despachada', () => {
  const lista = [cirugia([pend()]), { ...cirugia([desp()]), id: 'y' }, { ...cirugia([desp()]), id: 'z' }];
  assert.equal(primeraPorRecibir(lista).id, 'y');
  assert.equal(primeraPorRecibir([cirugia([pend()]), cirugia([ent()])]), undefined);
});

test('bannerCanasta describe el estado de la canasta, sin hablar de iniciar', () => {
  assert.deepEqual(bannerCanasta(cirugia([item()])), {
    tone: 'neutral', texto: 'Esta canasta todavía no fue solicitada a farmacia.',
  });
  assert.deepEqual(bannerCanasta(cirugia([pend()])), {
    tone: 'neutral', texto: 'Farmacia está preparando la canasta. Podrás recibirla cuando la despache.',
  });
  assert.deepEqual(bannerCanasta(cirugia([desp()])), {
    tone: 'info', texto: 'Canasta despachada: verifica y recibe los insumos.',
  });
  assert.deepEqual(bannerCanasta(cirugia([ent()])), { tone: 'success', texto: 'Canasta recibida completa.' });
  assert.deepEqual(
    bannerCanasta(cirugia([ent()], { recepcion: { usuario: 'Ana', fecha: '2026-09-29T08:10', conNovedades: true } })),
    { tone: 'warn', texto: 'Canasta recibida con novedades: farmacia fue notificada.' },
  );
  assert.deepEqual(bannerCanasta(cirugia([ent()], { estado: 'realizada' })), {
    tone: 'info', texto: 'Cirugía realizada. Registra el consumo real y la devolución de insumos a farmacia.',
  });
  assert.deepEqual(bannerCanasta(cirugia([ent()], { estado: 'realizada', consumo })), {
    tone: 'neutral', texto: 'Cirugía realizada. El consumo y la devolución de insumos ya fueron registrados.',
  });
  assert.deepEqual(bannerCanasta(cirugia([pend()], { estado: 'realizada' })), {
    tone: 'neutral', texto: 'Cirugía realizada, pero su canasta no fue recibida: no hay consumo que registrar.',
  });
  assert.deepEqual(bannerCanasta(cirugia([])), { tone: 'neutral', texto: 'Esta cirugía no tiene insumos en su canasta.' });
  assert.equal(bannerCanasta(cirugia([ent()], { estado: 'cancelada' })), null);
});

test('resumenDevolucion: unidades e insumos a devolver', () => {
  const c = cirugia([ent({ nombre: 'A', cantidad: 4 }), ent({ nombre: 'B', cantidad: 2, recibido: 1 })]);
  assert.deepEqual(resumenDevolucion(c), { unidades: 0, insumos: 0 });
  assert.deepEqual(resumenDevolucion(c, { A: 1, B: 0 }), { unidades: 4, insumos: 2 });
});

test('líneas de trazabilidad', () => {
  const conNov = cirugia([ent()], { recepcion: { usuario: 'Ana', fecha: '2026-09-29T08:10', conNovedades: true } });
  assert.equal(lineaRecepcion(conNov), 'Recibida con novedades por Ana · 29.SEP.2026 - 08:10 · Farmacia notificada');
  const sinNov = cirugia([ent()], { recepcion: { usuario: 'Ana', fecha: '2026-09-29T08:10', conNovedades: false } });
  assert.equal(lineaRecepcion(sinNov), 'Recibida completa por Ana · 29.SEP.2026 - 08:10');
  assert.equal(lineaRecepcion(cirugia([ent()])), 'Canasta recibida.');
  const cons = cirugia([ent({ nombre: 'A', cantidad: 4 })], {
    estado: 'realizada', consumo: { usuario: 'Ana', fecha: '2026-09-29T10:00', usados: { A: 1 } },
  });
  assert.equal(lineaConsumo(cons), 'Consumo registrado por Ana · 29.SEP.2026 - 10:00 · 3 unidades enviadas a devolución');
});
