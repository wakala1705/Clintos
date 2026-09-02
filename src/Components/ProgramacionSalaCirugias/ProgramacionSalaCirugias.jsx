'use client';

import {
  useEffect, useRef, useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { LuSearch } from 'react-icons/lu';
import './ProgramacionSalaCirugias.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { initNuevaCita } from '@/hooks/NuevaCita/legacy-nueva-cita';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import MiniCalendarCirugias from './MiniCalendarCirugias/MiniCalendarCirugias';
import AgendaSemana from './AgendaSemana/AgendaSemana';
import AgendaMes from './AgendaMes/AgendaMes';
import VistaDropdown from './VistaDropdown/VistaDropdown';
import DetalleCirugiaPanel from './DetalleCirugiaPanel/DetalleCirugiaPanel';
import ReprogramarCirugiaModal from './modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal';
import CancelarCirugiaModal from './modals/CancelarCirugiaModal/CancelarCirugiaModal';
import NuevaCirugiaWizard from './modals/NuevaCirugiaWizard/NuevaCirugiaWizard';
import BuscarPacienteModal from './modals/BuscarPacienteModal/BuscarPacienteModal';
import {
  SALAS,
  SEMANA_ANCLA,
  actualizarEstadoCirugia,
  addDias,
  addMeses,
  cancelarCirugia,
  diaLabel,
  diaUnico,
  diasDeSemana,
  fechaISO,
  fetchAgendaRango,
  grillaMes,
  lunesDeSemana,
  mesLabel,
  rangoSemanaLabel,
  reprogramarCirugia,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

export default function ProgramacionSalaCirugias() {
  const router = useRouter();
  // Sin filtro de Sede en la UI (encargo explícito): fija a '02' (Sede
  // Norte), la única con datos completos en el mock (ver SEMANA_ANCLA en
  // mockCirugiaData.js) — deja de ser estado porque nada la cambia.
  const sedeId = '02';
  const [salaId, setSalaId] = useState('qx-1');
  // Fecha foco de la agenda -- su significado depende de `vista`: el día
  // mostrado (dia), la semana que lo contiene (semana, vía lunesDeSemana) o
  // el mes que lo contiene (mes, vía grillaMes). Reemplaza al `weekStart`
  // de V1 (solo semana) para que las 3 vistas compartan un único ancla.
  const [fechaAncla, setFechaAncla] = useState(SEMANA_ANCLA);
  const [estado, setEstado] = useState('todos');
  const [vista, setVista] = useState('semana');
  const [mostrarFinesDeSemana, setMostrarFinesDeSemana] = useState(true);

  const inicioSemana = lunesDeSemana(fechaAncla);
  const grillaMesActual = vista === 'mes' ? grillaMes(fechaAncla) : null;

  // Rango de fechas (ISO) que la vista activa necesita cargar -- en `mes`
  // cubre toda la grilla visible (incluye días mudos del mes ant./sig.) para
  // que el conteo por celda de AgendaMes sea exacto.
  let rangoInicio;
  let rangoFin;
  if (vista === 'dia') {
    rangoInicio = fechaISO(fechaAncla);
    rangoFin = rangoInicio;
  } else if (vista === 'mes') {
    rangoInicio = fechaISO(grillaMesActual.days[0].date);
    rangoFin = fechaISO(grillaMesActual.days[grillaMesActual.days.length - 1].date);
  } else {
    rangoInicio = fechaISO(inicioSemana);
    rangoFin = fechaISO(addDias(inicioSemana, 6));
  }

  const [cirugias, setCirugias] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  // Mismo flujo compartido de búsqueda/alta de pacientes que Asignación de
  // citas/Programar cita/Admisiones (.ps-overlay/.ap-overlay, ver
  // NuevaCitaFlow.jsx y AGENTS.md) -- "+ Programar cirugía"/"Nueva urgencia"
  // arrancan acá en vez de un formulario propio (ver ProgramarCirugiaDropdown
  // más abajo). `onPatientConfirmed` es lo que separa este uso del de citas:
  // normalmente elegir/crear un paciente encadena directo al wizard de
  // agendamiento (ncOpen) -- acá en cambio abre NuevaCirugiaWizard (mismo
  // criterio que handlePatientConfirmed en Admisiones.jsx, adaptado a un
  // wizard propio en vez de continuar un formulario de una sola pantalla).
  const nuevaCirugiaPatientRef = useRef(null);
  const [nuevaCirugiaWizardPatient, setNuevaCirugiaWizardPatient] = useState(null);
  function handlePatientConfirmedParaCirugia(patient) {
    setNuevaCirugiaWizardPatient(patient);
  }

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    const cleanupNuevaCita = initNuevaCita({
      getPatient: () => nuevaCirugiaPatientRef.current,
      setPatient: (patient) => { nuevaCirugiaPatientRef.current = patient; },
      onPatientConfirmed: handlePatientConfirmedParaCirugia,
      clearPatientAfterConfirm: true,
    });
    return () => {
      cleanupChrome?.();
      cleanupNuevaCita?.();
    };
    // Se inicializa una sola vez al montar (mismo criterio que
    // initShellChrome arriba): handlePatientConfirmedParaCirugia solo llama
    // a un setState (identidad estable entre renders).
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAgendaRango({
      sedeId, salaId, inicio: rangoInicio, fin: rangoFin, estado,
    }).then((items) => {
      if (cancelled) return;
      setCirugias(items);
    });
    return () => { cancelled = true; };
  }, [sedeId, salaId, estado, rangoInicio, rangoFin]);

  // Decide si una cirugía (recién creada/mutada) pertenece a la vista
  // actualmente visible -- evita un re-fetch completo después de cada
  // mutación: la respuesta de crearCirugia/actualizarCirugia/etc. ya trae
  // el registro completo, solo hace falta decidir si mostrarlo.
  function perteneceAVistaActual(c) {
    if (c.sedeId !== sedeId || c.salaId !== salaId) return false;
    if (c.fecha < rangoInicio || c.fecha > rangoFin) return false;
    if (estado !== 'todos' && c.estado !== estado) return false;
    return true;
  }

  function applyUpdated(actualizada) {
    setCirugias((prev) => {
      if (!perteneceAVistaActual(actualizada)) return prev.filter((c) => c.id !== actualizada.id);
      const existe = prev.some((c) => c.id === actualizada.id);
      return existe ? prev.map((c) => (c.id === actualizada.id ? actualizada : c)) : [...prev, actualizada];
    });
  }

  function handleSalaChange(v) {
    setSalaId(v);
    setSelectedId(null);
  }
  function handleFechaAnclaChange(d) {
    setFechaAncla(d);
    setSelectedId(null);
  }
  function handleEstadoChange(v) {
    setEstado(v);
    setSelectedId(null);
  }
  function handleChangeVista(id) {
    setVista(id);
    setSelectedId(null);
  }
  // Prev/next del header de la agenda: la unidad que avanza/retrocede
  // depende de la vista activa (1 día, 1 semana o 1 mes).
  function handlePrev() {
    if (vista === 'dia') handleFechaAnclaChange(addDias(fechaAncla, -1));
    else if (vista === 'mes') handleFechaAnclaChange(addMeses(fechaAncla, -1));
    else handleFechaAnclaChange(addDias(fechaAncla, -7));
  }
  function handleNext() {
    if (vista === 'dia') handleFechaAnclaChange(addDias(fechaAncla, 1));
    else if (vista === 'mes') handleFechaAnclaChange(addMeses(fechaAncla, 1));
    else handleFechaAnclaChange(addDias(fechaAncla, 7));
  }
  // Clickear un día en el mini-calendario lateral: en vista Semana navega a
  // la semana que lo contiene (comportamiento de V1, ver
  // handleSelectMiniCalDate en ProgramarCita.jsx); en Día/Mes salta directo
  // a esa fecha.
  function handleSelectMiniCalDate(date) {
    handleFechaAnclaChange(vista === 'semana' ? lunesDeSemana(date) : date);
  }
  // Clic en un día de la grilla mensual (AgendaMes): navega a la vista Día
  // de esa fecha -- decisión confirmada con el encargo.
  function handleSelectDiaDesdeMes(date) {
    setVista('dia');
    handleFechaAnclaChange(date);
  }

  const selectedCirugia = cirugias.find((c) => c.id === selectedId) ?? null;
  const salaLabelActual = SALAS.find((s) => s.value === salaId)?.label ?? '';
  // Sáb/Dom se ocultan por defecto vía el toggle del header (encargo
  // explícito) filtrando por `label` en vez de recalcular el día de semana
  // -- diasDeSemana ya lo trae calculado (ver mockCirugiaData.js).
  const diasVisibles = mostrarFinesDeSemana
    ? diasDeSemana(inicioSemana)
    : diasDeSemana(inicioSemana).filter((d) => d.label !== 'Sáb' && d.label !== 'Dom');

  function handleSubmitReprogramar(datos) {
    const actualizada = reprogramarCirugia(modal?.cirugia?.id, datos);
    applyUpdated(actualizada);
    setModal(null);
    showToast('Cirugía reprogramada correctamente.');
  }

  function handleSubmitCancelar(motivo) {
    const actualizada = cancelarCirugia(modal?.cirugia?.id, motivo);
    applyUpdated(actualizada);
    setModal(null);
    showToast('Cirugía cancelada correctamente.');
  }

  function handleMarcarProgramada() {
    if (!selectedCirugia) return;
    applyUpdated(actualizarEstadoCirugia(selectedCirugia.id, 'programada'));
    showToast('Cirugía marcada como programada.');
  }
  function handleMarcarIncumplida() {
    if (!selectedCirugia) return;
    applyUpdated(actualizarEstadoCirugia(selectedCirugia.id, 'incumplida'));
    showToast('Cirugía marcada como incumplida.');
  }
  // "Ver información/historial" solo tiene sentido con una cirugía
  // seleccionada -- el panel de detalle ya está visible en ese momento, así
  // que no hay ninguna acción adicional que ejecutar en V1 (no existe un
  // historial de auditoría real en el mock, ver spec).
  function handleVerInfo() {}
  // NuevaCirugiaModal se eliminó junto con "+ Programar cirugía" (encargo
  // explícito, ver handlePatientConfirmedParaCirugia arriba) -- "Editar"
  // queda sin flujo propio todavía, mismo criterio de toast "(en desarrollo)"
  // que el resto de acciones stub del proyecto (ver handleEditar en
  // Admisiones.jsx).
  function handleEditarCirugia() {
    if (!selectedCirugia) return;
    showToast('Editar cirugía (en desarrollo).');
  }
  function handleSeleccionarPacienteHistorial(paciente) {
    setModal(null);
    router.push(`/historial-quirurgico/${paciente.id}`);
  }
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Programación sala de cirugías"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="psc-page-header">
            <div>
              <h1>Programación sala de cirugías</h1>
              <p>Agenda y gestiona la ocupación de las salas de cirugía.</p>
            </div>
            <div className="psc-page-header-actions">
              <button
                type="button"
                className="icon-btn-circle"
                aria-label="Buscar"
                onClick={() => setModal({ type: 'buscarPaciente' })}
              >
                <LuSearch className="icon" />
              </button>
              <VistaDropdown
                value={vista}
                onChange={handleChangeVista}
                mostrarFinesDeSemana={mostrarFinesDeSemana}
                onToggleFinesDeSemana={setMostrarFinesDeSemana}
              />
            </div>
          </div>

          <div className="psc-workspace">
            <div className="psc-side-col">
              <MiniCalendarCirugias
                selectedDate={fechaAncla}
                onSelectDate={handleSelectMiniCalDate}
                onNuevaCirugia={() => window.openPatientSearch()}
                onNuevaUrgencia={() => window.openPatientSearch()}
              />
            </div>

            <div className="psc-main-col">
              {vista === 'mes' ? (
                <AgendaMes
                  monthLabel={mesLabel(fechaAncla)}
                  dowLabels={grillaMesActual.dowLabels}
                  days={grillaMesActual.days}
                  cirugias={cirugias}
                  onSelectDia={handleSelectDiaDesdeMes}
                  onPrevMonth={handlePrev}
                  onNextMonth={handleNext}
                  sedeId={sedeId}
                  salaId={salaId}
                  onSalaChange={handleSalaChange}
                  estado={estado}
                  onEstadoChange={handleEstadoChange}
                />
              ) : (
                <AgendaSemana
                  label={vista === 'dia' ? diaLabel(fechaAncla) : rangoSemanaLabel(inicioSemana)}
                  days={vista === 'dia' ? [diaUnico(fechaAncla)] : diasVisibles}
                  cirugias={cirugias}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onPrevWeek={handlePrev}
                  onNextWeek={handleNext}
                  navPrevLabel={vista === 'dia' ? 'Día anterior' : 'Semana anterior'}
                  navNextLabel={vista === 'dia' ? 'Día siguiente' : 'Semana siguiente'}
                  sedeId={sedeId}
                  salaId={salaId}
                  onSalaChange={handleSalaChange}
                  estado={estado}
                  onEstadoChange={handleEstadoChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <DetalleCirugiaPanel
        cirugia={selectedCirugia}
        salaLabel={salaLabelActual}
        onClose={() => setSelectedId(null)}
        onEditar={handleEditarCirugia}
        onReprogramar={() => selectedCirugia && setModal({ type: 'reprogramar', cirugia: selectedCirugia })}
        onCancelar={() => selectedCirugia && setModal({ type: 'cancelar', cirugia: selectedCirugia })}
        onMarcarProgramada={handleMarcarProgramada}
        onMarcarIncumplida={handleMarcarIncumplida}
        onVerInfo={handleVerInfo}
      />

      <NuevaCitaFlow />

      {nuevaCirugiaWizardPatient && (
        <NuevaCirugiaWizard
          patient={nuevaCirugiaWizardPatient}
          salaId={salaId}
          onClose={() => setNuevaCirugiaWizardPatient(null)}
        />
      )}

      {modal?.type === 'reprogramar' && (
        <ReprogramarCirugiaModal cirugia={modal?.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitReprogramar} />
      )}
      {modal?.type === 'cancelar' && (
        <CancelarCirugiaModal cirugia={modal?.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitCancelar} />
      )}
      {modal?.type === 'buscarPaciente' && (
        <BuscarPacienteModal onClose={() => setModal(null)} onSelect={handleSeleccionarPacienteHistorial} />
      )}

      <div className={`psc-toast${toast ? ' show' : ''}`}>
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
