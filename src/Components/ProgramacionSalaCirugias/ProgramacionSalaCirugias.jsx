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
import NuevaUrgenciaModal from './modals/NuevaUrgenciaModal/NuevaUrgenciaModal';
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
  // NuevaCitaFlow.jsx y AGENTS.md) -- "+ Programar cirugía"/"Nueva urgencia" Y
  // el ícono "Buscar" del header (acceso a Historial Quirúrgico) arrancan
  // acá en vez de cada uno con su propio modal (encargo explícito: antes el
  // ícono de búsqueda abría un BuscarPacienteModal propio con otro look,
  // divergente del buscador que ya usa "Programar cirugía" -- ver
  // ProgramarCirugiaDropdown más abajo). `onPatientConfirmed` es lo que
  // separa este uso del de citas: normalmente elegir/crear un paciente
  // encadena directo al wizard de agendamiento (ncOpen) -- acá en cambio
  // bifurca según qué botón abrió el buscador (patientSearchIntentRef):
  // NuevaCirugiaWizard para "+ Programar cirugía" (mismo criterio que
  // handlePatientConfirmed en Admisiones.jsx, adaptado a un wizard propio en
  // vez de continuar un formulario de una sola pantalla), NuevaUrgenciaModal
  // para "Nueva urgencia" (flujo corto de una sola pantalla, distinto del
  // wizard -- ver NuevaUrgenciaModal.jsx), o navegar a Historial Quirúrgico
  // para el ícono "Buscar". Las 3 intenciones se setean explícitamente en
  // cada trigger (nunca se asume el default) para que un clic residual no
  // reabra el flujo equivocado si el usuario ya usó otro botón antes.
  const nuevaCirugiaPatientRef = useRef(null);
  const [nuevaCirugiaWizardPatient, setNuevaCirugiaWizardPatient] = useState(null);
  const [nuevaUrgenciaPatient, setNuevaUrgenciaPatient] = useState(null);
  const patientSearchIntentRef = useRef('cirugia');
  // Fecha/hora del slot de la grilla que disparó el buscador de pacientes
  // (clic en una celda vacía de AgendaSemana) -- se guarda en un ref porque
  // solo se necesita en el próximo handlePatientConfirmedParaCirugia, no en
  // ningún render intermedio, mismo criterio que nuevaCirugiaPatientRef.
  const nuevaCirugiaSlotRef = useRef(null);
  const [nuevaCirugiaInitialFechaHora, setNuevaCirugiaInitialFechaHora] = useState(null);
  // Mismo criterio que nuevaCirugiaInitialFechaHora pero para
  // NuevaUrgenciaModal (fecha/hora como campos sueltos ahí -- ver
  // handlePatientConfirmedParaCirugia -- en vez del ISO combinado que espera
  // el wizard).
  const [nuevaUrgenciaInitialFechaHora, setNuevaUrgenciaInitialFechaHora] = useState(null);
  // `paciente` viene del buscador legacy (.ps-overlay) -- ese registro no
  // trae `id`, solo `documento` (ver PATIENTS en legacy-nueva-cita.js), así
  // que la ruta usa el documento. El `[id]` de la ruta se ignora igual
  // dentro de HistorialQuirurgico.jsx (contenido clínico siempre fijo, ver
  // ese componente), así que cualquier identificador único sirve acá.
  function handleSeleccionarPacienteHistorial(paciente) {
    router.push(`/historial-quirurgico/${encodeURIComponent(paciente.documento)}`);
  }
  function handleAbrirProgramarCirugia() {
    patientSearchIntentRef.current = 'cirugia';
    window.openPatientSearch();
  }
  function handleAbrirNuevaUrgencia() {
    patientSearchIntentRef.current = 'urgencia';
    window.openPatientSearch();
  }
  function handlePatientConfirmedParaCirugia(patient) {
    if (patientSearchIntentRef.current === 'historial') {
      patientSearchIntentRef.current = 'cirugia';
      handleSeleccionarPacienteHistorial(patient);
      return;
    }
    if (patientSearchIntentRef.current === 'urgencia') {
      setNuevaUrgenciaPatient(patient);
      setNuevaUrgenciaInitialFechaHora(nuevaCirugiaSlotRef.current);
      nuevaCirugiaSlotRef.current = null;
      return;
    }
    setNuevaCirugiaWizardPatient(patient);
    setNuevaCirugiaInitialFechaHora(nuevaCirugiaSlotRef.current);
    nuevaCirugiaSlotRef.current = null;
  }
  // Clic en una celda vacía de la grilla (AgendaSemana): a diferencia de
  // antes (siempre "Programar cirugía"), ahora la celda primero muestra
  // SlotAccionesMenu para elegir entre los 2 flujos de creación que ya
  // existían por separado en ProgramarCirugiaDropdown -- `tipo` llega desde
  // esa elección ('cirugia' | 'urgencia', ver onProgramarCirugia/
  // onCirugiaUrgencia en AgendaSemana.jsx). En ambos casos se precarga la
  // fecha/hora de la celda clickeada en vez de la fecha/hora del sistema
  // (wizard: ver datosIniciales en NuevaCirugiaWizard.jsx; urgencia: ver
  // fechaCirugia/horaCirugia en NuevaUrgenciaModal.jsx).
  function handleSlotClick(fecha, hora, tipo) {
    nuevaCirugiaSlotRef.current = { fecha, hora };
    patientSearchIntentRef.current = tipo === 'urgencia' ? 'urgencia' : 'cirugia';
    window.openPatientSearch();
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
    // a un setState o a router.push (identidad estable entre renders, ver
    // useRouter() de Next.js) y lee el ref de intención en el momento de la
    // confirmación, no al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // De acá para abajo, los handlers de acciones sobre una cirugía puntual
  // reciben `cirugia` como parámetro en vez de cerrar sobre `selectedCirugia`
  // (encargo explícito, 2026-09-07: menú "..." de CirugiaCard con Editar/
  // Reprogramar/Marcar como realizada/Marcar como incumplida/Cancelar) --
  // así los mismos handlers sirven tanto al menú "Más acciones"/botones de
  // DetalleCirugiaPanel (que ya tiene la cirugía seleccionada a mano) como al
  // menú de la card en la grilla (que actúa sobre la cirugía de esa card
  // puntual, esté o no seleccionada).
  function handleReprogramarCirugia(cirugia) {
    setModal({ type: 'reprogramar', cirugia });
  }
  function handleCancelarCirugia(cirugia) {
    setModal({ type: 'cancelar', cirugia });
  }
  function handleMarcarProgramada(cirugia) {
    applyUpdated(actualizarEstadoCirugia(cirugia.id, 'programada'));
    showToast('Cirugía marcada como programada.');
  }
  // "realizada" es un estado nuevo (encargo explícito, mismo momento que el
  // menú "..." de arriba) -- antes solo existían programada/urgencia/
  // cancelada/incumplida (ver ESTADOS_TERMINALES_CIRUGIA/ESTADO_FILTRO_OPTIONS
  // en mockCirugiaData.js y EstadoCirugiaBadge.jsx para el resto de lugares
  // que necesitaban conocerlo).
  function handleMarcarRealizada(cirugia) {
    applyUpdated(actualizarEstadoCirugia(cirugia.id, 'realizada'));
    showToast('Cirugía marcada como realizada.');
  }
  function handleMarcarIncumplida(cirugia) {
    applyUpdated(actualizarEstadoCirugia(cirugia.id, 'incumplida'));
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
    showToast('Editar cirugía (en desarrollo).');
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
                onClick={() => {
                  patientSearchIntentRef.current = 'historial';
                  window.openPatientSearch();
                }}
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
                onNuevaCirugia={handleAbrirProgramarCirugia}
                onNuevaUrgencia={handleAbrirNuevaUrgencia}
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
                  onSlotClick={handleSlotClick}
                  onPrevWeek={handlePrev}
                  onNextWeek={handleNext}
                  navPrevLabel={vista === 'dia' ? 'Día anterior' : 'Semana anterior'}
                  navNextLabel={vista === 'dia' ? 'Día siguiente' : 'Semana siguiente'}
                  sedeId={sedeId}
                  salaId={salaId}
                  onSalaChange={handleSalaChange}
                  estado={estado}
                  onEstadoChange={handleEstadoChange}
                  onEditarCirugia={handleEditarCirugia}
                  onReprogramarCirugia={handleReprogramarCirugia}
                  onMarcarRealizada={handleMarcarRealizada}
                  onMarcarIncumplida={handleMarcarIncumplida}
                  onCancelarCirugia={handleCancelarCirugia}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <DetalleCirugiaPanel
        cirugia={selectedCirugia}
        onClose={() => setSelectedId(null)}
        onEditar={handleEditarCirugia}
        onReprogramar={handleReprogramarCirugia}
        onCancelar={handleCancelarCirugia}
        onMarcarProgramada={handleMarcarProgramada}
        onMarcarIncumplida={handleMarcarIncumplida}
        onVerInfo={handleVerInfo}
      />

      <NuevaCitaFlow />

      {nuevaCirugiaWizardPatient && (
        <NuevaCirugiaWizard
          patient={nuevaCirugiaWizardPatient}
          salaId={salaId}
          initialFechaHora={nuevaCirugiaInitialFechaHora ? `${nuevaCirugiaInitialFechaHora.fecha}T${nuevaCirugiaInitialFechaHora.hora}` : null}
          onGuardar={(nueva) => {
            applyUpdated(nueva);
            showToast('Cirugía guardada correctamente');
          }}
          onClose={() => {
            setNuevaCirugiaWizardPatient(null);
            setNuevaCirugiaInitialFechaHora(null);
          }}
        />
      )}

      {nuevaUrgenciaPatient && (
        <NuevaUrgenciaModal
          patient={nuevaUrgenciaPatient}
          salaId={salaId}
          initialFechaHora={nuevaUrgenciaInitialFechaHora}
          onGuardar={(nueva) => {
            applyUpdated(nueva);
            showToast('Cirugía de urgencia guardada correctamente');
          }}
          onClose={() => {
            setNuevaUrgenciaPatient(null);
            setNuevaUrgenciaInitialFechaHora(null);
          }}
        />
      )}

      {modal?.type === 'reprogramar' && (
        <ReprogramarCirugiaModal cirugia={modal?.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitReprogramar} />
      )}
      {modal?.type === 'cancelar' && (
        <CancelarCirugiaModal cirugia={modal?.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitCancelar} />
      )}

      <div className={`psc-toast${toast ? ' show' : ''}`}>
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
