'use client';

import { useState } from 'react';
import './RegistrarObservacionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuMessageSquare } from 'react-icons/lu';

// Mismo patrón de campo requerido + `required-pill` que
// IgnorarInconsistenciaModal.jsx.
export default function RegistrarObservacionModal({ mantenimiento, onClose, onConfirm }) {
  const [observacion, setObservacion] = useState('');
  const puedeConfirmar = observacion.trim() !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onConfirm(mantenimiento.id, observacion.trim());
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-observacion-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuMessageSquare}
            tone="neutral"
            title="Registrar observación"
            titleId="cbm-observacion-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <p className="cbm-observacion-texto">{`Cama ${mantenimiento.cama} — la observación quedará agregada al historial del mantenimiento.`}</p>
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="cbm-observacion-texto">Observación</label>
                <span className="required-pill">Requerido</span>
              </div>
              <textarea
                id="cbm-observacion-texto"
                rows="3"
                placeholder="Describe lo observado durante el mantenimiento..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!puedeConfirmar}>Registrar observación</button>
          </div>
        </form>
      </div>
    </div>
  );
}
