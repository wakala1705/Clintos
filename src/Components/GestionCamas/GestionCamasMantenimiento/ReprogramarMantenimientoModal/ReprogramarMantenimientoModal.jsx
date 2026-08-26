'use client';

import { useState } from 'react';
import './ReprogramarMantenimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { formatFecha, formatHoraCorta } from '@/hooks/GestionCamas/mockMantenimientoData';
import { LuCalendarClock } from 'react-icons/lu';

export default function ReprogramarMantenimientoModal({ mantenimiento, onClose, onConfirm }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!fecha || !hora) {
      setError('La fecha y hora son obligatorias.');
      return;
    }
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const [hh, mm] = hora.split(':').map(Number);
    onConfirm(mantenimiento.id, new Date(anio, mes - 1, dia, hh, mm).getTime());
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-reprogramar-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuCalendarClock}
            tone="primary"
            title="Reprogramar mantenimiento"
            titleId="cbm-reprogramar-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label>Fecha actual</label>
              <div className="tf-readonly-value">
                {`${formatFecha(mantenimiento.fechaProgramada)} · ${formatHoraCorta(mantenimiento.fechaProgramada)}`}
              </div>
            </div>
            <div className="cbm-reprogramar-row">
              <div className="form-field">
                <label htmlFor="cbm-reprogramar-fecha">Nueva fecha<span className="cbm-required-mark">*</span></label>
                <input id="cbm-reprogramar-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="cbm-reprogramar-hora">Hora<span className="cbm-required-mark">*</span></label>
                <input id="cbm-reprogramar-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
            </div>
            {error && <span className="cbm-form-error">{error}</span>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Reprogramar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
