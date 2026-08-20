'use client';

import { useEffect, useRef } from 'react';
import './TurnoCellPopover.css';
import {
  AREA_TURNO_LABEL, TIPO_TURNO_META, diaLargoLabel,
} from '@/hooks/GestionEnfermeria/mockTurnosData';
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
export default function TurnoCellPopover({
  estado, cell, nurse, day, dayIdx, onClose, onEditar, onReasignar, onEliminar, onResolverConflicto, onAsignar, onEditarDescanso,
}) {
  const rootRef = useRef(null);

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

  return (
    <div className="tc-popover" ref={rootRef} role="dialog" aria-label="Detalle del turno" onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
}
