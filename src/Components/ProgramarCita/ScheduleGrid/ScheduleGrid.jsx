import './ScheduleGrid.css';
import {
  NOW_DEMO, SLOTS, SLOTS_PER_HOUR, START_HOUR, STATE_LABEL, TIPO_LABEL, slotIndex, timeLabel,
} from '@/hooks/ProgramarCita/agendaMockData';

const HEADER_H = 52;
// Altura de franja por defecto (32px, la opción "Media" de
// RowHeightDropdown) — 24/32/40px por franja de 20 min, elegible desde el
// header de la página (ver rowHeight en ProgramarCita.jsx).
const DEFAULT_ROW_H = 32;

// Grilla genérica de horario: no sabe si las columnas son días de la semana
// de un médico o médicos de una especialidad — solo pinta lo que recibe.
// `resolveColId(appt)` le dice a qué columna pertenece cada cita.
// `onEmptyCellClick(colId, slotIdx)` reemplaza al `window.ncOpen()` sin
// contexto que había antes: el padre (ProgramarCita.jsx) sabe a qué
// médico/día/hora real corresponde esa columna+franja y arma el prefill del
// wizard con eso, en vez de forzar a re-elegir lo que el usuario ya señaló
// con el clic.
export default function ScheduleGrid({
  columns, appointments, resolveColId, onSelectAppointment, onEmptyCellClick, showNow = true,
  rowHeight = DEFAULT_ROW_H,
}) {
  const nCols = columns.length;
  const ROW_H = rowHeight;

  const [nowH, nowM] = NOW_DEMO.split(':').map(Number);
  const nowIdxFraction = (nowH - START_HOUR) * SLOTS_PER_HOUR + nowM / (60 / SLOTS_PER_HOUR);
  const showNowLine = showNow && nowIdxFraction >= 0 && nowIdxFraction <= SLOTS;
  const nowTopPx = HEADER_H + nowIdxFraction * ROW_H;

  const hourSlots = Array.from({ length: SLOTS }, (_, s) => s);

  return (
    <div className="pc-schedule-panel">
      <div
        className="pc-schedule-grid"
        style={{
          gridTemplateColumns: `64px repeat(${nCols}, minmax(0, 1fr))`,
          gridTemplateRows: `${HEADER_H}px repeat(${SLOTS}, ${ROW_H}px)`,
        }}
      >
        <div className="pc-col-header pc-time-corner" style={{ gridColumn: 1, gridRow: 1 }}></div>

        {columns.map((c, i) => (
          <div className="pc-col-header" key={c.id} style={{ gridColumn: i + 2, gridRow: 1 }}>
            <div className="pc-col-header-top">{c.headerTop}</div>
            <div className="pc-col-header-bottom">{c.headerBottom}</div>
          </div>
        ))}

        {hourSlots.map((s) => (
          <div key={`gutter-${s}`} className="pc-time-gutter" style={{ gridColumn: 1, gridRow: s + 2 }}>
            {s % SLOTS_PER_HOUR === 0 ? timeLabel(s) : ''}
          </div>
        ))}

        {hourSlots.map((s) => columns.map((c, i) => (
          <button
            type="button"
            key={`cell-${s}-${c.id}`}
            className={`pc-slot-cell${s % SLOTS_PER_HOUR === 0 ? ' hour-line' : ''}`}
            style={{ gridColumn: i + 2, gridRow: s + 2 }}
            onClick={() => (onEmptyCellClick ? onEmptyCellClick(c.id, s) : window.ncOpen())}
          >
            <span className="pc-add-hint">+ Agendar</span>
          </button>
        )))}

        {appointments.map((a) => {
          const colIdx = columns.findIndex((c) => c.id === resolveColId(a));
          if (colIdx < 0) return null;
          const startIdx = slotIndex(a.start);
          return (
            <button
              type="button"
              key={a.id}
              className={`pc-appt-card ${a.estado.replace('_', '-')}`}
              style={{ gridColumn: colIdx + 2, gridRow: startIdx + 2 }}
              title={`${a.patient}\n${STATE_LABEL[a.estado]} · ${TIPO_LABEL[a.tipo]}\n${a.motivo}`}
              onClick={() => onSelectAppointment(a)}
            >
              <span className="pc-appt-time">{a.start}</span>
              <span className="pc-appt-patient">{a.patient}</span>
            </button>
          );
        })}

        {showNowLine && (
          <>
            <div className="pc-now-line" style={{ top: `${nowTopPx}px` }}></div>
            <div className="pc-now-pill" style={{ top: `${nowTopPx}px` }}>{NOW_DEMO}</div>
          </>
        )}
      </div>
    </div>
  );
}
