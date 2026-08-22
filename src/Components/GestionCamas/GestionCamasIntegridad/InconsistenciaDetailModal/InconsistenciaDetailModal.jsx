'use client';

import './InconsistenciaDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import ImpactoBadge from '../ImpactoBadge/ImpactoBadge';
import EstadoInconsistenciaBadge from '../EstadoInconsistenciaBadge/EstadoInconsistenciaBadge';
import {
  PUEDE_IGNORAR, SEDE_LABEL, SERVICIO_LABEL, formatFechaHora,
} from '@/hooks/GestionCamas/mockIntegridadData';
import { LuTriangleAlert } from 'react-icons/lu';

// "Ver" — encargo explícito (sección 7): "no realizar ninguna modificación
// desde esta acción". Solo lectura; Ignorar/Corregir viven en el footer
// como atajos hacia SUS PROPIOS modales (ver GestionCamasIntegridad.jsx),
// nunca ejecutados acá directamente — primero entender, después actuar
// (encargo sección 11).
export default function InconsistenciaDetailModal({
  inconsistencia, onClose, onIgnorar, onCorregir,
}) {
  if (!inconsistencia) return null;
  const esActiva = inconsistencia.estado === 'activa';

  return (
    <div className="modal-overlay open">
      <div className="modal-card cbi-detail-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbi-detail-title">
        <ModalHeader
          icon={LuTriangleAlert}
          tone={inconsistencia.impacto === 'critico' ? 'danger' : inconsistencia.impacto === 'advertencia' ? 'warning' : 'primary'}
          title={inconsistencia.titulo}
          titleId="cbi-detail-title"
          onClose={onClose}
        />
        <div className="modal-body cbi-detail-body">
          <div className="cbi-detail-badges">
            <ImpactoBadge impacto={inconsistencia.impacto} />
            <EstadoInconsistenciaBadge estado={inconsistencia.estado} />
          </div>

          <div className="cbi-detail-field">
            <span className="cbi-detail-label">Descripción</span>
            <span className="cbi-detail-value">{inconsistencia.descripcion}</span>
          </div>

          {inconsistencia.camas && (
            <div className="cbi-detail-field">
              <span className="cbi-detail-label">{inconsistencia.camas.length > 1 ? 'Camas afectadas' : 'Cama afectada'}</span>
              <span className="cbi-detail-value">{inconsistencia.camas.join(', ')}</span>
            </div>
          )}
          {inconsistencia.habitaciones && (
            <div className="cbi-detail-field">
              <span className="cbi-detail-label">{inconsistencia.habitaciones.length > 1 ? 'Habitaciones afectadas' : 'Habitación afectada'}</span>
              <span className="cbi-detail-value">{inconsistencia.habitaciones.join(', ')}</span>
            </div>
          )}
          {inconsistencia.paciente && (
            <div className="cbi-detail-field">
              <span className="cbi-detail-label">Paciente</span>
              <span className="cbi-detail-value">{inconsistencia.paciente}</span>
            </div>
          )}

          <div className="cbi-detail-grid">
            <div className="cbi-detail-field">
              <span className="cbi-detail-label">Sede</span>
              <span className="cbi-detail-value">{SEDE_LABEL[inconsistencia.sede]}</span>
            </div>
            {inconsistencia.servicio && (
              <div className="cbi-detail-field">
                <span className="cbi-detail-label">Servicio</span>
                <span className="cbi-detail-value">{SERVICIO_LABEL[inconsistencia.servicio]}</span>
              </div>
            )}
            <div className="cbi-detail-field">
              <span className="cbi-detail-label">Detectado</span>
              <span className="cbi-detail-value">{formatFechaHora(inconsistencia.detectadoEn)}</span>
            </div>
          </div>

          {!esActiva && (
            <div className="cbi-detail-resolucion">
              <span className="cbi-detail-label">{inconsistencia.estado === 'ignorada' ? 'Ignorada por' : 'Corregida por'}</span>
              <span className="cbi-detail-value">{inconsistencia.resueltoPor} · {formatFechaHora(inconsistencia.resueltoEn)}</span>
              {inconsistencia.motivo && <span className="cbi-detail-motivo">{inconsistencia.motivo}</span>}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {esActiva && PUEDE_IGNORAR && (
            <button type="button" className="btn btn-secondary" onClick={() => onIgnorar(inconsistencia)}>Ignorar</button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          {esActiva && (
            <button type="button" className="btn btn-primary" onClick={() => onCorregir(inconsistencia)}>Corregir</button>
          )}
        </div>
      </div>
    </div>
  );
}
