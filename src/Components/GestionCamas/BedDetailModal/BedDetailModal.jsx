'use client';

import { useEffect } from 'react';
import './BedDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import EstadoCamaBadge from '../EstadoCamaBadge/EstadoCamaBadge';
import InfoLine from '../InfoLine/InfoLine';
import { formatIngreso, formatVentanaReserva, infoLimpieza } from '@/hooks/GestionCamas/bedContextFormat';
import { formatRelativeTime } from '@/hooks/GestionCamas/formatRelativeTime';
import { EVENTO_CONFIG, EVENTO_CONFIG_DEFAULT } from '../ActivityPanel/ActivityPanel';
import {
  AREA_LABEL, CTA_PRINCIPAL, PISO_LABEL, PRIORIDAD_LABEL, SECTOR_LABEL, SEDE_LABEL,
} from '@/hooks/GestionCamas/mockCamasData';
import { LuBedDouble, LuChevronRight, LuUser } from 'react-icons/lu';

function DetailField({ label, value }) {
  return (
    <div className="cb-detail-field">
      <span className="cb-detail-field-label">{label}</span>
      <span className="cb-detail-field-value">{value}</span>
    </div>
  );
}

// "Tiempo de ocupación" (encargo, solo vive acá — la card ya no muestra
// estancia, ver feedback previo de esta misma iteración) — combina fecha de
// admisión + hora en un timestamp real y lo compara contra `now` (reloj vivo
// de GestionCamas.jsx), no contra HOY_ADMISION (fecha mock fija) para que el
// número siga avanzando mientras la demo esté abierta.
function formatTiempoOcupacion(admisionIso, horaIngreso, nowMs) {
  if (!horaIngreso) return null;
  const inicio = new Date(`${admisionIso}T${horaIngreso}:00`).getTime();
  const diffMs = Math.max(0, nowMs - inicio);
  const dias = Math.floor(diffMs / 86400000);
  const horas = Math.floor((diffMs % 86400000) / 3600000);
  if (dias > 0) return `${dias} día${dias === 1 ? '' : 's'} · ${horas} h`;
  if (horas > 0) return `${horas} h`;
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  return `${mins} min`;
}

// Bloque "Estado actual" (encargo, sección 4) — mismo criterio por estado
// que BloqueContextual en BedCard.jsx, pero con más contenido (Tiempo de
// ocupación) porque acá SÍ hay espacio para una lectura más completa; ambos
// comparten InfoLine/formatIngreso/infoLimpieza para no repetir el formato
// de fechas dos veces.
function EstadoActual({ cama, now, etaTimestamp }) {
  if (cama.estado === 'ocupada' && cama.paciente) {
    return (
      <>
        <div className="cb-card-paciente">
          <LuUser className="icon" aria-hidden="true" />
          <div>
            <div className="cb-card-paciente-nombre">{cama.paciente.nombre}</div>
            <div className="cb-card-paciente-hc">{cama.paciente.hc}</div>
          </div>
        </div>
        <InfoLine label="Ingreso" value={formatIngreso(cama.paciente.admision, cama.paciente.horaIngreso)} />
        <InfoLine label="Tiempo de ocupación" value={formatTiempoOcupacion(cama.paciente.admision, cama.paciente.horaIngreso, now)} />
      </>
    );
  }
  if (cama.estado === 'libre') {
    return (
      <>
        <div className="cb-card-status-text">Disponible para asignación</div>
        <InfoLine label="Última limpieza" value={cama.ultimaLimpieza ? `Hoy · ${cama.ultimaLimpieza}` : null} />
      </>
    );
  }
  if (cama.estado === 'reservada' && cama.reserva) {
    const ventana = formatVentanaReserva(cama.reserva.fechaInicio, cama.reserva.fechaVencimiento);
    const valor = ventana ? `${cama.reserva.motivo} · ${ventana}` : cama.reserva.motivo;
    return (
      <>
        {cama.reserva.paciente && <div className="cb-card-contexto">{cama.reserva.paciente}</div>}
        <InfoLine label="Reservada para" value={valor} />
        <InfoLine label="Prioridad" value={PRIORIDAD_LABEL[cama.reserva.prioridad]} />
      </>
    );
  }
  if (cama.estado === 'limpieza') {
    const { label, valor } = infoLimpieza(cama, etaTimestamp, now);
    return <InfoLine label={label} value={valor} />;
  }
  if (cama.estado === 'mantenimiento') {
    return <InfoLine label="Mantenimiento" value={cama.mantenimientoTipo ?? 'En mantenimiento'} />;
  }
  if (cama.estado === 'bloqueada') {
    return <InfoLine label="Motivo" value={cama.motivo ?? 'Sin motivo registrado'} />;
  }
  return null;
}

export default function BedDetailModal({
  cama, activity, now, etaTimestamp, onClose, onAction, onVerActividad,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const cta = CTA_PRINCIPAL[cama.estado];
  const actividadCama = activity
    .filter((ev) => ev.titulo.includes(cama.numero) || ev.detalle.includes(cama.numero))
    .slice(0, 5);

  function handlePrimary() {
    // Cierra primero: si la acción abre otro modal (ej. Asignar paciente),
    // ese setModal posterior gana sobre este onClose dentro del mismo batch
    // de React — si no abre ninguno, el resultado es simplemente cerrado.
    onClose();
    onAction(cta.action, cama.id);
  }

  return (
    <div className="modal-overlay open" role="presentation" onClick={onClose}>
      <div
        className="modal-card cb-detail-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bed-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={LuBedDouble}
          tone="primary"
          title={`Cama ${cama.numero}`}
          titleId="bed-detail-title"
          subtitle={`${SEDE_LABEL[cama.sede]} · ${AREA_LABEL[cama.area]}`}
          trailing={<EstadoCamaBadge estado={cama.estado} />}
          onClose={onClose}
        />

        <div className="modal-body cb-detail-body">
          <div className="cb-detail-section">
            <div className="fp-section-title">Estado actual</div>
            <EstadoActual cama={cama} now={now} etaTimestamp={etaTimestamp} />
          </div>

          <div className="cb-detail-section">
            <div className="fp-section-title">Ubicación y características</div>
            <div className="cb-detail-grid">
              <DetailField label="Sede" value={SEDE_LABEL[cama.sede]} />
              <DetailField label="Servicio" value={AREA_LABEL[cama.area]} />
              <DetailField label="Piso" value={PISO_LABEL[cama.piso]} />
              <DetailField label="Sector" value={`Sector ${SECTOR_LABEL[cama.sector]}`} />
              <DetailField label="Tipo" value={`Tipo ${cama.tipo}`} />
            </div>
          </div>

          <div className="cb-detail-section">
            <div className="fp-section-title">Actividad reciente</div>
            {actividadCama.length === 0 ? (
              <div className="cb-activity-empty">Sin actividad reciente registrada para esta cama.</div>
            ) : (
              <div className="cb-activity-list">
                {actividadCama.map((ev) => {
                  const { icon: Icon, color } = EVENTO_CONFIG[ev.tipo] ?? EVENTO_CONFIG_DEFAULT;
                  return (
                    <div className="cb-activity-item" key={ev.id}>
                      <span className={`cb-activity-dot dot-${color}`}>
                        <Icon className="icon" aria-hidden="true" />
                      </span>
                      <div className="cb-activity-body">
                        <div className="cb-activity-title">{ev.titulo}</div>
                        <div className="cb-activity-desc">{ev.detalle}</div>
                        <div className="cb-activity-time">{formatRelativeTime(ev.timestamp, now)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              className="cb-detail-link"
              onClick={() => { onClose(); onVerActividad(); }}
            >
              Ver toda la actividad
              <LuChevronRight className="icon" aria-hidden="true" />
            </button>
          </div>

          <div className="cb-detail-section">
            <div className="fp-section-title">Historial</div>
            <div className="cb-detail-historial-title">Últimos pacientes</div>
            {cama.estado === 'ocupada' && cama.paciente ? (
              <div className="cb-detail-historial-row">
                <span>{cama.paciente.nombre}</span>
                <span>{formatIngreso(cama.paciente.admision, cama.paciente.horaIngreso)}</span>
                <span>Actual</span>
              </div>
            ) : (
              <div className="cb-activity-empty">Sin historial de ocupación reciente para esta cama.</div>
            )}
            <button
              type="button"
              className="cb-detail-link"
              onClick={() => onAction('historial', cama.id)}
            >
              Ver historial completo
              <LuChevronRight className="icon" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="modal-footer">
          {cama.estado === 'ocupada' && cama.paciente && (
            <button type="button" className="btn btn-secondary" onClick={() => onAction('ver-paciente', cama.id)}>
              Ver paciente
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={handlePrimary}>
            {cta.label}
          </button>
        </div>
      </div>
    </div>
  );
}
