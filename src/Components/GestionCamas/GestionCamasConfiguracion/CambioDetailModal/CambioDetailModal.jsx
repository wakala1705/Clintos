'use client';

import './CambioDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { SEDE_LABEL, formatFechaHora } from '@/hooks/GestionCamas/mockConfiguracionData';
import { LuArrowRight, LuHistory } from 'react-icons/lu';

// "Ver detalle →" de un registro de Cambios recientes (encargo, sección 13)
// — mismo patrón antes/después en píldora que EventoDetailModal
// (Auditoría), acá siempre 1 campo (nunca una tabla multi-campo: cada
// cambio de configuración toca un único valor).
export default function CambioDetailModal({ cambio, onClose }) {
  if (!cambio) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbc-cd-title">
        <ModalHeader
          icon={LuHistory}
          tone="primary"
          title={cambio.configuracion}
          titleId="cbc-cd-title"
          subtitle={`${cambio.accion} · ${formatFechaHora(cambio.fecha)}`}
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="cbc-cd-grid">
            <div className="cbc-cd-field">
              <span className="cbc-cd-label">Usuario</span>
              <span className="cbc-cd-value">{cambio.usuario}</span>
            </div>
            <div className="cbc-cd-field">
              <span className="cbc-cd-label">Sede</span>
              <span className="cbc-cd-value">{SEDE_LABEL[cambio.sede]}</span>
            </div>
          </div>

          {cambio.valorAnterior ? (
            <div className="cbc-cd-field">
              <span className="cbc-cd-label">Cambio</span>
              <div className="cbc-cd-compare">
                <span className="cbc-cd-pill">{cambio.valorAnterior}</span>
                <LuArrowRight className="icon" aria-hidden="true" />
                <span className="cbc-cd-pill after">{cambio.valorNuevo}</span>
              </div>
            </div>
          ) : (
            <div className="cbc-cd-field">
              <span className="cbc-cd-label">Detalle</span>
              <span className="cbc-cd-value">{cambio.valorNuevo}</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
