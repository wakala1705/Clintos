'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import '../asignacion-citas/asignacion-citas.css';
import './historia-clinica.css';
import { initHistoriaClinica } from './legacy-app';

export default function HistoriaClinicaPage() {
  useEffect(() => {
    const cleanup = initHistoriaClinica();
    return cleanup;
  }, []);

  return (
    <>
<div className="app">

  {/* SIDEBAR (shared with /asignacion-citas — see that page's comments; here
      "Hospitalización" is the open group with "Historia Clínica" active,
      and "Asignación de citas" is a real, non-active Link) */}
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

      <div className="nav-group">
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

          <div className="nav-group sub">
            <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
              <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M8 12h8" />
  <path d="M12 8v8" /></svg>
              <span className="label">Consulta Externa</span>
              <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
            <div className="nav-body">
              <Link href="/asignacion-citas" className="nav-subitem"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" />
  <path d="M16 2v4" />
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M3 10h18" />
  <path d="M8 14h.01" />
  <path d="M12 14h.01" />
  <path d="M16 14h.01" />
  <path d="M8 18h.01" />
  <path d="M12 18h.01" />
  <path d="M16 18h.01" /></svg>Asignación de citas</Link>
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

      <div className="nav-group open">
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <svg className="icon nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16" />
  <path d="M2 8h18a2 2 0 0 1 2 2v10" />
  <path d="M2 17h20" />
  <path d="M6 8v9" /></svg>
          <span className="label">Hospitalización</span>
          <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
        <div className="nav-body">
          <Link href="/historia-clinica" className="nav-subitem active"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
  <path d="M14 2v5a1 1 0 0 0 1 1h5" />
  <path d="M10 9H8" />
  <path d="M16 13H8" />
  <path d="M16 17H8" /></svg>Historia Clínica</Link>
        </div>
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
        <span>Hospitalización</span><span className="sep">/</span>
        <span className="current">Historia Clínica</span>
      </div>
      <div className="spacer"></div>
      <div className="topbar-right">
        <div className="meta-item">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /></svg>
          <span className="lbl">Especialidad:</span> <b>Oncología</b>
        </div>
        <div className="meta-item">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>
          <span className="lbl">Área:</span> <b>02-Hospitalización</b>
        </div>
        <div className="divider-v"></div>
        <div className="user-chip">
          <div className="user-avatar">CG</div>
          <div className="who">
            <div className="name">Manuel Hernández</div>
            <div className="role">Médico</div>
          </div>
        </div>
      </div>
    </header>

    <div className="content">
            <div className="patient-banner">
              <div className="patient-avatar">ID</div>
              <div className="patient-name-block"><div className="pname">Isabella Daniela Rodríguez Paternina</div></div>
              <div className="patient-meta">
                <div className="pm-item"><span className="lbl">CC</span> <b>1234567890</b></div>
                <div className="pm-item"><span className="lbl">EDAD</span> <b>34 años 10 meses 14 días</b></div>
                <div className="pm-item"><span className="lbl">SEXO</span> <b>Femenino</b></div>
                <div className="pm-item"><b>Salud Total Entidad Promotora de Salud del Régimen Contributivo y del Régimen S</b></div>
                <div className="pm-item"><a href="#">Ver más datos</a></div>
              </div>
              <div className="patient-banner-right">
                <div className="filter-popover-wrap" id="allergy-popover-wrap">
                  <button type="button" className="allergy-chip" id="allergy-btn" aria-haspopup="true" aria-expanded="false" aria-controls="allergy-popover">
                    <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    Alergias
                  </button>
                  <div className="filter-popover filter-popover-right" id="allergy-popover" role="dialog" aria-label="Detalle de alergias del paciente">
                    <div className="fp-title">Alergias registradas</div>
                    <div className="dp-info" style={{marginBottom: '0'}}>
                      <div className="dp-info-row"><span className="k">Penicilina</span><span className="v">Reacción cutánea moderada</span></div>
                      <div className="dp-info-row"><span className="k">Mariscos</span><span className="v">Anafilaxia leve</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admission-row">
                <div className="ar-item"><span className="lbl">Admisión</span> <b>0200265899</b></div>
                <div className="ar-item"><span className="lbl">N° contrato</span> <b>** No Especificado **</b></div>
                <div className="ar-item"><span className="lbl">ID Contrato</span> <b>197</b></div>
                <div className="ar-item"><span className="lbl">Cama</span> <b>305</b></div>
                <div className="ar-item"><span className="lbl">Estado</span> <span className="badge status-active badge-dot-inline"><span className="dot"></span>Activo</span></div>
              </div>
            </div>

            {/* CARD: CRONOGRAMA (con tabs de módulo integradas) */}
            <div className="card">
              <div className="card-tabs-bar" role="tablist" aria-label="Secciones de la historia clínica">
                <button type="button" className="card-tab active" role="tab" id="tab-medicamentos" aria-selected="true" aria-controls="panel-medicamentos" tabIndex="0">
                  <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                  Gestión de medicamentos
                </button>
                <button type="button" className="card-tab" role="tab" id="tab-ordenes" aria-selected="false" aria-controls="panel-medicamentos" tabIndex="-1">
                  <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>
                  Órdenes médicas
                </button>
                <button type="button" className="card-tab" role="tab" id="tab-pedidos" aria-selected="false" aria-controls="panel-pedidos" tabIndex="-1">
                  <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                  Pedidos
                </button>
                <button type="button" className="card-tab" role="tab" id="tab-monitoreo" aria-selected="false" aria-controls="panel-medicamentos" tabIndex="-1">
                  <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>
                  Monitoreo
                </button>
                <button type="button" className="card-tab" role="tab" id="tab-notas" aria-selected="false" aria-controls="panel-medicamentos" tabIndex="-1">
                  <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
                  Notas de enfermería
                </button>
              </div>

              <div role="tabpanel" id="panel-medicamentos" aria-labelledby="tab-medicamentos" tabIndex="0" className="tab-panel active">
              <div className="filter-bar">
                <div className="search-field">
                  <label htmlFor="search-input" className="sr-only">Buscar medicamento por nombre</label>
                  <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                  <input type="text" placeholder="Buscar medicamento..." id="search-input"/>
                </div>

                <div className="chip-group" id="estado-chip-group">
                  <button className="chip-filter active" data-estado="" aria-pressed="true">Todos</button>
                  <button className="chip-filter" data-estado="activo" aria-pressed="false">Activos</button>
                  <button className="chip-filter" data-estado="suspendido" aria-pressed="false">Suspendidos</button>
                  <button className="chip-filter" data-estado="finalizado" aria-pressed="false">Finalizados</button>
                </div>

                <div className="filter-divider"></div>

                <div className="chip-group">
                  <button className="chip-filter active" data-quickdate="hoy" aria-pressed="true">Hoy</button>
                  <button className="chip-filter" data-quickdate="semana" aria-pressed="false">Última semana</button>
                </div>

                <div className="filter-popover-wrap" id="date-popover-wrap">
                  <button className="date-picker-btn" id="date-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="date-popover">
                    <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                    <span id="date-range-label">Rango personalizado</span>
                    <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div className="filter-popover" id="date-popover" role="dialog" aria-label="Seleccionar rango de fechas">
                    <div className="fp-title">Seleccionar rango de fechas</div>
                    <div className="fp-date-row">
                      <div className="fp-date-field">
                        <label htmlFor="date-from">Desde</label>
                        <input type="date" id="date-from" defaultValue="2026-05-02"/>
                      </div>
                      <div className="fp-date-field">
                        <label htmlFor="date-to">Hasta</label>
                        <input type="date" id="date-to" defaultValue="2026-05-02"/>
                      </div>
                    </div>
                    <div className="fp-actions">
                      <button className="btn btn-secondary" type="button" id="date-clear-btn">Limpiar</button>
                      <button className="btn btn-primary" type="button" id="date-apply-btn">Aplicar</button>
                    </div>
                  </div>
                </div>

                <div className="filter-divider"></div>

                <div className="filter-popover-wrap" id="more-popover-wrap">
                  <button className="filters-more-btn" id="more-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="more-popover">
                    <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    Otros filtros
                    <span className="badge-count" id="more-badge-count" style={{display: 'none'}} aria-live="polite">0</span>
                  </button>
                  <div className="filter-popover filter-popover-wide" id="more-popover" role="dialog" aria-label="Otros filtros: turno y vía">
                    <div className="fp-section">
                      <div className="fp-section-title">Turno</div>
                      <div className="chip-group" id="turno-chip-group">
                        <button className="chip-filter" data-turno="manana" aria-pressed="false">Mañana</button>
                        <button className="chip-filter" data-turno="tarde" aria-pressed="false">Tarde</button>
                        <button className="chip-filter" data-turno="noche" aria-pressed="false">Noche</button>
                      </div>
                    </div>
                    <div className="fp-section">
                      <div className="fp-section-title">Vía</div>
                      <div className="chip-group" id="via-chip-group">
                        <button className="chip-filter" data-via="VO" aria-pressed="false">VO</button>
                        <button className="chip-filter" data-via="IV" aria-pressed="false">IV</button>
                        <button className="chip-filter" data-via="IM" aria-pressed="false">IM</button>
                        <button className="chip-filter" data-via="SC" aria-pressed="false">SC</button>
                      </div>
                    </div>
                    <div className="fp-actions">
                      <button className="btn btn-secondary" type="button" id="more-clear-btn">Limpiar</button>
                      <button className="btn btn-primary" type="button" id="more-apply-btn">Aplicar</button>
                    </div>
                  </div>
                </div>

                <div className="filter-spacer"></div>

                <div className="view-toggle-group">
                  <button className="view-btn" type="button" id="view-compact-btn" title="Compactar filas" aria-label="Compactar filas">
                    <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                  </button>
                  <button className="view-btn" type="button" id="view-expand-btn" title="Expandir filas" aria-label="Expandir filas">
                    <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                  <div className="view-toggle-divider"></div>
                  <button className="view-btn active" type="button" id="view-columns-btn" title="Ver todas las horas" aria-label="Ver todas las horas" aria-pressed="true">
                    <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="18" x="3" y="3" rx="1"/><rect width="7" height="18" x="14" y="3" rx="1"/></svg>
                  </button>
                  <button className="view-btn" type="button" id="view-split-btn" title="Ver solo horas pares" aria-label="Ver solo horas pares" aria-pressed="false">
                    <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
                  </button>
                </div>
              </div>

              <div className="selection-toolbar" id="selection-toolbar">
                <div className="sel-info" aria-live="polite"><b id="sel-count">0</b> medicamento(s) seleccionado(s)</div>
                <div className="sel-actions" id="sel-actions"></div>
                <div className="sel-hint" id="sel-hint" aria-live="polite"></div>
                <div className="sel-spacer"></div>
                <button className="sel-cancel-btn" type="button" id="sel-cancel-btn">Cancelar selección</button>
              </div>

              <div className="timeline-wrap" id="timeline-wrap">
                <table className="timeline-table">
                  <thead>
                    <tr id="hour-header-row">
                      <th className="check-col-head"><input type="checkbox" className="select-all-check" id="select-all-check" title="Seleccionar todos" aria-label="Seleccionar todos los medicamentos visibles"/></th>
                      <th className="med-col-head">Medicamentos</th>
                      {/* hour headers injected by JS */}
                    </tr>
                  </thead>
                  <tbody id="timeline-body">
                    {/* rows injected by JS */}
                  </tbody>
                </table>
              </div>

              <div className="legend-bar">
                <div className="footer-title-block">
                  <div className="ft-sub" id="ft-sub">7 medicamentos · ronda del 02 May 2026</div>
                </div>
                <div className="legend-divider"></div>
                <div className="legend-items">
                  <div className="legend-item"><span className="legend-marker scheduled"></span>Programado</div>
                  <div className="legend-item"><span className="legend-marker administered"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>Administrado</div>
                  <div className="legend-item"><span className="legend-marker upcoming"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>Próximo</div>
                  <div className="legend-item"><span className="legend-marker incident"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></span>Incidencia</div>
                  <div className="legend-item"><span className="legend-marker suspended"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg></span>Suspendido</div>
                </div>
                <div className="footer-updated">Última actualización: <b>14:32h</b></div>
              </div>
              </div>

              {/* PANEL: PEDIDOS (con subnavegación Solicitudes / Recepción / Devoluciones) */}
              <div role="tabpanel" id="panel-pedidos" aria-labelledby="tab-pedidos" tabIndex="0" className="tab-panel">

                <div className="subnav-bar" role="tablist" aria-label="Secciones de pedidos">
                  <button type="button" className="subnav-tab active" role="tab" id="subtab-solicitudes" aria-selected="true" aria-controls="subpanel-solicitudes" tabIndex="0">
                    <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
                    Solicitudes
                  </button>
                  <button type="button" className="subnav-tab" role="tab" id="subtab-recepcion" aria-selected="false" aria-controls="subpanel-recepcion" tabIndex="-1">
                    <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
                    Recepción
                  </button>
                  <button type="button" className="subnav-tab" role="tab" id="subtab-devoluciones" aria-selected="false" aria-controls="subpanel-devoluciones" tabIndex="-1">
                    <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                    Devoluciones
                  </button>
                </div>

                {/* SUB-PANEL: SOLICITUDES */}
                <div role="tabpanel" id="subpanel-solicitudes" aria-labelledby="subtab-solicitudes" tabIndex="0" className="sub-panel active">
                  <div className="filter-bar">
                    <div className="search-field">
                      <label htmlFor="search-solicitudes" className="sr-only">Buscar solicitud por medicamento o insumo</label>
                      <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                      <input type="text" placeholder="Buscar medicamento o insumo..." id="search-solicitudes"/>
                    </div>
                    <div className="chip-group" id="chipgroup-solicitudes-estado">
                      <button className="chip-filter active" aria-pressed="true">Todas</button>
                      <button className="chip-filter" aria-pressed="false">Pendientes</button>
                      <button className="chip-filter" aria-pressed="false">Aprobadas</button>
                      <button className="chip-filter" aria-pressed="false">Despachadas</button>
                      <button className="chip-filter" aria-pressed="false">Rechazadas</button>
                    </div>
                    <div className="filter-divider"></div>
                    <div className="chip-group" id="chipgroup-solicitudes-fecha">
                      <button className="chip-filter active" aria-pressed="true">Hoy</button>
                      <button className="chip-filter" aria-pressed="false">Última semana</button>
                    </div>
                  </div>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>N° orden</th>
                          <th>Medicamento / insumo</th>
                          <th>Cantidad</th>
                          <th>Prioridad</th>
                          <th>Solicitado por</th>
                          <th>Fecha y hora</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* ORDEN SOL-000478 (2 ítems, misma prioridad y estado -> se puede resumir) */}
                        <tr>
                          <td>
                            <div className="med-cell-parent">
                              <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="items-orden-478" data-group="orden-478" title="Ver medicamentos de esta solicitud">
                                <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                              </button>
                              <span className="cell-primary">SOL-000478</span>
                            </div>
                          </td>
                          <td><span className="child-count-badge">2 ítems</span></td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge normal">Normal</span></td>
                          <td>Enf. Manuel Hernández</td>
                          <td>02 May 2026 · 08:10</td>
                          <td><span className="order-badge despachada">Despachada</span></td>
                        </tr>
                        <tr className="child-row" data-parent-group="orden-478">
                          <td className="cell-muted">—</td>
                          <td><div className="row-indent"><span className="row-indent-icon">↳</span>Enoxaparina sódica 40 mg solución inyectable</div></td>
                          <td>3 unidades</td>
                          <td><span className="order-badge normal">Normal</span></td>
                          <td className="cell-muted">—</td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge despachada">Despachada</span></td>
                        </tr>
                        <tr className="child-row" data-parent-group="orden-478">
                          <td className="cell-muted">—</td>
                          <td><div className="row-indent"><span className="row-indent-icon">↳</span>Acetaminofén 500 mg tableta</div></td>
                          <td>3 unidades</td>
                          <td><span className="order-badge normal">Normal</span></td>
                          <td className="cell-muted">—</td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge despachada">Despachada</span></td>
                        </tr>

                        {/* ORDEN SOL-000479 (2 ítems, estados MIXTOS: uno aprobado, otro rechazado) */}
                        <tr>
                          <td>
                            <div className="med-cell-parent">
                              <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="items-orden-479" data-group="orden-479" title="Ver medicamentos de esta solicitud">
                                <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                              </button>
                              <span className="cell-primary">SOL-000479</span>
                            </div>
                          </td>
                          <td><span className="child-count-badge">2 ítems</span></td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge urgente">Urgente</span></td>
                          <td>Enf. Manuel Hernández</td>
                          <td>02 May 2026 · 09:45</td>
                          <td><span className="order-badge mixto">Mixto</span></td>
                        </tr>
                        <tr className="child-row" data-parent-group="orden-479">
                          <td className="cell-muted">—</td>
                          <td><div className="row-indent"><span className="row-indent-icon">↳</span>Vancomicina 1 g solución inyectable</div></td>
                          <td>2 unidades</td>
                          <td><span className="order-badge urgente">Urgente</span></td>
                          <td className="cell-muted">—</td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge aprobada">Aprobada</span></td>
                        </tr>
                        <tr className="child-row" data-parent-group="orden-479">
                          <td className="cell-muted">—</td>
                          <td><div className="row-indent"><span className="row-indent-icon">↳</span>Insulina cristalina 100 UI/ml solución inyectable</div></td>
                          <td>1 unidad</td>
                          <td><span className="order-badge urgente">Urgente</span></td>
                          <td className="cell-muted">—</td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge rechazada">Rechazada</span></td>
                        </tr>

                        {/* ORDEN SOL-000481 (1 ítem, expandible igual por consistencia) */}
                        <tr>
                          <td>
                            <div className="med-cell-parent">
                              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="items-orden-481" data-group="orden-481" title="Ver medicamentos de esta solicitud">
                                <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                              </button>
                              <span className="cell-primary">SOL-000481</span>
                            </div>
                          </td>
                          <td><span className="child-count-badge">1 ítem</span></td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge normal">Normal</span></td>
                          <td>Enf. Laura Gómez</td>
                          <td>02 May 2026 · 10:15</td>
                          <td><span className="order-badge despachada">Despachada</span></td>
                        </tr>
                        <tr className="child-row collapsed" data-parent-group="orden-481">
                          <td className="cell-muted">—</td>
                          <td><div className="row-indent"><span className="row-indent-icon">↳</span>Ceftriaxona sódica 1 g solución inyectable</div></td>
                          <td>4 unidades</td>
                          <td><span className="order-badge normal">Normal</span></td>
                          <td className="cell-muted">—</td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge despachada">Despachada</span></td>
                        </tr>

                        {/* ORDEN SOL-000486 (1 ítem, PRN) */}
                        <tr>
                          <td>
                            <div className="med-cell-parent">
                              <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="items-orden-486" data-group="orden-486" title="Ver medicamentos de esta solicitud">
                                <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                              </button>
                              <span className="cell-primary">SOL-000486</span>
                            </div>
                          </td>
                          <td><span className="child-count-badge">1 ítem</span></td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge urgente">Urgente</span></td>
                          <td>Enf. Manuel Hernández</td>
                          <td>02 May 2026 · 13:20</td>
                          <td><span className="order-badge pendiente">Pendiente</span></td>
                        </tr>
                        <tr className="child-row collapsed" data-parent-group="orden-486">
                          <td className="cell-muted">—</td>
                          <td><div className="row-indent"><span className="row-indent-icon">↳</span>Tramadol 50 mg solución inyectable <span className="row-indent-sub">PRN</span></div></td>
                          <td>2 unidades</td>
                          <td><span className="order-badge urgente">Urgente</span></td>
                          <td className="cell-muted">—</td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge pendiente">Pendiente</span></td>
                        </tr>

                        {/* ORDEN SOL-000490 (3 ítems: 2 medicamentos + 1 insumo, para inicio de venoclisis) */}
                        <tr>
                          <td>
                            <div className="med-cell-parent">
                              <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="items-orden-490" data-group="orden-490" title="Ver medicamentos e insumos de esta solicitud">
                                <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                              </button>
                              <span className="cell-primary">SOL-000490</span>
                            </div>
                          </td>
                          <td><span className="child-count-badge">3 ítems</span></td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge normal">Normal</span></td>
                          <td>Enf. Laura Gómez</td>
                          <td>02 May 2026 · 12:05</td>
                          <td><span className="order-badge aprobada">Aprobada</span></td>
                        </tr>
                        <tr className="child-row" data-parent-group="orden-490">
                          <td className="cell-muted">—</td>
                          <td><div className="row-indent"><span className="row-indent-icon">↳</span>Cloruro de sodio 0.9% 500 ml solución para infusión</div></td>
                          <td>2 bolsas</td>
                          <td><span className="order-badge normal">Normal</span></td>
                          <td className="cell-muted">—</td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge aprobada">Aprobada</span></td>
                        </tr>
                        <tr className="child-row" data-parent-group="orden-490">
                          <td className="cell-muted">—</td>
                          <td><div className="row-indent"><span className="row-indent-icon">↳</span>Catéter venoso periférico N° 20 <span className="row-indent-sub">Insumo</span></div></td>
                          <td>2 unidades</td>
                          <td><span className="order-badge normal">Normal</span></td>
                          <td className="cell-muted">—</td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge aprobada">Aprobada</span></td>
                        </tr>
                        <tr className="child-row" data-parent-group="orden-490">
                          <td className="cell-muted">—</td>
                          <td><div className="row-indent"><span className="row-indent-icon">↳</span>Apósito transparente estéril 10x12 cm <span className="row-indent-sub">Insumo</span></div></td>
                          <td>3 unidades</td>
                          <td><span className="order-badge normal">Normal</span></td>
                          <td className="cell-muted">—</td>
                          <td className="cell-muted">—</td>
                          <td><span className="order-badge aprobada">Aprobada</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="legend-bar">
                    <div className="footer-title-block"><div className="ft-sub">5 solicitudes · 9 ítems · turno actual</div></div>
                    <div className="footer-updated">Última actualización: <b>14:32h</b></div>
                  </div>
                </div>

                {/* SUB-PANEL: RECEPCIÓN */}
                <div role="tabpanel" id="subpanel-recepcion" aria-labelledby="subtab-recepcion" tabIndex="0" className="sub-panel">
                  <div className="filter-bar">
                    <div className="search-field">
                      <label htmlFor="search-recepcion" className="sr-only">Buscar recepción por medicamento o insumo</label>
                      <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                      <input type="text" placeholder="Buscar medicamento o insumo..." id="search-recepcion"/>
                    </div>
                    <div className="chip-group" id="chipgroup-recepcion-estado">
                      <button className="chip-filter" data-filter="todas" aria-pressed="false">Todas</button>
                      <button className="chip-filter active" data-filter="despachado" aria-pressed="true">Pendiente</button>
                      <button className="chip-filter" data-filter="recibido" aria-pressed="false">Recibido</button>
                      <button className="chip-filter" data-filter="parcial" aria-pressed="false">Parcial</button>
                    </div>
                  </div>
                  <div className="recep-list">
                    <div className="recep-order" id="order-recep-478" data-order-id="recep-478" data-estado="recibido" data-partial="false">
                      <div className="recep-order-header">
                        <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="body-recep-478" data-group="recep-478" title="Ver medicamentos de esta orden">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-order-number">SOL-000478</span>
                        <span className="recep-order-date">02 May 2026 · 08:10</span>
                        <span className="child-count-badge">2 ítems</span>
                        <div className="recep-order-spacer"></div>
                        <div className="recep-order-status" id="recep-478-status">
                          <span className="confirmed-tag"><svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Recibido</span>
                        </div>
                      </div>
                      <div className="recep-order-body" id="body-recep-478" data-parent-group="recep-478">
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-enoxaparina" data-group="enoxaparina" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Enoxaparina sódica 40 mg solución inyectable</span>
                        <span className="child-count-badge">3</span>
                        
                      </div>
                      <div className="recep-med-detail collapsed" id="detalle-enoxaparina" data-parent-group="enoxaparina">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>MX0000012-1</td>
                                    <td>Enoxaparina sódica 40 mg solución inyectable - Clexane</td>
                                    <td className="cant-entregada">3</td>
                                    <td>L-48210</td>
                                    <td>2027-08-31</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="detalle-acetaminofen" data-group="acetaminofen" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Acetaminofén 500 mg tableta</span>
                        <span className="child-count-badge">3</span>
                        
                      </div>
                      <div className="recep-med-detail" id="detalle-acetaminofen" data-parent-group="acetaminofen">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>MX0000005-2</td>
                                    <td>Acetaminofén 500 mg tableta - Genfar</td>
                                    <td className="cant-entregada">1</td>
                                    <td>858E</td>
                                    <td>2026-12-31</td>
                                  </tr>
                                  <tr>
                                    <td>MX0000005-2</td>
                                    <td>Acetaminofén 500 mg tableta - Genfar</td>
                                    <td className="cant-entregada">1</td>
                                    <td>ERR_25</td>
                                    <td>2026-12-31</td>
                                  </tr>
                                  <tr>
                                    <td>MX0000005-3</td>
                                    <td>Acetaminofén 500mg tableta (Dolex)</td>
                                    <td className="cant-entregada">1</td>
                                    <td>UTYLO778</td>
                                    <td>2026-09-16</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      </div>
                    </div>
                    <div className="recep-order" id="order-recep-481" data-order-id="recep-481" data-estado="despachado" data-partial="false">
                      <div className="recep-order-header">
                        <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="body-recep-481" data-group="recep-481" title="Ver medicamentos de esta orden">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-order-number">SOL-000481</span>
                        <span className="recep-order-date">02 May 2026 · 10:15</span>
                        <span className="child-count-badge">1 ítem</span>
                        <div className="recep-order-spacer"></div>
                        <div className="recep-order-status" id="recep-481-status">
                          <button type="button" className="btn btn-primary btn-sm btn-confirm-receipt" data-confirm-target="recep-481" data-med-targets="ceftriaxona" data-partial="false">
                            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            Confirmar recepción
                          </button>
                        </div>
                      </div>
                      <div className="recep-order-body" id="body-recep-481" data-parent-group="recep-481">
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="detalle-ceftriaxona" data-group="ceftriaxona" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Ceftriaxona sódica 1 g solución inyectable</span>
                        <span className="child-count-badge" id="ceftriaxona-badge">4</span>
                        
                      </div>
                      <div className="recep-med-detail" id="detalle-ceftriaxona" data-parent-group="ceftriaxona">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>MX0000041-1</td>
                                    <td>Ceftriaxona sódica 1 g - Rocephin</td>
                                    <td className="cant-entregada">1</td>
                                    <td>L-51190</td>
                                    <td>2026-11-30</td>
                                  </tr>
                                  <tr>
                                    <td>MX0000041-1</td>
                                    <td>Ceftriaxona sódica 1 g - Rocephin</td>
                                    <td className="cant-entregada">1</td>
                                    <td>L-51204</td>
                                    <td>2026-11-30</td>
                                  </tr>
                                  <tr>
                                    <td>MX0000041-1</td>
                                    <td>Ceftriaxona sódica 1 g - Rocephin</td>
                                    <td className="cant-entregada">1</td>
                                    <td>L-51218</td>
                                    <td>2026-12-15</td>
                                  </tr>
                                  <tr>
                                    <td>MX0000041-1</td>
                                    <td>Ceftriaxona sódica 1 g - Rocephin</td>
                                    <td className="cant-entregada">1</td>
                                    <td>L-51233</td>
                                    <td>2027-01-10</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      </div>
                    </div>
                    <div className="recep-order" id="order-recep-493" data-order-id="recep-493" data-estado="despachado" data-partial="false">
                      <div className="recep-order-header">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="body-recep-493" data-group="recep-493" title="Ver medicamentos de esta orden">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-order-number">SOL-000493</span>
                        <span className="recep-order-date">02 May 2026 · 06:50</span>
                        <span className="child-count-badge">2 ítems</span>
                        <div className="recep-order-spacer"></div>
                        <div className="recep-order-status" id="recep-493-status">
                          <button type="button" className="btn btn-primary btn-sm btn-confirm-receipt" data-confirm-target="recep-493" data-med-targets="aposito-hidrocoloide,gasa-esteril" data-partial="false">
                            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            Confirmar recepción
                          </button>
                        </div>
                      </div>
                      <div className="recep-order-body collapsed" id="body-recep-493" data-parent-group="recep-493">
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-aposito-hidrocoloide" data-group="aposito-hidrocoloide" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Apósito hidrocoloide 10x10 cm</span>
                        <span className="child-count-badge" id="aposito-hidrocoloide-badge">5</span>
                        
                      </div>
                      <div className="recep-med-detail collapsed" id="detalle-aposito-hidrocoloide" data-parent-group="aposito-hidrocoloide">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>IN0000018-1</td>
                                    <td>Apósito hidrocoloide 10x10 cm - Convatec</td>
                                    <td className="cant-entregada">5</td>
                                    <td>L-90214</td>
                                    <td>2027-04-30</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-gasa-esteril" data-group="gasa-esteril" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Gasa estéril 10x10 cm</span>
                        <span className="child-count-badge" id="gasa-esteril-badge">10</span>
                        
                      </div>
                      <div className="recep-med-detail collapsed" id="detalle-gasa-esteril" data-parent-group="gasa-esteril">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>IN0000021-1</td>
                                    <td>Gasa estéril 10x10 cm - Curitas Médicas</td>
                                    <td className="cant-entregada">10</td>
                                    <td>L-77031</td>
                                    <td>2028-01-31</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      </div>
                    </div>
                    <div className="recep-order" id="order-recep-497" data-order-id="recep-497" data-estado="recibido" data-partial="false">
                      <div className="recep-order-header">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="body-recep-497" data-group="recep-497" title="Ver medicamentos de esta orden">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-order-number">SOL-000497</span>
                        <span className="recep-order-date">02 May 2026 · 11:20</span>
                        <span className="child-count-badge">1 ítem</span>
                        <div className="recep-order-spacer"></div>
                        <div className="recep-order-status" id="recep-497-status">
                          <span className="confirmed-tag"><svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Recibido</span>
                        </div>
                      </div>
                      <div className="recep-order-body collapsed" id="body-recep-497" data-parent-group="recep-497">
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-metamizol" data-group="metamizol" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Metamizol sódico 1 g solución inyectable</span>
                        <span className="child-count-badge">2</span>
                        
                      </div>
                      <div className="recep-med-detail collapsed" id="detalle-metamizol" data-parent-group="metamizol">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>MX0000029-1</td>
                                    <td>Metamizol sódico 1 g solución inyectable - Novalgina</td>
                                    <td className="cant-entregada">2</td>
                                    <td>L-60214</td>
                                    <td>2027-02-28</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      </div>
                    </div>
                    <div className="recep-order" id="order-recep-501" data-order-id="recep-501" data-estado="recibido" data-partial="true">
                      <div className="recep-order-header">
                        <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="body-recep-501" data-group="recep-501" title="Ver medicamentos de esta orden">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-order-number">SOL-000501</span>
                        <span className="recep-order-date">02 May 2026 · 14:05</span>
                        <span className="child-count-badge">3 ítems</span>
                        <div className="recep-order-spacer"></div>
                        <div className="recep-order-status" id="recep-501-status">
                          <span className="confirmed-tag"><svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Recibido</span><span className="partial-flag" title="Un ítem de esta orden se recibió incompleto"><svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>Parcial</span>
                        </div>
                      </div>
                      <div className="recep-order-body" id="body-recep-501" data-parent-group="recep-501">
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-vancomicina-501" data-group="vancomicina-501" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Vancomicina 1 g solución inyectable</span>
                        <span className="child-count-badge">2</span>
                        
                      </div>
                      <div className="recep-med-detail collapsed" id="detalle-vancomicina-501" data-parent-group="vancomicina-501">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>MX0000015-1</td>
                                    <td>Vancomicina 1 g solución inyectable - Vancocin</td>
                                    <td className="cant-entregada">2</td>
                                    <td>L-42078</td>
                                    <td>2027-01-31</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="true" aria-controls="detalle-piperacilina" data-group="piperacilina" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Piperacilina/Tazobactam 4.5 g solución inyectable</span>
                        <span className="child-count-badge">4</span>
                        <span className="partial-flag" title="Se solicitaron 6 unidades y solo se confirmaron 4"><svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>Parcial</span>
                      </div>
                      <div className="recep-med-detail" id="detalle-piperacilina" data-parent-group="piperacilina">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>MX0000033-1</td>
                                    <td>Piperacilina/Tazobactam 4.5 g solución inyectable - Tazonam</td>
                                    <td className="cant-entregada">2</td>
                                    <td>L-58821</td>
                                    <td>2026-10-31</td>
                                  </tr>
                                  <tr>
                                    <td>MX0000033-1</td>
                                    <td>Piperacilina/Tazobactam 4.5 g solución inyectable - Tazonam</td>
                                    <td className="cant-entregada">2</td>
                                    <td>L-58902</td>
                                    <td>2026-10-31</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-cloruro-potasio" data-group="cloruro-potasio" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Cloruro de potasio 10 mEq solución inyectable</span>
                        <span className="child-count-badge">5</span>
                        
                      </div>
                      <div className="recep-med-detail collapsed" id="detalle-cloruro-potasio" data-parent-group="cloruro-potasio">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>MX0000040-1</td>
                                    <td>Cloruro de potasio 10 mEq solución inyectable - Pisa</td>
                                    <td className="cant-entregada">5</td>
                                    <td>L-31490</td>
                                    <td>2027-06-30</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      </div>
                    </div>
                    <div className="recep-order" id="order-recep-505" data-order-id="recep-505" data-estado="despachado" data-partial="false">
                      <div className="recep-order-header">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="body-recep-505" data-group="recep-505" title="Ver medicamentos de esta orden">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-order-number">SOL-000505</span>
                        <span className="recep-order-date">02 May 2026 · 15:30</span>
                        <span className="child-count-badge">1 ítem</span>
                        <div className="recep-order-spacer"></div>
                        <div className="recep-order-status" id="recep-505-status">
                          <button type="button" className="btn btn-primary btn-sm btn-confirm-receipt" data-confirm-target="recep-505" data-med-targets="solucion-salina" data-partial="false">
                            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            Confirmar recepción
                          </button>
                        </div>
                      </div>
                      <div className="recep-order-body collapsed" id="body-recep-505" data-parent-group="recep-505">
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-solucion-salina" data-group="solucion-salina" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Cloruro de sodio 0.9% 500 ml solución para infusión</span>
                        <span className="child-count-badge" id="solucion-salina-badge">10</span>
                        
                      </div>
                      <div className="recep-med-detail collapsed" id="detalle-solucion-salina" data-parent-group="solucion-salina">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>MX0000008-2</td>
                                    <td>Cloruro de sodio 0.9% 500 ml solución para infusión - Baxter</td>
                                    <td className="cant-entregada">10</td>
                                    <td>L-20456</td>
                                    <td>2028-03-31</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      </div>
                    </div>
                    <div className="recep-order" id="order-recep-508" data-order-id="recep-508" data-estado="recibido" data-partial="false">
                      <div className="recep-order-header">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="body-recep-508" data-group="recep-508" title="Ver medicamentos de esta orden">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-order-number">SOL-000508</span>
                        <span className="recep-order-date">02 May 2026 · 16:45</span>
                        <span className="child-count-badge">3 ítems</span>
                        <div className="recep-order-spacer"></div>
                        <div className="recep-order-status" id="recep-508-status">
                          <span className="confirmed-tag"><svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Recibido</span>
                        </div>
                      </div>
                      <div className="recep-order-body collapsed" id="body-recep-508" data-parent-group="recep-508">
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-guantes-nitrilo" data-group="guantes-nitrilo" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Guantes de nitrilo talla M</span>
                        <span className="child-count-badge">1</span>
                        
                      </div>
                      <div className="recep-med-detail collapsed" id="detalle-guantes-nitrilo" data-parent-group="guantes-nitrilo">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>IN0000002-1</td>
                                    <td>Guantes de nitrilo talla M - Kimberly Clark</td>
                                    <td className="cant-entregada">1</td>
                                    <td>L-11023</td>
                                    <td>2028-08-31</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-jeringas" data-group="jeringas" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Jeringas 10 ml</span>
                        <span className="child-count-badge">20</span>
                        
                      </div>
                      <div className="recep-med-detail collapsed" id="detalle-jeringas" data-parent-group="jeringas">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>IN0000005-1</td>
                                    <td>Jeringas 10 ml - BD</td>
                                    <td className="cant-entregada">20</td>
                                    <td>L-40217</td>
                                    <td>2029-05-31</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      <div className="recep-med">
                        <button type="button" className="row-expand-btn" aria-expanded="false" aria-controls="detalle-alcohol-antiseptico" data-group="alcohol-antiseptico" title="Ver artículo(s) y lote(s)">
                          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <span className="recep-med-name">Alcohol antiséptico 70% 250 ml</span>
                        <span className="child-count-badge">4</span>
                        
                      </div>
                      <div className="recep-med-detail collapsed" id="detalle-alcohol-antiseptico" data-parent-group="alcohol-antiseptico">
                            <table className="detail-table">
                              <thead>
                                <tr><th>Artículo</th><th>Medicamento</th><th>Cant. entregada</th><th>Lote</th><th>Vencimiento</th></tr>
                              </thead>
                              <tbody>
                                  <tr>
                                    <td>IN0000009-1</td>
                                    <td>Alcohol antiséptico 70% 250 ml - Barrytek</td>
                                    <td className="cant-entregada">4</td>
                                    <td>L-63340</td>
                                    <td>2027-12-31</td>
                                  </tr>
                              </tbody>
                            </table>
                      </div>
                      </div>
                    </div>
                  </div>
                  <div className="legend-bar">
                    <div className="footer-title-block"><div className="ft-sub" id="recepcion-footer-count">3 órdenes · filtro: Pendiente</div></div>
                    <div className="footer-updated">Última actualización: <b>14:32h</b></div>
                  </div>
                </div>

                {/* SUB-PANEL: DEVOLUCIONES */}
                <div role="tabpanel" id="subpanel-devoluciones" aria-labelledby="subtab-devoluciones" tabIndex="0" className="sub-panel">
                  <div className="filter-bar">
                    <div className="search-field">
                      <label htmlFor="search-devoluciones" className="sr-only">Buscar devolución por medicamento o insumo</label>
                      <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                      <input type="text" placeholder="Buscar medicamento o insumo..." id="search-devoluciones"/>
                    </div>
                    <div className="chip-group" id="chipgroup-devoluciones-estado">
                      <button className="chip-filter active" aria-pressed="true">Todas</button>
                      <button className="chip-filter" aria-pressed="false">Pendientes</button>
                      <button className="chip-filter" aria-pressed="false">Procesadas</button>
                      <button className="chip-filter" aria-pressed="false">Rechazadas</button>
                    </div>
                  </div>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Medicamento / insumo</th>
                          <th>Cantidad devuelta</th>
                          <th>Motivo</th>
                          <th>Devuelto por</th>
                          <th>Fecha</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="cell-primary">Dexametasona 4 mg solución inyectable</td>
                          <td>1 unidad</td>
                          <td>Cambio de orden médica</td>
                          <td>Enf. Manuel Hernández</td>
                          <td>01 May 2026 · 19:40</td>
                          <td><span className="order-badge procesada">Procesada</span></td>
                        </tr>
                        <tr>
                          <td className="cell-primary">Omeprazol sódico 40 mg solución inyectable</td>
                          <td>2 unidades</td>
                          <td>Sobrante de dispensación</td>
                          <td>Enf. Laura Gómez</td>
                          <td>30 Abr 2026 · 08:05</td>
                          <td><span className="order-badge procesada">Procesada</span></td>
                        </tr>
                        <tr>
                          <td className="cell-primary">Metamizol 2.5 g / 5 ml solución inyectable <span className="cell-sub">Novalgina</span></td>
                          <td>1 unidad</td>
                          <td>Suspensión de tratamiento</td>
                          <td>Enf. Manuel Hernández</td>
                          <td>02 May 2026 · 09:10</td>
                          <td><span className="order-badge pendiente">Pendiente</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="legend-bar">
                    <div className="footer-title-block"><div className="ft-sub">3 devoluciones · turno actual</div></div>
                    <div className="footer-updated">Última actualización: <b>14:32h</b></div>
                  </div>
                </div>

              </div>
            </div>

    </div>
  </div>
</div>

{/* TOAST DE CONFIRMACIÓN */}
<div className="toast" id="toast" role="status" aria-live="polite">
  <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  <span id="toast-message">Acción completada</span>
</div>

{/* POPOVER HOVER DE DOSIS (reutilizable, se posiciona vía JS) */}
<div className="dose-popover" id="dose-popover">
  <div className="dp-header">
    <span className="dp-time" id="dp-time">--:--</span>
    <span className="dp-status-badge" id="dp-status-badge"><span className="dot"></span><span id="dp-status-label">—</span></span>
  </div>
  <div className="dp-info" id="dp-info">
    <div className="dp-info-row"><span className="k">Fecha</span><span className="v" id="dp-fecha">—</span></div>
    <div className="dp-info-row"><span className="k">Hora programada</span><span className="v" id="dp-hora-programada">—</span></div>
    <div className="dp-info-row" id="dp-row-hora-real" style={{display: 'none'}}><span className="k">Hora real</span><span className="v" id="dp-hora-real">—</span></div>
    <div className="dp-info-row" id="dp-row-dosis-real" style={{display: 'none'}}><span className="k">Dosis administrada</span><span className="v" id="dp-dosis-real">—</span></div>
    <div className="dp-info-row" id="dp-row-via-real" style={{display: 'none'}}><span className="k">Vía administrada</span><span className="v" id="dp-via-real">—</span></div>
    <div className="dp-info-row"><span className="k">Profesional</span><span className="v" id="dp-profesional">—</span></div>
    <div className="dp-info-row" id="dp-row-lote"><span className="k">Lote</span><span className="v" id="dp-lote">—</span></div>
    <div className="dp-info-row" id="dp-row-vencimiento"><span className="k">Vencimiento</span><span className="v" id="dp-vencimiento">—</span></div>
    <div className="dp-pending-note" id="dp-lote-pending-note" style={{display: 'none'}}>El lote y vencimiento se seleccionan al registrar la administración.</div>
    <div className="dp-observaciones" id="dp-observaciones" style={{display: 'none'}}></div>
  </div>
  <div className="dp-divider" id="dp-divider"></div>
  <div className="dp-resolved-note" id="dp-resolved-note" style={{display: 'none'}}></div>
  <div className="dp-actions" id="dp-actions">
    <button className="dp-action" type="button" id="dp-action-registrar">
      <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="m9 12 2 2 4-4"/></svg>
      Registrar administración
    </button>
    <button className="dp-action" type="button">
      <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>
      Reprogramar
    </button>
    <button className="dp-action" type="button">
      <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="9" y2="15"/><line x1="14" x2="14" y1="9" y2="15"/></svg>
      Suspender
    </button>
    <button className="dp-action danger" type="button">
      <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
      No aplicar
    </button>
  </div>
</div>

{/* MODAL: Registrar administración */}
<div className="modal-overlay" id="admin-modal-overlay">
  <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
    <div className="modal-header">
      <h3 id="admin-modal-title">Registrar administración</h3>
      <button className="modal-close-btn" type="button" id="admin-modal-close" aria-label="Cerrar formulario">
        <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>

    <div className="modal-body">
      <div className="admin-summary">
        <div className="admin-summary-name" id="admin-med-nombre">—</div>
        <div className="admin-summary-meta">
          <span className="asm-item"><span className="asm-k">Dosis</span><span className="asm-v" id="admin-dosis-prescrita">—</span></span>
          <span className="asm-sep"></span>
          <span className="asm-item"><span className="asm-k">Vía</span><span className="asm-v" id="admin-via">—</span></span>
          <span className="asm-sep"></span>
          <span className="asm-item"><span className="asm-k">Frecuencia</span><span className="asm-v" id="admin-frecuencia">—</span></span>
          <span className="asm-sep"></span>
          <span className="asm-item"><span className="asm-k">Hora programada</span><span className="asm-v" id="admin-hora-programada">—</span></span>
        </div>
        <div className="admin-summary-time">
          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Quedará registrada con hora <b id="admin-hora-registro">--:--</b>
        </div>
      </div>

      <div className="admin-lote-section">
        <label className="admin-lote-label" id="admin-lote-label">Selecciona el lote administrado</label>
        <div className="lote-table-wrap">
          <table className="lote-table" role="radiogroup" aria-labelledby="admin-lote-label">
            <thead>
              <tr>
                <th className="col-radio"><span className="sr-only">Seleccionar</span></th>
                <th>Lote</th>
                <th>Vencimiento</th>
                <th className="col-disp">Disponible</th>
                <th className="col-estado">Estado</th>
              </tr>
            </thead>
            <tbody id="admin-lote-list">{/* filas generadas por JS */}</tbody>
          </table>
        </div>
        <div className="admin-lote-warning" id="admin-lote-warning" role="status" aria-live="polite" style={{display: 'none'}}>
          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <span id="admin-lote-warning-text"></span>
        </div>
      </div>

      <div className="form-field full">
        <label htmlFor="admin-observaciones">Observaciones (opcional)</label>
        <textarea id="admin-observaciones" rows="3" placeholder="Ej. Paciente toleró bien la administración, sitio de punción sin signos de infección..."></textarea>
      </div>

      <label className="admin-checklist">
        <input type="checkbox" id="admin-5-correctos"/>
        Confirmo los 5 correctos: paciente correcto, medicamento correcto, dosis correcta, vía correcta y hora correcta
      </label>
    </div>

    <div className="modal-footer">
      <button className="btn btn-secondary" type="button" id="admin-cancel-btn">Cancelar</button>
      <button className="btn btn-primary" type="button" id="admin-confirm-btn" disabled>Confirmar administración</button>
    </div>
  </div>
</div>
    </>
  );
}