'use client';

import { useEffect } from 'react';
import './DetalleCitaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import {
  DOCTORS, SERVICIO_BY_TIPO, STATE_LABEL, VALOR_BY_TIPO, fmtCOP,
} from '@/hooks/ProgramarCita/agendaMockData';
import {
  LuCheck, LuReceipt, LuCalendarClock, LuUserX, LuCalendarX,
} from 'react-icons/lu';

const SIN_DATO = '—';

// `appointment` es la única fuente de verdad de si el modal está abierto: al
// hacer click en una tarjeta de ScheduleGrid, ProgramarCita.jsx la guarda en
// estado y se la pasa aquí; onClose la vuelve a poner en null. Las acciones
// del footer (Confirmar/Facturar/Reprogramar/No asistió/Cancelar) todavía no mutan la
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
  // Las citas agendadas por el wizard traen su propio `servicio` (el/los
  // procedimiento(s) elegidos en el paso "Servicios") — el resto (citas de
  // ejemplo del panel) cae al servicio por defecto según `tipo`, ver
  // SERVICIO_BY_TIPO.
  const servicioLabel = appointment.servicio || SERVICIO_BY_TIPO[appointment.tipo]?.nombre || SIN_DATO;

  return (
    <div className="pc-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pc-modal pc-modal-lg">
        <ModalHeader title="Detalle de la cita" onClose={onClose} />
        <div className="pc-modal-body">
          <div className="pc-detail-top">
            <div>
              <div className="pc-detail-patient">{appointment.patient}</div>
              <div className="pc-detail-doc">{appointment.doc}</div>
            </div>
            <span className={`pc-estado-badge ${estadoClass}`}>{STATE_LABEL[appointment.estado]}</span>
          </div>

          <div className="pc-detail-section">
            <div className="pc-detail-section-title">Datos de la cita</div>
            <div className="pc-detail-grid">
              <div className="pc-detail-field"><span className="k">Médico</span><span className="v">{doctor?.nombre}</span></div>
              <div className="pc-detail-field"><span className="k">Consultorio</span><span className="v">{doctor?.consultorio}</span></div>
              <div className="pc-detail-field"><span className="k">Horario</span><span className="v">{appointment.start} · {appointment.duration * 20} min</span></div>
              <div className="pc-detail-field"><span className="k">EPS</span><span className="v">{appointment.eps}</span></div>
              <div className="pc-detail-field full"><span className="k">Servicio</span><span className="v">{servicioLabel}</span></div>
            </div>
          </div>

          <div className="pc-detail-section">
            <div className="pc-detail-section-title">Contrato y facturación</div>
            <div className="pc-detail-grid">
              <div className="pc-detail-field"><span className="k">Tipo contrato</span><span className="v">Evento</span></div>
              <div className="pc-detail-field"><span className="k">Tipo cita</span><span className="v">Cita</span></div>
              <div className="pc-detail-field"><span className="k">Valor</span><span className="v">{fmtCOP(VALOR_BY_TIPO[appointment.tipo])}</span></div>
              <div className="pc-detail-field"><span className="k">Valor moderadora</span><span className="v">{fmtCOP(0)}</span></div>
              <div className="pc-detail-field"><span className="k">Valor pago compartido</span><span className="v">{fmtCOP(0)}</span></div>
              <div className="pc-detail-field"><span className="k">Factura mod pc</span><span className="v">{SIN_DATO}</span></div>
              <div className="pc-detail-field"><span className="k">Facturada</span><span className="v">No</span></div>
              <div className="pc-detail-field"><span className="k">Nro factura cita</span><span className="v">{SIN_DATO}</span></div>
            </div>
          </div>

          <div className="pc-detail-section">
            <div className="pc-detail-section-title">Solicitud y seguimiento</div>
            <div className="pc-detail-grid">
              <div className="pc-detail-field"><span className="k">Teléfono aviso</span><span className="v">{appointment.telefonoAviso}</span></div>
              <div className="pc-detail-field"><span className="k">Fecha solicitud</span><span className="v">{appointment.fechaSolicitud}</span></div>
              <div className="pc-detail-field"><span className="k">Fecha atención</span><span className="v">{SIN_DATO}</span></div>
              <div className="pc-detail-field"><span className="k">Usuario</span><span className="v">CAMILO</span></div>
              <div className="pc-detail-field"><span className="k">Consecutivo</span><span className="v">{appointment.consecutivo}</span></div>
            </div>
          </div>
        </div>
        <div className="pc-modal-footer pc-detail-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}><LuCheck className="icon" />Confirmar</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}><LuReceipt className="icon" />Facturar</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}><LuCalendarClock className="icon" />Reprogramar</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}><LuUserX className="icon" />No asistió</button>
          <button type="button" className="btn btn-danger-outline" onClick={onClose}><LuCalendarX className="icon" />Cancelar cita</button>
        </div>
      </div>
    </div>
  );
}
