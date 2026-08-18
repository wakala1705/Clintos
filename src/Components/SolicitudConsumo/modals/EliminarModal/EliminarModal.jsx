'use client';

import { useEffect } from 'react';
import './EliminarModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuTrash2 } from 'react-icons/lu';

// Confirma la eliminación/cancelación de una reposición. Se abre tanto desde
// el menú "···" de una fila como desde el botón "Cancelar Pedido" de
// DetalleModal — ver solicitud-consumo.jsx.
export default function EliminarModal({ open, repId, onCancel, onConfirm }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) { if (e.key === 'Escape') onCancel(); }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="eliminar-modal-title">
        <ModalHeader title="Eliminar solicitud" titleId="eliminar-modal-title" onClose={onCancel} />
        <div className="modal-body-plain" style={{ padding: '16px 24px 8px' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-700)' }}>
            ¿Estás seguro de que querés eliminar la solicitud <b>{repId}</b>? Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button type="button" className="btn btn-danger-outline" onClick={onConfirm}>
            <LuTrash2 className="icon" aria-hidden="true" />
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
