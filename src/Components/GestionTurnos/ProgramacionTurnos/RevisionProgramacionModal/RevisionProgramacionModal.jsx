'use client';

import { useState } from 'react';
import './RevisionProgramacionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import {
  LuCheck, LuClipboardCheck, LuTriangleAlert, LuUserRoundX, LuUsers,
} from 'react-icons/lu';

// "Revisar programación" (encargo sección 9) — reutiliza el mismo `resumen`
// que ya alimenta el footer del calendario (enfermeras/turnos/sin asignar/
// conflictos), acá mostrado como checklist con un veredicto único arriba.
// Sin conflictos ni sin-asignar → listo para publicar; si hay algo
// pendiente, "Publicar programación" ni se muestra (encargo explícito: solo
// deja volver al calendario a resolverlo) — las filas de problema son además
// accionables: clickearlas cierra la revisión y filtra el calendario por
// ese mismo problema (`onVerEnCalendario`, mismo filtro que ya disparaban
// los contadores del footer del calendario).
//
// Publicar pide una confirmación explícita (encargo sección 10: "¿Publicar
// programación?") antes de ejecutar — `confirmando` alterna el body/footer
// a esa vista sin cerrar el modal; Cancelar vuelve al checklist, no a la
// grilla.
export default function RevisionProgramacionModal({
  resumen, onClose, onPublicar, onVerEnCalendario,
}) {
  const [confirmando, setConfirmando] = useState(false);
  const listo = resumen.sinAsignar === 0 && resumen.conflictos === 0;

  if (confirmando) {
    return (
      <div className="modal-overlay open">
        <div className="modal-card rpm-modal-card" role="dialog" aria-modal="true" aria-labelledby="rpm-confirm-title">
          <ModalHeader
            icon={LuClipboardCheck}
            tone="primary"
            title="¿Publicar programación?"
            titleId="rpm-confirm-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <p className="rpm-confirm-text">
              Al publicar, los turnos quedarán disponibles para el personal seleccionado.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmando(false)}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={onPublicar}>Publicar programación</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card rpm-modal-card" role="dialog" aria-modal="true" aria-labelledby="rpm-title">
        <ModalHeader
          icon={LuClipboardCheck}
          tone={listo ? 'primary' : 'warning'}
          title="Revisión de programación"
          titleId="rpm-title"
          onClose={onClose}
        />
        <div className="modal-body">
          <div className={`rpm-status ${listo ? 'ready' : 'pending'}`}>
            {listo ? 'Listo para publicar' : 'Hay elementos pendientes'}
          </div>

          <div className="rpm-list">
            <div className="rpm-row ok">
              <LuUsers className="icon" aria-hidden="true" />
              {resumen.enfermeras} {resumen.enfermeras === 1 ? 'enfermera' : 'enfermeras'}
            </div>
            <div className="rpm-row ok">
              <LuCheck className="icon" aria-hidden="true" />
              {resumen.turnos} turnos asignados
            </div>
            <button
              type="button"
              className={`rpm-row ${resumen.sinAsignar === 0 ? 'ok' : 'warn'}${resumen.sinAsignar > 0 ? ' clickable' : ''}`}
              disabled={resumen.sinAsignar === 0}
              onClick={() => onVerEnCalendario('sin-asignar')}
            >
              {resumen.sinAsignar === 0 ? <LuCheck className="icon" aria-hidden="true" /> : <LuUserRoundX className="icon" aria-hidden="true" />}
              {resumen.sinAsignar} {resumen.sinAsignar === 1 ? 'día sin asignar' : 'días sin asignar'}
            </button>
            <button
              type="button"
              className={`rpm-row ${resumen.conflictos === 0 ? 'ok' : 'warn'}${resumen.conflictos > 0 ? ' clickable' : ''}`}
              disabled={resumen.conflictos === 0}
              onClick={() => onVerEnCalendario('con-conflicto')}
            >
              {resumen.conflictos === 0 ? <LuCheck className="icon" aria-hidden="true" /> : <LuTriangleAlert className="icon" aria-hidden="true" />}
              {resumen.conflictos} {resumen.conflictos === 1 ? 'conflicto' : 'conflictos'}
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Volver al calendario</button>
          {listo && (
            <button type="button" className="btn btn-primary" onClick={() => setConfirmando(true)}>Publicar programación</button>
          )}
        </div>
      </div>
    </div>
  );
}
