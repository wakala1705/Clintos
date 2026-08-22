'use client';

import { useState } from 'react';
import './IgnorarInconsistenciaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuEyeOff } from 'react-icons/lu';

// Encargo, sección 7: "ignorar" registra usuario/fecha y NO elimina la
// inconsistencia (pasa a estado Ignorada, sigue en el historial — ver
// handleConfirmIgnorar en GestionCamasIntegridad.jsx). Motivo obligatorio
// solo para impacto Crítico (stand-in local de regla de negocio, mismo
// criterio que REQUIERE_MOTIVO en mockCamasAdminData.js): ignorar algo
// crítico sin justificar por qué es el caso que más debería explicarse.
export default function IgnorarInconsistenciaModal({ inconsistencia, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');
  if (!inconsistencia) return null;

  const motivoRequerido = inconsistencia.impacto === 'critico';
  const puedeConfirmar = !motivoRequerido || motivo.trim() !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onConfirm(inconsistencia.id, motivo.trim() || undefined);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbi-ignorar-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuEyeOff}
            tone="neutral"
            title="Ignorar inconsistencia"
            titleId="cbi-ignorar-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <p className="cbi-ignorar-texto">
              ¿Deseas ignorar &quot;{inconsistencia.titulo}&quot;? Quedará registrada como
              <b> Ignorada</b> en el historial, pero seguirá visible para consulta.
            </p>

            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="cbi-ignorar-motivo">Motivo</label>
                {motivoRequerido && <span className="required-pill">Requerido</span>}
              </div>
              <textarea
                id="cbi-ignorar-motivo"
                rows="2"
                placeholder="Describe brevemente por qué se ignora..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!puedeConfirmar}>Ignorar inconsistencia</button>
          </div>
        </form>
      </div>
    </div>
  );
}
