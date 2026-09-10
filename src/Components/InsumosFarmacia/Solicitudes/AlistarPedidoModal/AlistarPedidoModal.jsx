'use client';

import { useEffect } from 'react';
import './AlistarPedidoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuConstruction } from 'react-icons/lu';

// Modal grande (mismo patrón .modal-overlay/.modal extragrande que
// MovimientoDetalleModal, ver Solicitudes/shared/shared.css) disparado
// desde "Alistar pedido" (MovimientoRowMenu, solo Sin Confirmar) y desde
// doble clic en cualquier fila de MovimientosGrid -- encargo explícito. Sin
// funcionalidad real todavía (leyenda "en desarrollo", pendiente de
// definir la lógica). `movimiento` null = cerrado, mismo contrato que
// MovimientoDetalleModal.
export default function AlistarPedidoModal({ movimiento, onClose }) {
  useEffect(() => {
    if (!movimiento) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [movimiento, onClose]);

  if (!movimiento) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal mig-alistar-modal" role="dialog" aria-modal="true" aria-labelledby="mig-alistar-title">
        <ModalHeader
          title={`Alistar pedido ${movimiento.consecutivo}`}
          titleId="mig-alistar-title"
          onClose={onClose}
        />

        <div className="modal-body">
          <div className="mig-alistar-empty">
            <LuConstruction className="icon" aria-hidden="true" />
            <h3>Función en desarrollo</h3>
            <p>Estamos trabajando en el alistamiento de pedidos. Muy pronto vas a poder completar este flujo desde acá.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
