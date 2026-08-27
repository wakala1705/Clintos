'use client';

import { useState } from 'react';
import './DesactivarCamaModal.css';
import Button from '@/Components/Button/Button';
import { LuPowerOff } from 'react-icons/lu';

// "Activar/desactivar cama" (encargo #30) — diálogo de confirmación
// centrado sin fila de header, mismo tipo de elemento que .nc-discard-modal
// (NuevaCitaFlow.jsx, ver AGENTS.md "Modales": "fuera de este componente...
// diálogos de confirmación centrados sin fila de header"), no un
// ModalHeader — acá con un campo de formulario (Motivo) sumado al patrón,
// obligatorio antes de poder confirmar (mismo required-pill que
// CambiarEstadoModal.jsx). Nunca elimina la cama: onConfirm solo pasa el
// motivo, GestionCamas.jsx decide qué mutar (estado → 'inactiva').
export default function DesactivarCamaModal({ cama, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');
  const puedeConfirmar = motivo.trim() !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onConfirm(cama.id, motivo.trim());
  }

  return (
    <div className="modal-overlay open" role="presentation" onClick={onClose}>
      <form
        className="cb-desactivar-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cb-desactivar-title"
        aria-describedby="cb-desactivar-desc"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="cb-desactivar-icon"><LuPowerOff className="icon" aria-hidden="true" /></div>
        <h3 id="cb-desactivar-title">{`¿Desactivar la cama ${cama.numero}?`}</h3>
        <p id="cb-desactivar-desc">La cama tiene historial de uso. No se elimina — queda marcada como inactiva y puede reactivarse más adelante.</p>

        <div className="form-field cb-desactivar-motivo">
          <div className="field-label-row">
            <label htmlFor="cb-desactivar-motivo-input">Motivo</label>
            <span className="required-pill">Requerido</span>
          </div>
          <textarea
            id="cb-desactivar-motivo-input"
            rows="2"
            placeholder="Describe brevemente el motivo de la desactivación..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            autoFocus
          />
        </div>

        <div className="cb-desactivar-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" type="submit" disabled={!puedeConfirmar}>Desactivar</Button>
        </div>
      </form>
    </div>
  );
}
