import { aISO } from './interconsultaData';

// Usuario que firma los eventos generados desde el modal. Mock: cuando haya
// sesión real, sale del usuario logueado (mismo que muestra el Topbar).
const USUARIO_ACTUAL = 'CAMILO GRONDONA';

function conEvento(s, estado, detalle) {
  return {
    ...s,
    traza: [...s.traza, {
      estado, fecha: aISO(new Date()), usuario: USUARIO_ACTUAL, detalle,
    }],
  };
}

// Acciones del modal de Interconsulta como funciones puras: reciben la
// solicitud y devuelven la solicitud actualizada (con su evento nuevo en la
// trazabilidad). Interconsulta.jsx las aplica sobre su lista en estado; con
// backend real, cada una se vuelve una llamada y la lista se refresca.
//   - 'guardar-respuesta': payload { concepto, resultado, observaciones }
//   - 'confirmar-cargo':   pasa a facturada
//   - 'anular':            payload { motivo }
//   - 'reintentar-sms':    payload { telefono }
//   - 'regenerar-hc'
export function aplicarAccion(s, tipo, payload = {}) {
  switch (tipo) {
    case 'guardar-respuesta':
      return conEvento(
        { ...s, estado: 'respondidas', esHoy: true, respuesta: payload },
        'RESPONDIDA',
        `Respuesta clínica registrada (${payload.resultado}).`,
      );
    case 'confirmar-cargo':
      return conEvento({ ...s, estado: 'facturadas', esHoy: true }, 'FACTURADA', 'Cargo confirmado y generado.');
    case 'anular':
      return conEvento({ ...s, estado: 'anuladas', esHoy: false }, 'ANULADA', `Motivo: ${payload.motivo}`);
    case 'reintentar-sms':
      return conEvento(s, 'SMS_REINTENTADO', `SMS INTERC_NOTIF reenviado a +57${payload.telefono}.`);
    case 'regenerar-hc':
      return conEvento(s, 'HC_REGENERADA', `HC HIC regenerada: ${s.hc}.`);
    default:
      return s;
  }
}

// Estados en los que la solicitud ya no admite cambios.
export function estaCerrada(s) {
  return s.estado === 'facturadas' || s.estado === 'anuladas';
}

// "Confirmar + cargo" solo aplica a una solicitud ya respondida.
export function puedeConfirmarCargo(s) {
  return s.estado === 'respondidas' || s.estado === 'sin-cargo';
}
