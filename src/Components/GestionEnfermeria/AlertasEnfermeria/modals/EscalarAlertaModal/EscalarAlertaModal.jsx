'use client';

import { useState } from 'react';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { RESPONSABLES_ESCALAMIENTO } from '@/hooks/GestionEnfermeria/mockAlertasData';
import { LuUserRoundCog } from 'react-icons/lu';

// "Escalar alerta" (encargo sección 11): enviar a otro responsable/nivel de
// atención + motivo opcional — mismo patrón mínimo que RescheduleModal.jsx.
// Select nativo reemplazado por FormSelect (AGENTS.md, "Selects de
// formulario": ningún <select> nativo dentro de un .form-field de modal).
export default function EscalarAlertaModal({ alerta, onClose, onConfirm }) {
  const [responsable, setResponsable] = useState('');
  const [motivo, setMotivo] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!responsable) return;
    onConfirm(alerta.id, { responsable, motivo });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="escalar-alerta-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuUserRoundCog}
            tone="primary"
            title="Escalar alerta"
            titleId="escalar-alerta-title"
            subtitle={alerta.titulo}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="escalar-responsable">Enviar a</label>
              <FormSelect
                id="escalar-responsable"
                value={responsable}
                onChange={setResponsable}
                options={RESPONSABLES_ESCALAMIENTO}
                placeholder="Selecciona un responsable o nivel"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="escalar-motivo">Motivo (opcional)</label>
              <textarea
                id="escalar-motivo"
                rows="3"
                placeholder="Ej. Requiere valoración médica inmediata..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!responsable}>Escalar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
