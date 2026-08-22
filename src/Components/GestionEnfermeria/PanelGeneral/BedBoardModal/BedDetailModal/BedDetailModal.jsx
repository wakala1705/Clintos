'use client';

import { useEffect } from 'react';
import './BedDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import EstadoCamaBadge from '@/Components/GestionCamas/EstadoCamaBadge/EstadoCamaBadge';
import {
  AREAS_OPERATIVAS, ESTADO_MEDICACION_LABEL, PACIENTES_PISO, sectorDeCama,
} from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import {
  LuArrowLeftRight, LuBedDouble, LuCalendarCheck, LuCalendarClock, LuCalendarX,
  LuClipboardList, LuFileText, LuLock, LuLockOpen, LuLogOut, LuPill, LuSparkles,
  LuUserPlus, LuWrench,
} from 'react-icons/lu';

// Grupo de acciones por estado (encargo explícito: "el grupo de acciones va
// a depender del estado de la cama") — a diferencia de MENU_ACCIONES
// (mockCamasData.js, usado por el ⋯ de BedCard), esta lista es propia de
// Enfermería: acciones clínicas/de piso (historia clínica, medicación,
// traslado, alta...) en vez del vocabulario de logística de camas de
// Gestión de Camas (reservar/tipo/sede...), que no tiene sentido acá. Solo
// "Ver Historia Clínica" navega de verdad (mismo `onOpenAtencion` que ya usa
// la tabla "Pacientes en piso", ver PatientsTable.jsx); el resto dispara el
// mismo aviso "en desarrollo" que el resto de acciones sin pantalla propia
// en este módulo, hasta que existan.
const ACCIONES_POR_ESTADO = {
  ocupada: [
    { action: 'ver-historia', label: 'Ver Historia Clínica', icon: LuFileText, primary: true },
    { action: 'ver-medicacion', label: 'Ver medicación', icon: LuPill },
    { action: 'ordenes-medicas', label: 'Órdenes Médicas', icon: LuClipboardList },
    { action: 'gestionar-traslado', label: 'Gestionar traslado', icon: LuArrowLeftRight },
    { action: 'programar-alta', label: 'Programar alta', icon: LuLogOut },
    { action: 'solicitar-limpieza', label: 'Solicitar limpieza', icon: LuSparkles },
  ],
  libre: [
    { action: 'asignar-paciente', label: 'Asignar paciente', icon: LuUserPlus, primary: true },
    { action: 'reservar', label: 'Reservar cama', icon: LuCalendarClock },
    { action: 'reportar-mantenimiento', label: 'Reportar mantenimiento', icon: LuWrench },
    { action: 'bloquear', label: 'Bloquear cama', icon: LuLock },
  ],
  reservada: [
    { action: 'utilizar-reserva', label: 'Utilizar reserva', icon: LuCalendarCheck, primary: true },
    { action: 'cancelar-reserva', label: 'Cancelar reserva', icon: LuCalendarX },
  ],
  limpieza: [
    { action: 'finalizar-limpieza', label: 'Finalizar limpieza', icon: LuSparkles, primary: true },
  ],
  mantenimiento: [
    { action: 'finalizar-mantenimiento', label: 'Finalizar mantenimiento', icon: LuWrench, primary: true },
  ],
  bloqueada: [
    { action: 'desbloquear', label: 'Desbloquear cama', icon: LuLockOpen, primary: true },
  ],
};

// Punto/color por estado de medicación — mismo idioma visual que la
// leyenda del footer (.bb-legend-dot, ver BedBoardModal.css, ya cargado por
// el padre que siempre monta este modal) en vez de una píldora de color
// nueva.
const MEDICACION_COLOR = {
  'al-dia': 'green', pendiente: 'amber', retrasada: 'red', 'no-aplica': 'gray',
};

function iniciales(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function BedDetailModal({
  cama, onClose, onAction, onOpenAtencion,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // `cama.paciente.hc` es el mismo HC que `PACIENTES_PISO[].id` (ver
  // mockBedBoardData.js: `hc: p.id` al derivar CAMAS_PISO) — una sola
  // fuente de verdad para el paciente, nunca 2 registros que puedan
  // desincronizarse entre sí.
  const pacienteCompleto = cama.paciente
    ? PACIENTES_PISO.find((p) => p.id === cama.paciente.hc)
    : null;
  const sectorLabel = AREAS_OPERATIVAS.find((a) => a.value === sectorDeCama(cama.numero))?.label;
  const acciones = ACCIONES_POR_ESTADO[cama.estado] ?? [];

  function handleActionClick(action) {
    if (action === 'ver-historia' && pacienteCompleto) {
      onClose();
      onOpenAtencion(pacienteCompleto.id);
      return;
    }
    onAction(action, cama.id);
  }

  return (
    <div className="modal-overlay open" role="presentation" onClick={onClose}>
      <div
        className="modal-card bdm-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bed-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={LuBedDouble}
          tone="primary"
          title="Detalle de cama"
          titleId="bed-detail-title"
          onClose={onClose}
        />

        <div className="modal-body">
          <div className="bdm-summary">
            <div>
              <div className="bdm-summary-title">Cama {cama.numero}</div>
              <div className="bdm-summary-sub">{sectorLabel}</div>
            </div>
            <EstadoCamaBadge estado={cama.estado} />
          </div>

          {pacienteCompleto ? (
            <>
              <div className="bdm-patient">
                <span className="bdm-avatar">{iniciales(pacienteCompleto.paciente)}</span>
                <div>
                  <div className="bdm-patient-nombre">{pacienteCompleto.paciente}</div>
                  <div className="bdm-patient-hc">{pacienteCompleto.id}</div>
                </div>
              </div>

              <div className="dp-info">
                <div className="dp-info-row">
                  <span className="k">Edad</span>
                  <span className="v">{pacienteCompleto.edad} años</span>
                </div>
                <div className="dp-info-row">
                  <span className="k">Diagnóstico</span>
                  <span className="v">{pacienteCompleto.diagnostico}</span>
                </div>
                <div className="dp-info-row">
                  <span className="k">Admisión</span>
                  <span className="v">{pacienteCompleto.admision}</span>
                </div>
                <div className="dp-info-row">
                  <span className="k">Días hospitalizado</span>
                  <span className="v">{pacienteCompleto.diasEstancia} días</span>
                </div>
                <div className="dp-info-row">
                  <span className="k">Medicación</span>
                  <span className="v bdm-med-value">
                    <span className={`bb-legend-dot bb-legend-dot-${MEDICACION_COLOR[pacienteCompleto.estadoMedicacion]}`} />
                    {ESTADO_MEDICACION_LABEL[pacienteCompleto.estadoMedicacion]}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="bdm-empty-context">
              {cama.estado === 'libre'
                ? `Disponible para asignación${cama.ultimaLimpieza ? ` · Última limpieza hoy · ${cama.ultimaLimpieza}` : ''}.`
                : 'Sin información adicional para esta cama.'}
            </div>
          )}

          <div className="bdm-divider" />

          <div className="bdm-actions">
            {acciones.map(({
              action, label, icon: Icon, primary,
            }) => (
              <button
                type="button"
                key={action}
                className={`btn ${primary ? 'btn-primary' : 'btn-outline'} bdm-action-btn`}
                onClick={() => handleActionClick(action)}
              >
                <Icon className="icon" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
