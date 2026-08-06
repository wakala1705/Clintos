'use client';

import './AgendaToolbar.css';
import { DOCTORS, SPECIALTIES, todayLabel, weekRangeLabel } from '@/hooks/ProgramarCita/agendaMockData';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export default function AgendaToolbar({
  vista, onChangeVista,
  rango,
  doctorId, onChangeDoctorId,
  especialidadId, onChangeEspecialidadId,
}) {
  const esDia = vista === 'medico' && rango === 'dia';

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

      {vista === 'medico' ? (
        <div className="pc-select-wrap">
          <label htmlFor="pc-doctor-select">Médico</label>
          <select id="pc-doctor-select" value={doctorId} onChange={(e) => onChangeDoctorId(e.target.value)}>
            {DOCTORS.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre} — {SPECIALTIES.find((s) => s.id === d.especialidadId)?.nombre}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="pc-select-wrap">
          <label htmlFor="pc-especialidad-select">Especialidad</label>
          <select id="pc-especialidad-select" value={especialidadId} onChange={(e) => onChangeEspecialidadId(e.target.value)}>
            {SPECIALTIES.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      )}

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
    </div>
  );
}
