'use client';

import './MantenimientoDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { EstadoMantenimientoBadge, PrioridadBadge } from '../MantenimientoBadges/MantenimientoBadges';
import {
  AREA_LABEL, SEDE_LABEL, TIPO_LABEL, formatFecha, formatFechaCorta, formatHoraCorta,
} from '@/hooks/GestionCamas/mockMantenimientoData';
import { LuWrench } from 'react-icons/lu';

// "Ver" (encargo sección 11) — el mismo modal cubre "Ver detalle" y "Ver
// historial" del menú "⋯" (ambos abren esta pantalla; HISTORIAL siempre está
// presente, así que no hace falta un modal de historial aparte). Acción
// contextual "Finalizar mantenimiento" solo si `estado === 'en-proceso'`
// (encargo, literal).
export default function MantenimientoDetailModal({ mantenimiento, onClose, onFinalizar }) {
  if (!mantenimiento) return null;
  const m = mantenimiento;

  const eventos = [...m.historial].sort((a, b) => b.fecha - a.fecha);
  const tone = m.estado === 'vencido' ? 'danger' : m.estado === 'cancelado' ? 'neutral' : 'primary';

  return (
    <div className="modal-overlay open">
      <div className="modal-card cbm-detail-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-detail-title">
        <ModalHeader
          icon={LuWrench}
          tone={tone}
          title={`Mantenimiento ${TIPO_LABEL[m.tipo].toLowerCase()}`}
          titleId="cbm-detail-title"
          onClose={onClose}
        />
        <div className="modal-body cbm-detail-body">
          <EstadoMantenimientoBadge estado={m.estado} />

          <div className="cbm-detail-section">
            <span className="cbm-detail-section-title">Cama</span>
            <div className="cbm-detail-cama-block">
              <span className="cbm-detail-cama-code">{m.cama}</span>
              <span className="cbm-detail-cama-meta">{SEDE_LABEL[m.sede]}</span>
              <span className="cbm-detail-cama-meta">{AREA_LABEL[m.area]}</span>
              <span className="cbm-detail-cama-meta">{m.ubicacion}</span>
            </div>
          </div>

          <div className="cbm-detail-section">
            <span className="cbm-detail-section-title">Detalle</span>
            <div className="cbm-detail-grid">
              <div className="cbm-detail-field">
                <span className="cbm-detail-label">Tipo</span>
                <span className="cbm-detail-value">{TIPO_LABEL[m.tipo]}</span>
              </div>
              <div className="cbm-detail-field">
                <span className="cbm-detail-label">Prioridad</span>
                <PrioridadBadge prioridad={m.prioridad} />
              </div>
              <div className="cbm-detail-field">
                <span className="cbm-detail-label">Fecha programada</span>
                <span className="cbm-detail-value">{`${formatFecha(m.fechaProgramada)} · ${formatHoraCorta(m.fechaProgramada)}`}</span>
              </div>
              <div className="cbm-detail-field">
                <span className="cbm-detail-label">Responsable</span>
                <span className="cbm-detail-value">{m.responsable}</span>
              </div>
            </div>
            <div className="cbm-detail-field cbm-detail-descripcion">
              <span className="cbm-detail-label">Descripción</span>
              <span className="cbm-detail-value">{m.descripcion}</span>
            </div>
          </div>

          <div className="cbm-detail-section">
            <span className="cbm-detail-section-title">Historial</span>
            <ul className="cbm-historial-list">
              {eventos.map((ev) => (
                <li key={ev.id} className="cbm-historial-item">
                  <span className="cbm-historial-fecha">{formatFechaCorta(ev.fecha)}</span>
                  <span className="cbm-historial-titulo">{ev.titulo}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          {m.estado === 'en-proceso' && (
            <button type="button" className="btn btn-primary" onClick={() => onFinalizar(m)}>Finalizar mantenimiento</button>
          )}
        </div>
      </div>
    </div>
  );
}
