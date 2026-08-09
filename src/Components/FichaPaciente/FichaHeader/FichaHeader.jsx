'use client';

import Link from 'next/link';
import './FichaHeader.css';
import RowActionsMenu from '@/Components/ListaPacientes/PatientsTable/RowActionsMenu/RowActionsMenu';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import { LuArrowLeft, LuCalendarPlus, LuFileText, LuTriangleAlert } from 'react-icons/lu';

const ESTADO_LABEL = { activo: 'Activo', inactivo: 'Inactivo' };

// Header fijo de la ficha: identidad + acciones rápidas. Editar/Inactivar se
// agrupan en el mismo menú "⋯" (RowActionsMenu) que ya usa Lista de
// Pacientes — mismo componente, no una versión nueva del mismo patrón.
export default function FichaHeader({
  patient,
  canViewHistoria,
  canScheduleAppointment,
  canEdit,
  canInactivate,
  onHistoriaClinica,
  onAgendarCita,
  onEditar,
  onInactivar,
}) {
  return (
    <div className="fp-header">
      {patient.estado === 'inactivo' && (
        <div className="fp-inactive-banner">
          <LuTriangleAlert className="icon" />
          Este paciente está inactivo. Algunas acciones pueden estar restringidas.
        </div>
      )}

      <Link href="/lista-pacientes" className="fp-back-link">
        <LuArrowLeft className="icon" />
        Volver a Lista de Pacientes
      </Link>

      <div className="fp-header-row">
        <div className="fp-header-identity">
          <PatientAvatar iniciales={patient.iniciales} className="fp-avatar" />
          <div>
            <h1>{patient.nombre}</h1>
            <div className="fp-header-meta">
              <span>{patient.tipoDocumento} {patient.documento}</span>
              <span className="fp-dot">·</span>
              <span>{patient.edad} años</span>
              <span className="fp-dot">·</span>
              <span className={`estado-badge ${patient.estado}`}>
                <span className="dot"></span>{ESTADO_LABEL[patient.estado]}
              </span>
            </div>
          </div>
        </div>

        <div className="fp-header-actions">
          {canViewHistoria && (
            <button type="button" className="btn btn-secondary" onClick={onHistoriaClinica}>
              <LuFileText className="icon" />Historia clínica
            </button>
          )}
          {canScheduleAppointment && (
            <button type="button" className="btn btn-primary" onClick={onAgendarCita}>
              <LuCalendarPlus className="icon" />Agendar cita
            </button>
          )}
          <RowActionsMenu
            canEdit={canEdit}
            canInactivate={canInactivate && patient.estado === 'activo'}
            onEditar={onEditar}
            onInactivar={onInactivar}
          />
        </div>
      </div>
    </div>
  );
}
