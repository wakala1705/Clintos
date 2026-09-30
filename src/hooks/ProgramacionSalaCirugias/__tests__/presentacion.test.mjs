import test from 'node:test';
import assert from 'node:assert/strict';
import {
  badgeProps, bannerCanasta, filtrarCanastas, GATE_META, kpisCanastas, lineaAutorizacion, lineaConsumo,
  lineaRecepcion, resumenDevolucion,
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

test('badgeProps: el tono violeta agrega la clase propia', () => {
  assert.deepEqual(badgeProps({ tone: 'success' }), { tone: 'success', className: '' });
  assert.deepEqual(badgeProps(GATE_META['urgencia-autorizada']), { tone: 'neutral', className: 'cnc-badge-violet' });
});

test('filtrarCanastas: por estado y por texto', () => {
  const lista = [
    cirugia([pend()]), // en preparación, bloqueada
    { ...cirugia([desp()]), id: 'y', paciente: { nombre: 'Laura Gómez', documento: 'CC 1' } },
    { ...cirugia([ent()]), id: 'z', paciente: { nombre: 'Ana', documento: 'CC 2' } },
  ];
  const ids = (f) => filtrarCanastas(lista, f).map((c) => c.id);
  assert.deepEqual(ids({}), ['x', 'y', 'z']);
  assert.deepEqual(ids({ estado: 'en-preparacion' }), ['x']);
  assert.deepEqual(ids({ estado: 'por-recibir' }), ['y']);
  assert.deepEqual(ids({ estado: 'recibidas' }), ['z']);
  assert.deepEqual(ids({ estado: 'bloqueadas' }), ['x', 'y']);
  assert.deepEqual(ids({ busqueda: 'laura' }), ['y']);
  assert.deepEqual(ids({ busqueda: '4593' }), ['x', 'y', 'z']);
});

test('kpisCanastas: la urgencia sin autorizar no cuenta como bloqueada', () => {
  const lista = [cirugia([pend()]), cirugia([desp()]), cirugia([ent()]), cirugia([pend()], { estado: 'urgencia' })];
  assert.deepEqual(kpisCanastas(lista), {
    recibidas: 1, porRecibir: 1, enPreparacion: 2, bloqueadas: 2,
  });
});

test('bannerCanasta por compuerta', () => {
  assert.equal(bannerCanasta(cirugia([pend()])).tone, 'danger');
  assert.equal(bannerCanasta(cirugia([pend()])).bloqueado, true);
  assert.match(bannerCanasta(cirugia([pend()], { estado: 'urgencia' })).texto, /puedes autorizar el inicio/);
  const autorizada = cirugia([pend()], { estado: 'urgencia', autorizacionUrgencia: { usuario: 'Ana', fecha: '2026-09-29T08:45' } });
  assert.match(bannerCanasta(autorizada).texto, /Inicio autorizado por urgencia \(Ana · 29\.SEP\.2026 - 08:45\)/);
  assert.equal(bannerCanasta(cirugia([ent()])).tone, 'success');
  assert.equal(
    bannerCanasta(cirugia([ent()], { recepcion: { usuario: 'Ana', fecha: '2026-09-29T08:10', conNovedades: true } })).tone,
    'warn',
  );
  assert.equal(bannerCanasta(cirugia([ent()], { estado: 'realizada' })).tone, 'info');
  assert.equal(
    bannerCanasta(cirugia([ent()], { estado: 'realizada', consumo: { usuario: 'Ana', fecha: '2026-09-29T10:00', usados: {} } })).tone,
    'neutral',
  );
  assert.equal(bannerCanasta(cirugia([ent()], { estado: 'cancelada' })), null);
});

test('canasta sin ítems: banner propio y no cuenta como bloqueada', () => {
  const vacia = cirugia([]);
  assert.deepEqual(bannerCanasta(vacia), {
    tone: 'neutral', bloqueado: false, texto: 'Esta cirugía no tiene insumos en su canasta: puede iniciar.',
  });
  assert.equal(kpisCanastas([vacia]).bloqueadas, 0);
  assert.deepEqual(filtrarCanastas([vacia], { estado: 'bloqueadas' }), []);
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
  const aut = cirugia([pend()], { estado: 'urgencia', autorizacionUrgencia: { usuario: 'Ana', fecha: '2026-09-29T08:45' } });
  assert.equal(lineaAutorizacion(aut), 'Excepción registrada por Ana · 29.SEP.2026 - 08:45. La recepción sigue pendiente.');
  const cons = cirugia([ent({ nombre: 'A', cantidad: 4 })], {
    estado: 'realizada', consumo: { usuario: 'Ana', fecha: '2026-09-29T10:00', usados: { A: 1 } },
  });
  assert.equal(lineaConsumo(cons), 'Consumo registrado por Ana · 29.SEP.2026 - 10:00 · 3 unidades enviadas a devolución');
});
