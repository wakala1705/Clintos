import test from 'node:test';
import assert from 'node:assert/strict';
import {
  agregarBloque, alternarDia, alternarSinFecha, aISO, bloqueSiguiente, cambiarBloque, copiarDia,
  diaSemana, diasEntre, FIN_JORNADA, horarioVacio, horariosIguales, INICIO_JORNADA, lunesDe,
  opcionesHora, quitarBloque, sumarDias,
} from '../horario.js';

const HOY = '2026-10-14'; // miércoles

test('la jornada operativa es 07:00–19:00 (420–1140 min)', () => {
  assert.equal(INICIO_JORNADA, 420);
  assert.equal(FIN_JORNADA, 1140);
});

test('sumarDias cruza fin de mes y de año', () => {
  assert.equal(sumarDias('2026-10-31', 1), '2026-11-01');
  assert.equal(sumarDias('2026-12-31', 1), '2027-01-01');
  assert.equal(sumarDias('2026-10-14', -14), '2026-09-30');
  assert.equal(sumarDias(HOY, 0), HOY);
});

test('aISO formatea en hora local con ceros', () => {
  assert.equal(aISO(new Date(2026, 0, 5)), '2026-01-05');
});

test('diaSemana: lunes = 0 y domingo = 6', () => {
  assert.equal(diaSemana('2026-10-12'), 0);
  assert.equal(diaSemana(HOY), 2);
  assert.equal(diaSemana('2026-10-18'), 6);
});

test('lunesDe devuelve el lunes de la semana (el domingo pertenece a la semana que termina)', () => {
  assert.equal(lunesDe(HOY), '2026-10-12');
  assert.equal(lunesDe('2026-10-12'), '2026-10-12');
  assert.equal(lunesDe('2026-10-18'), '2026-10-12');
  assert.equal(lunesDe('2026-10-19'), '2026-10-19');
});

test('diasEntre', () => {
  assert.equal(diasEntre('2026-10-14', '2026-11-13'), 30);
  assert.equal(diasEntre('2026-10-14', '2026-10-13'), -1);
  assert.equal(diasEntre(HOY, HOY), 0);
});

test('opcionesHora: cada 30 min, extremos incluidos, con forma de FormSelect', () => {
  const ops = opcionesHora(420, 600);
  assert.equal(ops.length, 7);
  assert.deepEqual(ops[0], { value: '07:00', label: '07:00' });
  assert.deepEqual(ops[1], { value: '07:30', label: '07:30' });
  assert.deepEqual(ops[6], { value: '10:00', label: '10:00' });
});

test('horarioVacio: 7 días apagados, vigente desde hoy y sin fecha de fin', () => {
  const h = horarioVacio(HOY);
  assert.equal(h.desde, HOY);
  assert.equal(h.hasta, null);
  assert.equal(h.dias.length, 7);
  assert.ok(h.dias.every((d) => d.activo === false && d.bloques.length === 1));
  h.dias[0].bloques[0].inicio = '09:00';
  assert.equal(horarioVacio(HOY).dias[1].bloques[0].inicio, '07:00', 'cada día tiene su propio bloque');
});

test('copiarDia copia los bloques, activa los destinos y no toca el origen ni el original', () => {
  const base = horarioVacio(HOY);
  const conLunes = alternarDia(cambiarBloque(base, 0, 0, 'fin', '13:00'), 0, true);
  const copiado = copiarDia(conLunes, 0, [1, 2, 0]);
  assert.equal(copiado.dias[1].activo, true);
  assert.deepEqual(copiado.dias[1].bloques, [{ inicio: '07:00', fin: '13:00' }]);
  assert.equal(copiado.dias[3].activo, false);
  assert.equal(conLunes.dias[1].activo, false, 'el original no cambia');
  copiado.dias[1].bloques[0].fin = '08:00';
  assert.equal(copiado.dias[2].bloques[0].fin, '13:00', 'los bloques copiados no se comparten');
});

test('alternarDia: encender un día sin bloques le pone el de partida; apagar conserva los bloques', () => {
  const base = horarioVacio(HOY);
  const sinBloques = { ...base, dias: base.dias.map((d, i) => (i === 3 ? { activo: false, bloques: [] } : d)) };
  assert.deepEqual(alternarDia(sinBloques, 3, true).dias[3], { activo: true, bloques: [{ inicio: '07:00', fin: '12:00' }] });
  const encendido = alternarDia(base, 1, true);
  assert.equal(alternarDia(encendido, 1, false).dias[1].bloques.length, 1);
});

test('bloqueSiguiente arranca donde termina el último y dura 2 h como máximo', () => {
  assert.deepEqual(bloqueSiguiente([]), { inicio: '07:00', fin: '09:00' });
  assert.deepEqual(bloqueSiguiente([{ inicio: '07:00', fin: '12:00' }]), { inicio: '12:00', fin: '14:00' });
  assert.deepEqual(bloqueSiguiente([{ inicio: '07:00', fin: '18:00' }]), { inicio: '18:00', fin: '19:00' });
  assert.deepEqual(bloqueSiguiente([{ inicio: '07:00', fin: '19:00' }]), { inicio: '18:00', fin: '19:00' });
});

test('agregarBloque / quitarBloque / cambiarBloque solo tocan el día indicado', () => {
  const base = alternarDia(horarioVacio(HOY), 0, true);
  const con2 = agregarBloque(base, 0);
  assert.deepEqual(con2.dias[0].bloques, [{ inicio: '07:00', fin: '12:00' }, { inicio: '12:00', fin: '14:00' }]);
  assert.equal(base.dias[0].bloques.length, 1, 'el original no cambia');
  assert.equal(quitarBloque(con2, 0, 0).dias[0].bloques[0].inicio, '12:00');
  assert.equal(cambiarBloque(con2, 0, 1, 'inicio', '13:00').dias[0].bloques[1].inicio, '13:00');
  assert.equal(cambiarBloque(con2, 0, 1, 'inicio', '13:00').dias[1].bloques[0].inicio, '07:00');
});

test('alternarSinFecha: desmarcar propone desde + 90 días; marcar vuelve a null', () => {
  const h = horarioVacio(HOY);
  const conFin = alternarSinFecha(h, false);
  assert.equal(conFin.hasta, '2027-01-12');
  assert.equal(alternarSinFecha(conFin, true).hasta, null);
  assert.equal(alternarSinFecha({ ...h, desde: '' }, false).hasta, '');
});

test('horariosIguales compara por valor', () => {
  assert.equal(horariosIguales(horarioVacio(HOY), horarioVacio(HOY)), true);
  assert.equal(horariosIguales(horarioVacio(HOY), alternarDia(horarioVacio(HOY), 0, true)), false);
});
