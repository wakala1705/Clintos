'use client';

import { useEffect } from 'react';
import './BedDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import EstadoCamaBadge from '../EstadoCamaBadge/EstadoCamaBadge';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import { formatVentanaReserva, infoLimpieza } from '@/hooks/GestionCamas/bedContextFormat';
import { formatRelativeTime } from '@/hooks/GestionCamas/formatRelativeTime';
import {
  AREA_LABEL, CTA_PRINCIPAL, PISO_LABEL, PRIORIDAD_LABEL, SECTOR_LABEL, SEDE_LABEL,
} from '@/hooks/GestionCamas/mockCamasData';
import {
  LuArrowRightLeft, LuBedDouble, LuClock, LuFileText, LuHistory, LuLogOut, LuUser,
} from 'react-icons/lu';

function DetailField({ label, value }) {
  if (!value) return null;
  return (
    <div className="cb-detail-field">
      <span className="cb-detail-field-label">{label}</span>
      <span className="cb-detail-field-value">{value}</span>
    </div>
  );
}

function HistorialList({ eventos, now, emptyLabel }) {
  if (eventos.length === 0) {
    return <div className="cb-activity-empty">{emptyLabel}</div>;
  }
  return (
    <ul className="cb-detail-historial">
      {eventos.map((ev) => (
        <li key={ev.id} className="cb-detail-historial-item">
          <div className="cb-detail-historial-icon"><LuHistory className="icon" aria-hidden="true" /></div>
          <div className="cb-detail-historial-body">
            <span className="cb-detail-historial-item-title">{ev.titulo}</span>
            <span className="cb-detail-historial-meta">{formatRelativeTime(ev.timestamp, now)}</span>
            {ev.detalle && <span className="cb-detail-historial-motivo">{ev.detalle}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

// Mismo cálculo que BedDetailModal.jsx de GestionEnfermeria/PanelGeneral/
// BedBoardModal (feature hermana, mismo criterio de no compartir helpers
// chicos entre features de AGENTS.md) — primeras 2 iniciales, sin acentos
// especiales ni normalización adicional (nombres del mock ya vienen limpios).
function iniciales(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
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

// "Ver detalle" — mismo estilo que CamaDetailModal.jsx (Camas admin, encargo
// explícito): fila "Estado" con badge a la derecha, UNA sola grilla
// "Información" (label/valor de 2 columnas) y "Historial reciente" con
// ítems en círculo neutro. El modelo OPERATIVO no tiene "Fecha de
// creación"/"Última actualización" genéricas como el admin (no se trackean
// por cama, ver mockCamasData.js) — en su lugar, la info contextual por
// estado (reserva/motivo/ETA de limpieza) se suma como filas adicionales de
// la MISMA grilla "Información", no como prosa aparte. Ocupada es la única
// excepción (encargo explícito: "separar información de la cama de
// información del paciente, que hoy están mezcladas") — su info de paciente
// vive en una card propia "Paciente actual" entre Información e Historial
// reciente, con su propio avatar+acciones, ver más abajo.
//
// "Ver historial completo" abre HistorialCamaModal (encargo: un solo lugar
// para ver el historial completo de una cama, no 2 UI distintas — mismo
// criterio de cierre que handleReservarClick/handlePrimary: cierra este
// modal primero, el setModal posterior gana dentro del mismo batch de
// React). "Historial reciente" (últimos 5, abajo) se queda tal cual, es
// solo un vistazo rápido.
export default function BedDetailModal({
  cama, activity, now, etaTimestamp, onClose, onAction,
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
    .filter((ev) => ev.titulo.includes(cama.numero) || ev.detalle.includes(cama.numero));
  const { label: limpiezaLabel, valor: limpiezaValor } = infoLimpieza(cama, etaTimestamp, now);
  const ventanaReserva = cama.reserva
    ? formatVentanaReserva(cama.reserva.fechaInicio, cama.reserva.fechaVencimiento)
    : null;
  // `cama.fechaInicio` (timestamp, no el string YYYY-MM-DD de
  // reserva/bloqueo) viene de CambiarEstadoModal — a diferencia de esos 2,
  // acá el usuario elige fecha+hora exacta, así que se formatea con hora.
  const fechaInicioCambio = cama.fechaInicio
    ? new Date(cama.fechaInicio).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
    : null;
  const ventanaBloqueo = cama.bloqueo
    ? formatVentanaReserva(cama.bloqueo.fechaInicio, cama.bloqueo.fechaFin)
    : null;

  function handlePrimary() {
    if (!cta) return;
    // Cierra primero: si la acción abre otro modal (ej. Asignar paciente),
    // ese setModal posterior gana sobre este onClose dentro del mismo batch
    // de React — si no abre ninguno, el resultado es simplemente cerrado.
    onClose();
    onAction(cta.action, cama.id);
  }

  // "Reservar" (Libre) — mismo criterio de cierre que handlePrimary, pero
  // como acción secundaria: "Asignar paciente" sigue siendo la primaria de
  // este estado (CTA_PRINCIPAL.libre, mockCamasData.js), Reservar solo
  // necesitaba quedar accesible desde el detalle además del menú "⋯"
  // (encargo: "el modal Reservar cama se abre desde el detalle de una cama
  // en estado Libre").
  function handleReservarClick() {
    onClose();
    onAction('reservar', cama.id);
  }

  // Mismo criterio de cierre que handleReservarClick — "Ver historial
  // completo" ya no es una vista interna, abre HistorialCamaModal.
  function handleVerHistorialClick() {
    onClose();
    onAction('historial', cama.id);
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
          onClose={onClose}
        />

        <div className="modal-body">
          <div className="cb-detail-body">
            <div className="cb-detail-estado-row">
              <span className="cb-detail-field-label">Estado</span>
              <EstadoCamaBadge estado={cama.estado} />
            </div>

            <div className="cb-detail-divider" />

            <div className="cb-detail-section">
              <span className="cb-detail-section-title">Información</span>
              <div className="cb-detail-grid">
                <DetailField label="Código" value={cama.codigo ?? '—'} />
                <DetailField label="Habitación" value={cama.habitacion ?? '—'} />
                <DetailField label="Servicio" value={AREA_LABEL[cama.area]} />
                <DetailField label="Sede" value={SEDE_LABEL[cama.sede]} />
                <DetailField label="Piso" value={PISO_LABEL[cama.piso]} />
                <DetailField label="Sector" value={SECTOR_LABEL[cama.sector]} />
                <DetailField label="Tipo" value={`Tipo ${cama.tipo}`} />

                {/* Ocupada NO agrega filas acá (encargo explícito:
                    "separar información de la cama de información del
                    paciente, que hoy están mezcladas") — Paciente/Historia
                    clínica/Admisión/Ingreso/Tiempo de ocupación se movieron
                    a la card "Paciente actual" de abajo. */}
                {cama.estado === 'libre' && (
                  <DetailField label="Última limpieza" value={cama.ultimaLimpieza ? `Hoy · ${cama.ultimaLimpieza}` : null} />
                )}
                {cama.estado === 'reservada' && cama.reserva && (
                  <>
                    <DetailField label="Reservada para" value={cama.reserva.paciente ?? 'Ingreso programado'} />
                    <DetailField label="Motivo" value={cama.reserva.motivo} />
                    <DetailField label="Prioridad" value={PRIORIDAD_LABEL[cama.reserva.prioridad]} />
                    <DetailField label="Ventana de reserva" value={ventanaReserva} />
                  </>
                )}
                {cama.estado === 'limpieza' && (
                  <DetailField label={limpiezaLabel} value={limpiezaValor} />
                )}
                {cama.estado === 'mantenimiento' && (
                  <DetailField label="Mantenimiento" value={cama.mantenimientoTipo ?? 'En mantenimiento'} />
                )}
                {cama.estado === 'bloqueada' && (
                  <>
                    <DetailField label="Motivo" value={cama.motivo ?? 'Sin motivo registrado'} />
                    <DetailField label="Ventana de bloqueo" value={ventanaBloqueo} />
                    <DetailField label="Observación" value={cama.bloqueo?.observacion} />
                  </>
                )}
                {cama.estado === 'inactiva' && (
                  <DetailField label="Motivo de desactivación" value={cama.motivo ?? 'Sin motivo registrado'} />
                )}

                {/* Observación/Fecha inicio del último "Cambiar estado"
                    (modal genérico) — a diferencia de los campos de arriba,
                    no están atados a un `estado` puntual: se muestran para
                    cualquier cama que los traiga, sin importar en qué estado
                    esté ahora. */}
                <DetailField label="Observación" value={cama.observacion} />
                <DetailField label="Fecha inicio" value={fechaInicioCambio} />
              </div>
            </div>

            {cama.estado === 'ocupada' && cama.paciente && (
              <>
                <div className="cb-detail-divider" />
                <div className="cb-detail-section">
                  <span className="cb-detail-section-title">Paciente actual</span>
                  <div className="cb-paciente-card">
                    <div className="cb-paciente-card-header">
                      <PatientAvatar iniciales={iniciales(cama.paciente.nombre)} className="cb-paciente-avatar" />
                      <div className="cb-paciente-card-identidad">
                        <span className="cb-paciente-card-nombre">{cama.paciente.nombre}</span>
                        <span className="cb-paciente-card-hc">{cama.paciente.hc}</span>
                      </div>
                    </div>

                    <div className="cb-detail-divider" />

                    {/* Admisión + Tiempo de ocupación, no Ingreso a cama
                        (encargo: "decide cuál de los dos aporta más al
                        vistazo rápido" — Tiempo de ocupación es más
                        accionable que la fecha de ingreso sola). */}
                    <div className="cb-detail-grid">
                      <DetailField label="Admisión" value={cama.paciente.admisionId ?? '—'} />
                      <DetailField label="Tiempo de ocupación" value={formatTiempoOcupacion(cama.paciente.admision, cama.paciente.horaIngreso, now)} />
                    </div>

                    {/* 2x2 (encargo) — Iniciar alta como única primaria:
                        es la acción de cierre de flujo más frecuente en
                        este contexto, asunción de producto sin validar con
                        el equipo clínico todavía (si Trasladar resulta
                        igual de común, ambas deberían quedar secundarias
                        sin ninguna primaria). */}
                    <div className="cb-paciente-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => onAction('ver-paciente', cama.id)}>
                        <LuUser className="icon" aria-hidden="true" />
                        Ver paciente
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => onAction('ver-admision', cama.id)}>
                        <LuFileText className="icon" aria-hidden="true" />
                        Ver admisión
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => onAction('trasladar', cama.id)}>
                        <LuArrowRightLeft className="icon" aria-hidden="true" />
                        Trasladar
                      </button>
                      <button type="button" className="btn btn-primary" onClick={() => onAction('iniciar-alta', cama.id)}>
                        <LuLogOut className="icon" aria-hidden="true" />
                        Iniciar alta
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="cb-detail-divider" />

            <div className="cb-detail-section">
              <span className="cb-detail-section-title">Historial reciente</span>
              <HistorialList
                eventos={actividadCama.slice(0, 5)}
                now={now}
                emptyLabel="Sin actividad reciente registrada para esta cama."
              />
              <button
                type="button"
                className="cb-link-btn"
                onClick={handleVerHistorialClick}
              >
                Ver historial completo
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          {/* Ocupada: sin botones extra acá (encargo explícito: "las
              acciones de paciente ya viven contextualmente arriba, no hace
              falta duplicarlas abajo") — Ver paciente/Ver admisión/
              Trasladar/Iniciar alta se movieron al grid 2x2 de la card
              "Paciente actual". El resto de estados sigue con su CTA
              genérico de siempre (Aislamiento/Inactiva no tienen
              CTA_PRINCIPAL, ver mockCamasData.js). */}
          {cama.estado === 'libre' && (
            <button type="button" className="btn btn-secondary" onClick={handleReservarClick}>
              <LuClock className="icon" aria-hidden="true" />
              Reservar
            </button>
          )}
          {cta && cama.estado !== 'ocupada' && (
            <button type="button" className="btn btn-primary" onClick={handlePrimary}>
              {cta.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
