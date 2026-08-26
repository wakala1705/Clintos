'use client';

import { useState } from 'react';
import './FinalizarMantenimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuCircleCheck } from 'react-icons/lu';

// Observación opcional al finalizar (no está en el encargo, pero da lugar a
// dejar una nota sin necesitar "Registrar observación" después) — mismo
// criterio de campo opcional que IgnorarInconsistenciaModal.jsx.
export default function FinalizarMantenimientoModal({ mantenimiento, onClose, onConfirm }) {
  const [observacion, setObservacion] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(mantenimiento.id, observacion.trim() || undefined);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-finalizar-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuCircleCheck}
            tone="primary"
            title="Finalizar mantenimiento"
            titleId="cbm-finalizar-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <p className="cbm-modal-msg">{`¿Deseas finalizar el mantenimiento de la cama ${mantenimiento.cama}?`}</p>
            <div className="form-field">
              <label htmlFor="cbm-finalizar-obs">Observación (opcional)</label>
              <textarea
                id="cbm-finalizar-obs"
                rows="2"
                placeholder="Notas sobre el trabajo realizado..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              <LuCircleCheck className="icon" aria-hidden="true" />
              Finalizar mantenimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
