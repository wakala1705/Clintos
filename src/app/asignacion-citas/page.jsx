'use client';

import { useEffect, useState } from 'react';
import './asignacion-citas.css';
import { initAsignacionCitas } from '@/hooks/AsignacionCitas/legacy-app';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import PatientBanner from '@/Components/PatientBanner/PatientBanner';
import Badge from '@/Components/Badge/Badge';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import FiltroPickerModal from '@/Components/AsignacionCitas/FiltroPickerModal/FiltroPickerModal';
import { ESPECIALIDADES, MEDICOS } from '@/hooks/AsignacionCitas/filtrosData';
import { LuCalendarClock, LuCalendarX, LuChevronDown, LuChevronLeft, LuChevronRight, LuCheck, LuEye, LuFile, LuFileText, LuHistory, LuMapPin, LuPencil, LuPlus, LuPrinter, LuSearch } from 'react-icons/lu';

// activo/inactivo/suspendido son los valores de estado que usa PATIENTS en
// legacy-app.js; se traducen a los tonos que soporta PatientBanner
// (status-active/status-inactive/status-suspendido en PatientBanner.css).
const ESTADO_LABEL = { activo: 'Activo', inactivo: 'Inactivo', suspendido: 'Suspendido' };
const ESTADO_TONE = { activo: 'success', inactivo: 'neutral', suspendido: 'warn' };

const REGIMEN_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'contributivo', label: 'Contributivo' },
  { value: 'subsidiado', label: 'Subsidiado' },
];

// Etiqueta corta de fecha ("sáb, 18 jul 2026") para el date-nav del toolbar
// — mismo formato que tenía el chip estático que reemplaza, no el largo
// ("sábado, 18 de julio de 2026") de dateLabel() en
// hooks/ProgramarCita/agendaMockData.js (ese vive en otra feature, ver
// AGENTS.md sobre no acoplar dos features por un helper de fecha).
const DAY_ABBR = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTH_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function formatDateChip(date) {
  return `${DAY_ABBR[date.getDay()]}, ${date.getDate()} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

export default function AsignacionCitasPage() {
  const [patient, setPatient] = useState(null);
  const [regimen, setRegimen] = useState('todos');
  // Especialidad/Médico del header de la agenda: mismo patrón de picker que
  // AgendaToolbar.jsx en ProgramarCita (botón que abre una tabla buscable en
  // vez de un <select> nativo), ver FiltroPickerModal. `null` = "Todas"/
  // "Todos" (sin filtrar) — MEDICOS ya viene acotado por especialidadFiltroId
  // cuando hay una elegida.
  const [especialidadFiltroId, setEspecialidadFiltroId] = useState(null);
  const [medicoFiltroId, setMedicoFiltroId] = useState(null);
  const [pickerAbierto, setPickerAbierto] = useState(null); // 'especialidad' | 'medico' | null
  // Fecha del toolbar (‹ fecha ›, mismo patrón que .pc-date-nav en
  // ProgramarCita/AgendaToolbar.jsx) — a diferencia de especialidad/médico
  // (ver useEffect de abajo), todavía no recalcula la tabla "Agenda del
  // día": la agenda generada es de "hoy" para el médico elegido, cambiar de
  // día no tiene una fuente de datos distinta que mostrar todavía. Arranca
  // en la fecha real del sistema (encargo explícito: "ajustar los
  // calendarios a las fechas reales actuales" — antes era una fecha fija,
  // 18 Jul 2026, mismo criterio que tenían SEMANA_ANCLA en
  // mockProgramacionData.js y HOY en mockPanelGeneralData.js, también
  // actualizados).
  const [viewDate, setViewDate] = useState(() => new Date());
  function handlePrevDate() {
    setViewDate((d) => { const next = new Date(d); next.setDate(next.getDate() - 1); return next; });
  }
  function handleNextDate() {
    setViewDate((d) => { const next = new Date(d); next.setDate(next.getDate() + 1); return next; });
  }

  const especialidadFiltro = ESPECIALIDADES.find((e) => e.id === especialidadFiltroId);
  const medicoFiltro = MEDICOS.find((m) => m.id === medicoFiltroId);
  const medicosDeEspecialidad = especialidadFiltroId
    ? MEDICOS.filter((m) => m.especialidadId === especialidadFiltroId)
    : MEDICOS;

  useEffect(() => {
    // legacy-app.js sigue siendo dueño de currentPatient (arrastra contrato,
    // servicios y agenda con él); este setter es el único puente para que
    // también actualice el PatientBanner de React — ver renderPatientBanner()
    // en src/hooks/AsignacionCitas/legacy-app.js.
    window.__setAsignacionCitasPatient = setPatient;
    const cleanup = initAsignacionCitas();
    return () => {
      cleanup?.();
      delete window.__setAsignacionCitasPatient;
    };
  }, []);

  useEffect(() => {
    // Puente inverso al de arriba: legacy-app.js expone este setter (ver
    // setMedicoAgenda ahí) y acá se lo llama cada vez que cambia el médico
    // elegido en el toolbar, para que "Agenda del día" regenere su franja
    // 7:00-18:00/30min para ese médico — independiente de currentPatient
    // (banner) por diseño, ver pregunta al usuario sobre el gate del empty
    // state.
    window.__setAsignacionCitasMedicoAgenda?.(medicoFiltroId);
  }, [medicoFiltroId]);

  return (
    <>
<div className="app">

  <Sidebar />

  {/* MAIN */}
  <div className="main">

    <Topbar
      section="Consulta Externa"
      page="Asignación de Citas"
      user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
    >
      <div className="meta-item">
        <LuFile className="icon" />
        <span className="lbl">Especialidad:</span> <b>Medicina General</b>
      </div>
      <div className="meta-item">
        <LuMapPin className="icon" />
        <span className="lbl">Sede:</span> <b>Sede Norte — Piso 2</b>
      </div>
    </Topbar>

    <div className="content">

      {/* PATIENT BANNER */}
      <PatientBanner
        leadingSelect={patient ? { label: 'Régimen', value: regimen, options: REGIMEN_OPTIONS, onChange: setRegimen } : undefined}
        secondRowButton={patient ? {
          label: 'Historial de citas',
          icon: LuHistory,
          // Mismo placeholder "en desarrollo" que psAccionHistorial() en
          // legacy-nueva-cita.js (menú contextual de Lista de Pacientes) —
          // todavía no hay una vista de historial real que abrir.
          onClick: () => window.ncToast?.(`Historial de citas de ${patient.nombre} (en desarrollo).`),
        } : undefined}
        patient={patient ? {
          iniciales: patient.iniciales,
          nombre: patient.nombre,
          documento: patient.documento,
          edad: `${patient.edad} años`,
          sexo: patient.sexo,
          eps: patient.eps,
          ciudad: patient.ciudad,
          telefono: patient.telefono,
        } : null}
        secondRow={patient ? [
          { label: 'Ciudad', value: patient.ciudad },
          { label: 'Teléfono', value: patient.telefono },
          { label: 'Citas futuras', value: patient.citasFuturas },
        ] : undefined}
        statusBadge={patient ? { label: ESTADO_LABEL[patient.estado], tone: ESTADO_TONE[patient.estado] } : undefined}
        onClose={patient ? () => window.clearPatient() : undefined}
        empty={{
          title: 'Ningún paciente seleccionado',
          subtitle: 'Busca por nombre o documento para iniciar la atención',
          actionLabel: 'Buscar paciente',
          onAction: () => window.openPatientSearch(),
        }}
      />

      {/* WORKSPACE */}
      <div className="workspace">

        {/* LEFT: CONTRATO / SERVICIOS */}
        <aside className="side-panel">

          <div className="panel-card contract-block">
            <div className="panel-card-title">
              <span className="lbl"><LuFileText className="icon" />Contrato</span>
              <button className="link-btn">Cambiar</button>
            </div>
            <div className="contract-row">
              <span className="k">N° Contrato</span>
              <span className="v" id="contrato-numero">—</span>
            </div>
            <div className="contract-row">
              <span className="k">Tipo</span>
              <span className="v link" id="contrato-tipo">—</span>
            </div>
          </div>

          <div className="services-card">
            <div className="services-search">
              <LuSearch className="icon" />
              <input type="text" placeholder="Buscar procedimiento..." />
            </div>
            <div className="panel-card-title" style={{marginBottom:'8px'}}>
              <span className="lbl" style={{textTransform:'none', fontSize:'11.5px'}}>Servicios contratados</span>
              <Badge tone="neutral" id="servicios-count">0</Badge>
            </div>
            <div className="services-list" id="services-list"></div>
          </div>

        </aside>

        {/* RIGHT: AGENDA */}
        <div className="agenda-panel">

          <div className="card">
            {/* Mismo patrón que .pc-toolbar en ProgramarCita/AgendaToolbar.jsx:
                selectores inline a la izquierda + navegación de fecha al
                extremo derecho, en una sola barra. */}
            <div className="ac-toolbar">
              <div className="ac-toolbar-selectors">
                <div className="ac-select-wrap">
                  <label id="filtro-especialidad-label">Especialidad</label>
                  <button
                    type="button"
                    className="ac-picker-trigger"
                    aria-labelledby="filtro-especialidad-label"
                    onClick={() => setPickerAbierto('especialidad')}
                  >
                    <span>{especialidadFiltro?.nombre ?? 'Todas'}</span>
                    <LuChevronDown className="icon chev" aria-hidden="true" />
                  </button>
                </div>
                <div className="ac-select-wrap">
                  <label id="filtro-medico-label">Médico</label>
                  <button
                    type="button"
                    className="ac-picker-trigger"
                    aria-labelledby="filtro-medico-label"
                    onClick={() => setPickerAbierto('medico')}
                  >
                    <span>{medicoFiltro?.nombre ?? 'Todos'}</span>
                    <LuChevronDown className="icon chev" aria-hidden="true" />
                  </button>
                </div>
                <div className="ac-select-wrap">
                  <label htmlFor="clase-orden-select">Clase de orden</label>
                  <select id="clase-orden-select" className="ac-native-select">
                    <option>Todas</option><option>Primera vez</option><option>Control</option>
                  </select>
                </div>
              </div>
              <div className="ac-date-nav">
                <button type="button" className="ac-nav-btn" aria-label="Día anterior" onClick={handlePrevDate}>
                  <LuChevronLeft className="icon" />
                </button>
                <span className="ac-date-label">{formatDateChip(viewDate)}</span>
                <button type="button" className="ac-nav-btn" aria-label="Día siguiente" onClick={handleNextDate}>
                  <LuChevronRight className="icon" />
                </button>
              </div>
            </div>

            {pickerAbierto === 'especialidad' && (
              <FiltroPickerModal
                title="Seleccionar especialidad"
                searchPlaceholder="Buscar por nombre o ID..."
                idHeader="ID"
                nameHeader="Especialidad"
                countHeader="Cantidad de médicos"
                items={ESPECIALIDADES.map((e) => ({
                  id: e.id,
                  codigo: e.codigo,
                  label: e.nombre,
                  count: MEDICOS.filter((m) => m.especialidadId === e.id).length,
                }))}
                selectedId={especialidadFiltroId}
                onSelect={(id) => {
                  setEspecialidadFiltroId(id);
                  // Cambiar de especialidad puede dejar al médico elegido
                  // fuera de la nueva lista filtrada (mismo resguardo que
                  // handleChangeEspecialidad en ProgramarCita.jsx).
                  if (medicoFiltroId && !MEDICOS.some((m) => m.id === medicoFiltroId && m.especialidadId === id)) {
                    setMedicoFiltroId(null);
                  }
                }}
                onClose={() => setPickerAbierto(null)}
              />
            )}
            {pickerAbierto === 'medico' && (
              <FiltroPickerModal
                title="Seleccionar médico"
                searchPlaceholder="Buscar por nombre o ID..."
                idHeader="ID médico"
                nameHeader="Nombre médico"
                countHeader="Citas disponibles"
                items={medicosDeEspecialidad.map((m) => ({
                  id: m.id, codigo: m.codigo, label: m.nombre, count: m.citasDisponibles,
                }))}
                selectedId={medicoFiltroId}
                onSelect={setMedicoFiltroId}
                onClose={() => setPickerAbierto(null)}
              />
            )}
            <div className="tabs-bar">
              <div className="tabs" role="tablist">
                <div className="tab active" tabIndex="0" role="tab" aria-selected="true" onClick={(e) => window.cambiarTab(e.currentTarget)}>Agenda del día <span className="count">5</span></div>
                <div className="tab" tabIndex="0" role="tab" aria-selected="false" onClick={(e) => window.cambiarTab(e.currentTarget)}>Disponibilidad <span className="count">10</span></div>
                <div className="tab" tabIndex="0" role="tab" aria-selected="false" onClick={(e) => window.cambiarTab(e.currentTarget)}>Disponibilidad (Sedes)</div>
                <div className="tab" tabIndex="0" role="tab" aria-selected="false" onClick={(e) => window.cambiarTab(e.currentTarget)}>Disponibilidad (Especialidad)</div>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{width:'90px'}}>Hora</th>
                    <th style={{width:'110px'}}>Hora Llegada</th>
                    <th>Paciente / Tipo</th>
                    <th>EPS</th>
                    <th>Valor</th>
                    <th>Teléfono</th>
                    <th>F. Solicitud</th>
                    <th style={{width:'120px'}}>Estado</th>
                  </tr>
                </thead>
                <tbody id="agenda-tbody"></tbody>
              </table>
            </div>

            <div className="legend-bar">
              <div className="legend-item"><span className="dot green"></span>Disponible</div>
              <div className="legend-item"><span className="dot red"></span>Ocupado</div>
              <div className="legend-item"><span className="dot gray"></span>Expirado</div>
              <div className="legend-item"><span className="dot amber"></span>Bloqueado</div>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="page-footer-bar">
        <span className="footer-note" id="footer-note">Cita seleccionada: <b id="footer-selected">08:20 — Mario Pineda León</b></span>
        <div className="footer-actions">
          <button className="btn btn-primary" onClick={() => window.ncOpen()}><LuPlus className="icon" />Nueva cita</button>
          <button className="btn btn-secondary" id="footer-editar-btn"><LuPencil className="icon" />Editar</button>
          <button className="btn btn-danger-outline" id="footer-cancelar-btn"><LuCalendarX className="icon" />Cancelar</button>
          <button className="btn btn-secondary" id="footer-imprimir-btn"><LuPrinter className="icon" />Imprimir</button>
        </div>
      </div>

    </div>
  </div>
</div>

{/* MENÚ CONTEXTUAL DE FILA (posición fija, fuera del scroll de la tabla) */}
<div className="context-menu" id="row-context-menu" role="menu" onClick={(e) => e.stopPropagation()}>
  <div className="context-menu-item accent" tabIndex="0" role="menuitem" onClick={() => window.accionMarcarLlegada()}>
    <LuCheck className="icon" />Marcar llegada
  </div>
  <div className="context-menu-item" tabIndex="0" role="menuitem" onClick={() => window.accionReprogramar()}>
    <LuCalendarClock className="icon" />Reprogramar
  </div>
  <div className="context-menu-item danger" tabIndex="0" role="menuitem" onClick={() => window.accionCancelar()}>
    <LuCalendarX className="icon" />Cancelar
  </div>
  <div className="context-menu-divider"></div>
  <div className="context-menu-item" tabIndex="0" role="menuitem" onClick={() => window.accionVerDetalle()}>
    <LuEye className="icon" />Ver detalle
  </div>
</div>

{/* FLUJO "NUEVA CITA" (búsqueda/alta de paciente + wizard de agendamiento) */}
<NuevaCitaFlow />
    </>
  );
}
