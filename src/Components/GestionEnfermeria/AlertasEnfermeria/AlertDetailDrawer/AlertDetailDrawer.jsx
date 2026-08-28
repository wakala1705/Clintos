'use client';

import { useEffect, useState } from 'react';
import './AlertDetailDrawer.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { ICONOS_ALERTA, PriorityBadge, StatusBadge } from '../AlertBadges/AlertBadges';
import { AREAS_ALERTA, TIPO_ALERTA_CONFIG } from '@/hooks/GestionEnfermeria/mockAlertasData';
import {
  LuChevronDown, LuExternalLink, LuHistory, LuSend, LuTimer, LuTriangleAlert, LuUserRoundCog,
} from 'react-icons/lu';

const AREA_LABEL = Object.fromEntries(AREAS_ALERTA.map((a) => [a.value, a.label]));
const TONO_POR_PRIORIDAD = { critica: 'danger', alta: 'warning', media: 'warning', baja: 'neutral' };

// Panel lateral derecho de detalle (encargo secciones 7-13) — overlay fijo +
// ModalHeader, mismo patrón que TaskDetailPanel.jsx (Tareas de enfermería):
// lectura/consulta rápida que coexiste con la tabla ya filtrada en vez de
// bloquearla, cierra con el botón X, click en el backdrop, o Escape.
export default function AlertDetailDrawer({
  alerta, onClose, onVerPaciente, onAdministrar, onPosponer, onEscalar, onAgregarNota,
}) {
  const [nota, setNota] = useState('');
  const [historialAbierto, setHistorialAbierto] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!alerta) return null;

  const tipoCfg = TIPO_ALERTA_CONFIG[alerta.tipo];
  const TipoIcon = ICONOS_ALERTA[tipoCfg.icon];
  const accion = tipoCfg.accion;
  const AccionIcon = accion ? ICONOS_ALERTA[accion.icon] : null;
  const esResuelta = alerta.estado === 'resuelta';
  const creadaHora = alerta.historial[0]?.hora;

  function enviarNota() {
    const texto = nota.trim();
    if (!texto) return;
    onAgregarNota(alerta.id, texto);
    setNota('');
  }

  return (
    <div className="alert-detail-overlay" onClick={onClose}>
      <aside className="alert-detail-panel" onClick={(e) => e.stopPropagation()} aria-label={`Detalle de ${alerta.titulo}`}>
        <ModalHeader
          icon={TipoIcon}
          tone={TONO_POR_PRIORIDAD[alerta.prioridad]}
          title={alerta.titulo}
          titleId="alert-detail-title"
          subtitle={alerta.detalle}
          onClose={onClose}
          closeLabel="Cerrar panel de detalle"
        />

        <div className="alert-detail-body">
          <div className="alert-detail-top-row">
            <PriorityBadge prioridad={alerta.prioridad} />
            <span className="alert-detail-id">{alerta.id}</span>
          </div>

          {alerta.retrasoMin && (
            <div className={`adl-delay-banner adl-delay-${alerta.prioridad}`}>
              <LuTriangleAlert className="icon" aria-hidden="true" />
              Retraso de {alerta.retrasoMin} minutos
            </div>
          )}

          {alerta.estado === 'pospuesta' && alerta.pospuestaHasta && (
            <div className="adl-delay-banner adl-delay-baja">
              <LuTimer className="icon" aria-hidden="true" />
              Pospuesta — vuelve a estar pendiente a las {alerta.pospuestaHasta}
            </div>
          )}

          {alerta.programadoPara && (
            <div className="alert-detail-section">
              <span className="alert-detail-label">Programado para</span>
              <span className="alert-detail-value">{alerta.programadoPara} — 14 Ago 2026</span>
            </div>
          )}

          {alerta.paciente && (
            <div className="alert-detail-block">
              <h4 className="alert-detail-block-title">Información del paciente</h4>
              <div className="alert-detail-grid">
                <div className="alert-detail-field full"><span className="k">Paciente</span><span className="v">{alerta.paciente}</span></div>
                <div className="alert-detail-field"><span className="k">ID Paciente</span><span className="v">{alerta.pacienteId}</span></div>
                <div className="alert-detail-field"><span className="k">Edad</span><span className="v">{alerta.edad} años</span></div>
                <div className="alert-detail-field"><span className="k">Sexo</span><span className="v">{alerta.sexo}</span></div>
                <div className="alert-detail-field full"><span className="k">Diagnóstico</span><span className="v">{alerta.diagnostico}</span></div>
              </div>
              <Button variant="outline" size="sm" icon={LuExternalLink} onClick={() => onVerPaciente(alerta)}>
                Ver paciente
              </Button>
            </div>
          )}

          <div className="alert-detail-block">
            <h4 className="alert-detail-block-title">Ubicación</h4>
            <div className="alert-detail-grid">
              <div className="alert-detail-field"><span className="k">Cama</span><span className="v">{alerta.cama ?? 'Sin asignar'}</span></div>
              <div className="alert-detail-field"><span className="k">Área</span><span className="v">{AREA_LABEL[alerta.area]}</span></div>
              <div className="alert-detail-field full"><span className="k">Enfermera asignada</span><span className="v">{alerta.enfermeraAsignada}</span></div>
            </div>
          </div>

          <div className="alert-detail-block">
            <h4 className="alert-detail-block-title">Detalles de la alerta</h4>
            <div className="alert-detail-grid">
              <div className="alert-detail-field full"><span className="k">Tipo de alerta</span><span className="v">{tipoCfg.label}</span></div>
              {creadaHora && <div className="alert-detail-field"><span className="k">Creada</span><span className="v">{creadaHora} — 14 Ago 2026</span></div>}
              {alerta.programadoPara && <div className="alert-detail-field"><span className="k">Programado para</span><span className="v">{alerta.programadoPara} — 14 Ago 2026</span></div>}
              {alerta.retrasoMin && <div className="alert-detail-field"><span className="k">Retraso</span><span className="v">{alerta.retrasoMin} minutos</span></div>}
              <div className="alert-detail-field"><span className="k">Prioridad</span><PriorityBadge prioridad={alerta.prioridad} /></div>
              <div className="alert-detail-field"><span className="k">Estado</span><StatusBadge estado={alerta.estado} prioridad={alerta.prioridad} /></div>
            </div>
          </div>

          {/* Acciones operativas (encargo sección 11) — cambian según el
              tipo de alerta (accion.label/icon, ver TIPOS_ALERTA); ausentes
              por completo en alertas resueltas (regla 14: "solo acciones de
              consulta/historial"), acá no queda nada que resolver. */}
          {!esResuelta && (
            <div className="alert-detail-block">
              <h4 className="alert-detail-block-title">Acciones</h4>
              <div className="adl-actions">
                {accion && (
                  <Button icon={AccionIcon} onClick={() => onAdministrar(alerta)}>
                    {accion.label}
                  </Button>
                )}
                <Button variant="outline" icon={LuTimer} onClick={() => onPosponer(alerta)}>
                  Posponer alerta
                </Button>
                <Button variant="outline" icon={LuUserRoundCog} onClick={() => onEscalar(alerta)}>
                  Escalar alerta
                </Button>
              </div>
            </div>
          )}

          <div className="alert-detail-block">
            <h4 className="alert-detail-block-title">Notas</h4>
            {alerta.notas.length > 0 && (
              <ul className="adl-notes-list">
                {alerta.notas.map((n, i) => (
                  <li key={i}>
                    <span className="adl-note-meta">{n.autor} · {n.hora}</span>
                    <span className="adl-note-text">{n.texto}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="adl-note-form">
              <input
                type="text"
                placeholder="Agregar nota (opcional)..."
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') enviarNota(); }}
                aria-label="Agregar nota a la alerta"
              />
              <Button size="sm" icon={LuSend} onClick={enviarNota} disabled={!nota.trim()}>Enviar</Button>
            </div>
          </div>

          <div className="alert-detail-block">
            <button
              type="button"
              className="adl-history-toggle"
              onClick={() => setHistorialAbierto((v) => !v)}
              aria-expanded={historialAbierto}
            >
              <LuHistory className="icon" aria-hidden="true" />
              Historial de la alerta
              <LuChevronDown className={`icon adl-history-chev${historialAbierto ? ' open' : ''}`} aria-hidden="true" />
            </button>
            {historialAbierto && (
              <ul className="alert-detail-timeline">
                {alerta.historial.map((p, i) => (
                  <li key={i} className={i === alerta.historial.length - 1 ? 'actual' : undefined}>
                    <span className="dot" aria-hidden="true" />
                    <b>{p.hora}</b> — {p.texto}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
