'use client';

import './RevisionProgramacionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import {
  LuCheck, LuClipboardCheck, LuTriangleAlert, LuUserRoundX,
} from 'react-icons/lu';

// "Revisar programación" (encargo sección 7) — reutiliza el mismo `resumen`
// que ya alimenta el footer del calendario (turnos/sin asignar/conflictos),
// acá mostrado como checklist con un veredicto único arriba. Sin conflictos
// ni sin-asignar → listo para publicar; si hay algo pendiente, "Publicar
// programación" ni se muestra (encargo explícito: solo deja volver al
// calendario a resolverlo).
export default function RevisionProgramacionModal({ resumen, onClose, onPublicar }) {
  const listo = resumen.sinAsignar === 0 && resumen.conflictos === 0;

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
              <LuCheck className="icon" aria-hidden="true" />
              {resumen.turnos} turnos programados
            </div>
            <div className={`rpm-row ${resumen.sinAsignar === 0 ? 'ok' : 'warn'}`}>
              {resumen.sinAsignar === 0 ? <LuCheck className="icon" aria-hidden="true" /> : <LuUserRoundX className="icon" aria-hidden="true" />}
              {resumen.sinAsignar} {resumen.sinAsignar === 1 ? 'turno sin asignar' : 'turnos sin asignar'}
            </div>
            <div className={`rpm-row ${resumen.conflictos === 0 ? 'ok' : 'warn'}`}>
              {resumen.conflictos === 0 ? <LuCheck className="icon" aria-hidden="true" /> : <LuTriangleAlert className="icon" aria-hidden="true" />}
              {resumen.conflictos} {resumen.conflictos === 1 ? 'conflicto' : 'conflictos'}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Volver al calendario</button>
          {listo && (
            <button type="button" className="btn btn-primary" onClick={onPublicar}>Publicar programación</button>
          )}
        </div>
      </div>
    </div>
  );
}
