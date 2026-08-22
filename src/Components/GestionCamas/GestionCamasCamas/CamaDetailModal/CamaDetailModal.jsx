'use client';

import './CamaDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import EstadoAdminBadge from '../EstadoAdminBadge/EstadoAdminBadge';
import {
  SEDE_LABEL, SERVICIO_LABEL, TIPO_LABEL, formatFecha, formatFechaHora, generarHistorial,
} from '@/hooks/GestionCamas/mockCamasAdminData';
import { LuBedDouble, LuHistory } from 'react-icons/lu';

// Modal, no drawer (encargo explícito, sección 10). Vive dentro de la
// tabla: no navega a otra pantalla, así que el admin no pierde el filtro/
// página en la que estaba (mismo criterio que AdmisionDetalleModal).
export default function CamaDetailModal({
  cama, onClose, onVerHistorialCompleto,
}) {
  if (!cama) return null;
  const historial = generarHistorial(cama).slice(0, 3);

  return (
    <div className="modal-overlay open">
      <div className="modal-card cba-detail-modal-card" role="dialog" aria-modal="true" aria-labelledby="cba-detail-title">
        <ModalHeader
          icon={LuBedDouble}
          tone="primary"
          title={`Cama ${cama.codigo}`}
          titleId="cba-detail-title"
          onClose={onClose}
        />
        <div className="modal-body cba-detail-body">
          <div className="cba-detail-estado">
            <span className="cba-detail-label">Estado</span>
            <EstadoAdminBadge estado={cama.estado} />
          </div>

          <div className="cba-detail-divider" />

          <span className="cba-detail-section-title">Información</span>
          <div className="cba-detail-grid">
            <div className="cba-detail-field">
              <span className="cba-detail-label">Código</span>
              <span className="cba-detail-value">{cama.codigo}</span>
            </div>
            <div className="cba-detail-field">
              <span className="cba-detail-label">Habitación</span>
              <span className="cba-detail-value">{cama.habitacionCodigo}</span>
            </div>
            <div className="cba-detail-field">
              <span className="cba-detail-label">Servicio</span>
              <span className="cba-detail-value">{SERVICIO_LABEL[cama.servicio]}</span>
            </div>
            <div className="cba-detail-field">
              <span className="cba-detail-label">Sede</span>
              <span className="cba-detail-value">{SEDE_LABEL[cama.sede]}</span>
            </div>
            <div className="cba-detail-field">
              <span className="cba-detail-label">Tipo de cama</span>
              <span className="cba-detail-value">{TIPO_LABEL[cama.tipo]}</span>
            </div>
            <div className="cba-detail-field">
              <span className="cba-detail-label">Fecha de creación</span>
              <span className="cba-detail-value">{formatFecha(cama.fechaCreacion)}</span>
            </div>
            <div className="cba-detail-field cba-detail-field-wide">
              <span className="cba-detail-label">Última actualización</span>
              <span className="cba-detail-value">{formatFechaHora(cama.estadoDesde)}</span>
            </div>
          </div>

          <div className="cba-detail-divider" />

          <span className="cba-detail-section-title">Historial reciente</span>
          <ul className="cba-detail-historial">
            {historial.map((ev) => (
              <li key={ev.id} className="cba-detail-historial-item">
                <div className="cba-detail-historial-icon"><LuHistory className="icon" aria-hidden="true" /></div>
                <div className="cba-detail-historial-body">
                  <span className="cba-detail-historial-title">{ev.titulo}</span>
                  <span className="cba-detail-historial-meta">{ev.usuario} · {formatFechaHora(ev.fecha)}</span>
                  {ev.motivo && <span className="cba-detail-historial-motivo">{ev.motivo}</span>}
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="cba-link-btn" onClick={() => onVerHistorialCompleto(cama)}>
            Ver historial completo
          </button>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
