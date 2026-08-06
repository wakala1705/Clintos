'use client';

import { useEffect } from 'react';
import './DetalleCitaModal.css';
import { DOCTORS, STATE_LABEL, TIPO_LABEL } from '@/hooks/ProgramarCita/agendaMockData';
import { LuX } from 'react-icons/lu';

// `appointment` es la única fuente de verdad de si el modal está abierto: al
// hacer click en una tarjeta de ScheduleGrid, ProgramarCita.jsx la guarda en
// estado y se la pasa aquí; onClose la vuelve a poner en null. Las acciones
// del footer (Confirmar/Reprogramar/No asistió/Cancelar) todavía no mutan la
// cita — solo cierran el modal (ver plan "Rediseño de /programar-cita": esa
// mutación de estado real queda para una iteración aparte).
export default function DetalleCitaModal({ appointment, onClose }) {
  useEffect(() => {
    if (!appointment) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [appointment, onClose]);

  if (!appointment) return null;
  const doctor = DOCTORS.find((d) => d.id === appointment.doctorId);
  const estadoClass = appointment.estado.replace('_', '-');

  return (
    <div className="pc-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pc-modal">
        <div className="pc-modal-header">
          <h3>Detalle de la cita</h3>
          <button type="button" className="pc-close-x" aria-label="Cerrar" onClick={onClose}><LuX className="icon" /></button>
        </div>
        <div className="pc-modal-body">
          <div className="pc-detail-top">
            <div>
              <div className="pc-detail-patient">{appointment.patient}</div>
              <div className="pc-detail-doc">{appointment.doc}</div>
            </div>
            <span className={`pc-estado-badge ${estadoClass}`}>{STATE_LABEL[appointment.estado]}</span>
          </div>

          <div className="pc-detail-rows">
            <div className="pc-detail-row"><span className="k">Médico</span><span className="v">{doctor?.nombre}</span></div>
            <div className="pc-detail-row"><span className="k">Consultorio</span><span className="v">{doctor?.consultorio}</span></div>
            <div className="pc-detail-row"><span className="k">Horario</span><span className="v">{appointment.start} · {appointment.duration * 30} min</span></div>
            <div className="pc-detail-row"><span className="k">Tipo de consulta</span><span className="v">{TIPO_LABEL[appointment.tipo]}</span></div>
            <div className="pc-detail-row"><span className="k">EPS</span><span className="v">{appointment.eps}</span></div>
            <div className="pc-detail-row last"><span className="k">Motivo</span><span className="v">{appointment.motivo}</span></div>
          </div>
        </div>
        <div className="pc-modal-footer pc-detail-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>Confirmar</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Reprogramar</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>No asistió</button>
          <button type="button" className="btn btn-danger-outline" onClick={onClose}>Cancelar cita</button>
        </div>
      </div>
    </div>
  );
}
