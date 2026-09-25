'use client';

import { useRef } from 'react';
import { LuCheckCheck, LuTriangleAlert } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import './ConfirmarRealizadasDialog.css';

// Confirmación centrada sin fila de header (patrón .nc-discard-modal, fuera
// de ModalHeader por AGENTS.md "Modales"): solo para "Marcar realizadas" en
// lote -- la acción individual es directa con Deshacer.
export default function ConfirmarRealizadasDialog({
  cantidad, conInsumos, onCancel, onConfirm,
}) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  return (
    <div
      className="modal-overlay open"
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      <div
        ref={cardRef}
        className="modal-card rv-confirm-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rv-confirm-title"
        aria-describedby="rv-confirm-desc"
      >
        <div className="rv-confirm-icon"><LuCheckCheck className="icon" aria-hidden="true" /></div>
        <h3 id="rv-confirm-title" className="rv-confirm-title">
          ¿Marcar {cantidad} programaciones como realizadas?
        </h3>
        <p id="rv-confirm-desc" className="rv-confirm-text">
          Esta acción queda registrada en la trazabilidad de cada una.
        </p>
        {conInsumos > 0 && (
          <p className="tf-warning-note">
            <LuTriangleAlert className="icon" aria-hidden="true" />
            {conInsumos} {conInsumos === 1 ? 'tiene' : 'tienen'} insumos pedidos; se registrarán como consumidos.
          </p>
        )}
        <div className="rv-confirm-actions">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button icon={LuCheckCheck} onClick={onConfirm}>Marcar realizadas</Button>
        </div>
      </div>
    </div>
  );
}
