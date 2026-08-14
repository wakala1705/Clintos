'use client';

import { useState } from 'react';
import './ShiftChangeBanner.css';
import { TURNO_LABEL, ubicacionDeTarea } from '@/hooks/GestionEnfermeria/mockTareasData';
import { LuArrowLeftRight, LuChevronDown, LuUserRoundPlus } from 'react-icons/lu';

// "N tareas pendientes del turno anterior" (encargo explícito) — banner
// aparte de la tabla principal (no una fila más, aunque las tareas TAMBIÉN
// viven en `TAREAS`/la tabla, ver mockTareasData.js: "la tarea no debe
// desaparecer al finalizar el turno"). Colapsada por defecto (encargo:
// "no debe ocupar demasiado espacio vertical cuando no está expandida") —
// la barra resumida es en sí el botón que expande/colapsa, mismo patrón que
// un <details> pero con el mismo lenguaje visual .task-shift-banner-* que ya
// existía. "Asumir tarea" reasigna al usuario actual y la pasa a Pendiente
// (ver handleAsumir en TareasEnfermeria.jsx) — la trazabilidad de quién la
// recibió/ejecutó queda en el timeline de su panel de detalle (ver
// timelineDeTarea, primeros 3 pasos son justo ese registro). El banner deja
// de mostrarse solo (el padre no la renderiza) una vez todas sus tareas
// fueron asumidas.
export default function ShiftChangeBanner({ tareas, onAsumir }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="task-shift-banner">
      <button
        type="button"
        className="task-shift-banner-header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <LuArrowLeftRight className="icon" aria-hidden="true" />
        <span>{tareas.length} {tareas.length === 1 ? 'tarea pendiente' : 'tareas pendientes'} del turno anterior</span>
        <span className="task-shift-banner-cta">
          Revisar y asumir
          <LuChevronDown className={`icon chev${expanded ? ' open' : ''}`} aria-hidden="true" />
        </span>
      </button>

      {expanded && (
        <div className="task-shift-banner-list">
          {tareas.map((t) => (
            <div className="task-shift-item" key={t.id}>
              <div className="task-shift-item-main">
                <span className="task-shift-item-name">{t.nombre}</span>
                <span className="task-shift-item-meta">{ubicacionDeTarea(t)}</span>
                <span className="task-shift-item-meta2">
                  Turno anterior: <b>{TURNO_LABEL[t.turno]}</b> · Responsable anterior: <b>{t.responsableAnterior}</b> · Hora original: <b>{t.horaOriginal}</b>
                </span>
                <span className="task-shift-item-motivo">{t.motivoPendiente}</span>
              </div>
              <button type="button" className="btn btn-sm btn-tinted" onClick={() => onAsumir(t.id)}>
                <LuUserRoundPlus className="icon" aria-hidden="true" />
                Asumir tarea
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
