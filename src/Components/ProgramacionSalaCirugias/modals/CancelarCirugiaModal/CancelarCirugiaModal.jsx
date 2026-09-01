'use client';

import { useState } from 'react';
import './CancelarCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuBan } from 'react-icons/lu';

export default function CancelarCirugiaModal({ cirugia, onClose, onSubmit }) {
  const [motivo, setMotivo] = useState('');
  const puedeEnviar = motivo.trim() !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeEnviar) return;
    onSubmit(motivo.trim());
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card ccm-modal-card" role="dialog" aria-modal="true" aria-labelledby="ccm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuBan}
            tone="danger"
            title="Cancelar cirugía"
            titleId="ccm-title"
            subtitle={cirugia.paciente.nombre}
            onClose={onClose}
          />
          <div className="modal-body">
            <p className="ccm-question">¿Deseas cancelar esta cirugía?</p>
            <div className="form-field">
              <label htmlFor="ccm-motivo">Motivo de cancelación *</label>
              <textarea id="ccm-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Volver</Button>
            <Button type="submit" variant="danger" disabled={!puedeEnviar}>Cancelar cirugía</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
