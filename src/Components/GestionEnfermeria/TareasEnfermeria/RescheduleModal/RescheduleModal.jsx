'use client';

import { useState } from 'react';
import './RescheduleModal.css';
import { LuCalendarClock, LuX } from 'react-icons/lu';

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
          <div className="modal-header">
            <div className="modal-header-titles">
              <div className="suspend-header-icon icon-primary">
                <LuCalendarClock className="icon" aria-hidden="true" />
              </div>
              <div>
                <h3 id="reschedule-title">Reprogramar tarea</h3>
                <div className="modal-header-sub">{tarea.nombre}</div>
              </div>
            </div>
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
              <LuX className="icon" aria-hidden="true" />
            </button>
          </div>
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
