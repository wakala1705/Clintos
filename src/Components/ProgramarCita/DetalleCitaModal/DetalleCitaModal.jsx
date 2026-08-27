'use client';

import { useEffect, useState } from 'react';
import './DetalleCitaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import {
  DOCTORS, SERVICIO_BY_TIPO, SLOT_MINUTES, STATE_LABEL, VALOR_BY_TIPO, fmtCOP,
} from '@/hooks/ProgramarCita/agendaMockData';
import {
  LuCheck, LuReceipt, LuCalendarClock, LuUserX, LuCalendarX, LuChevronDown, LuTriangleAlert,
} from 'react-icons/lu';
import Button from '@/Components/Button/Button';

const SIN_DATO = '—';

// `appointment` es la única fuente de verdad de si el modal está abierto: al
// hacer click en una tarjeta de ScheduleGrid, ProgramarCita.jsx la guarda en
// estado y se la pasa aquí; onClose la vuelve a poner en null. "Confirmar" es
// la única acción del footer que de verdad muta la cita (Agendada →
// Confirmada, ver onConfirmar/handleConfirmarCita en ProgramarCita.jsx) — el
// resto (Facturar/Reprogramar/No asistió/Cancelar) sigue siendo solo
// feedback (toast, ver plan "Rediseño de /programar-cita": esa mutación
// queda para una iteración aparte), pero YA no cierra el modal en silencio
// como antes (auditoría heurística #1: un clic sin ningún indicio de que
// pasó algo es indistinguible de un botón roto). "Cancelar cita" además pide
// confirmación (heurística #3/#5): es la única acción irreversible del
// grupo, y antes era la única del wizard completo sin ese resguardo — mismo
// lenguaje visual que "¿Descartar esta cita?" en NuevaCitaFlow.jsx, adaptado
// en tono "danger" acá por ser la variante realmente destructiva (esa era
// solo "perder progreso sin guardar").
export default function DetalleCitaModal({ appointment, onClose, onConfirmar }) {
  if (!appointment) return null;
  // key={appointment.id}: al pasar de una cita a otra (sin cerrar el modal
  // de por medio, ver ScheduleGrid.jsx onSelectAppointment), este remount
  // resetea confirmandoCancelar/seccionAbierta con la propia identidad de
  // React en vez de un useEffect + setState — evita el round-trip de
  // renders que causaría sincronizar ese reset manualmente.
  return <DetalleCitaModalContent key={appointment.id} appointment={appointment} onClose={onClose} onConfirmar={onConfirmar} />;
}

function DetalleCitaModalContent({ appointment, onClose, onConfirmar }) {
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  // Contrato/facturación y Solicitud/seguimiento arrancan expandidas (todo
  // el detalle visible de una) — el toggle sigue disponible por si el
  // usuario prefiere colapsarlas para una lectura más rápida de "Datos de la
  // cita" (ver auditoría heurística #8).
  const [seccionAbierta, setSeccionAbierta] = useState({ contrato: true, seguimiento: true });

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'Escape') return;
      if (confirmandoCancelar) setConfirmandoCancelar(false);
      else onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirmandoCancelar, onClose]);

  const doctor = DOCTORS.find((d) => d.id === appointment.doctorId);
  const estadoClass = appointment.estado.replace('_', '-');
  // Las citas agendadas por el wizard traen su propio `servicio` (el/los
  // procedimiento(s) elegidos en el paso "Servicios") — el resto (citas de
  // ejemplo del panel) cae al servicio por defecto según `tipo`, ver
  // SERVICIO_BY_TIPO.
  const servicioLabel = appointment.servicio || SERVICIO_BY_TIPO[appointment.tipo]?.nombre || SIN_DATO;

  function toggleSeccion(key) {
    setSeccionAbierta((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleAccion(mensaje) {
    window.ncToast?.(mensaje);
    onClose();
  }

  function handleConfirmar() {
    onConfirmar?.(appointment.id);
    window.ncToast?.('Cita confirmada.');
    onClose();
  }

  function handleConfirmarCancelacion() {
    window.ncToast?.(`Cita de ${appointment.patient} cancelada.`);
    onClose();
  }

  return (
    <div className="pc-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`pc-modal ${confirmandoCancelar ? 'pc-modal-confirm' : 'pc-modal-lg'}`}>
        {confirmandoCancelar ? (
          <div className="pc-cancel-confirm">
            <div className="pc-cancel-confirm-icon"><LuTriangleAlert className="icon" /></div>
            <h3>¿Cancelar esta cita?</h3>
            <p>
              Se cancelará la cita de <b>{appointment.patient}</b> del {appointment.start} con {doctor?.nombre}.
              Esta acción no se puede deshacer.
            </p>
            <div className="pc-cancel-confirm-actions">
              <Button variant="secondary" onClick={() => setConfirmandoCancelar(false)}>Volver al detalle</Button>
              <Button variant="danger-outline" icon={LuCalendarX} onClick={handleConfirmarCancelacion}>
                Sí, cancelar cita
              </Button>
            </div>
          </div>
        ) : (
          <>
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
                  <div className="pc-detail-field"><span className="k">Horario</span><span className="v">{appointment.start} · {appointment.duration * (doctor?.slotMinutes || SLOT_MINUTES)} min</span></div>
                  <div className="pc-detail-field"><span className="k">EPS</span><span className="v">{appointment.eps}</span></div>
                  <div className="pc-detail-field full"><span className="k">Servicio</span><span className="v">{servicioLabel}</span></div>
                </div>
              </div>

              <div className="pc-detail-section">
                <button
                  type="button"
                  className="pc-detail-section-toggle"
                  aria-expanded={seccionAbierta.contrato}
                  onClick={() => toggleSeccion('contrato')}
                >
                  <span className="pc-detail-section-title">Contrato y facturación</span>
                  <LuChevronDown className={`icon chev${seccionAbierta.contrato ? ' open' : ''}`} aria-hidden="true" />
                </button>
                {seccionAbierta.contrato && (
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
                )}
              </div>

              <div className="pc-detail-section">
                <button
                  type="button"
                  className="pc-detail-section-toggle"
                  aria-expanded={seccionAbierta.seguimiento}
                  onClick={() => toggleSeccion('seguimiento')}
                >
                  <span className="pc-detail-section-title">Solicitud y seguimiento</span>
                  <LuChevronDown className={`icon chev${seccionAbierta.seguimiento ? ' open' : ''}`} aria-hidden="true" />
                </button>
                {seccionAbierta.seguimiento && (
                  <div className="pc-detail-grid">
                    <div className="pc-detail-field"><span className="k">Teléfono aviso</span><span className="v">{appointment.telefonoAviso}</span></div>
                    <div className="pc-detail-field"><span className="k">Fecha solicitud</span><span className="v">{appointment.fechaSolicitud}</span></div>
                    <div className="pc-detail-field"><span className="k">Fecha atención</span><span className="v">{SIN_DATO}</span></div>
                    <div className="pc-detail-field"><span className="k">Usuario</span><span className="v">CAMILO</span></div>
                    <div className="pc-detail-field"><span className="k">Consecutivo</span><span className="v">{appointment.consecutivo}</span></div>
                  </div>
                )}
              </div>
            </div>
            <div className="pc-modal-footer pc-detail-actions">
              <Button icon={LuCheck} onClick={handleConfirmar}>Confirmar</Button>
              <Button variant="secondary" icon={LuReceipt} onClick={() => handleAccion('Facturación en desarrollo.')}>Facturar</Button>
              <Button variant="secondary" icon={LuCalendarClock} onClick={() => handleAccion('Reprogramación en desarrollo.')}>Reprogramar</Button>
              <Button variant="secondary" icon={LuUserX} onClick={() => handleAccion(`${appointment.patient} marcado como No asistió.`)}>No asistió</Button>
              <Button variant="danger-outline" icon={LuCalendarX} onClick={() => setConfirmandoCancelar(true)}>Cancelar cita</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
