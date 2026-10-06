import test from 'node:test';
import assert from 'node:assert/strict';
import { armarChecklist, esAmbulatorio } from '../ordenes.js';
import { evaluarSolicitud } from '../gestion.js';
import { crearSolicitudesMock } from '../mockSolicitudes.js';
import { datosWizardDesdeSolicitud, duracionEstimadaMin, pacienteDeSolicitud } from '../programacion.js';

test('armarChecklist: orden adjunta, imágenes solo si se requieren', () => {
  const procs = [{ nombre: 'X', requiereImagenes: false, cobertura: 'cubierto' }];
  const c = armarChecklist({
    historia: { valoracion: 'ok', laboratorios: 'ok' }, procedimientos: procs, ordenAdjunta: true, eps: 'Sura',
  });
  assert.equal(c.orden.estado, 'ok');
  assert.equal(c.imagenes.estado, 'no-requerido');
  const ev = evaluarSolicitud({ checklist: c });
  assert.deepEqual([ev.completos, ev.total, ev.estado], [3, 4, 'pendientes']);
  const sin = armarChecklist({ procedimientos: [{ ...procs[0], requiereImagenes: true }], ordenAdjunta: false, eps: 'Sura' });
  assert.equal(sin.orden.estado, 'pendiente');
  assert.equal(sin.imagenes.obligatorio, true);
});

test('esAmbulatorio', () => {
  assert.equal(esAmbulatorio({ origen: 'internacion' }), false);
  assert.equal(esAmbulatorio({ origen: 'externa' }), true);
  assert.equal(esAmbulatorio({ origen: 'consulta-externa' }), true);
});

test('solicitud -> datos del wizard: precarga y vínculo', () => {
  const [s] = crearSolicitudesMock(new Date(2026, 9, 6));
  const datos = datosWizardDesdeSolicitud(s);
  assert.equal(datos.fechaInicio, `${s.fechaTentativa}T07:00`);
  assert.equal(datos.idAseguradora, 'Sura');
  assert.equal(datos.procedimientos.length, 1);
  assert.match(datos.procedimientos[0].idCirugia, / - Colecistectomía laparoscópica$/);
  assert.equal(datos.procedimientos[0].idCirujano, 'Dr. Andrés Villamizar');
  assert.equal(datos.noAutorizacion, '[N° autorización]');
  assert.deepEqual(
    [datos.solicitud.id, datos.solicitud.origen, datos.solicitud.ambulatorio],
    ['SC-1041', 'consulta-externa', true],
  );
  const paciente = pacienteDeSolicitud(s, new Date(2026, 9, 6));
  assert.equal(paciente.fechaNacimiento, '1974-01-01');
});

test('duración estimada se redondea hacia arriba al catálogo del wizard', () => {
  const base = { procedimiento: 'X', cups: 'c', especialidad: 'e' };
  assert.equal(duracionEstimadaMin({ ...base, procedimientos: [{ nombre: 'a', tiempo: 100 }] }), 120);
  assert.equal(duracionEstimadaMin({ ...base, procedimientos: [{ nombre: 'a', tiempo: 150 }, { nombre: 'b', tiempo: 60 }] }), 240);
  assert.equal(duracionEstimadaMin({ ...base, procedimientos: [{ nombre: 'a', tiempo: 900 }] }), 240);
});
