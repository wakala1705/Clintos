import test from 'node:test';
import assert from 'node:assert/strict';
import * as mod from '../hojaGasto.js';
import {
  aMinutos, minutosEntre, duracionesHoja, duracionTexto, horaAhora, formatearHora,
  conteoEstado, validarCierre, progresoHoja, resumenRegistro, pinValido, reabrirHoja,
  cerrarHoja, firmarHoja, construirHojaInicial, ROLES_PERSONAL,
  obtenerHojaGuardada, guardarHoja, actualizarFila, quitarFila, fechaHoraHoja,
  insumosPorConciliar, conciliarTodos, marcarInsumo,
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
  h.insumos = conciliarTodos(h.insumos);
  h.conteo.forEach((c) => { c.inicial = 10; c.final = 10; });
  h.firmas = { circulante: '2026-10-01T09:50', instrumentadora: '2026-10-01T09:50', cirujano: '2026-10-01T09:55' };
  return h;
}

test('aMinutos / minutosEntre: parsea HH:mm, valida rango y rechaza vacíos', () => {
  assert.equal(aMinutos('07:30'), 450);
  assert.equal(aMinutos('00:00'), 0);
  assert.equal(aMinutos('23:59'), 1439);
  assert.equal(aMinutos(''), null);
  assert.equal(aMinutos('24:00'), null);
  assert.equal(aMinutos('12:60'), null);
  assert.equal(aMinutos('99:99'), null);
  assert.equal(minutosEntre('07:30', '09:30'), 120);
  assert.equal(minutosEntre('', '09:30'), null);
});

test('horaAhora: HH:mm en 24 h con ceros', () => {
  assert.equal(horaAhora(new Date(2026, 9, 1, 7, 5)), '07:05');
  assert.equal(horaAhora(new Date(2026, 9, 1, 23, 59)), '23:59');
  assert.match(horaAhora(), /^\d{2}:\d{2}$/);
});

test('formatearHora: máscara progresiva', () => {
  assert.equal(formatearHora('0'), '0');
  assert.equal(formatearHora('073'), '07:3');
  assert.equal(formatearHora('0730'), '07:30');
  assert.equal(formatearHora('07:30abc'), '07:30');
  assert.equal(formatearHora('073045'), '07:30');
  assert.equal(formatearHora(''), '');
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

test('conteoEstado: pendiente, correcto, discrepancia y previo a cierre', () => {
  assert.equal(conteoEstado({ inicial: null, final: 5 }), 'pendiente');
  assert.equal(conteoEstado({ inicial: '', final: '' }), 'pendiente');
  assert.equal(conteoEstado({ inicial: 5, final: '' }), 'pendiente');
  assert.equal(conteoEstado({ inicial: 5, final: 5 }), 'correcto');
  assert.equal(conteoEstado({ inicial: 5, final: 4 }), 'discrepancia');
  assert.equal(conteoEstado({ inicial: 5, previoCierre: '', final: 5 }), 'correcto');
  assert.equal(conteoEstado({ inicial: 5, previoCierre: 5, final: 5 }), 'correcto');
  assert.equal(conteoEstado({ inicial: 5, previoCierre: 4, final: 5 }), 'discrepancia');
  assert.equal(conteoEstado({ inicial: 5, previoCierre: 5, final: 4 }), 'discrepancia');
});

test('construirHojaInicial: nueva forma sin dinero', () => {
  const h = construirHojaInicial(cirugia());
  assert.equal(h.numero, 'HG-99001');
  assert.equal(h.estado, 'borrador');
  assert.deepEqual(h.reaperturas, []);
  assert.deepEqual(h.tiempos, { ingresoSala: '', inicioAnestesia: '', inicioCirugia: '', finCirugia: '', salidaSala: '' });
  assert.deepEqual(h.programado, { inicio: '07:30', fin: '09:30' });
  assert.equal(h.personal.length, 4);
  assert.equal(h.personal[0].registro, '');
  assert.equal(h.personal[0].rol, 'Cirujano');
  assert.equal(h.honorarios, undefined);
  assert.equal(h.derechosSala, undefined);
  // solo los insumos ya entregados; usado = entregado - devuelto
  assert.deepEqual(h.insumos.map((i) => [i.nombre, i.entregado, i.usado]), [['Gasas estériles', 10, 8], ['Trocar 5mm', 2, 2]]);
  assert.ok(h.insumos.every((i) => !('valorUnitario' in i)));
  assert.equal(h.medicamentos[0].nombre, 'Cefazolina');
  assert.equal(h.medicamentos[0].cantidad, 1);
  assert.ok(!('valorUnitario' in h.medicamentos[0]));
  assert.equal(h.equipos[0].identificacion, 'EQ-0412');
  assert.equal(h.equipos[0].minutos, 120);
  assert.ok(!('tarifaHora' in h.equipos[0]));
  assert.equal(h.conteo.length, 4);
  assert.deepEqual(
    { inicial: h.conteo[0].inicial, previoCierre: h.conteo[0].previoCierre, final: h.conteo[0].final, nota: h.conteo[0].nota, manual: h.conteo[0].manual },
    { inicial: '', previoCierre: '', final: '', nota: '', manual: false },
  );
  assert.deepEqual(h.firmas, { circulante: null, instrumentadora: null, cirujano: null });
});

test('constantes y exports de dinero eliminados', () => {
  assert.deepEqual(ROLES_PERSONAL, ['Cirujano', 'Ayudante', 'Anestesiólogo', 'Instrumentadora', 'Circulante']);
  ['valorPorTiempo', 'valorDerechosSala', 'valorInsumo', 'valorMedicamento', 'totalesHoja', 'formatoCOP', 'ROLES_HONORARIOS']
    .forEach((n) => assert.equal(mod[n], undefined, n));
});

test('validarCierre: hoja completa no tiene errores', () => {
  assert.deepEqual(validarCierre(hojaLista()), []);
});

test('validarCierre: detecta cada regla', () => {
  const h = hojaLista();
  h.tiempos.salidaSala = '09:00'; // antes del fin de cirugía
  h.anestesia.tipo = '';
  h.procedimientos[0].cups = '';
  h.personal = h.personal.filter((p) => p.rol !== 'Cirujano');
  h.insumos[0].usado = 99;
  h.implantes = [{ id: 'imp-1', nombre: 'Malla', invima: '', lote: '', serie: '', proveedor: '' }];
  h.conteo[0].final = 9;
  h.firmas.cirujano = null;
  const secciones = validarCierre(h).map((e) => e.seccion);
  assert.deepEqual(secciones, ['tiempos', 'anestesia', 'procedimientos', 'personal', 'insumos', 'implantes', 'conteo', 'firmas']);
});

test('validarCierre: cirujano con nombre vacío falla', () => {
  const h = hojaLista();
  h.personal[0].nombre = '  ';
  const e = validarCierre(h);
  assert.equal(e.length, 1);
  assert.equal(e[0].seccion, 'personal');
  assert.equal(e[0].mensaje, 'Registra al cirujano.');
});

test('validarCierre: conteo pendiente y discrepancia con/sin nota', () => {
  const pend = hojaLista();
  pend.conteo[0].final = '';
  let e = validarCierre(pend);
  assert.deepEqual(e.map((x) => [x.seccion, x.mensaje]), [['conteo', 'Completa el conteo quirúrgico.']]);

  const sinNota = hojaLista();
  sinNota.conteo[0].final = 9;
  e = validarCierre(sinNota);
  assert.deepEqual(e.map((x) => [x.seccion, x.mensaje]), [['conteo', 'Documenta con una nota la discrepancia del conteo.']]);

  const conNota = hojaLista();
  conNota.conteo[0].final = 9;
  conNota.conteo[0].nota = 'Gasa en el campo, se recuperó';
  assert.deepEqual(validarCierre(conNota), []);
});

test('validarCierre: mensajes de firmas', () => {
  const h = hojaLista();
  h.firmas = { circulante: null, instrumentadora: null, cirujano: null };
  assert.deepEqual(validarCierre(h).map((e) => e.mensaje), [
    'Falta la firma del circulante.',
    'Falta la firma de la instrumentadora.',
    'Falta la firma del cirujano.',
  ]);
});

test('validarCierre: insumo sin cantidad usada cuenta como sin conciliar', () => {
  const h = hojaLista();
  h.insumos[0].usado = '';
  const e = validarCierre(h);
  assert.equal(e.length, 1);
  assert.equal(e[0].seccion, 'insumos');
});

test('construirHojaInicial: insumos de canasta arrancan por conciliar y con lote vacío', () => {
  const h = construirHojaInicial(cirugia());
  assert.ok(h.insumos.every((i) => i.conciliado === false && i.lote === '' && i.manual === false));
});

test('insumosPorConciliar / conciliarTodos / marcarInsumo', () => {
  const h = construirHojaInicial(cirugia());
  assert.equal(insumosPorConciliar(h.insumos), 2);
  const todos = conciliarTodos(h.insumos);
  assert.equal(insumosPorConciliar(todos), 0);
  assert.deepEqual(todos.map((i) => i.usado), h.insumos.map((i) => i.usado));
  assert.equal(h.insumos[0].conciliado, false); // no muta
  const t = marcarInsumo(h.insumos[0], 'todo');
  assert.equal(t.usado, 10);
  assert.equal(t.conciliado, true);
  const n = marcarInsumo(h.insumos[0], 'nada');
  assert.equal(n.usado, 0);
  assert.equal(n.conciliado, true);
});

test('validarCierre: insumos por conciliar bloquean el cierre con N real', () => {
  const h = hojaLista();
  h.insumos[0].conciliado = false;
  h.insumos[1].conciliado = false;
  assert.deepEqual(validarCierre(h).map((e) => [e.seccion, e.mensaje]), [['insumos', 'Concilia los insumos entregados (2 por conciliar).']]);
  assert.equal(progresoHoja(h).porSeccion.insumos, false);
});

test('validarCierre: usado > entregado tiene prioridad sobre por conciliar', () => {
  const h = hojaLista();
  h.insumos[0].conciliado = false;
  h.insumos[1].usado = 99;
  assert.equal(validarCierre(h)[0].mensaje, 'Un insumo tiene más cantidad usada que entregada.');
});

test('progresoHoja: 7 secciones, anestesia cuenta contra tiempos', () => {
  const ok = progresoHoja(hojaLista());
  assert.equal(ok.total, 7);
  assert.equal(ok.completas, 7);
  assert.deepEqual(Object.keys(ok.porSeccion), ['tiempos', 'procedimientos', 'personal', 'insumos', 'implantes', 'conteo', 'firmas']);

  const h = hojaLista();
  h.anestesia.tipo = '';
  h.firmas.cirujano = null;
  const p = progresoHoja(h);
  assert.equal(p.porSeccion.tiempos, false);
  assert.equal(p.porSeccion.firmas, false);
  assert.equal(p.porSeccion.conteo, true);
  assert.equal(p.completas, 5);

  const vacia = progresoHoja(construirHojaInicial(cirugia()));
  assert.equal(vacia.porSeccion.personal, true);
  assert.equal(vacia.porSeccion.tiempos, false);
});

test('resumenRegistro: conteos y peor estado del conteo', () => {
  const h = hojaLista();
  h.implantes = [{ id: 'i', nombre: 'Malla', invima: 'X', lote: 'L', serie: '', proveedor: '' }];
  const r = resumenRegistro(h);
  assert.equal(r.insumosItems, 2);
  assert.equal(r.insumosUnidadesUsadas, 10);
  assert.equal(r.insumosUnidadesDevueltas, 2);
  assert.equal(r.medicamentos, 1);
  assert.equal(r.implantes, 1);
  assert.equal(r.equipos, 1);
  assert.equal(r.conteo, 'correcto');
  assert.deepEqual(r.duraciones, { sala: 155, anestesia: 130, cirugia: 120 });

  h.conteo[1].final = '';
  assert.equal(resumenRegistro(h).conteo, 'pendiente');
  h.conteo[2].final = 1;
  assert.equal(resumenRegistro(h).conteo, 'discrepancia');
});

test('pinValido: exactamente 4 dígitos', () => {
  assert.equal(pinValido('1234'), true);
  assert.equal(pinValido('0000'), true);
  assert.equal(pinValido('123'), false);
  assert.equal(pinValido('12345'), false);
  assert.equal(pinValido('12a4'), false);
  assert.equal(pinValido(''), false);
  assert.equal(pinValido(1234), false);
  assert.equal(pinValido(null), false);
});

test('reabrirHoja: exige motivo, limpia firmas y registra la reapertura', () => {
  const cerrada = { ...hojaLista(), estado: 'cerrada', cerradaEn: '2026-10-01T10:00' };
  const r0 = reabrirHoja(cerrada, '   ', '2026-10-01T11:00');
  assert.equal(r0.ok, false);
  assert.equal(r0.error, 'Escribe el motivo de la reapertura.');
  assert.equal(r0.hoja, cerrada);

  const r = reabrirHoja(cerrada, '  Error en conteo ', '2026-10-01T11:00');
  assert.equal(r.ok, true);
  assert.equal(r.hoja.estado, 'borrador');
  assert.equal(r.hoja.cerradaEn, null);
  assert.deepEqual(r.hoja.firmas, { circulante: null, instrumentadora: null, cirujano: null });
  assert.deepEqual(r.hoja.reaperturas, [{ motivo: 'Error en conteo', en: '2026-10-01T11:00' }]);
  assert.equal(cerrada.estado, 'cerrada'); // no muta
  assert.equal(cerrada.reaperturas.length, 0);
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
