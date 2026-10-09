'use client';

import { useRef, useState } from 'react';
import { registrarTiempoEnHoja } from './hojaConsumo/hojaConsumo';
import {
  actualizarEstadoCirugia, cancelarCirugia, cancelarSolicitudInsumos, finalizarCirugia, iniciarCirugia, reprogramarCirugia,
  resumenCanasta, solicitarInsumosFarmacia, vincularCanastaCirugia,
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
  // Iniciar: confirma la hora real y, al iniciar, abre la hoja de gasto (flujo
  // del circulante). `hoja` también se abre sola desde la fila de una en curso.
  function handleIniciarCirugia(cirugia) {
    setModal({ type: 'iniciar', cirugia });
  }
  function handleFinalizarCirugia(cirugia) {
    setModal({ type: 'finalizar', cirugia });
  }
  // Finalizar: cierra la cirugía con su hora real de fin, la registra en la hoja
  // ("Fin cirugía") y abre la hoja: con la cirugía realizada ya se puede registrar
  // el consumo.
  function cerrarCirugiaEnCurso(cirugia, horaFinReal) {
    const finalizada = finalizarCirugia(cirugia.id, { horaFinReal });
    applyUpdated(finalizada);
    registrarTiempoEnHoja(finalizada, 'termOperac', horaFinReal);
    return finalizada;
  }
  function handleSubmitFinalizar(horaFinReal) {
    try {
      const finalizada = cerrarCirugiaEnCurso(modal.cirugia, horaFinReal);
      setModal({ type: 'hoja', cirugia: finalizada });
      showToast('Cirugía finalizada. Registra el consumo en la hoja de gasto.');
    } catch (e) {
      setModal(null);
      showToast(e.message);
    }
  }
  // Finalizar desde la propia hoja de gasto: la hoja sigue abierta (no se cambia
  // `modal`), así el circulante registra el consumo sin pasar por el panel.
  // Devuelve la cirugía finalizada, o null si falló (el error va al toast).
  function handleFinalizarDesdeHoja(cirugia, horaFinReal) {
    try {
      const finalizada = cerrarCirugiaEnCurso(cirugia, horaFinReal);
      showToast('Cirugía finalizada. Ya puedes registrar el consumo.');
      return finalizada;
    } catch (e) {
      showToast(e.message);
      return null;
    }
  }
  function handleAbrirHoja(cirugia) {
    setModal({ type: 'hoja', cirugia });
  }
  function handleSubmitIniciar(horaInicioReal, horaInicioAnest) {
    try {
      const iniciada = iniciarCirugia(modal?.cirugia?.id, { horaInicioReal, horaInicioAnest });
      applyUpdated(iniciada);
      // La hoja de consumo registra los tiempos: "Inicio anestesia" e "Inicio cirugía".
      if (horaInicioAnest) registrarTiempoEnHoja(iniciada, 'inicioAnest', horaInicioAnest);
      registrarTiempoEnHoja(iniciada, 'inicioOperac', horaInicioReal);
      setModal({ type: 'hoja', cirugia: iniciada });
      showToast('Cirugía iniciada.');
    } catch (e) {
      setModal(null);
      showToast(e.message);
    }
  }
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
  function handleVincularCanasta(cirugia, canasta) {
    applyUpdated(vincularCanastaCirugia(cirugia.id, canasta));
    showToast('Canasta vinculada a la cirugía.');
  }
  function handleCancelarSolicitud(cirugia, { causal, observacion }) {
    applyUpdated(cancelarSolicitudInsumos(cirugia.id, { causal, observacion }));
    showToast('Solicitud de insumos cancelada.');
  }

  // "Registrar consumo" en la hoja de consumo: ya registró el consumo de la canasta y, si
  // había algo sin usar, generó la devolución a farmacia (`devolucion`, o null).
  function handleConsumoRegistrado(actualizada, devolucion) {
    applyUpdated(actualizada);
    if (!devolucion) {
      showToast('Consumo registrado. No hay insumos por devolver a farmacia.');
      return;
    }
    const unidades = devolucion.items.reduce((t, i) => t + i.cantidad, 0);
    showToast(`Consumo registrado. Devolución N.º ${devolucion.consecutivo} generada: ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'} a farmacia.`);
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
    handleIniciarCirugia,
    handleAbrirHoja,
    handleSubmitIniciar,
    handleFinalizarCirugia,
    handleSubmitFinalizar,
    handleFinalizarDesdeHoja,
    handleMarcarRealizada,
    handleMarcarIncumplida,
    handlePedirInsumos,
    handleVincularCanasta,
    handleCancelarSolicitud,
    handleConsumoRegistrado,
  };
}
