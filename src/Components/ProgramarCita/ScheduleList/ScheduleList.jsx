import './ScheduleList.css';
import { STATE_LABEL, TIPO_LABEL } from '@/hooks/ProgramarCita/agendaMockData';
import { LuCalendarPlus, LuClock } from 'react-icons/lu';

// Vista alternativa de ScheduleGrid para el rango tablet (<=1024px,
// --bp-desktop, ver AGENTS.md "Responsive / Breakpoints") — mismos
// columns/appointments/resolveColId que ScheduleGrid recibe (ver
// ProgramarCita.jsx), la CSS decide cuál de las dos se muestra según el
// ancho (mismo criterio "misma data, la CSS decide" que PatientsTable/
// AgendaTable). Una grilla hora×columna se vuelve ilegible en un ancho
// angosto (33 franjas de 20 min, más aún con varias columnas de "Por
// especialidad"), así que en vez de encoger celdas se agrupa por columna
// (día o médico, mismo significado que en ScheduleGrid) en una lista
// cronológica compacta: solo las citas ya agendadas, sin una fila por cada
// una de las 33 franjas vacías. Cada sección lleva su propio botón "Nueva
// cita" para seguir pudiendo agendar sin esa grilla de franjas clickeables
// — reutiliza el mismo onEmptyCellClick(colId, slotIdx) de ScheduleGrid,
// pero sin slotIdx: el paso "Médico" del wizard ya deja elegir la hora
// (ver ncSelectSlot en legacy-nueva-cita.js), así que no hace falta que la
// lista también ofrezca franja por franja.
export default function ScheduleList({
  columns, appointments, resolveColId, onSelectAppointment, onEmptyCellClick,
}) {
  return (
    <div className="pc-schedule-list">
      {columns.map((c) => {
        const items = appointments
          .filter((a) => resolveColId(a) === c.id)
          .slice()
          .sort((a, b) => a.start.localeCompare(b.start));
        return (
          <div className="pc-list-section" key={c.id}>
            <div className="pc-list-section-head">
              <div>
                <div className="pc-list-col-top">{c.headerTop}</div>
                <div className="pc-list-col-bottom">{c.headerBottom}</div>
              </div>
              <button type="button" className="btn btn-secondary" onClick={() => onEmptyCellClick(c.id)}>
                <LuCalendarPlus className="icon" />Nueva cita
              </button>
            </div>
            {items.length === 0 ? (
              <div className="pc-list-empty">Sin citas agendadas.</div>
            ) : (
              <div className="pc-list-items">
                {items.map((a) => {
                  const estadoClass = a.estado.replace('_', '-');
                  return (
                    <button
                      type="button"
                      key={a.id}
                      className={`pc-list-item ${estadoClass}`}
                      onClick={() => onSelectAppointment(a)}
                    >
                      <span className="pc-list-item-time"><LuClock className="icon" aria-hidden="true" />{a.start}</span>
                      <span className="pc-list-item-patient">{a.patient}</span>
                      <span className="pc-list-item-meta">{TIPO_LABEL[a.tipo]}</span>
                      <span className={`pc-estado-badge ${estadoClass}`}>{STATE_LABEL[a.estado]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
