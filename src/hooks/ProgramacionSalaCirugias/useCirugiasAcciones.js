'use client';

import { useRef, useState } from 'react';
import {
  actualizarEstadoCirugia, cancelarCirugia, cancelarSolicitudInsumos, reprogramarCirugia,
  resumenCanasta, solicitarInsumosFarmacia,
} from './mockCirugiaData';

// Acciones sobre una cirugía puntual (reprogramar, cancelar, marcar realizada/
// incumplida, insumos) + el `modal` que las confirma y el toast de
// resultado. Compartido por la agenda (ProgramacionSalaCirugias.jsx) y el
// tablero del día (TableroDia.jsx) para que ambas pantallas apliquen
// exactamente las mismas reglas y mensajes. `applyUpdated(cirugia)` es cómo
// cada pantalla refleja el registro mutado en su propia lista.
export default function useCirugiasAcciones({ applyUpdated }) {
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  function handleSubmitReprogramar(datos) {
    applyUpdated(reprogramarCirugia(modal?.cirugia?.id, datos));
    setModal(null);
    showToast('Cirugía reprogramada correctamente.');
  }
  function handleSubmitCancelar(motivo) {
    applyUpdated(cancelarCirugia(modal?.cirugia?.id, motivo));
    setModal(null);
    showToast('Cirugía cancelada correctamente.');
  }

  // Reciben `cirugia` como parámetro (no cierran sobre la seleccionada): los
  // usa tanto el detalle como el menú "⋯" de la tarjeta, que actúa sobre su
  // propia cirugía esté o no seleccionada.
  function handleReprogramarCirugia(cirugia) {
    setModal({ type: 'reprogramar', cirugia });
  }
  function handleCancelarCirugia(cirugia) {
    setModal({ type: 'cancelar', cirugia });
  }
  function handleMarcarRealizada(cirugia) {
    applyUpdated(actualizarEstadoCirugia(cirugia.id, 'realizada'));
    // Solo advierte (no bloquea): con saldo pendiente en farmacia la solicitud sigue abierta.
    showToast(resumenCanasta(cirugia).estado === 'despacho-parcial'
      ? 'Cirugía marcada como realizada. Su solicitud de insumos sigue abierta: farmacia tiene un saldo pendiente.'
      : 'Cirugía marcada como realizada.');
  }
  function handleMarcarIncumplida(cirugia) {
    applyUpdated(actualizarEstadoCirugia(cirugia.id, 'incumplida'));
    showToast('Cirugía marcada como incumplida.');
  }
  function handlePedirInsumos(cirugia) {
    applyUpdated(solicitarInsumosFarmacia(cirugia.id));
    showToast('Insumos solicitados a farmacia.');
  }
  function handleCancelarSolicitud(cirugia, { causal, observacion }) {
    applyUpdated(cancelarSolicitudInsumos(cirugia.id, { causal, observacion }));
    showToast('Solicitud de insumos cancelada.');
  }

  return {
    modal,
    setModal,
    toast,
    showToast,
    handleSubmitReprogramar,
    handleSubmitCancelar,
    handleReprogramarCirugia,
    handleCancelarCirugia,
    handleMarcarRealizada,
    handleMarcarIncumplida,
    handlePedirInsumos,
    handleCancelarSolicitud,
  };
}
