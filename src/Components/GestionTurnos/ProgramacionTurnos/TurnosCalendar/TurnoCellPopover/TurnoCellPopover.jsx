'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './TurnoCellPopover.css';
import {
  AREA_TURNO_LABEL, TIPO_TURNO_META, diaLargoLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import {
  LuCalendarPlus, LuPencil, LuTrash2, LuTriangleAlert, LuUserRoundCog,
} from 'react-icons/lu';

// Popover de detalle al hacer click en una celda con turno/conflicto/
// descanso (encargo explícito: "no abrir inmediatamente un modal si un
// popover contextual es suficiente") — "Sin asignar" no pasa por acá: su
// click abre directo el modal de asignación (ver TurnosCalendar.jsx). Mismo
// contenedor flotante que RowActionsMenu (blanco, radio, sombra) pero más
// ancho porque necesita mostrar detalle, no solo una lista de acciones.
// Autocontenido (click-afuera/Escape) igual que ese menú.
//
// Se porta a document.body con position:fixed (mismo patrón que
// FormSelect.jsx) en vez de position:absolute sobre `anchorEl` (.tc-cell):
// .tc-cell vive dentro de .tc-table-wrap (overflow:auto, ver
// TurnosCalendar.css) — si el popover quedara absoluto ahí, su alto suma al
// scrollHeight de ese contenedor y genera scroll + espacio en blanco de más
// cada vez que se abre cerca del final de la tabla (bug real encontrado en
// la última fila del calendario).
export default function TurnoCellPopover({
  estado, cell, nurse, day, dayIdx, getAnchorEl, onClose, onEditar, onReasignar, onEliminar, onResolverConflicto, onAsignar, onEditarDescanso,
}) {
  const rootRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useLayoutEffect(() => {
    const anchorEl = getAnchorEl();
    if (!anchorEl) return undefined;
    function updateCoords() {
      const rect = anchorEl.getBoundingClientRect();
      setCoords({ top: rect.bottom + 6, left: rect.left });
    }
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Anti-corte contra el borde inferior del viewport: `updateCoords` de
  // arriba siempre ancla debajo de la celda sin saber cuánto mide el
  // popover (todavía no está montado la primera vez que corre). Acá, ya con
  // el popover real en el DOM, si su borde inferior se pasa del viewport se
  // reubica arriba de la celda (o se clampea contra el viewport si tampoco
  // entra arriba) — mismo problema que resolvía top:calc(100%+6px) antes de
  // portarse a document.body, pero ahora sin la ayuda del flujo normal.
  useLayoutEffect(() => {
    if (!coords || !rootRef.current) return;
    const anchorEl = getAnchorEl();
    if (!anchorEl) return;
    const margin = 8;
    const popRect = rootRef.current.getBoundingClientRect();
    const overflowBottom = popRect.bottom - (window.innerHeight - margin);
    if (overflowBottom <= 0) return;
    const anchorRect = anchorEl.getBoundingClientRect();
    const height = popRect.height;
    const spaceAbove = anchorRect.top - margin;
    const top = spaceAbove >= height
      ? anchorRect.top - height - 6
      : Math.max(margin, window.innerHeight - height - margin);
    if (Math.abs(top - coords.top) > 0.5) {
      setCoords((c) => ({ ...c, top }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) onClose();
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const fecha = diaLargoLabel(day, dayIdx);

  if (!coords) return null;

  return createPortal(
    <div
      className="tc-popover"
      ref={rootRef}
      style={{ top: coords.top, left: coords.left }}
      role="dialog"
      aria-label="Detalle del turno"
      onClick={(e) => e.stopPropagation()}
    >
      {estado === 'turno' && !cell.conflicto && (
        <>
          <div className="tc-popover-title">Turno de {TIPO_TURNO_META[cell.tipo].label.toLowerCase()}</div>
          <div className="tc-popover-name">{nurse.nombre}</div>
          <div className="tc-popover-line">{fecha}</div>
          <div className="tc-popover-line">{cell.horario}</div>
          <div className="tc-popover-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={onEditar}>
              <LuPencil className="icon" aria-hidden="true" />
              Editar turno
            </button>
            <button type="button" className="tc-popover-link" onClick={onReasignar}>
              <LuUserRoundCog className="icon" aria-hidden="true" />
              Reasignar turno
            </button>
            <button type="button" className="tc-popover-link danger" onClick={onEliminar}>
              <LuTrash2 className="icon" aria-hidden="true" />
              Eliminar turno
            </button>
          </div>
        </>
      )}

      {estado === 'turno' && cell.conflicto && (
        <>
          <div className="tc-popover-title danger">Conflicto de programación</div>
          <div className="tc-popover-name">{nurse.nombre}</div>

          <div className="tc-popover-section">
            <div className="tc-popover-label">Turno actual</div>
            <div className="tc-popover-line">{cell.horario}</div>
          </div>
          <div className="tc-popover-section">
            <div className="tc-popover-label danger">Problema</div>
            <div className="tc-popover-line">{cell.conflictoNota}</div>
          </div>
          {cell.conflictoOtro && (
            <div className="tc-popover-section">
              <div className="tc-popover-label">Otra asignación</div>
              <div className="tc-popover-line">{cell.conflictoOtro.horario}</div>
              <div className="tc-popover-line">Área operativa: {AREA_TURNO_LABEL[cell.conflictoOtro.area]}</div>
            </div>
          )}

          <div className="tc-popover-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={onResolverConflicto}>
              <LuTriangleAlert className="icon" aria-hidden="true" />
              Resolver conflicto
            </button>
            <button type="button" className="tc-popover-link" onClick={onEditar}>
              <LuPencil className="icon" aria-hidden="true" />
              Editar turno
            </button>
            <button type="button" className="tc-popover-link" onClick={onReasignar}>
              <LuUserRoundCog className="icon" aria-hidden="true" />
              Reasignar turno
            </button>
          </div>
        </>
      )}

      {estado === 'descanso' && (
        <>
          <div className="tc-popover-title">Descanso programado</div>
          <div className="tc-popover-line"><b>Enfermera:</b> {nurse.nombre}</div>
          <div className="tc-popover-line"><b>Fecha:</b> {fecha}</div>
          <div className="tc-popover-actions">
            <button type="button" className="tc-popover-link" onClick={onEditarDescanso}>
              <LuPencil className="icon" aria-hidden="true" />
              Editar descanso
            </button>
            <button type="button" className="tc-popover-link" onClick={onAsignar}>
              <LuCalendarPlus className="icon" aria-hidden="true" />
              Asignar turno
            </button>
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
