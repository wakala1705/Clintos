'use client';

import { useState } from 'react';
import './CancelarMantenimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuBan } from 'react-icons/lu';

// tone="danger" + btn-danger (mismo patrón que RestablecerConfigModal.jsx) —
// acción destructiva sobre un mantenimiento programado, nunca ejecutable sin
// pasar por esta confirmación.
export default function CancelarMantenimientoModal({ mantenimiento, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(mantenimiento.id, motivo.trim() || undefined);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-cancelar-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuBan}
            tone="danger"
            title="Cancelar mantenimiento"
            titleId="cbm-cancelar-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <p className="cbm-cancelar-texto">
              {`¿Deseas cancelar el mantenimiento programado para la cama ${mantenimiento.cama}? Esta acción quedará registrada en el historial.`}
            </p>
            <div className="form-field">
              <label htmlFor="cbm-cancelar-motivo">Motivo (opcional)</label>
              <textarea
                id="cbm-cancelar-motivo"
                rows="2"
                placeholder="Describe brevemente por qué se cancela..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Volver</Button>
            <Button type="submit" variant="danger">Cancelar mantenimiento</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
