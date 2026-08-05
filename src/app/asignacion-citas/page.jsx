'use client';

import { useEffect } from 'react';
import './asignacion-citas.css';
import { initAsignacionCitas } from '@/hooks/AsignacionCitas/legacy-app';
import Sidebar from '@/Components/Sidebar/Sidebar';
import UserMenu from '@/Components/UserMenu/UserMenu';
import { LuArrowRight, LuCalendar, LuCalendarClock, LuCalendarX, LuCheck, LuChevronLeft, LuEye, LuFileText, LuHistory, LuIdCard, LuMapPin, LuMenu, LuMoon, LuPencil, LuPlus, LuPrinter, LuScanLine, LuSearch, LuSquarePen, LuSun, LuUser, LuUserPlus, LuUserX, LuUsers, LuX } from 'react-icons/lu';

export default function AsignacionCitasPage() {
  useEffect(() => {
    const cleanup = initAsignacionCitas();
    return cleanup;
  }, []);

  return (
    <>
<div className="app">

  <Sidebar />

  {/* MAIN */}
  <div className="main">

    {/* TOPBAR */}
    <header className="topbar">
      <LuMenu className="hamburger icon" />
      <div className="breadcrumb">
        <span>Consulta Externa</span><span className="sep">/</span>
        <span className="current">Asignación de Citas</span>
      </div>
      <div className="spacer"></div>
      <div className="topbar-right">
        <div className="pill-chip">
          <LuMapPin className="icon" />
          Sede Norte — Piso 2
        </div>
        <div className="divider-v"></div>
        <div className="icon-btn-circle" onClick={() => window.toggleThemeFromIcon()} aria-label="Cambiar tema" title="Cambiar tema">
          <LuSun className="icon theme-icon-sun" />
          <LuMoon className="icon theme-icon-moon" />
        </div>
        <UserMenu name="Dr. Juan Carlos Pérez" role="Medicina General" initials="JC" />
      </div>
    </header>

    <div className="content">

      {/* PATIENT BANNER */}
      <div id="patient-banner-zone"></div>

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

{/* MENÚ CONTEXTUAL DE FILA DE PACIENTE */}
<div className="context-menu" id="ps-context-menu" role="menu" onClick={(e) => e.stopPropagation()}>
  <div className="context-menu-item" tabIndex="0" role="menuitem" onClick={() => window.psAccionEditar()}>
    <LuSquarePen className="icon" />Editar
  </div>
  <div className="context-menu-item" tabIndex="0" role="menuitem" onClick={() => window.psAccionHistorial()}>
    <LuHistory className="icon" />Historial de citas
  </div>
  <div className="context-menu-divider"></div>
  <div className="context-menu-item danger" tabIndex="0" role="menuitem" onClick={() => window.psAccionDesactivar()}>
    <LuUserX className="icon" />Desactivar usuario
  </div>
</div>

{/* MODAL: BÚSQUEDA DE PACIENTES */}
<div className="modal-overlay" id="ps-overlay" onClick={(e) => { if (e.target === e.currentTarget) window.closePatientSearch(); }}>
  <div className="ps-modal">
    <div className="ps-header">
      <div className="ps-header-title">
        <LuUsers className="icon" />
        Lista de Pacientes
      </div>
      <button className="wizard-close" onClick={() => window.closePatientSearch()} aria-label="Cerrar" title="Cerrar">
        <LuX className="icon" />
      </button>
    </div>
    <div className="ps-search-row">
      <div className="ps-search-field">
        <LuSearch className="icon" />
        <input type="text" placeholder="Buscar por nombre o documento..." onInput={(e) => window.filterPatients(e.target.value)} autoFocus />
      </div>
      <button className="icon-btn-circle" onClick={() => window.ncToast('Escaneo de QR de cédula en desarrollo.')} aria-label="Buscar por QR de cédula" title="Buscar por QR de cédula">
        <LuScanLine className="icon" />
      </button>
    </div>
    <div className="ps-table-wrap">
      <table>
        <thead><tr>
          <th>Paciente</th><th style={{width:'150px'}}>Documento</th><th style={{width:'130px'}}>Ciudad</th><th style={{width:'130px'}}>EPS</th><th style={{width:'120px'}}>Estado</th><th style={{width:'44px'}}></th>
        </tr></thead>
        <tbody id="ps-tbody"></tbody>
      </table>
    </div>

    <div className="wizard-footer">
      <button className="btn btn-secondary" onClick={() => window.apOpen()}>
        <LuUserPlus className="icon" />
        Agregar paciente
      </button>
      <div className="wizard-footer-actions">
        <button className="btn btn-primary" id="ps-accept-btn" onClick={() => window.confirmPatientSelection()} disabled>
          <LuCheck className="icon" />
          Aceptar
        </button>
      </div>
    </div>
  </div>
</div>

{/* WIZARD: AGREGAR PACIENTE */}
<div className="modal-overlay" id="ap-overlay" onClick={(e) => { if (e.target === e.currentTarget) window.apClose(); }}>
  <div className="wizard-modal">

    <div className="wizard-body">
      <nav className="wizard-rail">
        <div className="wizard-rail-header">
          <div className="rh-eyebrow" id="ap-rail-eyebrow">Nuevo registro</div>
          <div className="rh-title" id="ap-rail-title">Agregar Paciente</div>
          <div className="rh-sub">
            <LuUser className="icon" />
            <span id="ap-rail-sub">Historia clínica nueva</span>
          </div>
        </div>
        <div className="wizard-rail-nav" id="ap-rail"></div>
      </nav>

      <div className="wizard-main">
        <div className="wizard-main-header">
          <div className="t" id="ap-progress-text">Paso 1 de 4</div>
          <button className="wizard-close" onClick={() => window.apClose()} aria-label="Cerrar" title="Cerrar">
            <LuX className="icon" />
          </button>
        </div>

        <form id="ap-form" onSubmit={(e) => e.preventDefault()}>
          <div className="wizard-content" id="ap-content"></div>
        </form>

        <div className="wizard-footer">
          <button type="button" className="btn btn-secondary" id="ap-back-btn" onClick={() => window.apBack()}>
            <LuChevronLeft className="icon" />Atrás
          </button>
          <div className="wizard-footer-actions">
            <button type="button" className="btn btn-primary" id="ap-continue-btn">Siguiente
              <LuArrowRight className="icon" />
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>

{/* WIZARD: NUEVO AGENDAMIENTO */}
<div className="modal-overlay" id="nc-overlay" onClick={(e) => { if (e.target === e.currentTarget) window.ncClose(); }}>
  <div className="wizard-modal">

    <div className="wizard-body">
      <nav className="wizard-rail">
        <div className="wizard-rail-header">
          <div className="rh-eyebrow">Nueva Cita</div>
          <div className="rh-title" id="nc-rail-patient-name">Laura Sofía Martínez Gómez</div>
          <div className="rh-sub">
            <LuIdCard className="icon" />
            <span id="nc-rail-patient-doc">CC 1.032.847.291</span>
          </div>
        </div>
        <div className="wizard-rail-nav" id="nc-rail"></div>
      </nav>

      <div className="wizard-main">
        <div className="wizard-main-header">
          <div>
            <div className="t" id="nc-main-title">Régimen</div>
            <div className="sub" id="nc-progress-text">Paso 1 de 7</div>
          </div>
          <button className="wizard-close" onClick={() => window.ncClose()} aria-label="Cerrar" title="Cerrar">
            <LuX className="icon" />
          </button>
        </div>

        <nav className="wiz-stepper" id="nc-stepper"></nav>

        <div className="wizard-content" id="nc-content"></div>

        <div className="wizard-footer">
          <button className="btn btn-secondary" id="nc-back-btn" onClick={() => window.ncBack()}>
            <LuChevronLeft className="icon" />Atrás
          </button>
          <div className="wizard-footer-actions">
            <button className="btn btn-primary" id="nc-continue-btn" disabled>Continuar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
    </>
  );
}
