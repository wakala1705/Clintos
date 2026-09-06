'use client';

import { useState } from 'react';
import './RescheduleModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuCalendarClock } from 'react-icons/lu';

// "Reprogramar" — mismo patrón mínimo que ReassignModal.jsx (fecha + hora
// nuevas), reutilizado desde TaskRowMenu y el footer de TaskDetailPanel.jsx.
export default function RescheduleModal({ tarea, onClose, onConfirm }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(tarea.id, fecha, hora);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="reschedule-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCalendarClock}
            tone="primary"
            title="Reprogramar tarea"
            titleId="reschedule-title"
            subtitle={tarea.nombre}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="task-reschedule-grid">
              <div className="form-field">
                <label htmlFor="reschedule-fecha">Nueva fecha</label>
                <input id="reschedule-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required autoFocus />
              </div>
              <div className="form-field">
                <label htmlFor="reschedule-hora">Nueva hora</label>
                <input id="reschedule-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Confirmar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
