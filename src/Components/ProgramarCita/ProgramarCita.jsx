'use client';

import { useEffect, useRef, useState } from 'react';
import './ProgramarCita.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { initNuevaCita } from '@/hooks/NuevaCita/legacy-nueva-cita';
import {
  addDays, addWeekday, APPOINTMENTS, dateLabel, dayIndexForDate, diffInDays,
  DOCTORS, isSameDate, SLOT_MINUTES, SPECIALTIES, timeLabel, weekDays, weekRangeLabel,
} from '@/hooks/ProgramarCita/agendaMockData';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import MiniCalendar from '@/Components/ProgramarCita/MiniCalendar/MiniCalendar';
import AgendaToolbar from '@/Components/ProgramarCita/AgendaToolbar/AgendaToolbar';
import ScheduleGrid from '@/Components/ProgramarCita/ScheduleGrid/ScheduleGrid';
import ScheduleList from '@/Components/ProgramarCita/ScheduleList/ScheduleList';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import DetalleCitaModal from '@/Components/ProgramarCita/DetalleCitaModal/DetalleCitaModal';
import RangoDropdown from '@/Components/ProgramarCita/RangoDropdown/RangoDropdown';
import RowHeightDropdown from '@/Components/ProgramarCita/RowHeightDropdown/RowHeightDropdown';
import { LuCalendarSearch, LuPlus, LuSearch, LuSettings } from 'react-icons/lu';

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

  // Citas agendadas por el wizard "Nueva cita" se agregan acá (ver
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
        // Toda cita nueva nace "Agendada" (azul, ver ESTADO_LEYENDA) — pasa a
        // "Confirmada" recién cuando alguien acciona "Confirmar" en
        // DetalleCitaModal (ver handleConfirmarCita más abajo), nunca de
        // entrada al agendarla.
        estado: 'agendada',
        motivo: filaNueva.tipo,
        servicio: extra.servicio,
        telefonoAviso: filaNueva.tel,
        fechaSolicitud: filaNueva.fsol,
        consecutivo: '—',
      },
    ]);
  }

  // Única acción del footer de DetalleCitaModal que de verdad muta el estado
  // de la cita (el resto — Facturar/Reprogramar/No asistió/Cancelar — sigue
  // siendo solo feedback, ver plan "Rediseño de /programar-cita"): "Agendada"
  // → "Confirmada" al accionar "Confirmar".
  function handleConfirmarCita(id) {
    setAppointmentsList((prev) => prev.map((a) => (a.id === id ? { ...a, estado: 'confirmada' } : a)));
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
  // Arrancan sin elegir (a diferencia de antes, que precargaba DOCTORS[0]/
  // SPECIALTIES[0]): la agenda solo se pinta una vez que el usuario configura
  // especialidad (+ médico en vista "Por médico") desde AgendaToolbar — ver
  // `agendaLista` y el empty state más abajo.
  const [doctorId, setDoctorId] = useState(null);
  const [especialidadId, setEspecialidadId] = useState(null);
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

  // La agenda solo se arma una vez que hay suficiente contexto elegido en
  // AgendaToolbar: un médico puntual en vista "Por médico", o al menos una
  // especialidad en "Por especialidad" (ese modo agrupa varios médicos, no
  // necesita uno solo elegido). Antes de eso no hay columns/appointments que
  // calcular — se muestra el empty state en vez del grid (ver más abajo).
  const agendaLista = vista === 'medico' ? Boolean(doctorId) : Boolean(especialidadId);

  let columns = [], appointments = [], resolveColId = () => null, showNow = false, slotMinutes = SLOT_MINUTES;
  if (agendaLista && vista === 'medico') {
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
    // Duración real de franja del médico activo (default 20 min) — el de
    // Oncología usa 30 (ver DOCTORS en agendaMockData.js), consultas más
    // largas que la consulta general.
    slotMinutes = DOCTORS.find((d) => d.id === doctorId)?.slotMinutes || SLOT_MINUTES;
  } else if (agendaLista) {
    const doctoresEspecialidad = DOCTORS.filter((d) => d.especialidadId === especialidadId);
    columns = doctoresEspecialidad.map((d) => ({ id: d.id, headerTop: d.nombre, headerBottom: d.consultorio }));
    appointments = appointmentsList.filter(
      (a) => a.day === ESPECIALIDAD_DAY_ID && doctoresEspecialidad.some((d) => d.id === a.doctorId),
    );
    resolveColId = (a) => a.doctorId;
    showNow = isSameDate(days[ESPECIALIDAD_DAY_ID].date, today);
    // Aproximación para "Por especialidad": toma la franja del primer médico
    // del grupo — sostenible mientras cada especialidad tenga médicos con la
    // misma duración de franja (hoy es el caso: Oncología es la única con
    // 30 min y por ahora tiene un solo médico).
    slotMinutes = doctoresEspecialidad[0]?.slotMinutes || SLOT_MINUTES;
  }

  // Un clic en una celda vacía ya identifica médico/especialidad + día + hora
  // — antes se descartaba todo eso y el wizard arrancaba siempre desde cero
  // (ver ncOpen en legacy-nueva-cita.js). `slotIdx` es opcional: el botón
  // "Nueva cita" de ScheduleList (vista tablet, ver ese componente) solo
  // identifica columna, no una franja puntual — el wizard igual deja elegir
  // la hora en su paso "Médico".
  function handleEmptyCellClick(colId, slotIdx) {
    const horario = typeof slotIdx === 'number' ? timeLabel(slotIdx, slotMinutes) : undefined;
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
              <h1>Programar cita</h1>
              <p>Gestiona la disponibilidad y las citas de los consultorios activos.</p>
            </div>
            <div className="pc-page-header-actions">
              <button type="button" className="icon-btn-circle" aria-label="Buscar" onClick={() => window.ncToast?.('Búsqueda de citas en desarrollo.')}><LuSearch className="icon" /></button>
              <button type="button" className="icon-btn-circle" aria-label="Configuración" onClick={() => window.ncToast?.('Configuración de la agenda en desarrollo.')}><LuSettings className="icon" /></button>
              <RowHeightDropdown value={rowHeight} onChange={setRowHeight} />
              {vista === 'medico' && <RangoDropdown value={rango} onChange={setRango} />}
              
            </div>
          </div>

          <div className="pc-workspace">
            <div className="pc-side-col">
              <MiniCalendar
                selectedDate={viewDate}
                onSelectDate={handleSelectMiniCalDate}
                onNuevaCita={() => window.ncOpen()}
              />
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
              {agendaLista ? (
                <>
                  <ScheduleGrid
                    columns={columns}
                    appointments={appointments}
                    resolveColId={resolveColId}
                    onSelectAppointment={setSelectedAppointment}
                    onEmptyCellClick={handleEmptyCellClick}
                    showNow={showNow}
                    rowHeight={rowHeight}
                    slotMinutes={slotMinutes}
                  />
                  {/* Vista tablet de la misma agenda (<=1024px, --bp-desktop) —
                      mismos columns/appointments/resolveColId, la CSS decide
                      cuál de las dos se ve según el ancho (ver ScheduleList.css). */}
                  <ScheduleList
                    columns={columns}
                    appointments={appointments}
                    resolveColId={resolveColId}
                    onSelectAppointment={setSelectedAppointment}
                    onEmptyCellClick={handleEmptyCellClick}
                  />
                </>
              ) : (
                <div className="pc-agenda-empty">
                  <div className="pc-agenda-empty-icon"><LuCalendarSearch className="icon" aria-hidden="true" /></div>
                  <div className="pc-agenda-empty-title">Configura la agenda para continuar</div>
                  <div className="pc-agenda-empty-sub">
                    Elegí una especialidad{vista === 'medico' ? ' y un médico' : ''} arriba para ver su disponibilidad.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <NuevaCitaFlow />
      <DetalleCitaModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} onConfirmar={handleConfirmarCita} />

      <div className="pc-toast">
        <span className="pc-toast-dot"></span>
        <span>Cita agendada</span>
      </div>
    </div>
  );
}
