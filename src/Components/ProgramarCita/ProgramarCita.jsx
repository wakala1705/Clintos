'use client';

import { useEffect, useRef, useState } from 'react';
import './ProgramarCita.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { initNuevaCita } from '@/hooks/NuevaCita/legacy-nueva-cita';
import { APPOINTMENTS, DOCTORS, SPECIALTIES, todayDayIndex, weekDays } from '@/hooks/ProgramarCita/agendaMockData';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import MiniCalendar from '@/Components/ProgramarCita/MiniCalendar/MiniCalendar';
import ContractPanel from '@/Components/ProgramarCita/ContractPanel/ContractPanel';
import AgendaToolbar from '@/Components/ProgramarCita/AgendaToolbar/AgendaToolbar';
import ScheduleGrid from '@/Components/ProgramarCita/ScheduleGrid/ScheduleGrid';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import DetalleCitaModal from '@/Components/ProgramarCita/DetalleCitaModal/DetalleCitaModal';
import RangoDropdown from '@/Components/ProgramarCita/RangoDropdown/RangoDropdown';
import { LuPlus, LuSearch, LuSettings } from 'react-icons/lu';

// Vista "Por especialidad" muestra un solo día (el miércoles de la semana
// visible), igual que el mockup de referencia — el usuario ya filtró a una
// especialidad, no necesita ver toda la semana de cada médico.
const ESPECIALIDAD_DAY_ID = 2;

export default function ProgramarCita() {
  // Esta página no tiene banner/contrato/agenda ligados a "el paciente
  // activo" (a diferencia de AsignacionCitas) — el ref solo existe para que
  // el wizard compartido tenga dónde guardar el paciente elegido mientras
  // dura el flujo de agendamiento. Ver initNuevaCita en
  // src/hooks/NuevaCita/legacy-nueva-cita.js.
  const nuevaCitaPatientRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    const cleanupNuevaCita = initNuevaCita({
      getPatient: () => nuevaCitaPatientRef.current,
      setPatient: (patient) => { nuevaCitaPatientRef.current = patient; },
    });
    return () => {
      cleanupChrome?.();
      cleanupNuevaCita?.();
    };
  }, []);

  const [vista, setVista] = useState('medico');
  const [rango, setRango] = useState('dia');
  const [doctorId, setDoctorId] = useState(DOCTORS[0].id);
  const [especialidadId, setEspecialidadId] = useState(SPECIALTIES[0].id);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // El médico seleccionado siempre debe pertenecer a la especialidad activa
  // (selector de médico "relacionado" a la especialidad, ver AgendaToolbar):
  // si la nueva especialidad no incluye al médico actual, se cae al primero
  // de la lista en vez de dejar un médico de otra especialidad seleccionado.
  function handleChangeEspecialidad(id) {
    setEspecialidadId(id);
    const doctoresDeEsp = DOCTORS.filter((d) => d.especialidadId === id);
    if (!doctoresDeEsp.some((d) => d.id === doctorId)) {
      setDoctorId(doctoresDeEsp[0]?.id ?? doctorId);
    }
  }

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

        <Topbar
          section="Consulta Externa"
          page="Programar cita"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

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
              <button type="button" className="btn btn-primary" onClick={() => window.ncOpen()}><LuPlus className="icon" />Agendar cita</button>
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
                onChangeEspecialidadId={handleChangeEspecialidad}
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

      <NuevaCitaFlow />
      <DetalleCitaModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />

      <div className="pc-toast">
        <span className="pc-toast-dot"></span>
        <span>Cita agendada</span>
      </div>
    </div>
  );
}
