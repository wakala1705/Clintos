'use client';

import './TaskTable.css';
import TaskRowMenu from './TaskRowMenu/TaskRowMenu';
import QuickAssignMenu from './QuickAssignMenu/QuickAssignMenu';
import { PriorityBadge, StatusBadge } from '../../TaskBadges/TaskBadges';
import { TIPOS_TAREA, ubicacionDeTarea } from '@/hooks/GestionEnfermeria/mockTareasData';
import {
  LuCircleCheck, LuClock, LuClockAlert, LuLoaderCircle, LuMinus, LuPlay,
} from 'react-icons/lu';

const TIPO_LABEL = Object.fromEntries(TIPOS_TAREA.map((t) => [t.value, t.label]));

// Segundo nivel bajo el nombre de la tarea (encargo explícito, con ejemplos
// literales): "Cuidado asistencial · Signos vitales" / "Tarea operativa" —
// las operativas no repiten un tipo (siempre son, por definición, la misma
// naturaleza), las asistenciales sí lo necesitan para distinguir qué tipo de
// cuidado es.
function metadataDeTarea(t) {
  return t.categoria === 'operativa' ? 'Tarea operativa' : `Cuidado asistencial · ${TIPO_LABEL[t.tipo]}`;
}

const PROGRAMACION_ICONO = {
  'vence-pronto': LuClockAlert,
  vencida: LuClockAlert,
  proxima: LuClock,
  'en-curso': LuLoaderCircle,
  completada: LuCircleCheck,
  neutral: LuMinus,
};

// Celda "Programación" — ícono+texto coloreado por urgencia real (nunca solo
// color, mismo criterio WCAG del resto del sistema de badges). `tono` ya
// viene resuelto desde mockTareasData.js (ver comentario en `TAREAS`), este
// componente solo lo traduce a ícono/clase.
function ProgramacionCell({ programacion }) {
  const Icon = PROGRAMACION_ICONO[programacion.tono];
  return (
    <span className={`task-prog task-prog-${programacion.tono}`}>
      <Icon className="icon" aria-hidden="true" />
      {programacion.label}
    </span>
  );
}

// Qué acciones secundarias del menú "⋮" no aplican según el estado actual
// de la tarea (ej. no tiene sentido "Reprogramar" una ya cancelada).
const ESTADOS_FINALES = ['completada', 'cancelada', 'no-realizada'];
function accionesDeshabilitadas(tarea) {
  const final = ESTADOS_FINALES.includes(tarea.estado);
  return { reprogramar: final, noRealizada: final, cancelar: final };
}

// Acción primaria en fila (encargo explícito, con la tabla exacta):
// Pendiente/Vencida → Iniciar, En curso → Completar, Sin asignar → Asignar
// (ver QuickAssignMenu), cualquier otro estado (Completada, Cancelada, No
// realizada, Reprogramada) → ninguna, solo queda el badge de Estado + el
// menú "⋮" secundario.
function accionPrimariaDeTarea(t) {
  if (t.estado === 'sin-asignar' || (!t.responsable && (t.estado === 'pendiente' || t.estado === 'vencida'))) return 'asignar';
  if (t.estado === 'pendiente' || t.estado === 'vencida') return 'iniciar';
  if (t.estado === 'en-curso') return 'completar';
  return null;
}

// Fila = una tarea. Un solo clic selecciona Y abre el panel de detalle
// lateral (encargo: "al seleccionar una tarea, abrir un panel lateral
// derecho") — a diferencia de PatientsTable (clic selecciona/doble clic
// navega a OTRA pantalla), acá "abrir" es un panel local, así que un solo
// clic ya es la interacción natural (mismo patrón que un inbox con panel de
// lectura). El botón primario + el menú "⋮" en la celda de Acciones hacen
// `e.stopPropagation()` para no disparar también la selección de fila.
export default function TaskTable({
  tareas, selectedId, onSelect, onIniciar, onCompletar, onAsignarRapido, onReasignar, onReprogramar, onNoRealizada, onCancelar,
}) {
  return (
    <>
      <div className="task-table-wrap">
        <table className="data-table task-table">
          <thead>
            <tr>
              <th>Prioridad</th>
              <th>Tarea</th>
              <th>Paciente / ubicación</th>
              <th>Programación</th>
              <th>Responsable</th>
              <th>Estado</th>
              <th className="col-acciones"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {tareas.map((t) => {
              const accionPrimaria = accionPrimariaDeTarea(t);
              return (
                <tr
                  key={t.id}
                  className={selectedId === t.id ? 'selected' : undefined}
                  aria-selected={selectedId === t.id}
                  tabIndex={0}
                  onClick={() => onSelect(t.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t.id); } }}
                >
                  <td><PriorityBadge prioridad={t.prioridad} /></td>
                  <td className="task-col-tarea">
                    <span className="cell-primary">{t.nombre}</span>
                    <span className="cell-sub">{metadataDeTarea(t)}</span>
                  </td>
                  <td className="task-col-ubicacion">{ubicacionDeTarea(t)}</td>
                  <td><ProgramacionCell programacion={t.programacion} /></td>
                  <td className={t.responsable ? undefined : 'cell-muted'}>{t.responsable ?? 'Sin asignar'}</td>
                  <td><StatusBadge estado={t.estado} /></td>
                  <td className="col-acciones">
                    <div className="task-row-actions">
                      {accionPrimaria === 'iniciar' && (
                        <button type="button" className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); onIniciar(t.id); }}>
                          <LuPlay className="icon" aria-hidden="true" />
                          Iniciar
                        </button>
                      )}
                      {accionPrimaria === 'completar' && (
                        <button type="button" className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); onCompletar(t.id); }}>
                          <LuCircleCheck className="icon" aria-hidden="true" />
                          Completar
                        </button>
                      )}
                      {accionPrimaria === 'asignar' && (
                        <QuickAssignMenu onAsignar={(responsable) => onAsignarRapido(t.id, responsable)} />
                      )}
                      <TaskRowMenu
                        tarea={t}
                        disabled={accionesDeshabilitadas(t)}
                        onVerDetalle={() => onSelect(t.id)}
                        onReasignar={() => onReasignar(t.id)}
                        onReprogramar={() => onReprogramar(t.id)}
                        onNoRealizada={() => onNoRealizada(t.id)}
                        onCancelar={() => onCancelar(t.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {tareas.length === 0 && (
          <div className="task-table-empty">
            Ningún resultado con los filtros actuales.
          </div>
        )}
      </div>

      {/* Tarjetas mobile — mismo dataset/mismas acciones que la tabla de
          arriba, la CSS decide cuál se ve según el ancho (mismo patrón que
          PatientsTable/AgendaTable, ver AGENTS.md). */}
      <div className="task-cards">
        {tareas.map((t) => {
          const accionPrimaria = accionPrimariaDeTarea(t);
          return (
            <div
              className={`task-card${selectedId === t.id ? ' selected' : ''}`}
              key={t.id}
              aria-selected={selectedId === t.id}
              tabIndex={0}
              onClick={() => onSelect(t.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t.id); } }}
            >
              <div className="task-card-top">
                <PriorityBadge prioridad={t.prioridad} />
                <StatusBadge estado={t.estado} />
              </div>
              <div className="task-card-id">
                <span className="cell-primary">{t.nombre}</span>
                <span className="cell-sub">{metadataDeTarea(t)}</span>
              </div>
              <div className="task-card-meta">
                <span>{ubicacionDeTarea(t)}</span>
                <span className={t.responsable ? undefined : 'cell-muted'}>{t.responsable ?? 'Sin asignar'}</span>
                <ProgramacionCell programacion={t.programacion} />
              </div>
              <div className="task-row-actions" onClick={(e) => e.stopPropagation()}>
                {accionPrimaria === 'iniciar' && (
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => onIniciar(t.id)}>
                    <LuPlay className="icon" aria-hidden="true" />
                    Iniciar
                  </button>
                )}
                {accionPrimaria === 'completar' && (
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => onCompletar(t.id)}>
                    <LuCircleCheck className="icon" aria-hidden="true" />
                    Completar
                  </button>
                )}
                {accionPrimaria === 'asignar' && (
                  <QuickAssignMenu onAsignar={(responsable) => onAsignarRapido(t.id, responsable)} />
                )}
                <TaskRowMenu
                  tarea={t}
                  disabled={accionesDeshabilitadas(t)}
                  onVerDetalle={() => onSelect(t.id)}
                  onReasignar={() => onReasignar(t.id)}
                  onReprogramar={() => onReprogramar(t.id)}
                  onNoRealizada={() => onNoRealizada(t.id)}
                  onCancelar={() => onCancelar(t.id)}
                />
              </div>
            </div>
          );
        })}
        {tareas.length === 0 && (
          <div className="task-table-empty">
            Ningún resultado con los filtros actuales.
          </div>
        )}
      </div>
    </>
  );
}
