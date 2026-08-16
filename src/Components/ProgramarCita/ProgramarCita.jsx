'use client';

import { useEffect, useRef, useState } from 'react';
import './ProgramarCita.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { initNuevaCita } from '@/hooks/NuevaCita/legacy-nueva-cita';
import {
  addDays, addWeekday, APPOINTMENTS, dateLabel, dayIndexForDate, diffInDays,
  DOCTORS, isSameDate, SPECIALTIES, timeLabel, weekDays, weekRangeLabel,
} from '@/hooks/ProgramarCita/agendaMockData';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import MiniCalendar from '@/Components/ProgramarCita/MiniCalendar/MiniCalendar';
import ContractPanel from '@/Components/ProgramarCita/ContractPanel/ContractPanel';
import AgendaToolbar from '@/Components/ProgramarCita/AgendaToolbar/AgendaToolbar';
import ScheduleGrid from '@/Components/ProgramarCita/ScheduleGrid/ScheduleGrid';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import DetalleCitaModal from '@/Components/ProgramarCita/DetalleCitaModal/DetalleCitaModal';
import RangoDropdown from '@/Components/ProgramarCita/RangoDropdown/RangoDropdown';
import RowHeightDropdown from '@/Components/ProgramarCita/RowHeightDropdown/RowHeightDropdown';
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

  // Citas confirmadas por el wizard "Nueva cita" se agregan acá (ver
  // handleAppointmentConfirmed) — sin esto, "Confirmar cita" cerraba el
  // wizard sin que la agenda reflejara nunca la cita recién creada.
  const [appointmentsList, setAppointmentsList] = useState(APPOINTMENTS);

  function handleAppointmentConfirmed(filaNueva, extra) {
    if (!extra?.doctorId) return;
    const day = dayIndexForDate(addDays(new Date(), extra.dia));
    setAppointmentsList((prev) => [
      ...prev,
      {
        id: `nc-${Date.now()}`,
        doctorId: extra.doctorId,
        day,
        start: extra.horario,
        duration: 1,
        patient: filaNueva.paciente,
        doc: extra.patientDoc,
        eps: filaNueva.eps,
        tipo: extra.tipo,
        estado: 'confirmada',
        motivo: filaNueva.tipo,
        servicio: extra.servicio,
        telefonoAviso: filaNueva.tel,
        fechaSolicitud: filaNueva.fsol,
        consecutivo: '—',
      },
    ]);
  }

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    const cleanupNuevaCita = initNuevaCita({
      getPatient: () => nuevaCitaPatientRef.current,
      setPatient: (patient) => { nuevaCitaPatientRef.current = patient; },
      onAppointmentConfirmed: handleAppointmentConfirmed,
      clearPatientAfterConfirm: true,
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
  // Fecha foco de la agenda — "Día/Semana anterior/siguiente" del toolbar la
  // mueven (ver handlePrevDate/handleNextDate); antes esos botones no tenían
  // onClick y la vista quedaba fija en "hoy" sin forma de navegar.
  const [viewDate, setViewDate] = useState(() => new Date());
  // Altura de cada franja de 20 min en ScheduleGrid — 24 (Compacta), 32
  // (Media, valor por defecto) o 40 (Amplia), ver RowHeightDropdown.
  const [rowHeight, setRowHeight] = useState(32);

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

  const esDia = vista === 'medico' && rango === 'dia';
  const days = weekDays(viewDate);
  const today = new Date();

  function handlePrevDate() {
    setViewDate((d) => (esDia ? addWeekday(d, -1) : addDays(d, -7)));
  }
  function handleNextDate() {
    setViewDate((d) => (esDia ? addWeekday(d, 1) : addDays(d, 7)));
  }
  const toolbarDateLabel = esDia ? dateLabel(viewDate) : weekRangeLabel(viewDate);

  // Clickear un día en el mini-calendario navega la agenda a ese día
  // puntual (vista "Por médico · Día") — es la única vista con foco en un
  // solo día, así el día elegido queda literalmente en pantalla.
  function handleSelectMiniCalDate(date) {
    setViewDate(date);
    setVista('medico');
    setRango('dia');
  }

  let columns, appointments, resolveColId, showNow;
  if (vista === 'medico') {
    if (rango === 'dia') {
      const dayIdx = dayIndexForDate(viewDate);
      const dayCol = days[dayIdx];
      columns = [{ id: dayCol.id, headerTop: dayCol.nombre, headerBottom: dayCol.fecha, date: dayCol.date }];
      appointments = appointmentsList.filter((a) => a.doctorId === doctorId && a.day === dayIdx);
      showNow = isSameDate(dayCol.date, today);
    } else {
      columns = days.map((d) => ({ id: d.id, headerTop: d.nombre, headerBottom: d.fecha, date: d.date }));
      appointments = appointmentsList.filter((a) => a.doctorId === doctorId);
      showNow = days.some((d) => isSameDate(d.date, today));
    }
    resolveColId = (a) => a.day;
  } else {
    const doctoresEspecialidad = DOCTORS.filter((d) => d.especialidadId === especialidadId);
    columns = doctoresEspecialidad.map((d) => ({ id: d.id, headerTop: d.nombre, headerBottom: d.consultorio }));
    appointments = appointmentsList.filter(
      (a) => a.day === ESPECIALIDAD_DAY_ID && doctoresEspecialidad.some((d) => d.id === a.doctorId),
    );
    resolveColId = (a) => a.doctorId;
    showNow = isSameDate(days[ESPECIALIDAD_DAY_ID].date, today);
  }

  // Un clic en una celda vacía ya identifica médico/especialidad + día + hora
  // — antes se descartaba todo eso y el wizard arrancaba siempre desde cero
  // (ver ncOpen en legacy-nueva-cita.js).
  function handleEmptyCellClick(colId, slotIdx) {
    const horario = timeLabel(slotIdx);
    if (vista === 'medico') {
      const col = columns.find((c) => c.id === colId);
      const dia = col?.date ? diffInDays(col.date) : 0;
      window.ncOpen({ doctorId, dia, horario });
    } else {
      const dia = diffInDays(days[ESPECIALIDAD_DAY_ID].date);
      window.ncOpen({ doctorId: colId, dia, horario });
    }
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
              <RowHeightDropdown value={rowHeight} onChange={setRowHeight} />
              {vista === 'medico' && <RangoDropdown value={rango} onChange={setRango} />}
              <button type="button" className="btn btn-primary" onClick={() => window.ncOpen()}><LuPlus className="icon" />Agendar cita</button>
            </div>
          </div>

          <div className="pc-workspace">
            <div className="pc-side-col">
              <MiniCalendar selectedDate={viewDate} onSelectDate={handleSelectMiniCalDate} />
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
                dateLabel={toolbarDateLabel}
                onPrevDate={handlePrevDate}
                onNextDate={handleNextDate}
              />
              <ScheduleGrid
                columns={columns}
                appointments={appointments}
                resolveColId={resolveColId}
                onSelectAppointment={setSelectedAppointment}
                onEmptyCellClick={handleEmptyCellClick}
                showNow={showNow}
                rowHeight={rowHeight}
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
