'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './GestionEnfermeriaSidebar.css';
import {
  LuCalendarClock, LuLayoutGrid, LuListChecks, LuPanelLeftClose, LuPanelLeftOpen, LuUsers,
} from 'react-icons/lu';

// Ancho debajo del cual el sidebar colapsa a solo-ícono aunque el botón
// manual no se haya usado — mismo umbral que --bp-desktop (ver AGENTS.md
// "Responsive / Breakpoints") y el @media de GestionEnfermeriaSidebar.css.
const AUTO_COLLAPSE_BREAKPOINT = '(max-width:1024px)';

// Segundo nivel de navegación del módulo "Gestión de Enfermería" — mismo
// patrón que GestionCamasSidebar.jsx (sidebar interno vertical, secundario
// al sidebar global de íconos): reemplaza a GestionEnfermeriaNav (franja
// horizontal de tabs). Compartido por las 4 rutas del feature (Panel
// general/Pacientes/Turnos/Tareas, ver .ge-shell-content/.ge-page-body en
// shared/shared.css) — vive en su propio componente en vez de duplicar el
// nav por página, mismo criterio que Sidebar.jsx (AGENTS.md "App-wide
// components"): el activo se deriva de usePathname(), no de un prop.
const ITEMS = [
  {
    id: 'panel-general', label: 'Panel general', href: '/gestion-enfermeria', icon: LuLayoutGrid,
  },
  {
    id: 'pacientes', label: 'Pacientes', href: '/gestion-enfermeria/pacientes', icon: LuUsers,
  },
  {
    id: 'turnos', label: 'Turnos', href: '/gestion-enfermeria/turnos', icon: LuCalendarClock,
  },
  {
    id: 'tareas', label: 'Tareas', href: '/gestion-enfermeria/tareas', icon: LuListChecks,
  },
];

export default function GestionEnfermeriaSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  // El tooltip solo tiene sentido en modo solo-ícono (colapsado a mano O por
  // el breakpoint de abajo, ver GestionEnfermeriaSidebar.css) — sin esto no
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

  return (
    <aside className={`ges-sidebar${collapsed ? ' collapsed' : ''}`}>
      <nav className="ges-nav" aria-label="Secciones de Gestión de Enfermería">
        <div className="ges-nav-header">
          <span className="ges-nav-label-group" aria-hidden="true">Secciones</span>
          <button
            type="button"
            className="ges-collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed
              ? <LuPanelLeftOpen className="icon" aria-hidden="true" />
              : <LuPanelLeftClose className="icon" aria-hidden="true" />}
          </button>
        </div>
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`ges-nav-item${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={(e) => showTooltip(e, item.label)}
              onMouseLeave={hideTooltip}
              onFocus={(e) => showTooltip(e, item.label)}
              onBlur={hideTooltip}
            >
              <item.icon className="icon ges-nav-icon" aria-hidden="true" />
              <span className="ges-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {tooltip && createPortal(
        <div
          className="ges-tooltip-float"
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
