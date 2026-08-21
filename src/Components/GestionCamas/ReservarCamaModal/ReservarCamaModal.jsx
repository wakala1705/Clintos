'use client';

import { useState } from 'react';
import './ReservarCamaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREA_LABEL, PISO_LABEL, PRIORIDADES_RESERVA, SECTOR_LABEL, SEDE_LABEL,
} from '@/hooks/GestionCamas/mockCamasData';
import { LuClock, LuSearch } from 'react-icons/lu';

// "Reservar cama" (encargo) — reemplaza la mutación instantánea que tenía
// antes el CTA "Reservar" de una cama Libre (motivo fijo "Reserva manual",
// sin fechas) por un formulario real. Paciente/Admisión son texto libre con
// ícono de búsqueda (no un picker real: no hay un directorio de
// pacientes/admisiones en este prototipo, mismo recorte de alcance que
// AsignarPacienteModal — "sin flujo de admisión completo"), y por eso son
// opcionales: una reserva sin nombre todavía ("Ingreso programado") ya es un
// caso real que maneja BedCard/BedDetailModal.
export default function ReservarCamaModal({ cama, onClose, onReservar }) {
  const [paciente, setPaciente] = useState('');
  const [admisionId, setAdmisionId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [prioridad, setPrioridad] = useState('normal');
  const [motivo, setMotivo] = useState('');

  const puedeConfirmar = fechaInicio !== '' && fechaVencimiento !== '' && fechaVencimiento >= fechaInicio;

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onReservar(cama.id, {
      paciente: paciente.trim() || undefined,
      admisionId: admisionId.trim() || undefined,
      fechaInicio,
      fechaVencimiento,
      prioridad,
      motivo: motivo.trim() || 'Reserva manual',
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card rc-modal-card" role="dialog" aria-modal="true" aria-labelledby="reservar-cama-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuClock}
            tone="primary"
            title="Reservar cama"
            titleId="reservar-cama-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label>Cama</label>
              <div className="tf-readonly-value">
                {cama.numero} — {SEDE_LABEL[cama.sede]} · {AREA_LABEL[cama.area]} · {PISO_LABEL[cama.piso]} · {SECTOR_LABEL[cama.sector]}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="rc-paciente">Paciente</label>
              <div className="rc-search-field">
                <LuSearch className="icon" aria-hidden="true" />
                <input
                  id="rc-paciente"
                  type="text"
                  placeholder="Buscar paciente..."
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="rc-admision">Admisión</label>
              <div className="rc-search-field">
                <LuSearch className="icon" aria-hidden="true" />
                <input
                  id="rc-admision"
                  type="text"
                  placeholder="Buscar admisión..."
                  value={admisionId}
                  onChange={(e) => setAdmisionId(e.target.value)}
                />
              </div>
            </div>

            <div className="rc-row">
              <div className="form-field">
                <label htmlFor="rc-fecha-inicio">Fecha inicio</label>
                <input
                  id="rc-fecha-inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="rc-fecha-vencimiento">Fecha vencimiento</label>
                <input
                  id="rc-fecha-vencimiento"
                  type="date"
                  min={fechaInicio || undefined}
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="rc-prioridad">Prioridad</label>
              <FormSelect
                id="rc-prioridad"
                value={prioridad}
                onChange={setPrioridad}
                options={PRIORIDADES_RESERVA}
              />
            </div>

            <div className="form-field">
              <label htmlFor="rc-motivo">Motivo</label>
              <input
                id="rc-motivo"
                type="text"
                placeholder="Ej. Ingreso programado, procedimiento..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!puedeConfirmar}>Reservar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
