import test from 'node:test';
import assert from 'node:assert/strict';
import {
  actualizarCirugia, actualizarEquiposCirugia, actualizarPersonalCirugia, fetchAgendaRango,
  vincularEquiposCirugia, vincularPersonalCirugia,
} from '../mockCirugiaData.js';

async function cirugiaSinNada() {
  const [c] = await fetchAgendaRango({ sedeId: '02', salaId: 'todas', inicio: '2000-01-01', fin: '2100-01-01' });
  return actualizarCirugia(c.id, { personal: [], equipos: [] });
}

test('vincularPersonalCirugia: guarda rol y nombre, y no se puede vincular dos veces', async () => {
  const c = await cirugiaSinNada();
  const r = vincularPersonalCirugia(c.id, [{ rol: 'Cirujano', nombre: 'Ana Pérez', extra: 'x' }]);
  assert.deepEqual(r.personal, [{ rol: 'Cirujano', nombre: 'Ana Pérez' }]);
  assert.throws(() => vincularPersonalCirugia(c.id, [{ rol: 'Ayudante', nombre: 'B' }]), /ya tiene personal/);
});

test('vincularPersonalCirugia: exige a alguien y una cirugía existente', async () => {
  const c = await cirugiaSinNada();
  assert.throws(() => vincularPersonalCirugia(c.id, []), /al menos una persona/);
  assert.throws(() => vincularPersonalCirugia('no-existe', [{ rol: 'Cirujano', nombre: 'A' }]), /No se encontró/);
});

test('vincularEquiposCirugia: los equipos arrancan disponibles y no se vinculan dos veces', async () => {
  const c = await cirugiaSinNada();
  const r = vincularEquiposCirugia(c.id, [{ nombre: 'Cauterio', tipo: 'Energía', identificacion: 'EQ-1', otro: 1 }]);
  assert.deepEqual(r.equipos, [{ nombre: 'Cauterio', tipo: 'Energía', identificacion: 'EQ-1', estado: 'disponible' }]);
  assert.throws(() => vincularEquiposCirugia(c.id, [{ nombre: 'X', tipo: 'Y', identificacion: 'EQ-2' }]), /ya tiene equipos/);
});

test('vincularEquiposCirugia: exige al menos un equipo', async () => {
  const c = await cirugiaSinNada();
  assert.throws(() => vincularEquiposCirugia(c.id, []), /al menos un equipo/);
});

test('actualizarPersonalCirugia: reemplaza la lista (también por una vacía)', async () => {
  const c = await cirugiaSinNada();
  vincularPersonalCirugia(c.id, [{ rol: 'Cirujano', nombre: 'Ana' }]);
  const r = actualizarPersonalCirugia(c.id, [{ rol: 'Cirujano', nombre: 'Luis', extra: 1 }, { rol: 'Ayudante', nombre: 'Eva' }]);
  assert.deepEqual(r.personal, [{ rol: 'Cirujano', nombre: 'Luis' }, { rol: 'Ayudante', nombre: 'Eva' }]);
  assert.deepEqual(actualizarPersonalCirugia(c.id, []).personal, []);
  assert.throws(() => actualizarPersonalCirugia('no-existe', []), /No se encontró/);
});

test('actualizarEquiposCirugia: conserva el estado de los que ya estaban y agrega nuevos como disponibles', async () => {
  const c = await cirugiaSinNada();
  vincularEquiposCirugia(c.id, [{ nombre: 'Cauterio', tipo: 'Energía', identificacion: 'EQ-1' }]);
  actualizarCirugia(c.id, { equipos: [{ nombre: 'Cauterio', tipo: 'Energía', identificacion: 'EQ-1', estado: 'en-uso' }] });
  const r = actualizarEquiposCirugia(c.id, [
    { nombre: 'Cauterio', tipo: 'Energía', identificacion: 'EQ-1' },
    { nombre: 'Monitor', tipo: 'Monitoreo', identificacion: 'EQ-2' },
  ]);
  assert.deepEqual(r.equipos.map((e) => [e.identificacion, e.estado]), [['EQ-1', 'en-uso'], ['EQ-2', 'disponible']]);
  assert.deepEqual(actualizarEquiposCirugia(c.id, []).equipos, []);
  assert.throws(() => actualizarEquiposCirugia('no-existe', []), /No se encontró/);
});
