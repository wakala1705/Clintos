// Origen de la orden y armado del checklist del asistente "Registrar orden
// externa". Lógica pura; la evaluación de estados vive en gestion.js.

export const ORIGEN_LABEL = {
  'consulta-externa': 'Consulta externa',
  internacion: 'Internación',
};

// Ambulatorio = no está hospitalizado: al programar se crea la admisión con
// los datos de la programación (Internación ya tiene admisión abierta).
export const esAmbulatorio = (solicitud) => solicitud.origen !== 'internacion';

// Una solicitud creada en el asistente trae `procedimientos`; las de ejemplo
// traen un solo `procedimiento`/`cups`.
export function listaProcedimientos(solicitud) {
  return solicitud.procedimientos
    ?? [{ cups: solicitud.cups, nombre: solicitud.procedimiento, especialidad: solicitud.especialidad }];
}

export const LATERALIDAD_LABEL = {
  izq: 'Izq.', der: 'Der.', bilat: 'Bilat.', na: 'N/A',
};

// Checklist que arma el asistente a partir de la historia clínica del
// paciente (`historia`), los procedimientos elegidos y el adjunto de la orden.
// Los pasos 1-3 son siempre obligatorios; Laboratorios siempre se pide;
// Imágenes solo si algún procedimiento lo requiere.
export function armarChecklist({
  historia = {}, procedimientos, ordenAdjunta, eps,
}) {
  const item = (estado, detalle, obligatorio = true) => ({ estado, obligatorio, detalle });
  const estadoHc = (v) => (v === 'ok' ? 'ok' : 'pendiente');
  const pideImagenes = procedimientos.some((p) => p.requiereImagenes);
  const noCubierto = procedimientos.find((p) => p.cobertura === 'no-cubierto');

  let autorizacion = item('pendiente', `Falta solicitar la autorización a ${eps}.`);
  if (historia.autorizacion === 'ok') {
    autorizacion = item('ok', 'Autorización [N° autorización] vigente.');
  } else if (noCubierto) {
    autorizacion = item('pendiente', `${noCubierto.nombre} no está cubierto por el contrato: requiere autorización especial de ${eps}.`);
  }

  return {
    orden: ordenAdjunta
      ? item('ok', 'Orden externa adjunta como soporte.')
      : item('pendiente', 'Falta adjuntar el documento de la orden.'),
    autorizacion,
    valoracion: historia.valoracion === 'ok'
      ? item('ok', 'Valoración preanestésica registrada en la historia clínica.')
      : item('pendiente', 'Sin valoración preanestésica en la historia clínica.'),
    laboratorios: historia.laboratorios === 'ok'
      ? item('ok', 'Laboratorios vigentes en la historia clínica.')
      : item('pendiente', 'No hay laboratorios vigentes en la historia clínica.'),
    imagenes: pideImagenes
      ? item(
        estadoHc(historia.imagenes),
        historia.imagenes === 'ok'
          ? 'Estudio de imágenes disponible en la historia clínica.'
          : 'Falta el estudio de imágenes requerido.',
      )
      : item('no-requerido', 'Los procedimientos elegidos no requieren estudios de imágenes.', false),
  };
}
