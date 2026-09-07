'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useActiveModule } from '@/hooks/Session/session';
import './Sidebar.css';
import {
  LuBed,
  LuCalendarClock,
  LuCalendarDays,
  LuCalendarPlus,
  LuChevronDown,
  LuChevronLeft,
  LuClipboardCheck,
  LuFileText,
  LuFlaskConical,
  LuFolder,
  LuHandCoins,
  LuHeart,
  LuHeartPulse,
  LuHouse,
  LuLandmark,
  LuMoon,
  LuReceipt,
  LuScissors,
  LuSettings,
  LuShoppingCart,
  LuSiren,
  LuSquarePlus,
  LuStethoscope,
  LuSun,
  LuSyringe,
  LuUsers,
  LuUsersRound,
  LuVault,
  LuWallet,
  LuWrench,
} from 'react-icons/lu';

// Sidebar de navegación, compartido por /asignacion-citas y /gestion-enfermeria
// (antes duplicado inline en cada page.jsx). El estado de "grupo abierto" /
// "ítem activo" se deriva de la ruta actual en vez de estar hardcodeado, así
// que agregar una nueva ruta bajo un grupo existente solo requiere un Link
// nuevo, no una copia completa del árbol de navegación.
export default function Sidebar() {
  const pathname = usePathname();
  const activeModule = useActiveModule();
  const isAdmin = activeModule === 'administrador';
  const isHome = pathname === '/home';
  const isAsignacionCitas = pathname === '/asignacion-citas';
  const isProgramarCita = pathname === '/programar-cita';
  const isListaPacientes = pathname === '/lista-pacientes';
  const isHistoriaClinica = pathname.startsWith('/historia-clinica');
  const isVacunacion = pathname === '/vacunacion';
  const isConsultaExterna = isAsignacionCitas || isProgramarCita || isListaPacientes || isHistoriaClinica || isVacunacion;
  const isGestionEnfermeria = pathname.startsWith('/gestion-enfermeria');
  const isAdmisiones = pathname === '/admisiones';
  const isProgramacionSalaCirugias = pathname === '/programacion-sala-cirugias';
  const isHospitalizacion = isGestionEnfermeria || isAdmisiones || isProgramacionSalaCirugias;
  const isFacturas = pathname === '/facturas';
  const isFinanzas = isFacturas;
  const isUtilitarios = pathname === '/utilitarios';
  const isConfiguracion = pathname === '/configuracion';

  // Admin ve estos 6 anidados bajo "Módulo Asistencial" (junto a Nómina/Otros
  // soportes); un usuario de solo-Asistencial ya sabe en qué módulo está, así
  // que se suben a nivel superior (mismo contenido, sin el nivel extra de
  // navegación redundante).
  const subGroupClass = isAdmin ? 'nav-group sub' : 'nav-group';

  const asistencialSubGroups = (
    <>
      <div className={`${subGroupClass}${isConsultaExterna ? ' open' : ''}`}>
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <LuSquarePlus className="icon nav-icon" />
          <span className="label">Consulta Externa</span>
          <LuChevronDown className="icon chev" />
        </div>
        <div className="nav-body">
          <Link href="/asignacion-citas" className={`nav-subitem${isAsignacionCitas ? ' active' : ''}`}><LuCalendarDays className="icon" />Asignación de citas</Link>
          <Link href="/programar-cita" className={`nav-subitem${isProgramarCita ? ' active' : ''}`}><LuCalendarPlus className="icon" />Programar cita</Link>
          <div className="nav-subitem" tabIndex="0" role="button"><LuCalendarClock className="icon" />Reasignación de Citas</div>
          <Link href="/historia-clinica" className={`nav-subitem${isHistoriaClinica ? ' active' : ''}`}><LuFileText className="icon" />Historias Clínicas</Link>
          <div className="nav-subitem" tabIndex="0" role="button"><LuHeart className="icon" />Signos Vitales</div>
          <div className="nav-subitem" tabIndex="0" role="button"><LuSiren className="icon" />Accidentes de Tránsito</div>
          <Link href="/lista-pacientes" className={`nav-subitem${isListaPacientes ? ' active' : ''}`}><LuUsers className="icon" />Pacientes</Link>
          <Link href="/vacunacion" className={`nav-subitem${isVacunacion ? ' active' : ''}`}><LuSyringe className="icon" />PyMS</Link>
        </div>
      </div>

      <div className={`${subGroupClass}${isHospitalizacion ? ' open' : ''}`}>
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <LuBed className="icon nav-icon" />
          <span className="label">Hospitalización</span>
          <LuChevronDown className="icon chev" />
        </div>
        <div className="nav-body">
          <Link href="/gestion-enfermeria" className={`nav-subitem${isGestionEnfermeria ? ' active' : ''}`}><LuHeartPulse className="icon" />Gestión de Enfermería</Link>
          <Link href="/admisiones" className={`nav-subitem${isAdmisiones ? ' active' : ''}`}><LuClipboardCheck className="icon" />Admisiones</Link>
          <Link href="/programacion-sala-cirugias" className={`nav-subitem${isProgramacionSalaCirugias ? ' active' : ''}`}><LuScissors className="icon" />Programación sala de cirugías</Link>
        </div>
      </div>

      <div className={subGroupClass}>
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <LuFlaskConical className="icon nav-icon" />
          <span className="label">Ayudas DX</span>
          <LuChevronDown className="icon chev" />
        </div>
        <div className="nav-body"></div>
      </div>

      <div className={`${subGroupClass}${isFinanzas ? ' open' : ''}`}>
        <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
          <LuLandmark className="icon nav-icon" />
          <span className="label">Finanzas</span>
          <LuChevronDown className="icon chev" />
        </div>
        <div className="nav-body">
          <Link href="/facturas" className={`nav-subitem${isFacturas ? ' active' : ''}`}><LuReceipt className="icon" />Facturas</Link>
          <div className="nav-subitem" tabIndex="0" role="button"><LuWallet className="icon" />Cartera</div>
          <div className="nav-subitem" tabIndex="0" role="button"><LuVault className="icon" />Tesorería</div>
          <div className="nav-subitem" tabIndex="0" role="button"><LuShoppingCart className="icon" />Compras</div>
          <div className="nav-subitem" tabIndex="0" role="button"><LuHandCoins className="icon" />Caja</div>
        </div>
      </div>

      <div className={subGroupClass}>
        <Link href="/utilitarios" className={`nav-head nav-link${isUtilitarios ? ' active' : ''}`}>
          <LuWrench className="icon nav-icon" />
          <span className="label">Utilitarios</span>
        </Link>
      </div>

      <div className={subGroupClass}>
        <Link href="/configuracion" className={`nav-head nav-link${isConfiguracion ? ' active' : ''}`}>
          <LuSettings className="icon nav-icon" />
          <span className="label">Configuración</span>
        </Link>
      </div>
    </>
  );

  return (
    <aside className="sidebar" id="sidebar">

      <div className="sidebar-brand">
        <div className="wordmark">
          <img
            className="symbol"
            src="/img/simbolo-alt.svg"
            alt="Expandir menú"
            title="Expandir menú"
            onClick={() => window.toggleSidebar()}
          />
          <img
            className="full-logo"
            src="/img/logo-alt-horizontal.svg"
            alt="clintos"
            title="Colapsar menú"
            onClick={() => window.toggleSidebar()}
          />
        </div>
        <span className="collapse-btn" aria-label="Colapsar menú" title="Colapsar menú" onClick={() => window.toggleSidebar()}><LuChevronLeft className="icon" /></span>
      </div>

      <div className="sidebar-divider"></div>

      <nav className="sidebar-nav">

        <Link href="/home" className={`nav-head nav-link${isHome ? ' active' : ''}`}>
          <LuHouse className="icon nav-icon" />
          <span className="label">Inicio</span>
        </Link>

        {isAdmin ? (
          <div className={`nav-group${isConsultaExterna || isHospitalizacion || isFinanzas || isUtilitarios || isConfiguracion ? ' open' : ''}`}>
            <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
              <LuStethoscope className="icon nav-icon" />
              <span className="label">Módulo Asistencial</span>
              <LuChevronDown className="icon chev" />
            </div>
            <div className="nav-body">
              {asistencialSubGroups}
            </div>
          </div>
        ) : asistencialSubGroups}

        {isAdmin && (
          <>
            <div className="sidebar-divider"></div>

            <div className="nav-group">
              <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
                <LuUsersRound className="icon nav-icon" />
                <span className="label">Módulo Nómina</span>
                <LuChevronDown className="icon chev" />
              </div>
              <div className="nav-body"></div>
            </div>

            <div className="sidebar-divider"></div>

            <div className="nav-group">
              <div className="nav-head" onClick={(e) => window.toggleNavGroup(e.currentTarget)} tabIndex="0" role="button">
                <LuFolder className="icon nav-icon" />
                <span className="label">Otros soportes</span>
                <LuChevronDown className="icon chev" />
              </div>
              <div className="nav-body"></div>
            </div>
          </>
        )}

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
