'use client';

import './RestablecerConfigModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuRotateCcw } from 'react-icons/lu';

// Encargo, sección 18: acción sensible — nunca ejecutable de un solo clic
// desde "Acciones rápidas" (ver GestionCamasConfiguracion.jsx), siempre pasa
// por esta confirmación con copy verbatim del requerimiento.
export default function RestablecerConfigModal({ onClose, onConfirm }) {
  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbc-rst-title">
        <ModalHeader icon={LuRotateCcw} tone="danger" title="¿Restablecer configuración?" titleId="cbc-rst-title" onClose={onClose} />
        <div className="modal-body">
          <p className="cbc-rst-texto">
            Los valores configurables seleccionados volverán a su configuración predeterminada.
            Los cambios quedarán registrados en auditoría.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>Restablecer configuración</button>
        </div>
      </div>
    </div>
  );
}
