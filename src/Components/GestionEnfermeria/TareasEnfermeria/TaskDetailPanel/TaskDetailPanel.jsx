'use client';

import { useEffect } from 'react';
import './TaskDetailPanel.css';
import { PriorityBadge, StatusBadge } from '../TaskBadges/TaskBadges';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { AREA_LABEL, timelineDeTarea } from '@/hooks/GestionEnfermeria/mockTareasData';
import { LuCalendarClock, LuCircleCheck, LuPlay, LuUserRoundCog } from 'react-icons/lu';

// Panel lateral derecho de detalle (encargo: "al seleccionar una tarea,
// abrir un panel lateral derecho") — overlay fijo con backdrop + transform
// (nunca left/width, ver regla de movimiento del proyecto), cierra con el
// botón X, click en el backdrop, o Escape. No es un modal centrado (ver
// .modal-overlay en shared.css, reservado para formularios como
// NewTaskModal): esto es lectura/consulta rápida sobre la fila ya
// seleccionada en la tabla, coexiste con ella en vez de bloquearla.
export default function TaskDetailPanel({ tarea, onClose, onIniciar, onReprogramar, onReasignar }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!tarea) return null;
  const timeline = timelineDeTarea(tarea);
  const esFinal = ['completada', 'cancelada', 'no-realizada'].includes(tarea.estado);

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <aside className="task-detail-panel" onClick={(e) => e.stopPropagation()} aria-label={`Detalle de ${tarea.nombre}`}>
        <ModalHeader title={tarea.nombre} onClose={onClose} closeLabel="Cerrar panel de detalle" />

        <div className="task-detail-body">
          <div className="task-detail-grid">
            {tarea.categoria === 'asistencial' ? (
              <>
                <div className="task-detail-field"><span className="k">Paciente</span><span className="v">{tarea.paciente}</span></div>
                <div className="task-detail-field"><span className="k">Cama</span><span className="v">{tarea.cama}</span></div>
                <div className="task-detail-field"><span className="k">Servicio</span><span className="v">Hospitalización</span></div>
                <div className="task-detail-field"><span className="k">Área</span><span className="v">{AREA_LABEL[tarea.areaOperativa]}</span></div>
              </>
            ) : (
              <>
                <div className="task-detail-field"><span className="k">Ubicación</span><span className="v">{tarea.ubicacion}</span></div>
                <div className="task-detail-field"><span className="k">Área</span><span className="v">{AREA_LABEL[tarea.areaOperativa]}</span></div>
              </>
            )}
          </div>

          <div className="task-detail-section">
            <span className="task-detail-label">Programación</span>
            <span className="task-detail-value">{tarea.ventana}</span>
          </div>

          <div className="task-detail-row">
            <div className="task-detail-section">
              <span className="task-detail-label">Prioridad</span>
              <PriorityBadge prioridad={tarea.prioridad} />
            </div>
            <div className="task-detail-section">
              <span className="task-detail-label">Estado</span>
              <StatusBadge estado={tarea.estado} />
            </div>
          </div>

          <div className="task-detail-section">
            <span className="task-detail-label">Responsable</span>
            <span className="task-detail-value">{tarea.responsable ?? 'Sin asignar'}</span>
          </div>

          <div className="task-detail-section">
            <span className="task-detail-label">Instrucciones</span>
            <p className="task-detail-instrucciones">{tarea.instrucciones}</p>
          </div>

          <div className="task-detail-section">
            <span className="task-detail-label">Trazabilidad</span>
            <ul className="task-detail-timeline">
              {timeline.map((p, i) => (
                <li key={i} className={p.actual ? 'actual' : undefined}>
                  <span className="dot" aria-hidden="true"></span>
                  {p.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="task-detail-footer">
          <button type="button" className="btn btn-secondary" disabled={esFinal} onClick={() => onReasignar(tarea.id)}>
            <LuUserRoundCog className="icon" />
            Reasignar
          </button>
          <button type="button" className="btn btn-secondary" disabled={esFinal} onClick={() => onReprogramar(tarea.id)}>
            <LuCalendarClock className="icon" />
            Reprogramar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={esFinal || tarea.estado === 'en-curso' || !tarea.responsable}
            onClick={() => onIniciar(tarea.id)}
          >
            {tarea.estado === 'en-curso' ? <LuCircleCheck className="icon" /> : <LuPlay className="icon" />}
            {tarea.estado === 'en-curso' ? 'En curso' : 'Iniciar tarea'}
          </button>
        </div>
      </aside>
    </div>
  );
}
