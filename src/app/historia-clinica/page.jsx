'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import '../asignacion-citas/asignacion-citas.css';
import './historia-clinica.css';
import { initHistoriaClinica } from './legacy-app';
import PatientBanner from './components/PatientBanner';
import MedicamentosPanel from './components/MedicamentosPanel';
import OrdenesMedicasPanel from './components/OrdenesMedicasPanel';
import PedidosPanel from './components/PedidosPanel';
import Toast from './components/modals/Toast';
import DosePopover from './components/modals/DosePopover';
import AdminModal from './components/modals/AdminModal';
import SuspendModal from './components/modals/SuspendModal';
import ReturnModal from './components/modals/ReturnModal';
import ProgramModal from './components/modals/ProgramModal';
import PedidoModal from './components/modals/PedidoModal';
import CatalogModal from './components/modals/CatalogModal';

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
      <PatientBanner />

      {/* CARD: CRONOGRAMA (con tabs de módulo integradas) */}
      <div className="card">
        <div className="card-tabs-bar" role="tablist" aria-label="Secciones de la historia clínica">
          <button type="button" className="card-tab active" role="tab" id="tab-medicamentos" aria-selected="true" aria-controls="panel-medicamentos" tabIndex="0">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
            Gestión de medicamentos
          </button>
          <button type="button" className="card-tab" role="tab" id="tab-ordenes" aria-selected="false" aria-controls="panel-ordenes" tabIndex="-1">
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

        <MedicamentosPanel />
        <PedidosPanel />
        <OrdenesMedicasPanel />
      </div>

    </div>
  </div>
</div>

<Toast />
<DosePopover />
<AdminModal />
<SuspendModal />
<ReturnModal />
<ProgramModal />
<PedidoModal />
<CatalogModal />
    </>
  );
}
