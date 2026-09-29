'use client';

import { useRef, useState } from 'react';
import { LuCalendarClock, LuCheck } from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { ESTADO_PROGRAMACION_OPTIONS } from '@/hooks/ProgramacionSalaCirugias/mockListadoProgramaciones';
import './CambiarEstadoProgramacionModal.css';

// "Cambiar estado" de ListadoProgramacionesModal (réplica de "Listado de
// Programaciones - Revisión") -- a diferencia de esa ventana, esta sí se
// construye con el estilo/componentes actuales del proyecto en vez de
// replicar la legada (encargo explícito, 2026-09-29), mismo criterio ya
// usado en CancelarSolicitudInsumosModal (otra ventana legada de este mismo
// feature que se reconstruyó con ModalHeader/FormSelect/Validar-Cancelar en
// vez de copiar su <select> nativo).
export default function CambiarEstadoProgramacionModal({ programacion, onClose, onSubmit }) {
  const [estado, setEstado] = useState('programada');
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  const afiliado = [programacion.pNombre, programacion.sNombre, programacion.pApellido, programacion.sApellido]
    .filter(Boolean).join(' ');

  function handleSubmit(e) {
    e.preventDefault();
    if (!estado) return;
    onSubmit(estado);
  }

  return (
    <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div ref={cardRef} className="modal-card cepm-modal-card" role="dialog" aria-modal="true" aria-labelledby="cepm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCalendarClock}
            tone="primary"
            title="Cambiar estado de programación"
            titleId="cepm-title"
            onClose={onClose}
          />
          <div className="modal-body">
            {/* Bloque de contexto de solo lectura en una sola caja (mismo
                criterio que .rcm-info-box en ReprogramarCirugiaModal/
                .apm-patient-info en AgregarProcedimientoModal): texto plano,
                no .form-field/.tf-readonly-value -- no son campos editables,
                no deben verse como 3 inputs sueltos. */}
            <div className="cepm-info-box">
              <div className="cepm-info-item">
                <span className="cepm-info-label">Programación No.</span>
                <span className="cepm-info-value">{programacion.noProgramacion}</span>
              </div>
              <div className="cepm-info-item">
                <span className="cepm-info-label">Fecha</span>
                <span className="cepm-info-value">{programacion.fechaProg}</span>
              </div>
              <div className="cepm-info-item wide">
                <span className="cepm-info-label">Afiliado</span>
                <span className="cepm-info-value">{programacion.idAfiliado} - {afiliado}</span>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="cepm-estado">Estado Programación</label>
              <FormSelect
                id="cepm-estado"
                value={estado}
                onChange={setEstado}
                options={ESTADO_PROGRAMACION_OPTIONS}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" icon={LuCheck} disabled={!estado}>Validar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
