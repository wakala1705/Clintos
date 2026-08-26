'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './GestionCamasSidebar.css';
import { INCONSISTENCIAS_INICIALES } from '@/hooks/GestionCamas/mockIntegridadData';
import {
  LuBedDouble, LuCalendarClock, LuChartColumn, LuHistory, LuLayoutGrid, LuPanelLeftClose, LuPanelLeftOpen,
  LuSettings, LuShieldCheck, LuSprayCan,
} from 'react-icons/lu';

// Ancho debajo del cual el sidebar colapsa a solo-ícono aunque el botón
// manual no se haya usado — mismo umbral que --bp-desktop (ver AGENTS.md
// "Responsive / Breakpoints") y el @media de GestionCamasSidebar.css.
const AUTO_COLLAPSE_BREAKPOINT = '(max-width:1024px)';

// Encargo: el header propio del sidebar ("Gestión de Camas" + ícono) es
// redundante — el nombre del módulo ya está en el breadcrumb del Topbar y el
// título de la página en el contenido principal. En su lugar, un label chico
// en mayúscula sobre la lista (mismo patrón que un section-label de menú:
// contextualiza "estos son ítems de navegación" sin repetir el nombre del
// módulo).

// Sidebar secundario del módulo administrativo "Gestión de Camas" — segundo
// nivel de navegación, distinto del sidebar global de íconos (Sidebar.jsx,
// entre módulos de Clintos): éste vive DENTRO del módulo (encargo explícito:
// "convertir la navegación horizontal por tabs... en un sidebar interno
// vertical, secundario al sidebar global"). Reemplaza a la antigua
// GestionCamasNav (franja horizontal debajo del breadcrumb); mismo criterio
// de activo derivado de usePathname() que el resto de navs del proyecto
// (GestionEnfermeriaNav.jsx). Los 6 ítems ya tienen ruta propia (Resumen,
// Camas, Integridad, Indicadores, Auditoría/Historial, Configuración) — el
// fallback de botón + aviso "en desarrollo" (ver el bloque `!item.href` más
// abajo) queda para si se agrega un ítem nuevo sin pantalla todavía, mismo
// criterio que el resto de accesos sin pantalla propia en el proyecto.
// "Camas" (antes "Mapa de camas") absorbió a la vieja pantalla de inventario
// administrativo que vivía en /gestion-camas/camas (GestionCamasCamas.jsx,
// eliminada — duplicaba lo que ya cubre este tablero operativo) — mismo
// ícono que tenía ese ítem (LuBedDouble), reutilizado acá en vez de uno
// nuevo, ya que quedó libre.
// Conteo del badge de "Integridad" = inconsistencias Activas del mock
// inicial (mismo número que muestra la propia pantalla de Integridad al
// entrar) — no se recalcula en vivo si el admin corrige/ignora algo en esa
// pantalla (su copia local es aparte, ver GestionCamasIntegridad.jsx),
// mismo criterio de "no fabricar sincronía que el mock no modela" que el
// resto del proyecto (ver mockPanelGeneralData.js).
const INCONSISTENCIAS_ACTIVAS = INCONSISTENCIAS_INICIALES.filter((i) => i.estado === 'activa').length;

// Agrupado en 3 secciones (encargo: "las tres grandes experiencias del
// módulo" — Operación/Planificación/Administración, ver comentario en
// GestionCamasReservas.jsx sección "Concepto central"). Los títulos de grupo
// son kickers no-clickeables (ver .cbs-nav-section-label), nunca botones —
// solo separan visualmente, la navegación real sigue viviendo únicamente en
// los ítems de cada grupo.
const SECCIONES = [
  {
    id: 'operacion',
    label: 'Operación',
    items: [
      {
        id: 'resumen', label: 'Resumen', href: '/gestion-camas', icon: LuLayoutGrid,
      },
      // Tablero operativo (Estados visuales, encargo sección 6) — vista de
      // tarjetas/tabla en tiempo real (Libre/Ocupada/Reservada/Limpieza/
      // Mantenimiento/Bloqueada/Aislamiento/Inactiva, ver mockCamasData.js).
      // "Camas" (antes "Mapa de camas") absorbió a la vieja pantalla de
      // inventario administrativo que vivía en /gestion-camas/camas
      // (GestionCamasCamas.jsx, eliminada) — mismo ícono que tenía ese ítem
      // (LuBedDouble), reutilizado acá.
      {
        id: 'tablero', label: 'Camas', href: '/gestion-camas/tablero', icon: LuBedDouble,
      },
      {
        id: 'limpieza', label: 'Limpieza', href: '/gestion-camas/limpieza', icon: LuSprayCan,
      },
    ],
  },
  {
    id: 'planificacion',
    label: 'Planificación',
    items: [
      // Disponibilidad FUTURA de camas (encargo) — distinta de "Camas"
      // (estado actual); mismo criterio de sección propia que separa
      // Operación de Administración.
      {
        id: 'reservas', label: 'Reservas', href: '/gestion-camas/reservas', icon: LuCalendarClock,
      },
    ],
  },
  {
    id: 'administracion',
    label: 'Administración',
    items: [
      {
        id: 'integridad', label: 'Integridad', href: '/gestion-camas/integridad', icon: LuShieldCheck, badge: INCONSISTENCIAS_ACTIVAS,
      },
      {
        id: 'indicadores', label: 'Indicadores', href: '/gestion-camas/indicadores', icon: LuChartColumn,
      },
      {
        id: 'auditoria', label: 'Auditoría / Historial', href: '/gestion-camas/auditoria', icon: LuHistory,
      },
      {
        id: 'configuracion', label: 'Configuración', href: '/gestion-camas/configuracion', icon: LuSettings,
      },
    ],
  },
];

export default function GestionCamasSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  // El tooltip solo tiene sentido en modo solo-ícono (colapsado a mano O por
  // el breakpoint de abajo, ver GestionCamasSidebar.css) — sin esto no
  // sabríamos, desde JS, si el auto-colapso por ancho de viewport está
  // activo (esa parte es puro CSS/@media, no queda reflejada en `collapsed`).
  useEffect(() => {
    const mql = window.matchMedia(AUTO_COLLAPSE_BREAKPOINT);
    const update = () => setAutoCollapsed(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const iconOnly = collapsed || autoCollapsed;

  function showTooltip(e, label) {
    if (!iconOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, top: rect.top + rect.height / 2, left: rect.right + 10 });
  }
  function hideTooltip() {
    setTooltip(null);
  }

  function renderItem(item) {
    const active = item.href ? pathname === item.href : false;
    const className = `cbs-nav-item${active ? ' active' : ''}`;
    const inner = (
      <>
        <item.icon className="icon cbs-nav-icon" aria-hidden="true" />
        <span className="cbs-nav-label">{item.label}</span>
        {!!item.badge && <span className="cbs-nav-badge">{item.badge}</span>}
      </>
    );
    const hoverHandlers = {
      onMouseEnter: (e) => showTooltip(e, item.label),
      onMouseLeave: hideTooltip,
      onFocus: (e) => showTooltip(e, item.label),
      onBlur: hideTooltip,
    };

    if (!item.href) {
      return (
        <button
          key={item.id}
          type="button"
          className={className}
          onClick={() => window.ncToast?.(`${item.label} (en desarrollo).`)}
          {...hoverHandlers}
        >
          {inner}
        </button>
      );
    }
    return (
      <Link key={item.id} href={item.href} className={className} aria-current={active ? 'page' : undefined} {...hoverHandlers}>
        {inner}
      </Link>
    );
  }

  return (
    <aside className={`cbs-sidebar${collapsed ? ' collapsed' : ''}`}>
      <nav className="cbs-nav" aria-label="Secciones de Gestión de Camas">
        <div className="cbs-nav-header">
          <span className="cbs-nav-label-group" aria-hidden="true">Secciones</span>
          <button
            type="button"
            className="cbs-collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed
              ? <LuPanelLeftOpen className="icon" aria-hidden="true" />
              : <LuPanelLeftClose className="icon" aria-hidden="true" />}
          </button>
        </div>
        {SECCIONES.map((seccion) => (
          <div key={seccion.id} className="cbs-nav-group">
            <div className="cbs-nav-section-label" aria-hidden="true">{seccion.label}</div>
            {seccion.items.map(renderItem)}
          </div>
        ))}
      </nav>

      {tooltip && createPortal(
        <div
          className="cbs-tooltip-float"
          role="tooltip"
          style={{ top: tooltip.top, left: tooltip.left }}
        >
          {tooltip.label}
        </div>,
        document.body,
      )}
    </aside>
  );
}
