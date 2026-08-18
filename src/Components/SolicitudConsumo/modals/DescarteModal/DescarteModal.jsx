'use client';

import { useEffect } from 'react';
import './DescarteModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuTrash2 } from 'react-icons/lu';

// Confirmación de cierre de ArticulosModal cuando el carrito tiene cambios
// sin guardar. El texto cambia según el modo: crear una solicitud nueva
// pierde todo el carrito; editar una existente solo pierde los cambios de
// esta sesión (la reposición queda como estaba).
export default function DescarteModal({ open, mode, onKeepEditing, onConfirm }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) { if (e.key === 'Escape') onKeepEditing(); }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onKeepEditing]);

  if (!open) return null;

  const isEdit = mode === 'editar';
  const title = isEdit ? '¿Descartar los cambios?' : '¿Descartar esta solicitud?';
  const text = isEdit
    ? 'Los cambios que hiciste en esta edición no se guardarán. La solicitud seguirá tal como estaba.'
    : 'Tienes artículos en el carrito que no se guardarán. Si descartás, la solicitud no quedará registrada.';

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onKeepEditing(); }}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="descarte-modal-title">
        <ModalHeader title={title} titleId="descarte-modal-title" onClose={onKeepEditing} />
        <div className="modal-body-plain" style={{ padding: '16px 24px 8px' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-700)' }}>{text}</p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onKeepEditing}>Seguir editando</button>
          <button type="button" className="btn btn-danger-outline" onClick={onConfirm}>
            <LuTrash2 className="icon" aria-hidden="true" />
            Sí, descartar
          </button>
        </div>
      </div>
    </div>
  );
}
