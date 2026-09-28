'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './CerrarTurnoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { cerrarTurno } from '@/hooks/Turno/turno';
import { PACIENTES_PISO } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import { TAREAS } from '@/hooks/GestionEnfermeria/mockTareasData';
import { LuAlarmClockCheck, LuClock, LuTriangleAlert } from 'react-icons/lu';

// Cuenta real, no inventada: pacientes con medicación pendiente (Panel
// General) y tareas pendientes (Tareas de Enfermería) -- mismos mocks que ya
// alimentan esas pantallas, no un número aparte que pueda desincronizarse.
const MEDICAMENTOS_PENDIENTES = PACIENTES_PISO.filter((p) => p.estadoMedicacion === 'pendiente').length;
const TAREAS_PENDIENTES = TAREAS.filter((t) => t.estado === 'pendiente').length;

// Confirmación de cierre de turno -- se abre desde
// @/Components/TurnoActivoButton al elegir "Cerrar turno" en su dropdown.
// Chrome propio (.ctm-*), mismo criterio que SedePickerModal/
// AreaFuncionalPickerModal: se monta desde el Topbar (app-wide), no puede
// depender de .modal-overlay/.modal-card de ninguna feature en particular.
// Solo hace UNA cosa (confirmar o cancelar el cierre); el detalle de
// contexto (unidad, horario, hora real de apertura) ya se consultó en el
// dropdown de @/Components/TurnoActivoButton, así que acá no se repite.
export default function CerrarTurnoModal({ turnoActivo, onClose }) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleConfirmarCierre() {
    cerrarTurno();
    onClose();
    router.push('/home');
  }

  const { unidad, turno } = turnoActivo;
  const hayPendientes = MEDICAMENTOS_PENDIENTES > 0 || TAREAS_PENDIENTES > 0;

  return (
    <div
      className="ctm-overlay"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="ctm-modal" role="dialog" aria-modal="true" aria-labelledby="ctm-title">
        <ModalHeader
          icon={LuTriangleAlert}
          tone="warning"
          title="¿Cerrar turno?"
          titleId="ctm-title"
          onClose={onClose}
          closeLabel="Cancelar cierre de turno"
        />

        <div className="ctm-body">
          <p className="ctm-lead">Estás por finalizar tu turno de enfermería.</p>
          <span className="ctm-context-chip">
            <LuClock aria-hidden="true" />
            {unidad.label} · {turno.label}
          </span>

          {hayPendientes && (
            <div className="ctm-warning-note">
              <p className="ctm-warning-title">Antes de cerrar, revisa las actividades pendientes.</p>
              <ul className="ctm-warning-list">
                {MEDICAMENTOS_PENDIENTES > 0 && (
                  <li>
                    <LuTriangleAlert className="icon" aria-hidden="true" />
                    {MEDICAMENTOS_PENDIENTES} {MEDICAMENTOS_PENDIENTES === 1 ? 'medicamento pendiente' : 'medicamentos pendientes'}
                  </li>
                )}
                {TAREAS_PENDIENTES > 0 && (
                  <li>
                    <LuTriangleAlert className="icon" aria-hidden="true" />
                    {TAREAS_PENDIENTES} {TAREAS_PENDIENTES === 1 ? 'tarea pendiente' : 'tareas pendientes'}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="ctm-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" icon={LuAlarmClockCheck} onClick={handleConfirmarCierre}>Cerrar turno</Button>
        </div>
      </div>
    </div>
  );
}
