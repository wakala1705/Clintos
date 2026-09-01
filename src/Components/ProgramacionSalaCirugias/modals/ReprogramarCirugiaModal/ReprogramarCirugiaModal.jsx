'use client';

import { useState } from 'react';
import './ReprogramarCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { fechaLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuCalendarClock } from 'react-icons/lu';

export default function ReprogramarCirugiaModal({ cirugia, onClose, onSubmit }) {
  const [fecha, setFecha] = useState(cirugia.fecha);
  const [horaInicio, setHoraInicio] = useState(cirugia.horaInicio);
  const [horaFin, setHoraFin] = useState(cirugia.horaFin);
  const [motivo, setMotivo] = useState('');

  const puedeEnviar = motivo.trim() !== '' && fecha !== '' && horaInicio !== '' && horaFin !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeEnviar) return;
    onSubmit({
      fecha, horaInicio, horaFin, motivo: motivo.trim(),
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card rcm-modal-card" role="dialog" aria-modal="true" aria-labelledby="rcm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCalendarClock}
            tone="primary"
            title="Reprogramar cirugía"
            titleId="rcm-title"
            subtitle={cirugia.paciente.nombre}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="rcm-grid">
              <div className="form-field">
                <label>Fecha actual</label>
                <div className="tf-readonly-value">{fechaLabel(cirugia.fecha)}</div>
              </div>
              <div className="form-field">
                <label>Hora actual</label>
                <div className="tf-readonly-value">{cirugia.horaInicio} – {cirugia.horaFin}</div>
              </div>
              <div className="form-field">
                <label htmlFor="rcm-fecha">Nueva fecha</label>
                <input id="rcm-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-hora-inicio">Nueva hora inicio</label>
                <input id="rcm-hora-inicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-hora-fin">Nueva hora fin</label>
                <input id="rcm-hora-fin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="rcm-motivo">Motivo</label>
              <textarea id="rcm-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={!puedeEnviar}>Reprogramar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
