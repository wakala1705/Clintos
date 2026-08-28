'use client';

import { useState } from 'react';
import './NuevoTurnoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import { ESTADO_TURNO_OPTIONS } from '@/hooks/ConfiguracionTurnos/mockTurnosData';
import { LuCalendarClock } from 'react-icons/lu';

// Crear/editar tipo de turno (encargo sección 2/3) — mismo componente para
// ambos casos vía prop `turno` opcional (mismo criterio que NuevaCamaModal:
// sin `turno` es "crear", con `turno` precarga sus valores y el submit pasa
// su id). Validación básica: nombre/hora inicio/hora fin obligatorios — sin
// reglas de negocio adicionales (no se valida solapamiento entre turnos,
// fuera de alcance de V1).
export default function NuevoTurnoModal({ turno, onClose, onSubmit }) {
  const [nombre, setNombre] = useState(turno?.nombre ?? '');
  const [horaInicio, setHoraInicio] = useState(turno?.horaInicio ?? '');
  const [horaFin, setHoraFin] = useState(turno?.horaFin ?? '');
  const [estado, setEstado] = useState(turno?.estado ?? 'activo');

  const puedeGuardar = nombre.trim() !== '' && horaInicio !== '' && horaFin !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeGuardar) return;
    onSubmit({
      nombre: nombre.trim(), horaInicio, horaFin, estado,
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card ntm-modal-card" role="dialog" aria-modal="true" aria-labelledby="ntm-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuCalendarClock}
            title={turno ? 'Editar turno' : 'Nuevo turno'}
            titleId="ntm-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="ntm-nombre">Nombre del turno</label>
                <span className="required-pill">Requerido</span>
              </div>
              <input
                id="ntm-nombre"
                type="text"
                required
                placeholder="Ej. Mañana"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
              />
            </div>

            <div className="ntm-row">
              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="ntm-hora-inicio">Horario de inicio</label>
                  <span className="required-pill">Requerido</span>
                </div>
                <input
                  id="ntm-hora-inicio"
                  type="time"
                  required
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
              </div>
              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="ntm-hora-fin">Horario de finalización</label>
                  <span className="required-pill">Requerido</span>
                </div>
                <input
                  id="ntm-hora-fin"
                  type="time"
                  required
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="ntm-estado">Estado</label>
              <FormSelect
                id="ntm-estado"
                value={estado}
                onChange={setEstado}
                options={ESTADO_TURNO_OPTIONS}
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={!puedeGuardar}>Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
