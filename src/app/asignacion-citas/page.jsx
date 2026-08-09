'use client';

import { useEffect, useState } from 'react';
import './asignacion-citas.css';
import { initAsignacionCitas } from '@/hooks/AsignacionCitas/legacy-app';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import PatientBanner from '@/Components/PatientBanner/PatientBanner';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import { LuCalendar, LuCalendarClock, LuCalendarX, LuCheck, LuEye, LuFile, LuFileText, LuMapPin, LuPencil, LuPlus, LuPrinter, LuSearch } from 'react-icons/lu';

// activo/inactivo/suspendido son los valores de estado que usa PATIENTS en
// legacy-app.js; se traducen a los tonos que soporta PatientBanner
// (status-active/status-inactive/status-suspendido en PatientBanner.css).
const ESTADO_LABEL = { activo: 'Activo', inactivo: 'Inactivo', suspendido: 'Suspendido' };
const ESTADO_TONE = { activo: 'active', inactivo: 'inactive', suspendido: 'suspendido' };

export default function AsignacionCitasPage() {
  const [patient, setPatient] = useState(null);

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
        patient={patient ? {
          iniciales: patient.iniciales,
          nombre: patient.nombre,
          documento: patient.documento,
          edad: `${patient.edad} años`,
          sexo: patient.sexo,
          eps: patient.eps,
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
              <span className="badge neutral" id="servicios-count">0</span>
            </div>
            <div className="services-list" id="services-list"></div>
          </div>

        </aside>

        {/* RIGHT: AGENDA */}
        <div className="agenda-panel">

          <div className="card">
            <div className="filters-row">
              <div className="select-field">
                <label>Régimen</label>
                <select><option>Todos</option><option>Contributivo</option><option>Subsidiado</option></select>
              </div>
              <div className="select-field">
                <label>Especialidad</label>
                <select><option>Todas</option><option>Medicina General</option><option>Pediatría</option><option>Ginecología</option></select>
              </div>
              <div className="select-field">
                <label>Médico</label>
                <select><option>Todos</option><option>Dr. Juan Carlos Pérez</option><option>Dra. Ana María Ruiz</option></select>
              </div>
              <div className="select-field">
                <label>Clase de orden</label>
                <select><option>Todas</option><option>Primera vez</option><option>Control</option></select>
              </div>
            </div>
            <div className="tabs-bar">
              <div className="tabs" role="tablist">
                <div className="tab active" tabIndex="0" role="tab" aria-selected="true" onClick={(e) => window.cambiarTab(e.currentTarget)}>Agenda del día <span className="count">5</span></div>
                <div className="tab" tabIndex="0" role="tab" aria-selected="false" onClick={(e) => window.cambiarTab(e.currentTarget)}>Disponibilidad <span className="count">10</span></div>
                <div className="tab" tabIndex="0" role="tab" aria-selected="false" onClick={(e) => window.cambiarTab(e.currentTarget)}>Disponibilidad (Sedes)</div>
                <div className="tab" tabIndex="0" role="tab" aria-selected="false" onClick={(e) => window.cambiarTab(e.currentTarget)}>Disponibilidad (Especialidad)</div>
              </div>
              <div className="date-picker-chip">
                <LuCalendar className="icon" />
                sáb, 18 jul 2026
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
