import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aMinutos, minutosEntre, duracionesHoja, duracionTexto, valorPorTiempo, valorDerechosSala,
  conteoEstado, totalesHoja, validarCierre, cerrarHoja, firmarHoja, construirHojaInicial,
  obtenerHojaGuardada, guardarHoja, actualizarFila, quitarFila, fechaHoraHoja,
} from '../hojaGasto.js';

const cirugia = () => ({
  id: '99001',
  horaInicio: '07:30',
  horaFin: '09:30',
  procedimientos: [{ nombre: 'Colecistectomía laparoscópica', tipo: 'principal', duracionMin: 120 }],
  personal: [
    { rol: 'Cirujano', nombre: 'Dr. Juan García' },
    { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
    { rol: 'Instrumentadora', nombre: 'María Fernández' },
    { rol: 'Circulante', nombre: 'Luis Ramírez' },
  ],
  equipos: [{ nombre: 'Torre de laparoscopia', identificacion: 'EQ-0412' }],
  canasta: {
    nombre: 'Colecistectomía estándar',
    items: [
      { nombre: 'Gasas estériles', cantidad: 10, solicitudFarmacia: 'entregado', recibido: 10 },
      { nombre: 'Trocar 5mm', cantidad: 2, solicitudFarmacia: 'entregado', recibido: 2 },
      { nombre: 'Clips de titanio', cantidad: 6, solicitudFarmacia: 'solicitado' },
    ],
  },
  farmacia: { medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }] },
  devoluciones: [{ consecutivo: 1, estado: 'activa', items: [{ nombre: 'Gasas estériles', cantidad: 2 }] }],
});

// Hoja que cumple todas las reglas de cierre.
function hojaLista() {
  const h = construirHojaInicial(cirugia());
  h.tiempos = { ingresoSala: '07:10', inicioAnestesia: '07:20', inicioCirugia: '07:30', finCirugia: '09:30', salidaSala: '09:45' };
  h.anestesia.tipo = 'General';
  h.procedimientos[0].cups = '511101';
  h.procedimientos[0].dxPos = 'K80.1';
  h.conteo.forEach((c) => { c.inicial = 10; c.final = 10; });
  h.firmas = { circulante: '2026-10-01T09:50', instrumentadora: '2026-10-01T09:50', cirujano: '2026-10-01T09:55' };
  return h;
}

test('aMinutos / minutosEntre: parsea HH:mm y rechaza vacíos', () => {
  assert.equal(aMinutos('07:30'), 450);
  assert.equal(aMinutos(''), null);
  assert.equal(minutosEntre('07:30', '09:30'), 120);
  assert.equal(minutosEntre('', '09:30'), null);
});

test('duracionesHoja: sala, anestesia y cirugía; null si el orden es inválido o falta un tiempo', () => {
  const d = duracionesHoja({ ingresoSala: '07:10', inicioAnestesia: '07:20', inicioCirugia: '07:30', finCirugia: '09:30', salidaSala: '09:45' });
  assert.deepEqual(d, { sala: 155, anestesia: 130, cirugia: 120 });
  const roto = duracionesHoja({ ingresoSala: '10:00', inicioAnestesia: '', inicioCirugia: '07:30', finCirugia: '09:30', salidaSala: '09:45' });
  assert.deepEqual(roto, { sala: null, anestesia: null, cirugia: 120 });
});

test('duracionTexto', () => {
  assert.equal(duracionTexto(null), '—');
  assert.equal(duracionTexto(45), '45 min');
  assert.equal(duracionTexto(120), '2 h');
  assert.equal(duracionTexto(130), '2 h 10 min');
});

test('valorPorTiempo y valorDerechosSala (bloques de 30 min)', () => {
  assert.equal(valorPorTiempo({ minutos: 120, tarifaHora: 450000 }), 900000);
  assert.equal(valorPorTiempo({ minutos: '', tarifaHora: 450000 }), 0);
  assert.equal(valorDerechosSala({ minutos: 100, tarifaHora: 240000 }), 480000); // 100 min -> 4 bloques = 120 min = 2 h
  assert.equal(valorDerechosSala({ minutos: 0, tarifaHora: 240000 }), 0);
});

test('conteoEstado', () => {
  assert.equal(conteoEstado({ inicial: null, final: 5 }), 'pendiente');
  assert.equal(conteoEstado({ inicial: '', final: '' }), 'pendiente');
  assert.equal(conteoEstado({ inicial: 5, final: 5 }), 'correcto');
  assert.equal(conteoEstado({ inicial: 5, final: 4 }), 'discrepancia');
});

test('construirHojaInicial: precarga desde la cirugía', () => {
  const h = construirHojaInicial(cirugia());
  assert.equal(h.numero, 'HG-99001');
  assert.equal(h.estado, 'borrador');
  assert.equal(h.tiempos.inicioCirugia, '07:30');
  assert.equal(h.tiempos.ingresoSala, '');
  assert.equal(h.honorarios.length, 4);
  assert.equal(h.honorarios[0].minutos, 120);
  assert.equal(h.derechosSala.minutos, 120);
  // solo los insumos ya entregados; usado = entregado - devuelto
  assert.deepEqual(h.insumos.map((i) => [i.nombre, i.entregado, i.usado]), [['Gasas estériles', 10, 8], ['Trocar 5mm', 2, 2]]);
  assert.equal(h.medicamentos[0].nombre, 'Cefazolina');
  assert.equal(h.equipos[0].identificacion, 'EQ-0412');
  assert.equal(h.conteo.length, 4);
  assert.deepEqual(h.firmas, { circulante: null, instrumentadora: null, cirujano: null });
});

test('totalesHoja: suma por categoría', () => {
  const h = construirHojaInicial(cirugia());
  h.implantes = [{ id: 'imp-1', nombre: 'Malla', invima: 'X', lote: 'L1', serie: '', proveedor: '', valor: 500000 }];
  const t = totalesHoja(h);
  // 120 min cada uno: cirujano 900000, anestesiólogo 640000, instrumentadora 180000, circulante 120000
  assert.equal(t.honorarios, 900000 + 640000 + 180000 + 120000);
  assert.equal(t.insumos, 8 * 1800 + 2 * 95000);
  assert.equal(t.implantes, 500000);
  assert.equal(t.total, t.honorarios + t.insumos + t.medicamentos + t.implantes + t.equipos + t.derechosSala);
});

test('validarCierre: hoja completa no tiene errores', () => {
  assert.deepEqual(validarCierre(hojaLista()), []);
});

test('validarCierre: detecta cada regla', () => {
  const h = hojaLista();
  h.tiempos.salidaSala = '09:00'; // antes del fin de cirugía
  h.anestesia.tipo = '';
  h.procedimientos[0].cups = '';
  h.insumos[0].usado = 99;
  h.implantes = [{ id: 'imp-1', nombre: 'Malla', invima: '', lote: '', serie: '', proveedor: '', valor: 1 }];
  h.conteo[0].final = 9;
  h.firmas.cirujano = null;
  const secciones = validarCierre(h).map((e) => e.seccion);
  assert.deepEqual(secciones, ['tiempos', 'anestesia', 'procedimientos', 'insumos', 'implantes', 'conteo', 'firmas']);
});

test('validarCierre: insumo sin cantidad usada cuenta como sin conciliar', () => {
  const h = hojaLista();
  h.insumos[0].usado = '';
  const e = validarCierre(h);
  assert.equal(e.length, 1);
  assert.equal(e[0].seccion, 'insumos');
});

test('cerrarHoja: bloquea con errores y cierra sin ellos', () => {
  const mala = hojaLista();
  mala.firmas.circulante = null;
  const r1 = cerrarHoja(mala, '2026-10-01T10:00');
  assert.equal(r1.ok, false);
  assert.equal(r1.hoja.estado, 'borrador');
  const r2 = cerrarHoja(hojaLista(), '2026-10-01T10:00');
  assert.equal(r2.ok, true);
  assert.equal(r2.hoja.estado, 'cerrada');
  assert.equal(r2.hoja.cerradaEn, '2026-10-01T10:00');
});

test('firmarHoja: firma y quita la firma', () => {
  const h = construirHojaInicial(cirugia());
  const f = firmarHoja(h, 'cirujano', '2026-10-01T09:55');
  assert.equal(f.firmas.cirujano, '2026-10-01T09:55');
  assert.equal(firmarHoja(f, 'cirujano', null).firmas.cirujano, null);
  assert.equal(h.firmas.cirujano, null); // no muta
});

test('store: guarda una copia y la devuelve', () => {
  assert.equal(obtenerHojaGuardada('nunca'), null);
  const h = construirHojaInicial(cirugia());
  guardarHoja(h);
  h.observaciones = 'cambio posterior';
  assert.equal(obtenerHojaGuardada('99001').observaciones, '');
});

test('actualizarFila / quitarFila no mutan', () => {
  const rows = [{ id: 'a', v: 1 }, { id: 'b', v: 2 }];
  assert.deepEqual(actualizarFila(rows, 'b', 'v', 9), [{ id: 'a', v: 1 }, { id: 'b', v: 9 }]);
  assert.deepEqual(quitarFila(rows, 'a'), [{ id: 'b', v: 2 }]);
  assert.equal(rows[1].v, 2);
});

test('fechaHoraHoja: DD.MES.AAAA - HH:mm', () => {
  assert.equal(fechaHoraHoja('2026-08-21T07:00'), '21.AGO.2026 - 07:00');
  assert.equal(fechaHoraHoja('2026-10-01T09:05'), '01.OCT.2026 - 09:05');
});
