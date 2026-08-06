'use client';

import { useState } from 'react';
import './AgendaToolbar.css';
import { DOCTORS, SPECIALTIES, todayLabel, weekRangeLabel } from '@/hooks/ProgramarCita/agendaMockData';
import { LuChevronLeft, LuChevronRight, LuChevronDown } from 'react-icons/lu';
import SelectorModal from '@/Components/ProgramarCita/SelectorModal/SelectorModal';

// Picker de especialidad/médico: dos botones (no <select> nativos) que abren
// un modal de selección (SelectorModal) — el de médico siempre queda
// acotado a los médicos de la especialidad elegida (ver
// doctoresDeEspecialidad más abajo y handleChangeEspecialidad en
// ProgramarCita.jsx, que resincroniza el médico cuando cambia la especialidad).
export default function AgendaToolbar({
  vista, onChangeVista,
  rango,
  doctorId, onChangeDoctorId,
  especialidadId, onChangeEspecialidadId,
}) {
  const esDia = vista === 'medico' && rango === 'dia';
  const [modalAbierto, setModalAbierto] = useState(null); // 'especialidad' | 'medico' | null

  const especialidadActual = SPECIALTIES.find((s) => s.id === especialidadId);
  const doctorActual = DOCTORS.find((d) => d.id === doctorId);
  const doctoresDeEspecialidad = DOCTORS.filter((d) => d.especialidadId === especialidadId);

  return (
    <div className="pc-toolbar">
      <div className="pc-date-nav">
        <button type="button" className="pc-nav-btn" aria-label={esDia ? 'Día anterior' : 'Semana anterior'}>
          <LuChevronLeft className="icon" />
        </button>
        <span className="pc-date-label">{esDia ? todayLabel() : weekRangeLabel()}</span>
        <button type="button" className="pc-nav-btn" aria-label={esDia ? 'Día siguiente' : 'Semana siguiente'}>
          <LuChevronRight className="icon" />
        </button>
      </div>

      <div className="pc-toolbar-selectors">
        <div className="pc-select-wrap">
          <label id="pc-especialidad-label">Especialidad</label>
          <button
            type="button"
            className="pc-picker-trigger"
            aria-labelledby="pc-especialidad-label"
            onClick={() => setModalAbierto('especialidad')}
          >
            <span>{especialidadActual?.nombre}</span>
            <LuChevronDown className="icon chev" aria-hidden="true" />
          </button>
        </div>

        {vista === 'medico' && (
          <div className="pc-select-wrap">
            <label id="pc-medico-label">Médico</label>
            <button
              type="button"
              className="pc-picker-trigger"
              aria-labelledby="pc-medico-label"
              onClick={() => setModalAbierto('medico')}
            >
              <span>{doctorActual?.nombre}</span>
              <LuChevronDown className="icon chev" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className="pc-view-switch">
        <button
          type="button"
          className={vista === 'medico' ? 'active' : ''}
          onClick={() => onChangeVista('medico')}
        >
          Por médico
        </button>
        <button
          type="button"
          className={vista === 'especialidad' ? 'active' : ''}
          onClick={() => onChangeVista('especialidad')}
        >
          Por especialidad
        </button>
      </div>

      {modalAbierto === 'especialidad' && (
        <SelectorModal
          title="Seleccionar especialidad"
          searchPlaceholder="Buscar por nombre o ID..."
          idHeader="ID"
          nameHeader="Especialidad"
          countHeader="Cantidad de médicos"
          items={SPECIALTIES.map((s) => ({
            id: s.id,
            codigo: s.codigo,
            label: s.nombre,
            count: DOCTORS.filter((d) => d.especialidadId === s.id).length,
          }))}
          selectedId={especialidadId}
          onSelect={onChangeEspecialidadId}
          onClose={() => setModalAbierto(null)}
        />
      )}
      {modalAbierto === 'medico' && (
        <SelectorModal
          title="Seleccionar médico"
          searchPlaceholder="Buscar por nombre o ID..."
          idHeader="ID médico"
          nameHeader="Nombre médico"
          countHeader="Citas disponibles"
          items={doctoresDeEspecialidad.map((d) => ({
            id: d.id, codigo: d.codigo, label: d.nombre, count: d.citasDisponibles,
          }))}
          selectedId={doctorId}
          onSelect={onChangeDoctorId}
          onClose={() => setModalAbierto(null)}
        />
      )}
    </div>
  );
}
