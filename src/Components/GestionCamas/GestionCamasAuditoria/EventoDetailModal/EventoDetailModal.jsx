'use client';

import { useState } from 'react';
import './EventoDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import TipoEventoBadge from '../TipoEventoBadge/TipoEventoBadge';
import {
  MODULO_LABEL, TIPO_TONO, USUARIO_LABEL, formatFechaHora,
} from '@/hooks/GestionCamas/mockAuditoriaData';
import { LuCheck, LuCopy, LuFileClock, LuMonitor } from 'react-icons/lu';

const TONE_POR_TONO = {
  info: 'primary', success: 'primary', warning: 'warning', danger: 'danger', neutral: 'neutral',
};

// Modal, no drawer/panel lateral (encargo explícito, sección 21: "aunque
// visualmente puede usarse tabla + panel lateral... el detalle debe abrirse
// mediante modal para mantener consistencia con las decisiones
// anteriores") — mismo criterio que CamaDetailModal/InconsistenciaDetailModal.
// Solo lectura: la auditoría es inmutable (encargo sección 18), este modal
// no tiene ninguna acción de editar/eliminar/corregir.
export default function EventoDetailModal({ evento, onClose }) {
  const [copiado, setCopiado] = useState(false);
  if (!evento) return null;

  const usuarioLabel = evento.usuarioLabel ?? USUARIO_LABEL[evento.usuario];
  const tono = TIPO_TONO[evento.tipo];

  function handleCopiarId() {
    navigator.clipboard?.writeText(evento.id);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 1600);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cbau-detail-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbau-detail-title">
        <ModalHeader
          icon={LuFileClock}
          tone={TONE_POR_TONO[tono]}
          title="Detalle del evento"
          subtitle={evento.titulo}
          titleId="cbau-detail-title"
          trailing={<TipoEventoBadge tipo={evento.tipo} />}
          onClose={onClose}
        />
        <div className="modal-body cbau-detail-body">
          <div className="cbau-detail-grid">
            <div className="cbau-detail-field">
              <span className="cbau-detail-label">Fecha / Hora</span>
              <span className="cbau-detail-value">{formatFechaHora(evento.fecha)}</span>
            </div>
            <div className="cbau-detail-field">
              <span className="cbau-detail-label">Usuario</span>
              <span className="cbau-detail-value">{usuarioLabel}</span>
            </div>
            <div className="cbau-detail-field">
              <span className="cbau-detail-label">Módulo</span>
              <span className="cbau-detail-value">{MODULO_LABEL[evento.modulo]}</span>
            </div>
            <div className="cbau-detail-field">
              <span className="cbau-detail-label">Evento</span>
              <span className="cbau-detail-value">{evento.titulo}</span>
            </div>
            <div className="cbau-detail-field cbau-detail-field-wide">
              <span className="cbau-detail-label">Entidad afectada</span>
              <span className="cbau-detail-value">{evento.entidadLabel}</span>
            </div>
            <div className="cbau-detail-field cbau-detail-field-wide">
              <span className="cbau-detail-label">Descripción</span>
              <span className="cbau-detail-value">{evento.descripcion}</span>
            </div>
          </div>

          {evento.valores && (
            <>
              <div className="cbau-detail-divider" />
              <span className="cbau-detail-section-title">Valores</span>
              {evento.valores.length === 1 ? (
                <div className="cbau-valor-simple">
                  <div className="cbau-valor-col">
                    <span className="cbau-detail-label">{evento.valores[0].campo}</span>
                    <span className="cbau-valor-pill cbau-valor-antes">{evento.valores[0].antes}</span>
                  </div>
                  <span className="cbau-valor-arrow">→</span>
                  <div className="cbau-valor-col">
                    <span className="cbau-detail-label">{evento.valores[0].campo}</span>
                    <span className="cbau-valor-pill cbau-valor-despues">{evento.valores[0].despues}</span>
                  </div>
                </div>
              ) : (
                <table className="cbau-valores-table">
                  <thead>
                    <tr><th>Campo</th><th>Antes</th><th></th><th>Después</th></tr>
                  </thead>
                  <tbody>
                    {evento.valores.map((v) => (
                      <tr key={v.campo}>
                        <td className="cell-primary">{v.campo}</td>
                        <td className="cell-muted">{v.antes}</td>
                        <td className="cbau-valores-table-arrow">→</td>
                        <td>{v.despues}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {(evento.ip || evento.dispositivo) && (
            <>
              <div className="cbau-detail-divider" />
              <span className="cbau-detail-section-title">Información adicional</span>
              <div className="cbau-info-adicional">
                <LuMonitor className="icon" aria-hidden="true" />
                <div className="cbau-info-adicional-body">
                  {evento.ip && <span>IP: {evento.ip}</span>}
                  {evento.dispositivo && <span>Dispositivo: {evento.dispositivo}</span>}
                </div>
              </div>
            </>
          )}

          <div className="cbau-detail-divider" />
          <div className="cbau-id-row">
            <div>
              <span className="cbau-detail-label">ID del evento</span>
              <span className="cbau-id-value">{evento.id}</span>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopiarId}>
              {copiado ? <LuCheck className="icon" aria-hidden="true" /> : <LuCopy className="icon" aria-hidden="true" />}
              {copiado ? 'Copiado' : 'Copiar ID'}
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
