'use client';

import { useRef } from 'react';
import './TurnosCalendar.css';
import TurnoCellPopover from './TurnoCellPopover/TurnoCellPopover';
import { AREA_TURNO_LABEL, TIPO_TURNO_META, diaLargoLabel } from '@/hooks/GestionEnfermeria/mockTurnosData';
import { LuMoon, LuSun, LuSunrise, LuTriangleAlert } from 'react-icons/lu';

// Ícono propio por tipo de turno (mañana/tarde/noche) — el color de la
// tarjeta (ver .tc-turno-manana/tarde/noche en TurnosCalendar.css) nunca es
// el único indicador: el ícono + la etiqueta de texto ya distinguen el tipo
// sin depender de percibir el matiz exacto (encargo explícito + criterio
// WCAG ya usado en el resto de badges de este feature, ver PatientsTable.jsx
// ESTADO_ICONO).
const TIPO_ICONO = { manana: LuSunrise, tarde: LuSun, noche: LuMoon };

// Matriz enfermera x día (filas=enfermeras, columnas=días, ver
// TurnosEnfermeria.jsx). Tabla real (no una grilla de <div>s) porque el
// contenido es genuinamente tabular — fila=recurso, columna=día — y así el
// lector de pantalla anuncia "María González, columna Miércoles 20" al
// enfocar una celda, igual que cualquier otra `.data-table` del proyecto.
// La primera columna (ENFERMERA) y el thead quedan `position:sticky` (ver
// TurnosCalendar.css) para que ambos ejes de scroll (horizontal por días,
// vertical por cantidad de enfermeras) mantengan siempre visible "quién" y
// "qué día es cada columna".
//
// Progressive disclosure (encargo explícito) en 3 capas, sin tocar el alto
// de fila en reposo:
//  1. Reposo: la tarjeta compacta de siempre (tipo + horario / "Descanso" /
//     "Sin asignar").
//  2. Hover/foco: un panel `position:absolute` (.tc-hover-panel) que cubre
//     la misma celda y crece hacia abajo con info secundaria + 1-2 acciones
//     rápidas — al no estar en flujo normal, no empuja el resto de la fila
//     ni de la tabla (ver AGENTS.md-style comment en TurnosCalendar.css).
//  3. Click: popover contextual con el detalle completo + las 2-3 acciones
//     del estado (TurnoCellPopover) — "Sin asignar" es la excepción: su
//     click abre directo AsignarTurnoModal, no hay paso intermedio de
//     popover (encargo explícito).
export default function TurnosCalendar({
  nurses, days, schedule, selectedCell,
  onOpenPopover, onClosePopover, onOpenAsignar, onEditar, onReasignar, onEliminar, onResolverConflicto, onEditarDescanso,
}) {
  // Ancla de TurnoCellPopover (ver ese componente para el porqué de
  // position:fixed + portal a document.body en vez de position:absolute
  // sobre .tc-cell) — .tc-cell siempre se renderiza haya o no popover
  // abierto, así que su ref ya existe para cuando `isOpen` pasa a true.
  const cellRefs = useRef({});

  return (
    <div className="tc-table-wrap">
      <table className="tc-table">
        <thead>
          <tr>
            <th className="tc-col-nurse">Enfermera</th>
            {days.map((d, i) => (
              <th key={i} className={`tc-col-day${d.isToday ? ' today' : ''}`}>
                <span className="tc-day-label">{d.label}</span>
                <span className="tc-day-num">{d.dayNum}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nurses.map((n) => (
            <tr key={n.id}>
              <td className="tc-col-nurse">
                <div className="tc-nurse">
                  <span className="tc-avatar" aria-hidden="true">{n.iniciales}</span>
                  <div className="tc-nurse-id">
                    <span className="tc-name">{n.nombre}</span>
                    <span className="tc-role">{n.cargo}</span>
                  </div>
                </div>
              </td>
              {schedule[n.id].map((cell, dayIdx) => {
                const isOpen = selectedCell?.nurseId === n.id && selectedCell?.dayIdx === dayIdx;
                const fecha = diaLargoLabel(days[dayIdx], dayIdx);

                const cellKey = `${n.id}-${dayIdx}`;

                return (
                  <td key={dayIdx} className={`tc-col-day${days[dayIdx].isToday ? ' today' : ''}`}>
                    <div className="tc-cell" ref={(el) => { cellRefs.current[cellKey] = el; }}>
                      {cell.estado === 'turno' && (() => {
                        const meta = TIPO_TURNO_META[cell.tipo];
                        const Icon = cell.conflicto ? LuTriangleAlert : TIPO_ICONO[cell.tipo];
                        const toneClass = `tc-turno-${cell.tipo}${cell.conflicto ? ' conflicto' : ''}`;
                        return (
                          <>
                            <div
                              className={`tc-turno ${toneClass}${isOpen ? ' selected' : ''}`}
                              tabIndex={0}
                              role="button"
                              aria-haspopup="dialog"
                              aria-expanded={isOpen}
                              onClick={() => onOpenPopover(n.id, dayIdx)}
                              onKeyDown={(e) => {
                                if (e.key !== 'Enter' && e.key !== ' ') return;
                                e.preventDefault();
                                onOpenPopover(n.id, dayIdx);
                              }}
                            >
                              <span className="tc-turno-tipo">
                                <Icon className="icon" aria-hidden="true" />
                                {meta.label}
                              </span>
                              <span className="tc-turno-horario">{cell.horario}</span>
                            </div>

                            <div className={`tc-hover-panel tc-turno ${toneClass}`} onClick={() => onOpenPopover(n.id, dayIdx)}>
                              <span className="tc-turno-tipo">
                                <Icon className="icon" aria-hidden="true" />
                                {meta.label}
                              </span>
                              <span className="tc-turno-horario">{cell.horario}</span>
                              {cell.conflicto ? (
                                <>
                                  <div className="tc-hover-title">Conflicto de programación</div>
                                  <div className="tc-hover-sub">{cell.conflictoNota}</div>
                                  <div className="tc-hover-actions">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); onOpenPopover(n.id, dayIdx); }}>Ver conflicto</button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="tc-hover-title">{n.nombre}</div>
                                  <div className="tc-hover-sub">{n.cargo}</div>
                                  <div className="tc-hover-actions">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); onEditar(n.id, dayIdx); }}>Editar</button>
                                    <span className="sep" aria-hidden="true">·</span>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); onReasignar(n.id, dayIdx); }}>Reasignar</button>
                                  </div>
                                </>
                              )}
                            </div>

                            {isOpen && (
                              <TurnoCellPopover
                                estado="turno"
                                cell={cell}
                                nurse={n}
                                day={days[dayIdx]}
                                dayIdx={dayIdx}
                                getAnchorEl={() => cellRefs.current[cellKey]}
                                onClose={onClosePopover}
                                onEditar={() => onEditar(n.id, dayIdx)}
                                onReasignar={() => onReasignar(n.id, dayIdx)}
                                onEliminar={() => onEliminar(n.id, dayIdx)}
                                onResolverConflicto={() => onResolverConflicto(n.id, dayIdx)}
                              />
                            )}
                          </>
                        );
                      })()}

                      {cell.estado === 'descanso' && (
                        <>
                          <div
                            className={`tc-descanso${isOpen ? ' selected' : ''}`}
                            tabIndex={0}
                            role="button"
                            aria-haspopup="dialog"
                            aria-expanded={isOpen}
                            onClick={() => onOpenPopover(n.id, dayIdx)}
                            onKeyDown={(e) => {
                              if (e.key !== 'Enter' && e.key !== ' ') return;
                              e.preventDefault();
                              onOpenPopover(n.id, dayIdx);
                            }}
                          >
                            Descanso
                          </div>

                          <div className="tc-hover-panel tc-hover-descanso" onClick={() => onOpenPopover(n.id, dayIdx)}>
                            <div className="tc-hover-title">Descanso</div>
                            <div className="tc-hover-sub">{n.nombre}</div>
                            <div className="tc-hover-sub">{fecha}</div>
                            <div className="tc-hover-actions">
                              <button type="button" onClick={(e) => { e.stopPropagation(); onOpenPopover(n.id, dayIdx); }}>Ver detalle</button>
                              <span className="sep" aria-hidden="true">·</span>
                              <button type="button" onClick={(e) => { e.stopPropagation(); onEditarDescanso(n.id, dayIdx); }}>Editar</button>
                            </div>
                          </div>

                          {isOpen && (
                            <TurnoCellPopover
                              estado="descanso"
                              cell={cell}
                              nurse={n}
                              day={days[dayIdx]}
                              dayIdx={dayIdx}
                              getAnchorEl={() => cellRefs.current[cellKey]}
                              onClose={onClosePopover}
                              onEditarDescanso={() => onEditarDescanso(n.id, dayIdx)}
                              onAsignar={() => onOpenAsignar(n.id, dayIdx, { reemplazaDescanso: true })}
                            />
                          )}
                        </>
                      )}

                      {cell.estado === 'vacio' && (
                        <>
                          <button type="button" className="tc-vacio" onClick={() => onOpenAsignar(n.id, dayIdx)}>
                            Sin asignar
                          </button>

                          <div className="tc-hover-panel tc-hover-vacio" onClick={() => onOpenAsignar(n.id, dayIdx)}>
                            <div className="tc-hover-title">Sin asignar</div>
                            <div className="tc-hover-sub">{fecha}</div>
                            <div className="tc-hover-sub">Área operativa: {AREA_TURNO_LABEL[n.area]}</div>
                            <div className="tc-hover-actions">
                              <button type="button" onClick={(e) => { e.stopPropagation(); onOpenAsignar(n.id, dayIdx); }}>Asignar turno</button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {nurses.length === 0 && (
        <div className="tc-table-empty">Ningún resultado con los filtros actuales.</div>
      )}
    </div>
  );
}
