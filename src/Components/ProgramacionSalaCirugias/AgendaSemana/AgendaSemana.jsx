'use client';

import { useState } from 'react';
import './AgendaSemana.css';
import CirugiaCard from '../CirugiaCard/CirugiaCard';
import FiltrosBar from '../FiltrosBar/FiltrosBar';
import SlotAccionesMenu from '../SlotAccionesMenu/SlotAccionesMenu';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { JORNADAS } from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';

// Franjas de 30 min (mismas que gestion/agenda.js: índice 0 = 00:00). La
// "jornada" (horas visibles) es solo una ventana sobre ellas, así que cambiarla
// no mueve ni recalcula cirugías.
const SLOTS_POR_HORA = 2;

// Slot absoluto del día (0-47) de una hora "HH:mm".
function horaASlotAbs(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * SLOTS_POR_HORA + (m >= 30 ? 1 : 0);
}

// Inversa -- traduce el slot absoluto clickeado de vuelta a "HH:mm" para
// precargar la hora de inicio del wizard "Nueva cirugía" (ver onSlotClick).
function slotAbsAHora(slot) {
  const h = Math.floor(slot / SLOTS_POR_HORA);
  const m = (slot % SLOTS_POR_HORA) * (60 / SLOTS_POR_HORA);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function AgendaSemana({
  label, days, cirugias, selectedId, onSelect, onPrevWeek, onNextWeek,
  navPrevLabel = 'Semana anterior', navNextLabel = 'Semana siguiente',
  sedeId, salaId, onSalaChange, estado, onEstadoChange, onSlotClick,
  onEditarCirugia, onReprogramarCirugia, onMarcarRealizada, onMarcarIncumplida, onCancelarCirugia,
  vista, onChangeVista, jornada = '24h', onJornada, diasVista, onDiasVista,
}) {
  const ventana = JORNADAS[jornada] ?? JORNADAS['24h'];
  const SLOTS = ventana.hasta - ventana.desde;
  const HORAS = Array.from({ length: SLOTS / SLOTS_POR_HORA }, (_, i) => ventana.desde / SLOTS_POR_HORA + i);
  const slotAHora = (slot) => slotAbsAHora(slot + ventana.desde);

  // Slot clickeado a la espera de que el usuario elija tipo de programación
  // en SlotAccionesMenu (null = menú cerrado) -- guarda fecha/hora + el
  // <button> que se clickeó (anchorEl del menú) en vez de disparar
  // onSlotClick directo, porque ahora una celda sirve a los 2 flujos de
  // creación que antes solo vivían en ProgramarCirugiaDropdown (encargo
  // explícito: "Programar cirugía" y "Cirugía de urgencia").
  const [slotMenu, setSlotMenu] = useState(null);

  function closeSlotMenu() { setSlotMenu(null); }
  function handleSlotButtonClick(e, fecha, hora) {
    setSlotMenu({ fecha, hora, anchorEl: e.currentTarget });
  }
  function handleProgramarCirugia() {
    if (!slotMenu) return;
    onSlotClick?.(slotMenu.fecha, slotMenu.hora, 'cirugia');
    closeSlotMenu();
  }
  function handleCirugiaUrgencia() {
    if (!slotMenu) return;
    onSlotClick?.(slotMenu.fecha, slotMenu.hora, 'urgencia');
    closeSlotMenu();
  }

  return (
    <div className="as-wrap">
      <div className="psc-agenda-nav">
        <div className="psc-agenda-nav-date">
          <button type="button" className="psc-agenda-nav-btn" aria-label={navPrevLabel} onClick={onPrevWeek}>
            <LuChevronLeft className="icon" />
          </button>
          <span className="psc-agenda-nav-label">{label}</span>
          <button type="button" className="psc-agenda-nav-btn" aria-label={navNextLabel} onClick={onNextWeek}>
            <LuChevronRight className="icon" />
          </button>
        </div>

        <FiltrosBar
          sedeId={sedeId}
          salaId={salaId}
          onSalaChange={onSalaChange}
          estado={estado}
          onEstadoChange={onEstadoChange}
          vista={vista}
          onChangeVista={onChangeVista}
          jornada={jornada}
          onJornada={onJornada}
          diasVista={diasVista}
          onDiasVista={onDiasVista}
        />
      </div>

      <div className="as-scroll">
        <div
          className="as-grid"
          style={{
            gridTemplateColumns: `64px repeat(${days.length}, minmax(130px, 1fr))`,
            gridTemplateRows: `56px repeat(${SLOTS}, 30px)`,
          }}
        >
          <div className="as-corner" />

          {days.map((d, i) => (
            <div key={d.fecha} className={`as-day-head${d.isToday ? ' today' : ''}`} style={{ gridColumn: i + 2 }}>
              <span className="as-day-label">{d.label}</span>
              <span className="as-day-num">{d.dayNum}</span>
            </div>
          ))}

          {HORAS.map((h, i) => (
            <div
              key={h}
              className={`as-hour-label${i === 0 ? ' first' : ''}`}
              style={{ gridRow: `${i * SLOTS_POR_HORA + 2} / span ${SLOTS_POR_HORA}` }}
            >
              {String(h).padStart(2, '0')}:00
            </div>
          ))}

          {days.flatMap((d, dayIdx) => Array.from({ length: SLOTS }, (_, slot) => (
            <button
              key={`${d.fecha}-${slot}`}
              type="button"
              className={`as-slot${d.isToday ? ' today' : ''}${slot % SLOTS_POR_HORA === 0 ? ' hour-start' : ''}`}
              style={{ gridColumn: dayIdx + 2, gridRow: slot + 2 }}
              onClick={(e) => handleSlotButtonClick(e, d.fecha, slotAHora(slot))}
              aria-haspopup="menu"
              aria-label={`Programar cirugía ${d.dayNum} ${slotAHora(slot)}`}
            >
              <span className="as-add-hint" aria-hidden="true">+ Programar</span>
            </button>
          )))}

          {cirugias.map((c) => {
            const dayIdx = days.findIndex((d) => d.fecha === c.fecha);
            if (dayIdx === -1) return null;
            // Se recorta a la ventana visible; una cirugía fuera de ella no se
            // dibuja (sigue existiendo, solo no se ve con esta jornada).
            const inicioAbs = horaASlotAbs(c.horaInicio);
            const finAbs = Math.max(horaASlotAbs(c.horaFin), inicioAbs + 1);
            const desde = Math.max(inicioAbs, ventana.desde);
            const hasta = Math.min(finAbs, ventana.hasta);
            if (hasta <= desde) return null;
            const startSlot = desde - ventana.desde;
            const spanSlots = hasta - desde;
            return (
              <CirugiaCard
                key={c.id}
                cirugia={c}
                selected={c.id === selectedId}
                onClick={() => onSelect(c.id)}
                // <= 1h (2 slots de 30 min, ver SLOTS_POR_HORA): la card no
                // tiene alto para las 4 líneas (horario/paciente/
                // procedimiento/cirujano, ver CirugiaCard.jsx) sin cortarse
                // -- encargo explícito tras ver una cirugía de 60 min
                // desbordando su propia celda. En compacto solo queda el
                // nombre del paciente (el resto ya vive en
                // DetalleCirugiaPanel al seleccionarla, más el tooltip
                // nativo de CirugiaCard con el resumen completo).
                compact={spanSlots <= SLOTS_POR_HORA}
                style={{
                  gridColumn: dayIdx + 2,
                  gridRow: `${startSlot + 2} / span ${spanSlots}`,
                }}
                onEditar={onEditarCirugia}
                onReprogramar={onReprogramarCirugia}
                onMarcarRealizada={onMarcarRealizada}
                onMarcarIncumplida={onMarcarIncumplida}
                onCancelar={onCancelarCirugia}
              />
            );
          })}
        </div>
      </div>

      {slotMenu && (
        <SlotAccionesMenu
          anchorEl={slotMenu.anchorEl}
          onClose={closeSlotMenu}
          onProgramarCirugia={handleProgramarCirugia}
          onCirugiaUrgencia={handleCirugiaUrgencia}
        />
      )}
    </div>
  );
}
