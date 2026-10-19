import test from 'node:test';
import assert from 'node:assert/strict';
import {
  construirResumenHoja, documentoResumenHtml, escaparHtml, fechaHoraLarga, resumenAlRegistrar,
} from '../resumenHoja.js';

const mat = (nombre, entregado, consumido) => ({
  nombre, entregado: String(entregado), consumido: consumido === null ? '' : String(consumido),
});
const cirugia = {
  fecha: '2026-10-15',
  salaId: 'qx-1',
  horaInicio: '08:00',
  horaFin: '09:00',
  paciente: { nombre: 'Clemencia Sarmiento', edad: 62, documento: 'CC 41288653' },
  procedimientoPrincipal: 'Esofagogastroduodenoscopia con biopsias',
  procedimientos: [{ cups: '451302' }],
  dxIngreso: 'C160 - TUMOR MALIGNO DEL CARDIAS',
};
const hoja = (extra = {}) => ({
  estado: 'registrada',
  registradaEn: '2026-10-15T08:45',
  equipo: { cirujano: 'ANTONIO MIRANDA', ayudante: '', anestesiologo: 'NATALIA CABRERA', instrumentista: 'MARTHA RAMIREZ', circulante: 'LUZ CASTRO' },
  tiempos: { inicioAnest: '07:50', inicioOperac: '08:05', termOperac: '08:45' },
  materiales: [mat('Gasas', 5, 5), mat('Guantes', 4, 1), mat('Campo', 1, null), mat('Jeringa', 2, 0)],
  ...extra,
});

test('fechaHoraLarga: formato DD.MES.AAAA - HH:mm; vacío -> —', () => {
  assert.equal(fechaHoraLarga('2026-10-15T08:45'), '15.OCT.2026 - 08:45');
  assert.equal(fechaHoraLarga(''), '—');
});

test('filas: las que tienen devolución van primero y conservan el orden entre sí', () => {
  const vm = construirResumenHoja(cirugia, hoja());
  assert.deepEqual(vm.filas.map((f) => f.nombre), ['Guantes', 'Jeringa', 'Gasas', 'Campo']);
  assert.equal(vm.filas[0].devuelto, 3);
  assert.equal(vm.filas[0].conDevolucion, true);
});

test('filas: sin consumo digitado es "sin dato" y cuenta como usado completo, sin devolución', () => {
  const campo = construirResumenHoja(cirugia, hoja()).filas.find((f) => f.nombre === 'Campo');
  assert.equal(campo.sinDato, true);
  assert.equal(campo.usado, 1);
  assert.equal(campo.devuelto, null);
  assert.equal(campo.conDevolucion, false);
  const jeringa = construirResumenHoja(cirugia, hoja()).filas.find((f) => f.nombre === 'Jeringa');
  assert.equal(jeringa.sinDato, false); // un 0 digitado es un dato, no "sin dato"
  assert.equal(jeringa.usado, 0);
});

test('cifras: toma la devolución y el "sin dato" guardados al registrar', () => {
  const plan = { sinDato: 2, generaDevolucion: true, unidades: 5, insumos: 2 };
  const vm = construirResumenHoja(cirugia, hoja({ resumen: resumenAlRegistrar({ plan, usuario: 'Camilo' }) }));
  assert.equal(vm.cifras.devueltas, 5);
  assert.equal(vm.cifras.insumosDevueltos, 2);
  assert.equal(vm.cifras.sinDato, 2);
  assert.equal(vm.registro.por, 'Camilo');
  assert.match(vm.devolucion.texto, /5 unidades en 2 insumos/);
  assert.equal(vm.devolucion.tono, 'info');
  assert.equal(vm.devolucion.titulo, 'Devolución generada');
});

test('cifras: sin resumen guardado se derivan de la hoja', () => {
  const vm = construirResumenHoja(cirugia, hoja());
  assert.equal(vm.cifras.usadas, 7); // 5 + 1 + 1 (sin dato = usado completo) + 0
  assert.equal(vm.cifras.sinDato, 1);
  assert.equal(vm.cifras.devueltas, 5);
  assert.equal(vm.cifras.insumosDevueltos, 2);
  assert.equal(vm.registro.por, '—');
});

test('devolución: consumo ya registrado antes no genera una nueva', () => {
  const plan = { sinDato: 0, generaDevolucion: false, unidades: 3, insumos: 1 };
  const vm = construirResumenHoja(cirugia, hoja({ resumen: resumenAlRegistrar({ plan, usuario: 'X' }) }));
  assert.equal(vm.devolucion.generada, false);
  assert.match(vm.devolucion.texto, /ya estaba registrado/);
  assert.equal(vm.devolucion.tono, 'neutral');
});

test('devolución: nada por devolver', () => {
  const plan = { sinDato: 0, generaDevolucion: true, unidades: 0, insumos: 0 };
  const vm = construirResumenHoja(cirugia, hoja({ resumen: resumenAlRegistrar({ plan, usuario: 'X' }) }));
  assert.equal(vm.devolucion.tono, 'ok');
  assert.equal(vm.devolucion.titulo, 'Sin devoluciones a farmacia');
});

test('tiempos: real vs estimado; sin inicio o fin válido queda —', () => {
  const vm = construirResumenHoja(cirugia, hoja());
  assert.equal(vm.cifras.tiempoReal, '40 min');
  assert.equal(vm.cifras.tiempoEstimado, '1 h 00 min');
  const sinFin = construirResumenHoja(cirugia, hoja({ tiempos: { inicioAnest: '', inicioOperac: '08:05', termOperac: '' } }));
  assert.equal(sinFin.cifras.tiempoReal, '—');
  const invertido = construirResumenHoja(cirugia, hoja({ tiempos: { inicioAnest: '', inicioOperac: '09:00', termOperac: '08:00' } }));
  assert.equal(invertido.cifras.tiempoReal, '—');
});

test('equipo vacío se muestra como —', () => {
  const vm = construirResumenHoja(cirugia, hoja());
  assert.equal(vm.equipo.find((x) => x.rol === 'Cirujano ayudante').nombre, '—');
});

test('documento: escapa HTML en nombres y no deja markup inyectado', () => {
  assert.equal(escaparHtml('<b>"a"&\'</b>'), '&lt;b&gt;&quot;a&quot;&amp;&#39;&lt;/b&gt;');
  const vm = construirResumenHoja(cirugia, hoja({ materiales: [mat('<script>alert(1)</script>', 1, 1)] }));
  const html = documentoResumenHtml(vm);
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('documento: incluye paciente, cifras y estado de devolución', () => {
  const html = documentoResumenHtml(construirResumenHoja(cirugia, hoja()));
  assert.ok(html.startsWith('<!doctype html>'));
  assert.ok(html.includes('Clemencia Sarmiento'));
  assert.ok(html.includes('15.OCT.2026 - 08:45'));
  assert.ok(html.includes('Firma de farmacia'));
});

test('devolución: el consecutivo guardado va en el título', () => {
  const plan = { sinDato: 0, generaDevolucion: true, unidades: 2, insumos: 1 };
  const vm = construirResumenHoja(cirugia, hoja({ resumen: resumenAlRegistrar({ plan, usuario: 'X', consecutivo: 7 }) }));
  assert.equal(vm.devolucion.titulo, 'Devolución N.º 7 generada');
  assert.match(vm.devolucion.detalle, /pendiente de firma de farmacia/);
});

test('devolución: sin resumen guardado el estado es neutral y sin información', () => {
  const vm = construirResumenHoja(cirugia, hoja());
  assert.equal(vm.devolucion.tono, 'neutral');
  assert.match(vm.devolucion.texto, /Sin información/);
});

test('documento: lo sin dato se marca y el total es lo usado', () => {
  const html = documentoResumenHtml(construirResumenHoja(cirugia, hoja()));
  assert.ok(html.includes('(sin dato)'));
  assert.ok(html.includes('<th class="n">Usado</th>'));
});

test('pendiente: habla en futuro y no inventa una devolución ya generada', () => {
  const plan = { sinDato: 0, generaDevolucion: true, unidades: 3, insumos: 2 };
  const h = hoja({ registradaEn: undefined, resumen: resumenAlRegistrar({ plan, usuario: 'X' }) });
  const vm = construirResumenHoja(cirugia, h, { pendiente: true });
  assert.equal(vm.pendiente, true);
  assert.equal(vm.devolucion.titulo, 'Se generará la devolución a farmacia');
  assert.match(vm.devolucion.detalle, /3 unidades en 2 insumos · quedará pendiente/);
  assert.equal(vm.devolucion.tono, 'info');
});

test('pendiente: nada por devolver y consumo ya registrado', () => {
  const sin = hoja({ resumen: resumenAlRegistrar({ plan: { sinDato: 0, generaDevolucion: true, unidades: 0, insumos: 0 }, usuario: 'X' }) });
  assert.equal(construirResumenHoja(cirugia, sin, { pendiente: true }).devolucion.titulo, 'No hay insumos por devolver a farmacia');
  const ya = hoja({ resumen: resumenAlRegistrar({ plan: { sinDato: 0, generaDevolucion: false, unidades: 1, insumos: 1 }, usuario: 'X' }) });
  assert.equal(construirResumenHoja(cirugia, ya, { pendiente: true }).devolucion.titulo, 'No se generará una nueva devolución');
});

test('documento: en vista previa dice pendiente de confirmar, no "Registrada el"', () => {
  const html = documentoResumenHtml(construirResumenHoja(cirugia, hoja(), { pendiente: true }));
  assert.ok(html.includes('pendiente de confirmar'));
  assert.ok(!html.includes('Registrada el'));
});
