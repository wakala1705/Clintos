'use client';

import './ConfirmarStep.css';
import {
  AREA_TURNO_LABEL, NURSES, mesLabel, rangoSemanaLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';

// Paso 3 (solo lectura) — resumen antes de crear. La duración se deriva del
// tipo elegido en el paso 1 (nunca se calcula en días: "1 semana"/"1 mes"
// son las únicas 2 duraciones posibles en V1, ver encargo sección 2).
export default function ConfirmarStep({
  tipo, weekStart, monthStart, area, nurseIds,
}) {
  const periodLabel = tipo === 'semana' ? rangoSemanaLabel(weekStart) : mesLabel(monthStart);
  const duracionLabel = tipo === 'semana' ? '1 semana' : '1 mes';
  const seleccionadas = NURSES.filter((n) => nurseIds.includes(n.id));

  return (
    <div className="cs-step">
      <h4 className="npw-step-title">Revisa la programación</h4>

      <div className="cs-summary">
        <div className="cs-summary-row">
          <span className="cs-summary-label">Período</span>
          <span className="cs-summary-value">{periodLabel}</span>
        </div>
        <div className="cs-summary-row">
          <span className="cs-summary-label">Duración</span>
          <span className="cs-summary-value">{duracionLabel}</span>
        </div>
        <div className="cs-summary-row">
          <span className="cs-summary-label">Área</span>
          <span className="cs-summary-value">{AREA_TURNO_LABEL[area]}</span>
        </div>
        <div className="cs-summary-row">
          <span className="cs-summary-label">Personal</span>
          <span className="cs-summary-value">{nurseIds.length} enfermeras</span>
        </div>
      </div>

      <div className="cs-list">
        {seleccionadas.map((n) => (
          <div key={n.id} className="npw-nurse-row readonly">
            <span className="npw-nurse-avatar" aria-hidden="true">{n.iniciales}</span>
            <span className="npw-nurse-info">
              <span className="npw-nurse-name">{n.nombre}</span>
              <span className="npw-nurse-cargo">{n.cargo}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="cs-note">
        La programación se creará como borrador. Podrás asignar y modificar los turnos desde el calendario antes de publicarla.
      </div>
    </div>
  );
}
