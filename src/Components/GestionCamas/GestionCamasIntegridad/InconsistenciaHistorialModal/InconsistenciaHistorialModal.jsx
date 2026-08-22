'use client';

import './InconsistenciaHistorialModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { ESTADO_LABEL, formatFechaHora } from '@/hooks/GestionCamas/mockIntegridadData';
import { LuCircleCheck, LuEyeOff, LuHistory, LuTriangleAlert } from 'react-icons/lu';

const ICONO_POR_EVENTO = { detectada: LuTriangleAlert, corregida: LuCircleCheck, ignorada: LuEyeOff };

// Historial de ESTA inconsistencia puntual (menú "⋯" → "Ver historial",
// encargo sección 8) — distinto del historial GLOBAL de corridas de
// verificación (ver HistorialVerificacionesModal, CTA del header). Mismo
// criterio de trazabilidad que CamaHistorialModal (Camas): quién/cuándo/
// motivo de cada cambio de estado de seguimiento.
export default function InconsistenciaHistorialModal({ inconsistencia, onClose }) {
  if (!inconsistencia) return null;

  const eventos = [
    { id: 'detectada', tipo: 'detectada', titulo: 'Inconsistencia detectada', fecha: inconsistencia.detectadoEn, usuario: 'Verificación del sistema' },
  ];
  if (inconsistencia.estado !== 'activa') {
    eventos.push({
      id: 'resuelta',
      tipo: inconsistencia.estado,
      titulo: `Marcada como ${ESTADO_LABEL[inconsistencia.estado]}`,
      fecha: inconsistencia.resueltoEn,
      usuario: inconsistencia.resueltoPor,
      motivo: inconsistencia.motivo,
    });
  }
  eventos.sort((a, b) => b.fecha - a.fecha);

  return (
    <div className="modal-overlay open">
      <div className="modal-card cbi-historial-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbi-historial-title">
        <ModalHeader
          icon={LuHistory}
          tone="primary"
          title="Historial de la inconsistencia"
          subtitle={inconsistencia.titulo}
          titleId="cbi-historial-title"
          onClose={onClose}
        />
        <div className="modal-body">
          <ul className="cbi-historial-list">
            {eventos.map((ev) => {
              const Icon = ICONO_POR_EVENTO[ev.tipo];
              return (
                <li key={ev.id} className="cbi-historial-item">
                  <div className="cbi-historial-icon"><Icon className="icon" aria-hidden="true" /></div>
                  <div className="cbi-historial-body">
                    <span className="cbi-historial-title">{ev.titulo}</span>
                    <span className="cbi-historial-meta">{ev.usuario} · {formatFechaHora(ev.fecha)}</span>
                    {ev.motivo && <span className="cbi-historial-motivo">{ev.motivo}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
