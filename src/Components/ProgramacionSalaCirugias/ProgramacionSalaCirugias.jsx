'use client';

import {
  useEffect, useRef, useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LuHistory, LuPackage } from 'react-icons/lu';
import './ProgramacionSalaCirugias.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { initNuevaCita } from '@/hooks/NuevaCita/legacy-nueva-cita';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import MiniCalendarCirugias from './MiniCalendarCirugias/MiniCalendarCirugias';
import AgendaSemana from './AgendaSemana/AgendaSemana';
import AgendaMes from './AgendaMes/AgendaMes';
import DetalleCirugiaPanel from './DetalleCirugiaPanel/DetalleCirugiaPanel';
import ReprogramarCirugiaModal from './modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal';
import CancelarCirugiaModal from './modals/CancelarCirugiaModal/CancelarCirugiaModal';
import NuevaCirugiaWizard from './modals/NuevaCirugiaWizard/NuevaCirugiaWizard';
import NuevaUrgenciaModal from './modals/NuevaUrgenciaModal/NuevaUrgenciaModal';
import SeleccionarSolicitudModal from './SeleccionarSolicitudModal/SeleccionarSolicitudModal';
import SeleccionarHuecoModal from './GestionCirugias/SeleccionarHuecoModal/SeleccionarHuecoModal';
import ListadoProgramacionesModal from './modals/ListadoProgramacionesModal/ListadoProgramacionesModal';
import { ESTADO_PROGRAMACION_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockListadoProgramaciones';
import {
  SALAS,
  addDias,
  addMeses,
  datosWizardDesdeCirugia,
  diaLabel,
  diaUnico,
  diasDeSemana,
  fechaISO,
  fetchAgendaRango,
  fetchVencidas,
  grillaMes,
  lunesDeSemana,
  mesLabel,
  rangoSemanaLabel,
  resumenAgenda,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { canastasHref } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import useCirugiasAcciones from '@/hooks/ProgramacionSalaCirugias/useCirugiasAcciones';
import { evaluarSolicitud } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import {
  desplazarHabiles, parseISO, rangoFechasLabel, tresDiasHabiles,
} from '@/hooks/ProgramacionSalaCirugias/gestion/agenda';
import { datosWizardDesdeSolicitud, duracionEstimadaMin, pacienteDeSolicitud } from '@/hooks/ProgramacionSalaCirugias/gestion/programacion';
import { getSolicitud, getSolicitudes, marcarProgramada } from '@/hooks/ProgramacionSalaCirugias/gestion/store';

export default function ProgramacionSalaCirugias() {
  const router = useRouter();
  // Sin filtro de Sede en la UI (encargo explícito): fija a '02' (Sede
  // Norte), la única con datos completos en el mock (ver mockCirugiaData.js) — deja de ser estado porque nada la cambia.
  const sedeId = '02';
  const [salaId, setSalaId] = useState('qx-1');
  // Fecha foco de la agenda -- su significado depende de `vista`: el día
  // mostrado (dia), la semana que lo contiene (semana, vía lunesDeSemana) o
  // el mes que lo contiene (mes, vía grillaMes). Reemplaza al `weekStart`
  // de V1 (solo semana) para que las 3 vistas compartan un único ancla.
  const [fechaAncla, setFechaAncla] = useState(() => {
    // Arranca en el día de hoy (sin hora), no en una semana fija.
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  });
  const [estado, setEstado] = useState('todos');
  const [vista, setVista] = useState('semana');
  // Configuración "Vista" de la agenda (mismo menú que el modal de Programar
  // cirugía, ver VistaAgenda.jsx): horas visibles ('24h' | 'operativa') y días
  // visibles en la vista Semana ('semana' | 'habil' | 'tres'). Solo cambia lo
  // que se dibuja, no los datos.
  const [jornada, setJornada] = useState('24h');
  const [diasVista, setDiasVista] = useState('habil');

  const inicioSemana = lunesDeSemana(fechaAncla);
  const grillaMesActual = vista === 'mes' ? grillaMes(fechaAncla) : null;
  // "3 días hábiles": el día ancla (o el siguiente hábil) y los 2 hábiles que le siguen.
  const tresDias = vista === 'semana' && diasVista === 'tres' ? tresDiasHabiles(fechaISO(fechaAncla)) : null;

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
  } else if (tresDias) {
    rangoInicio = tresDias[0];
    rangoFin = tresDias[2];
  } else {
    rangoInicio = fechaISO(inicioSemana);
    rangoFin = fechaISO(addDias(inicioSemana, 6));
  }

  const [cirugias, setCirugias] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  // Acciones sobre una cirugía (reprogramar/cancelar/realizada/incumplida/
  // insumos), su `modal` y el toast: compartidas con el tablero del día
  // (ver useCirugiasAcciones.js). `applyUpdated` es una declaración de función
  // más abajo (hoisted).
  const {
    modal, setModal, toast, showToast,
    handleSubmitReprogramar, handleSubmitCancelar,
    handleReprogramarCirugia, handleCancelarCirugia,
    handleMarcarRealizada, handleMarcarIncumplida,
    handlePedirInsumos, handleCancelarSolicitud, handleConsumoRegistrado,
  } = useCirugiasAcciones({ applyUpdated });

  // Mismo flujo compartido de búsqueda/alta de pacientes que Asignación de
  // citas/Programar cita/Admisiones (.ps-overlay/.ap-overlay, ver
  // NuevaCitaFlow.jsx y AGENTS.md) -- "+ Programar cirugía"/"Nueva urgencia" Y
  // el botón "Historial de cirugías" del header (acceso a Historial
  // Quirúrgico; antes un ícono de lupa "Buscar") arrancan
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
  // para "Historial de cirugías". Las 3 intenciones se setean explícitamente en
  // cada trigger (nunca se asume el default) para que un clic residual no
  // reabra el flujo equivocado si el usuario ya usó otro botón antes.
  const nuevaCirugiaPatientRef = useRef(null);
  // Desde Gestión de cirugías ("Programar cirugía" de una solicitud con la
  // lista de chequeo completa, ?solicitud=<id>): el mismo wizard se abre ya
  // con paciente, procedimientos, aseguradora, dx y duración precargados
  // (ver gestion/programacion.js). Se resuelve una sola vez al montar.
  const solicitudId = useSearchParams().get('solicitud');
  const [desdeSolicitud, setDesdeSolicitud] = useState(() => {
    const s = solicitudId ? getSolicitud(solicitudId) : null;
    if (!s || evaluarSolicitud(s).estado !== 'lista') return null;
    return { solicitud: s, patient: pacienteDeSolicitud(s, new Date()), datos: datosWizardDesdeSolicitud(s) };
  });
  const solicitudGuardadaRef = useRef(false);
  const [nuevaCirugiaWizardPatient, setNuevaCirugiaWizardPatient] = useState(null);
  // "Editar" (encargo explícito) reabre el mismo NuevaCirugiaWizard en modo
  // edición -- comparte el mismo montaje que "+ Programar cirugía" más abajo
  // (ver `{(nuevaCirugiaWizardPatient || editCirugia) && ...}`), pero con su
  // propio disparador: no pasa por el buscador de pacientes (el paciente ya
  // es el de la cirugía seleccionada, no cambia al editar).
  const [editCirugia, setEditCirugia] = useState(null);
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
    router.push(`/cirugia/historial-quirurgico/${encodeURIComponent(paciente.documento)}`);
  }
  // "Programar cirugía" ya no pasa por el buscador de afiliados: abre el
  // listado de solicitudes de Gestión de cirugías con la lista de chequeo
  // completa (SeleccionarSolicitudModal). Se toma una foto de la lista al
  // abrir (el store vive en memoria). Elegir una solicitud reutiliza el mismo
  // estado `desdeSolicitud` que el acceso por ?solicitud=<id>.
  const [solicitudesParaProgramar, setSolicitudesParaProgramar] = useState(null);
  function handleAbrirProgramarCirugia() {
    patientSearchIntentRef.current = 'cirugia';
    setSolicitudesParaProgramar(getSolicitudes());
  }
  // Solicitud elegida que espera su hueco (SeleccionarHuecoModal): mismo paso
  // que en Gestión de cirugías, para ver qué bloques de la sala ya están
  // ocupados antes de abrir el wizard (antes el wizard arrancaba a las 07:00
  // sin avisar de cruces).
  const [huecoSolicitud, setHuecoSolicitud] = useState(null);
  function abrirWizardDesdeSolicitud(solicitud, hueco) {
    setDesdeSolicitud({
      solicitud,
      patient: pacienteDeSolicitud(solicitud, new Date()),
      datos: datosWizardDesdeSolicitud(solicitud, hueco),
      // El hueco elegido trae su sala; sin él, la del filtro de la agenda.
      salaId: hueco.salaId,
      // Cancelar el wizard vuelve a la agenda, no a Gestión de cirugías.
      desdeAgenda: true,
    });
  }
  function handleElegirSolicitud(solicitud) {
    const slot = nuevaCirugiaSlotRef.current;
    nuevaCirugiaSlotRef.current = null;
    setSolicitudesParaProgramar(null);
    // Desde una celda de la grilla el usuario ya eligió fecha/hora viendo la
    // agenda: va directo al wizard. Desde el botón, elige el hueco primero.
    if (slot) abrirWizardDesdeSolicitud(solicitud, slot);
    else setHuecoSolicitud(solicitud);
  }
  function handleCerrarSolicitudes() {
    nuevaCirugiaSlotRef.current = null;
    setSolicitudesParaProgramar(null);
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
    if (tipo === 'urgencia') {
      patientSearchIntentRef.current = 'urgencia';
      window.openPatientSearch();
      return;
    }
    handleAbrirProgramarCirugia();
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

  // Programaciones vencidas sin cerrar (ver RevisionVencidas.jsx): se
  // muestran en el "Resumen de agenda" del panel lateral, con el mismo
  // tratamiento que el aviso de urgencias (encargo explícito: reemplaza al
  // banner que antes vivía bajo el encabezado de la página). Se calcula al
  // montar -- volver desde la revisión remonta la página y lo refresca.
  const [vencidas, setVencidas] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchVencidas({ hoy: fechaISO(new Date()) }).then((items) => {
      if (!cancelled) setVencidas(items.length);
    });
    return () => { cancelled = true; };
  }, []);

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
    else if (tresDias) handleFechaAnclaChange(parseISO(desplazarHabiles(tresDias[0], -3)));
    else handleFechaAnclaChange(addDias(fechaAncla, -7));
  }
  function handleNext() {
    if (vista === 'dia') handleFechaAnclaChange(addDias(fechaAncla, 1));
    else if (vista === 'mes') handleFechaAnclaChange(addMeses(fechaAncla, 1));
    else if (tresDias) handleFechaAnclaChange(parseISO(desplazarHabiles(tresDias[2], 1)));
    else handleFechaAnclaChange(addDias(fechaAncla, 7));
  }
  // Clickear un día en el mini-calendario lateral: en vista Semana navega a
  // la semana que lo contiene (comportamiento de V1, ver
  // handleSelectMiniCalDate en ProgramarCita.jsx); en Día/Mes salta directo
  // a esa fecha.
  function handleSelectMiniCalDate(date) {
    handleFechaAnclaChange(vista === 'semana' && diasVista !== 'tres' ? lunesDeSemana(date) : date);
  }
  // Clic en un día de la grilla mensual (AgendaMes): navega a la vista Día
  // de esa fecha -- decisión confirmada con el encargo.
  function handleSelectDiaDesdeMes(date) {
    setVista('dia');
    handleFechaAnclaChange(date);
  }

  const selectedCirugia = cirugias.find((c) => c.id === selectedId) ?? null;
  // "Resumen de agenda" del panel lateral (ver MiniCalendarCirugias.jsx) --
  // se recalcula acá en vez de re-fetchear: `cirugias` ya es exactamente la
  // sala/estado/rango que la grilla principal está mostrando en este
  // momento, mismo criterio que selectedCirugia arriba (derivado, no estado
  // propio).
  const resumen = resumenAgenda({
    cirugias, sedeId, inicio: rangoInicio, fin: rangoFin, estado,
  });
  // Días visibles de la vista Semana (menú "Vista"): semana completa, solo
  // lun-vie (se filtra por `label` en vez de recalcular el día de semana --
  // diasDeSemana ya lo trae calculado, ver mockCirugiaData.js) o 3 días hábiles.
  let diasVisibles;
  if (tresDias) diasVisibles = tresDias.map((iso) => diaUnico(parseISO(iso)));
  else if (diasVista === 'habil') diasVisibles = diasDeSemana(inicioSemana).filter((d) => d.label !== 'Sáb' && d.label !== 'Dom');
  else diasVisibles = diasDeSemana(inicioSemana);

  // La recepción de lo que farmacia despacha se registra en Canastas de
  // cirugía: se abre allá con esta cirugía seleccionada.
  function handleVerEnCanastas(cirugia) {
    router.push(canastasHref(cirugia));
  }
  // "Editar" (encargo explícito) reabre NuevaCirugiaWizard en modo edición
  // -- ver `editCirugia` arriba y su montaje más abajo.
  function handleEditarCirugia(cirugia) {
    setEditCirugia(cirugia);
  }
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Cirugía"
          page="Programación"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="psc-page-header">
            <div>
              <h1>Programación sala de cirugías</h1>
              <p>Agenda y gestiona la ocupación de las salas de cirugía.</p>
            </div>
            <div className="psc-page-header-actions">
              {/* "Historial de cirugías" (antes "Listado de cirugías", encargo
                  explícito 2026-09-25): hereda el flujo del ícono de lupa que
                  había acá (buscador de pacientes -> Historial Quirúrgico), y
                  la lupa se quitó. El modal del Listado de Programaciones
                  sigue abriéndose desde el aviso de vencidas del panel
                  lateral (MiniCalendarCirugias). El switch Día/Semana/Mes ya
                  no vive acá -- se movió a FiltrosBar/psc-agenda-nav (encargo
                  explícito, 2026-09-29). */}
              <Button
                variant="secondary-accent"
                icon={LuHistory}
                onClick={() => {
                  patientSearchIntentRef.current = 'historial';
                  window.openPatientSearch();
                }}
              >
                Historial de cirugías
              </Button>
              {/* "Canastas de cirugía" (encargo explícito, 2026-09-29): navega
                  a /cirugia/canastas -- por ahora una
                  página en blanco (ver CanastasCirugia.jsx), el contenido
                  real se construye en un paso aparte. */}
              <Button
                variant="secondary-accent"
                icon={LuPackage}
                onClick={() => router.push('/cirugia/canastas')}
              >
                Canastas de cirugía
              </Button>
            </div>
          </div>

          <div className="psc-workspace">
            <div className="psc-side-col">
              <MiniCalendarCirugias
                selectedDate={fechaAncla}
                onSelectDate={handleSelectMiniCalDate}
                onNuevaCirugia={handleAbrirProgramarCirugia}
                onNuevaUrgencia={handleAbrirNuevaUrgencia}
                resumen={resumen}
                vencidas={vencidas}
                onVerVencidas={() => setModal({ type: 'listado' })}
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
                  vista={vista}
                  onChangeVista={handleChangeVista}
                />
              ) : (
                <AgendaSemana
                  label={vista === 'dia' ? diaLabel(fechaAncla) : (tresDias ? rangoFechasLabel(tresDias[0], tresDias[2]) : rangoSemanaLabel(inicioSemana))}
                  days={vista === 'dia' ? [diaUnico(fechaAncla)] : diasVisibles}
                  cirugias={cirugias}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onSlotClick={handleSlotClick}
                  onPrevWeek={handlePrev}
                  onNextWeek={handleNext}
                  navPrevLabel={vista === 'dia' ? 'Día anterior' : (tresDias ? 'Días anteriores' : 'Semana anterior')}
                  navNextLabel={vista === 'dia' ? 'Día siguiente' : (tresDias ? 'Días siguientes' : 'Semana siguiente')}
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
                  vista={vista}
                  onChangeVista={handleChangeVista}
                  jornada={jornada}
                  onJornada={setJornada}
                  diasVista={diasVista}
                  onDiasVista={setDiasVista}
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
        onMarcarRealizada={handleMarcarRealizada}
        onMarcarIncumplida={handleMarcarIncumplida}
        onPedirInsumos={handlePedirInsumos}
        onCancelarSolicitud={handleCancelarSolicitud}
        onConsumoRegistrado={handleConsumoRegistrado}
        onVerEnCanastas={handleVerEnCanastas}
      />

      <NuevaCitaFlow />

      {solicitudesParaProgramar && (
        <SeleccionarSolicitudModal
          solicitudes={solicitudesParaProgramar}
          onClose={handleCerrarSolicitudes}
          onElegir={handleElegirSolicitud}
        />
      )}

      {huecoSolicitud && (
        <SeleccionarHuecoModal
          solicitud={huecoSolicitud}
          duracionMin={duracionEstimadaMin(huecoSolicitud)}
          onClose={() => setHuecoSolicitud(null)}
          onElegir={(hueco) => {
            abrirWizardDesdeSolicitud(huecoSolicitud, hueco);
            setHuecoSolicitud(null);
          }}
        />
      )}

      {/* "Editar" (encargo explícito) comparte este mismo montaje con "+
          Programar cirugía" -- `editCirugia` presente es lo que activa el
          modo edición del wizard (`cirugiaId`/`initialDatos`, ver
          NuevaCirugiaWizard.jsx): patient/salaId/initialDatos se arman desde
          la cirugía seleccionada en vez de venir del buscador de pacientes,
          y `initialFechaHora` no aplica (el wizard ya arranca con la
          fecha/hora real de la cirugía vía initialDatos). */}
      {(nuevaCirugiaWizardPatient || editCirugia || desdeSolicitud) && (
        <NuevaCirugiaWizard
          patient={editCirugia ? {
            nombre: editCirugia.paciente.nombre,
            documento: editCirugia.paciente.documento,
            telefono: editCirugia.paciente.telAviso,
          } : (desdeSolicitud?.patient ?? nuevaCirugiaWizardPatient)}
          salaId={editCirugia ? editCirugia.salaId : (desdeSolicitud?.salaId ?? salaId)}
          cirugiaId={editCirugia?.id}
          initialDatos={editCirugia ? datosWizardDesdeCirugia(editCirugia) : desdeSolicitud?.datos}
          initialFechaHora={editCirugia
            ? null
            : (nuevaCirugiaInitialFechaHora ? `${nuevaCirugiaInitialFechaHora.fecha}T${nuevaCirugiaInitialFechaHora.hora}` : null)}
          onGuardar={(resultado) => {
            applyUpdated(resultado);
            const origen = desdeSolicitud?.solicitud;
            if (origen) {
              // La solicitud sale de Gestión; la agenda salta a la cirugía creada.
              solicitudGuardadaRef.current = true;
              marcarProgramada(origen.id);
              setSalaId(resultado.salaId);
              const [y, m, d] = resultado.fecha.split('-').map(Number);
              setFechaAncla(new Date(y, m - 1, d));
              showToast(`Cirugía programada desde la orden ${origen.ordenNumero}. Canasta solicitada a farmacia${origen.origen === 'internacion' ? '' : ' y admisión creada'}.`);
            } else {
              showToast(editCirugia ? 'Cirugía actualizada correctamente' : 'Cirugía guardada correctamente');
            }
          }}
          onClose={() => {
            setNuevaCirugiaWizardPatient(null);
            setNuevaCirugiaInitialFechaHora(null);
            setEditCirugia(null);
            if (desdeSolicitud) {
              // Abierto desde la agenda: siempre se queda en ella. Abierto desde
              // Gestión (?solicitud): guardada se queda en la agenda (sin
              // ?solicitud); cancelada vuelve a Gestión.
              const desdeAgenda = desdeSolicitud.desdeAgenda;
              setDesdeSolicitud(null);
              if (!desdeAgenda) {
                if (solicitudGuardadaRef.current) router.replace('/cirugia/programacion');
                else router.push('/cirugia/gestion');
              }
            }
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
      {/* "Listado de cirugías": réplica visual de la ventana legada
          "Listado de Programaciones - Revisión", sin lógica (ver
          ListadoProgramacionesModal.jsx). */}
      {modal?.type === 'listado' && (
        <ListadoProgramacionesModal
          onClose={() => setModal(null)}
          onCambiarEstado={(fila, nuevoEstado) => showToast(`Programación ${fila.noProgramacion} actualizada a ${ESTADO_PROGRAMACION_LABEL[nuevoEstado]}.`)}
        />
      )}

      <div className={`psc-toast${toast ? ' show' : ''}`}>
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
