'use client';

import { useEffect } from 'react';
import './asignacion-citas.css';
import { initAsignacionCitas } from './legacy-app';

export default function AsignacionCitasPage() {
  useEffect(() => {
    const cleanup = initAsignacionCitas();
    return cleanup;
  }, []);

  return (
    <>
<div className="app">

  {/* SIDEBAR */}
  <aside className="sidebar" id="sidebar">

    <div className="sidebar-brand">
      <div className="wordmark">
        <div className="symbol" aria-label="Expandir menú" title="Expandir menú" onClick={() => window.toggleSidebar()}>
          <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.1595 14.0019C19.1595 16.8535 16.8497 19.1639 13.9987 19.1639C11.1477 19.1639 8.83785 16.8535 8.83785 14.0019C8.83785 11.1502 11.1508 8.83984 13.9987 8.83984C16.8466 8.83984 19.1595 11.1502 19.1595 14.0019Z" fill="#58C2DC"/>
            <path d="M28 14.0015C28 16.0274 27.5702 17.9543 26.7971 19.6894C26.7631 19.7574 26.7291 19.8286 26.6951 19.8997C24.4687 24.6844 19.6202 28 13.9956 28C6.30228 28 0.0592013 21.7926 0.000450226 14.1098C-0.0613931 6.36828 6.2559 0 13.9956 0C16.0612 0 18.0247 0.44847 19.7903 1.25262C20.7149 1.67326 21.2189 2.5702 21.2189 3.47642C21.2189 4.08572 20.9901 4.7043 20.5077 5.18679C19.7872 5.90743 18.6957 6.09301 17.7649 5.66928C16.6116 5.14658 15.3314 4.85585 13.9863 4.85585C8.8595 4.85585 4.69745 9.16425 4.85515 14.2892C5.00667 19.1172 8.89352 23.0019 13.7235 23.1411C18.8441 23.2895 23.1391 19.1234 23.1391 13.9985C23.1391 12.653 22.8485 11.3757 22.3259 10.2251C22.1775 9.89418 22.1032 9.54468 22.1032 9.19828C22.1032 8.56733 22.3444 7.94875 22.8083 7.48481C24.0049 6.28786 26.0272 6.64973 26.7322 8.1869C26.7539 8.23639 26.7755 8.28587 26.7971 8.33536C26.8281 8.4065 26.8621 8.47763 26.8961 8.54568C26.8992 8.55495 26.9023 8.56114 26.9085 8.57042C27.6104 10.2406 27.9969 12.0716 27.9969 13.9985L28 14.0015Z" fill="white"/>
          </svg>
        </div>
        <span className="brand-text">clintos</span>
      </div>
      <span className="collapse-btn" aria-label="Colapsar menú" title="Colapsar menú" onClick={() => window.toggleSidebar()}><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg></span>
    </div>

    <div className="sidebar-divider"></div>

    <nav className="sidebar-nav">

      <div className="nav-group open">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2v2" />
  <path d="M5 2v2" />
  <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
  <path d="M8 15a6 6 0 0 0 12 0v-3" />
  <circle cx="20" cy="10" r="2" /></svg>
          <span className="label">Módulo Asistencial</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body">

          <div className="nav-group sub open">
            <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
              <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M8 12h8" />
  <path d="M12 8v8" /></svg>
              <span className="label">Consulta Externa</span>
              <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
            <div className="nav-body">
              <div className="nav-subitem active" tabIndex="0" role="button"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" />
  <path d="M16 2v4" />
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M3 10h18" />
  <path d="M8 14h.01" />
  <path d="M12 14h.01" />
  <path d="M16 14h.01" />
  <path d="M8 18h.01" />
  <path d="M12 18h.01" />
  <path d="M16 18h.01" /></svg>Asignación de citas</div>
              <div className="nav-subitem" tabIndex="0" role="button"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 14v2.2l1.6 1" />
  <path d="M16 2v4" />
  <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
  <path d="M3 10h5" />
  <path d="M8 2v4" />
  <circle cx="16" cy="16" r="6" /></svg>Reprogramar Citas</div>
              <div className="nav-subitem" tabIndex="0" role="button"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
  <path d="M10 9H8" />
  <path d="M16 13H8" />
  <path d="M16 17H8" /></svg>Historias Clínicas</div>
              <div className="nav-subitem" tabIndex="0" role="button"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" /></svg>Signos Vitales</div>
              <div className="nav-subitem" tabIndex="0" role="button"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18v-6a5 5 0 1 1 10 0v6" />
  <path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
  <path d="M21 12h1" />
  <path d="M18.5 4.5 18 5" />
  <path d="M2 12h1" />
  <path d="M12 2v1" />
  <path d="m4.929 4.929.707.707" />
  <path d="M12 12v6" /></svg>Accidentes de Tránsito</div>
              <div className="nav-subitem" tabIndex="0" role="button"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  <path d="M16 3.128a4 4 0 0 1 0 7.744" />
  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
  <circle cx="9" cy="7" r="4" /></svg>Pacientes</div>
              <div className="nav-subitem" tabIndex="0" role="button"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
  <path d="M12 22V12" />
  <polyline points="3.29 7 12 12 20.71 7" />
  <path d="m7.5 4.27 9 5.15" /></svg>Solicitud de consumo</div>
            </div>
          </div>

        </div>
      </div>

      <div className="nav-group">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16" />
  <path d="M2 8h18a2 2 0 0 1 2 2v10" />
  <path d="M2 17h20" />
  <path d="M6 8v9" /></svg>
          <span className="label">Hospitalización</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body"></div>
      </div>

      <div className="nav-group">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4" />
  <path d="m17 7 3-3" />
  <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
  <path d="m9 11 4 4" />
  <path d="m5 19-3 3" />
  <path d="m14 4 6 6" /></svg>
          <span className="label">Ayudas DX</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body"></div>
      </div>

      <div className="nav-group">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
  <path d="m3.3 7 8.7 5 8.7-5" />
  <path d="M12 22V12" /></svg>
          <span className="label">Consolidados</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body"></div>
      </div>

      <div className="nav-group">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
          <span className="label">Finanzas</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body"></div>
      </div>

      <div className="nav-group">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" /></svg>
          <span className="label">Utilitarios</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body"></div>
      </div>

      <div className="nav-group">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16" />
  <path d="M18 17V9" />
  <path d="M13 17V5" />
  <path d="M8 17v-3" /></svg>
          <span className="label">Reportes (CR)</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body"></div>
      </div>

      <div className="nav-group">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
  <circle cx="12" cy="12" r="3" /></svg>
          <span className="label">Configuración</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body"></div>
      </div>

      <div className="sidebar-divider"></div>

      <div className="nav-group">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 18v-7" />
  <path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z" />
  <path d="M14 18v-7" />
  <path d="M18 18v-7" />
  <path d="M3 22h18" />
  <path d="M6 18v-7" /></svg>
          <span className="label">Módulo Contable</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body"></div>
      </div>

      <div className="nav-group">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 21a8 8 0 0 0-16 0" />
  <circle cx="10" cy="8" r="5" />
  <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" /></svg>
          <span className="label">Módulo Nómina</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body"></div>
      </div>

      <div className="nav-group">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
          <span className="label">Otros soportes</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body"></div>
      </div>

    </nav>

    <div className="theme-toggle-row">
      <div className="theme-toggle-icon" onClick={() => window.toggleThemeFromIcon()} aria-label="Cambiar tema" title="Cambiar tema">
        <svg className="icon theme-icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" />
  <path d="M12 2v2" />
  <path d="M12 20v2" />
  <path d="m4.93 4.93 1.41 1.41" />
  <path d="m17.66 17.66 1.41 1.41" />
  <path d="M2 12h2" />
  <path d="M20 12h2" />
  <path d="m6.34 17.66-1.41 1.41" />
  <path d="m19.07 4.93-1.41 1.41" /></svg>
        <svg className="icon theme-icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>
      </div>
      <span className="theme-label">Modo oscuro</span>
      <label className="switch">
        <input type="checkbox" id="theme-switch" onChange={() => window.toggleTheme()} />
        <span className="switch-slider"></span>
      </label>
    </div>
  </aside>

  {/* MAIN */}
  <div className="main">

    {/* TOPBAR */}
    <header className="topbar">
      <svg className="hamburger icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16" />
  <path d="M4 12h16" />
  <path d="M4 19h16" /></svg>
      <div className="breadcrumb">
        <span>Consulta Externa</span><span className="sep">/</span>
        <span className="current">Asignación de Citas</span>
      </div>
      <div className="spacer"></div>
      <div className="topbar-right">
        <div className="pill-chip">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
  <circle cx="12" cy="10" r="3" /></svg>
          Sede Norte — Piso 2
        </div>
        <div className="divider-v"></div>
        <div className="icon-btn-circle" onClick={() => window.toggleThemeFromIcon()} aria-label="Cambiar tema" title="Cambiar tema">
          <svg className="icon theme-icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" />
  <path d="M12 2v2" />
  <path d="M12 20v2" />
  <path d="m4.93 4.93 1.41 1.41" />
  <path d="m17.66 17.66 1.41 1.41" />
  <path d="M2 12h2" />
  <path d="M20 12h2" />
  <path d="m6.34 17.66-1.41 1.41" />
  <path d="m19.07 4.93-1.41 1.41" /></svg>
          <svg className="icon theme-icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>
        </div>
        <div className="user-chip">
          <div className="user-avatar">JC</div>
          <div className="who">
            <div className="name">Dr. Juan Carlos Pérez</div>
            <div className="role">Medicina General</div>
          </div>
        </div>
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
              <span className="lbl"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
  <path d="M10 9H8" />
  <path d="M16 13H8" />
  <path d="M16 17H8" /></svg>Contrato</span>
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
              <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34" />
  <circle cx="11" cy="11" r="8" /></svg>
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
                <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" />
  <path d="M16 2v4" />
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M3 10h18" /></svg>
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
          <button className="btn btn-primary" onClick={() => window.ncOpen()}><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" />
  <path d="M12 5v14" /></svg>Nueva cita</button>
          <button className="btn btn-secondary" id="footer-editar-btn"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
  <path d="m15 5 4 4" /></svg>Editar</button>
          <button className="btn btn-danger-outline" id="footer-cancelar-btn"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" />
  <path d="M16 2v4" />
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M3 10h18" />
  <path d="m14 14-4 4" />
  <path d="m10 14 4 4" /></svg>Cancelar</button>
          <button className="btn btn-secondary" id="footer-imprimir-btn"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
  <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
  <rect x="6" y="14" width="12" height="8" rx="1" /></svg>Imprimir</button>
        </div>
      </div>

    </div>
  </div>
</div>

{/* MENÚ CONTEXTUAL DE FILA (posición fija, fuera del scroll de la tabla) */}
<div className="context-menu" id="row-context-menu" role="menu" onClick={(e) => e.stopPropagation()}>
  <div className="context-menu-item accent" tabIndex="0" role="menuitem" onClick={() => window.accionMarcarLlegada()}>
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Marcar llegada
  </div>
  <div className="context-menu-item" tabIndex="0" role="menuitem" onClick={() => window.accionReprogramar()}>
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 14v2.2l1.6 1" />
  <path d="M16 2v4" />
  <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
  <path d="M3 10h5" />
  <path d="M8 2v4" />
  <circle cx="16" cy="16" r="6" /></svg>Reprogramar
  </div>
  <div className="context-menu-item danger" tabIndex="0" role="menuitem" onClick={() => window.accionCancelar()}>
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" />
  <path d="M16 2v4" />
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M3 10h18" />
  <path d="m14 14-4 4" />
  <path d="m10 14 4 4" /></svg>Cancelar
  </div>
  <div className="context-menu-divider"></div>
  <div className="context-menu-item" tabIndex="0" role="menuitem" onClick={() => window.accionVerDetalle()}>
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
  <circle cx="12" cy="12" r="3" /></svg>Ver detalle
  </div>
</div>

{/* MENÚ CONTEXTUAL DE FILA DE PACIENTE */}
<div className="context-menu" id="ps-context-menu" role="menu" onClick={(e) => e.stopPropagation()}>
  <div className="context-menu-item" tabIndex="0" role="menuitem" onClick={() => window.psAccionEditar()}>
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" /></svg>Editar
  </div>
  <div className="context-menu-item" tabIndex="0" role="menuitem" onClick={() => window.psAccionHistorial()}>
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
  <path d="M3 3v5h5" />
  <path d="M12 7v5l4 2" /></svg>Historial de citas
  </div>
  <div className="context-menu-divider"></div>
  <div className="context-menu-item danger" tabIndex="0" role="menuitem" onClick={() => window.psAccionDesactivar()}>
    <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <line x1="17" x2="22" y1="8" y2="13" />
  <line x1="22" x2="17" y1="8" y2="13" /></svg>Desactivar usuario
  </div>
</div>

{/* MODAL: BÚSQUEDA DE PACIENTES */}
<div className="modal-overlay" id="ps-overlay" onClick={(e) => { if (e.target === e.currentTarget) window.closePatientSearch(); }}>
  <div className="ps-modal">
    <div className="ps-header">
      <div className="ps-header-title">
        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
  <path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        Lista de Pacientes
      </div>
      <button className="wizard-close" onClick={() => window.closePatientSearch()} aria-label="Cerrar" title="Cerrar">
        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </button>
    </div>
    <div className="ps-search-row">
      <div className="ps-search-field">
        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>
        <input type="text" placeholder="Buscar por nombre o documento..." onInput={(e) => window.filterPatients(e.target.value)} autoFocus />
      </div>
      <button className="icon-btn-circle" onClick={() => window.ncToast('Escaneo de QR de cédula en desarrollo.')} aria-label="Buscar por QR de cédula" title="Buscar por QR de cédula">
        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" />
  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
  <path d="M7 12h10" /></svg>
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
        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M19 8v6" /><path d="M22 11h-6" /></svg>
        Agregar paciente
      </button>
      <div className="wizard-footer-actions">
        <button className="btn btn-primary" id="ps-accept-btn" onClick={() => window.confirmPatientSelection()} disabled>
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
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
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" /></svg>
            <span id="ap-rail-sub">Historia clínica nueva</span>
          </div>
        </div>
        <div className="wizard-rail-nav" id="ap-rail"></div>
      </nav>

      <div className="wizard-main">
        <div className="wizard-main-header">
          <div className="t" id="ap-progress-text">Paso 1 de 4</div>
          <button className="wizard-close" onClick={() => window.apClose()} aria-label="Cerrar" title="Cerrar">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <form id="ap-form" onSubmit={(e) => e.preventDefault()}>
          <div className="wizard-content" id="ap-content"></div>
        </form>

        <div className="wizard-footer">
          <button type="button" className="btn btn-secondary" id="ap-back-btn" onClick={() => window.apBack()}>
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>Atrás
          </button>
          <div className="wizard-footer-actions">
            <button type="button" className="btn btn-primary" id="ap-continue-btn">Siguiente
              <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
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
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 10h2" />
  <path d="M16 14h2" />
  <path d="M6.17 15a3 3 0 0 1 5.66 0" />
  <circle cx="9" cy="11" r="2" />
  <rect x="2" y="5" width="20" height="14" rx="2" /></svg>
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
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <nav className="wiz-stepper" id="nc-stepper"></nav>

        <div className="wizard-content" id="nc-content"></div>

        <div className="wizard-footer">
          <button className="btn btn-secondary" id="nc-back-btn" onClick={() => window.ncBack()}>
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>Atrás
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
