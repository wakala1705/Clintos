'use client';

import { useState } from 'react';
import './ReassignModal.css';
import { RESPONSABLES } from '@/hooks/GestionEnfermeria/mockTareasData';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuUserRoundCog } from 'react-icons/lu';

// "Reasignar" — modal mínimo (1 solo campo) reutilizado desde TaskRowMenu y
// el footer de TaskDetailPanel.jsx (mismo `tarea` que ya se está viendo).
// Mismo scaffolding .modal-overlay/.modal-card que el resto de
// GestionEnfermeria, angosto (ver .task-mini-modal-card) porque no necesita
// la grilla de 2 columnas de NewTaskModal.
export default function ReassignModal({ tarea, onClose, onConfirm }) {
  const [responsable, setResponsable] = useState(tarea.responsable ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(tarea.id, responsable || null);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="reassign-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuUserRoundCog}
            tone="primary"
            title="Reasignar tarea"
            titleId="reassign-title"
            subtitle={tarea.nombre}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="reassign-responsable">Nuevo responsable</label>
              <select id="reassign-responsable" value={responsable} onChange={(e) => setResponsable(e.target.value)} autoFocus>
                <option value="">Sin asignar</option>
                {RESPONSABLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
