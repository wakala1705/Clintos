'use client';

import { useState } from 'react';
import {
  LuCircleCheck, LuDoorOpen, LuInfo, LuPlay,
} from 'react-icons/lu';
import './FinalizarCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { ahoraDemo, horaLocal } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Confirma el fin de una cirugía en curso: hora real de fin (editable, no antes
// del inicio real). Al confirmar, la cirugía queda realizada, el fin se registra
// en la hoja de gasto y esta se abre para registrar el consumo. Misma estructura
// visual que IniciarCirugiaModal.
export default function FinalizarCirugiaModal({
  cirugia, salaLabel, onClose, onSubmit,
}) {
  const [hora, setHora] = useState(() => {
    const ahora = horaLocal(ahoraDemo());
    return ahora < cirugia.horaInicioReal ? cirugia.horaInicioReal : ahora;
  });
  const valida = Boolean(hora) && hora >= cirugia.horaInicioReal;

  function handleSubmit(e) {
    e.preventDefault();
    if (valida) onSubmit(hora);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card fcm-modal-card" role="dialog" aria-modal="true" aria-labelledby="fcm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCircleCheck}
            tone="primary"
            title="Finalizar cirugía"
            titleId="fcm-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <section className="fcm-caso" aria-label="Cirugía a finalizar">
              <span className="fcm-paciente">{cirugia.paciente.nombre}</span>
              <span className="fcm-procedimiento">{cirugia.procedimientoPrincipal}</span>
              <div className="fcm-meta">
                <span className="fcm-dato">
                  <LuDoorOpen className="icon" aria-hidden="true" />
                  <span>Sala</span>
                  <b>{salaLabel}</b>
                </span>
                <span className="fcm-dato">
                  <LuPlay className="icon" aria-hidden="true" />
                  <span>Inicio real</span>
                  <b>{cirugia.horaInicioReal}</b>
                </span>
              </div>
            </section>

            <div className="form-field fcm-hora">
              <label htmlFor="fcm-hora">Hora real de fin *</label>
              <input id="fcm-hora" type="time" value={hora} min={cirugia.horaInicioReal} onChange={(e) => setHora(e.target.value)} required />
              {!valida && hora ? <span className="fcm-error" role="alert">No puede ser anterior al inicio real ({cirugia.horaInicioReal}).</span> : null}
            </div>

            <p className="fcm-nota">
              <LuInfo className="icon" aria-hidden="true" />
              Al finalizar se registra el fin en la hoja de gasto y se abre para que registres el consumo.
            </p>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Volver</Button>
            <Button type="submit" icon={LuCircleCheck} disabled={!valida}>Finalizar cirugía</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
