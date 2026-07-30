'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidebar.css';
import {
  LuBed,
  LuBox,
  LuCalendarClock,
  LuCalendarDays,
  LuChartColumn,
  LuChevronDown,
  LuChevronLeft,
  LuFileText,
  LuFolder,
  LuHeart,
  LuLandmark,
  LuMoon,
  LuPackage,
  LuSettings,
  LuSiren,
  LuSquarePlus,
  LuStethoscope,
  LuSun,
  LuSyringe,
  LuUsers,
  LuUsersRound,
  LuWallet,
  LuWrench,
} from 'react-icons/lu';

// Sidebar de navegación, compartido por /asignacion-citas y /historia-clinica
// (antes duplicado inline en cada page.jsx). El estado de "grupo abierto" /
// "ítem activo" se deriva de la ruta actual en vez de estar hardcodeado, así
// que agregar una nueva ruta bajo un grupo existente solo requiere un Link
// nuevo, no una copia completa del árbol de navegación.
export default function Sidebar() {
  const pathname = usePathname();
  const isAsignacionCitas = pathname === '/asignacion-citas';
  const isHistoriaClinica = pathname.startsWith('/historia-clinica');

  return (
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
        <span className="collapse-btn" aria-label="Colapsar menú" title="Colapsar menú" onClick={() => window.toggleSidebar()}><LuChevronLeft className="icon" /></span>
      </div>

      <div className="sidebar-divider"></div>

      <nav className="sidebar-nav">

        <div className={`nav-group${isAsignacionCitas ? ' open' : ''}`}>
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuStethoscope className="icon nav-icon" />
            <span className="label">Módulo Asistencial</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body">

            <div className={`nav-group sub${isAsignacionCitas ? ' open' : ''}`}>
              <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
                <LuSquarePlus className="icon nav-icon" />
                <span className="label">Consulta Externa</span>
                <LuChevronDown className="icon chev" />
              </div>
              <div className="nav-body">
                <Link href="/asignacion-citas" className={`nav-subitem${isAsignacionCitas ? ' active' : ''}`}><LuCalendarDays className="icon" />Asignación de citas</Link>
                <div className="nav-subitem" tabIndex="0" role="button"><LuCalendarClock className="icon" />Reprogramar Citas</div>
                <div className="nav-subitem" tabIndex="0" role="button"><LuFileText className="icon" />Historias Clínicas</div>
                <div className="nav-subitem" tabIndex="0" role="button"><LuHeart className="icon" />Signos Vitales</div>
                <div className="nav-subitem" tabIndex="0" role="button"><LuSiren className="icon" />Accidentes de Tránsito</div>
                <div className="nav-subitem" tabIndex="0" role="button"><LuUsers className="icon" />Pacientes</div>
                <div className="nav-subitem" tabIndex="0" role="button"><LuPackage className="icon" />Solicitud de consumo</div>
              </div>
            </div>

          </div>
        </div>

        <div className={`nav-group${isHistoriaClinica ? ' open' : ''}`}>
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuBed className="icon nav-icon" />
            <span className="label">Hospitalización</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body">
            <Link href="/historia-clinica" className={`nav-subitem${isHistoriaClinica ? ' active' : ''}`}><LuFileText className="icon" />Historia Clínica</Link>
          </div>
        </div>

        <div className="nav-group">
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuSyringe className="icon nav-icon" />
            <span className="label">Ayudas DX</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body"></div>
        </div>

        <div className="nav-group">
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuBox className="icon nav-icon" />
            <span className="label">Consolidados</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body"></div>
        </div>

        <div className="nav-group">
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuWallet className="icon nav-icon" />
            <span className="label">Finanzas</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body"></div>
        </div>

        <div className="nav-group">
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuWrench className="icon nav-icon" />
            <span className="label">Utilitarios</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body"></div>
        </div>

        <div className="nav-group">
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuChartColumn className="icon nav-icon" />
            <span className="label">Reportes (CR)</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body"></div>
        </div>

        <div className="nav-group">
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuSettings className="icon nav-icon" />
            <span className="label">Configuración</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body"></div>
        </div>

        <div className="sidebar-divider"></div>

        <div className="nav-group">
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuLandmark className="icon nav-icon" />
            <span className="label">Módulo Contable</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body"></div>
        </div>

        <div className="nav-group">
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuUsersRound className="icon nav-icon" />
            <span className="label">Módulo Nómina</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body"></div>
        </div>

        <div className="nav-group">
          <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
            <LuFolder className="icon nav-icon" />
            <span className="label">Otros soportes</span>
            <LuChevronDown className="icon chev" />
          </div>
          <div className="nav-body"></div>
        </div>

      </nav>

      <div className="theme-toggle-row">
        <div className="theme-toggle-icon" onClick={() => window.toggleThemeFromIcon()} aria-label="Cambiar tema" title="Cambiar tema">
          <LuSun className="icon theme-icon-sun" />
          <LuMoon className="icon theme-icon-moon" />
        </div>
        <span className="theme-label">Modo oscuro</span>
        <label className="switch">
          <input type="checkbox" id="theme-switch" onChange={() => window.toggleTheme()} />
          <span className="switch-slider"></span>
        </label>
      </div>
    </aside>
  );
}
