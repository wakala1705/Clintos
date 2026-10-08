'use client';

import { useState } from 'react';
import {
  LuClock, LuDoorOpen, LuInfo, LuPlay,
} from 'react-icons/lu';
import './IniciarCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { ahoraDemo, horaLocal } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// La anestesia suele empezar unos minutos antes de la incisión: se propone esa
// hora (editable), nunca antes de las 00:00.
const MIN_ANESTESIA_PREVIA = 15;

function restarMinutos(hora, min) {
  const [h, m] = hora.split(':').map(Number);
  const total = Math.max(0, h * 60 + m - min);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// Confirma el inicio de una cirugía: el caso (paciente, procedimiento, sala y
// hora programada) y los dos tiempos reales que se registran en la hoja de
// gasto -- inicio de anestesia e inicio de cirugía --, editables por si se
// capturan con retraso. Al confirmar, la pantalla abre la hoja de gasto
// quirúrgico (flujo del circulante).
export default function IniciarCirugiaModal({
  cirugia, salaLabel, onClose, onSubmit,
}) {
  const [hora, setHora] = useState(() => horaLocal(ahoraDemo()));
  const [anestesia, setAnestesia] = useState(() => restarMinutos(horaLocal(ahoraDemo()), MIN_ANESTESIA_PREVIA));
  const anestesiaTarde = Boolean(hora) && Boolean(anestesia) && anestesia > hora;
  const valido = Boolean(hora) && Boolean(anestesia) && !anestesiaTarde;

  function handleSubmit(e) {
    e.preventDefault();
    if (valido) onSubmit(hora, anestesia);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card icm-modal-card" role="dialog" aria-modal="true" aria-labelledby="icm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuPlay}
            tone="primary"
            title="Iniciar cirugía"
            titleId="icm-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <section className="icm-caso" aria-label="Cirugía a iniciar">
              <span className="icm-paciente">{cirugia.paciente.nombre}</span>
              <span className="icm-procedimiento">{cirugia.procedimientoPrincipal}</span>
              <div className="icm-meta">
                <span className="icm-dato">
                  <LuDoorOpen className="icon" aria-hidden="true" />
                  <span className="icm-dato-label">Sala</span>
                  <b>{salaLabel}</b>
                </span>
                <span className="icm-dato">
                  <LuClock className="icon" aria-hidden="true" />
                  <span className="icm-dato-label">Programada</span>
                  <b>{cirugia.horaInicio} – {cirugia.horaFin}</b>
                </span>
              </div>
            </section>

            {/* Orden cronológico: primero la anestesia, después la incisión. */}
            <div className="icm-horas">
              <div className="form-field">
                <label htmlFor="icm-anestesia">Inicio de anestesia *</label>
                <input
                  id="icm-anestesia"
                  type="time"
                  value={anestesia}
                  max={hora || undefined}
                  aria-invalid={anestesiaTarde}
                  onChange={(e) => setAnestesia(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="icm-hora">Inicio de cirugía *</label>
                <input id="icm-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
              </div>
            </div>
            {anestesiaTarde ? (
              <p className="icm-error" role="alert">La anestesia no puede iniciar después de la cirugía ({hora}).</p>
            ) : null}

            <p className="icm-nota">
              <LuInfo className="icon" aria-hidden="true" />
              Ambos tiempos quedan en la hoja de gasto quirúrgico, que se abrirá al iniciar para registrar los insumos durante la cirugía.
            </p>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Volver</Button>
            <Button type="submit" icon={LuPlay} disabled={!valido}>Iniciar cirugía</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
