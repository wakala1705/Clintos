'use client';

import { useEffect, useState } from 'react';
import './ProgramarCita.css';
import './shared/shared.css';
import { initProgramarCita } from '@/hooks/ProgramarCita/legacy-programar-cita';
import { APPOINTMENTS, DOCTORS, SPECIALTIES, todayDayIndex, weekDays } from '@/hooks/ProgramarCita/agendaMockData';
import Sidebar from '@/Components/Sidebar/Sidebar';
import UserMenu from '@/Components/UserMenu/UserMenu';
import MiniCalendar from '@/Components/ProgramarCita/MiniCalendar/MiniCalendar';
import ContractPanel from '@/Components/ProgramarCita/ContractPanel/ContractPanel';
import AgendaToolbar from '@/Components/ProgramarCita/AgendaToolbar/AgendaToolbar';
import ScheduleGrid from '@/Components/ProgramarCita/ScheduleGrid/ScheduleGrid';
import NuevaCitaModal from '@/Components/ProgramarCita/NuevaCitaModal/NuevaCitaModal';
import DetalleCitaModal from '@/Components/ProgramarCita/DetalleCitaModal/DetalleCitaModal';
import RangoDropdown from '@/Components/ProgramarCita/RangoDropdown/RangoDropdown';
import { LuMenu, LuPlus, LuSearch, LuSettings } from 'react-icons/lu';

// Vista "Por especialidad" muestra un solo día (el miércoles de la semana
// visible), igual que el mockup de referencia — el usuario ya filtró a una
// especialidad, no necesita ver toda la semana de cada médico.
const ESPECIALIDAD_DAY_ID = 2;

export default function ProgramarCita() {
  useEffect(() => {
    const cleanup = initProgramarCita();
    return cleanup;
  }, []);

  const [vista, setVista] = useState('medico');
  const [rango, setRango] = useState('dia');
  const [doctorId, setDoctorId] = useState(DOCTORS[0].id);
  const [especialidadId, setEspecialidadId] = useState(SPECIALTIES[0].id);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const days = weekDays();

  let columns, appointments, resolveColId;
  if (vista === 'medico') {
    if (rango === 'dia') {
      const todayIdx = todayDayIndex();
      const todayCol = days[todayIdx];
      columns = [{ id: todayCol.id, headerTop: todayCol.nombre, headerBottom: todayCol.fecha }];
      appointments = APPOINTMENTS.filter((a) => a.doctorId === doctorId && a.day === todayIdx);
    } else {
      columns = days.map((d) => ({ id: d.id, headerTop: d.nombre, headerBottom: d.fecha }));
      appointments = APPOINTMENTS.filter((a) => a.doctorId === doctorId);
    }
    resolveColId = (a) => a.day;
  } else {
    const doctoresEspecialidad = DOCTORS.filter((d) => d.especialidadId === especialidadId);
    columns = doctoresEspecialidad.map((d) => ({ id: d.id, headerTop: d.nombre, headerBottom: d.consultorio }));
    appointments = APPOINTMENTS.filter(
      (a) => a.day === ESPECIALIDAD_DAY_ID && doctoresEspecialidad.some((d) => d.id === a.doctorId),
    );
    resolveColId = (a) => a.doctorId;
  }

  return (
    <div className="app">

      <Sidebar />

      <div className="main">

        <header className="topbar">
          <LuMenu className="hamburger icon" />
          <div className="breadcrumb">
            <span>Consulta Externa</span><span className="sep">/</span>
            <span className="current">Programar cita</span>
          </div>
          <div className="spacer"></div>
          <div className="topbar-right">
            <UserMenu name="Manuel Hernández" role="Médico" initials="CG" />
          </div>
        </header>

        <div className="content">

          <div className="pc-page-header">
            <div>
              <h1>Agendamiento · Consulta Externa</h1>
              <p>Gestiona la disponibilidad y las citas de los consultorios activos.</p>
            </div>
            <div className="pc-page-header-actions">
              <button type="button" className="icon-btn-circle" aria-label="Buscar"><LuSearch className="icon" /></button>
              <button type="button" className="icon-btn-circle" aria-label="Configuración"><LuSettings className="icon" /></button>
              {vista === 'medico' && <RangoDropdown value={rango} onChange={setRango} />}
              <button type="button" className="btn btn-primary"><LuPlus className="icon" />Agendar cita</button>
            </div>
          </div>

          <div className="pc-workspace">
            <div className="pc-side-col">
              <MiniCalendar />
              <ContractPanel />
            </div>

            <div className="pc-main-col">
              <AgendaToolbar
                vista={vista}
                onChangeVista={setVista}
                rango={rango}
                doctorId={doctorId}
                onChangeDoctorId={setDoctorId}
                especialidadId={especialidadId}
                onChangeEspecialidadId={setEspecialidadId}
              />
              <ScheduleGrid
                columns={columns}
                appointments={appointments}
                resolveColId={resolveColId}
                onSelectAppointment={setSelectedAppointment}
              />
            </div>
          </div>

        </div>
      </div>

      <NuevaCitaModal open={false} />
      <DetalleCitaModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />

      <div className="pc-toast">
        <span className="pc-toast-dot"></span>
        <span>Cita agendada</span>
      </div>
    </div>
  );
}
