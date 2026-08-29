'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './GestionTurnosSidebar.css';
import {
  LuCalendarClock, LuCalendarDays, LuHistory, LuLayoutGrid, LuPanelLeftClose, LuPanelLeftOpen, LuUsers,
} from 'react-icons/lu';

// Ancho debajo del cual el sidebar colapsa a solo-ícono aunque el botón
// manual no se haya usado — mismo umbral que --bp-desktop (ver AGENTS.md
// "Responsive / Breakpoints").
const AUTO_COLLAPSE_BREAKPOINT = '(max-width:1024px)';

// Segundo nivel de navegación del módulo "Gestión de turnos" — mismo patrón
// exacto que GestionCamasSidebar (grupos con kicker, activo derivado de
// usePathname(), colapso manual + auto-colapso por breakpoint, tooltip
// portado en modo solo-ícono), sin inventar un sidebar nuevo (ver AGENTS.md
// "No crear un sidebar diferente al patrón existente").
//
// Encargo: "Resumen" queda SUELTO arriba, sin kicker de grupo (mismo criterio
// que GestionCamasSidebar da a sus 3 grupos, pero acá el primer nivel no
// necesita repetir "Operación" para un solo ítem) — `label: null` en la
// primera "sección" hace que el render se salte el div de kicker para ese
// grupo (ver más abajo), sin CSS nuevo: el margin-top:0 que ya aplica al
// primer grupo (`:first-of-type`) no depende de que ese grupo tenga label.
//
// "Programación de turnos" (PLANIFICACIÓN) vivía en Gestión de Enfermería
// (`/gestion-enfermeria/turnos`) — se mudó acá completa (encargo: "pasemos
// la pantalla de turnos a la ruta de planificación/programación", ver
// ProgramacionTurnos.jsx) y su entrada en GestionEnfermeriaSidebar se quitó,
// así que esta es ahora su único punto de acceso.
const SECCIONES = [
  {
    id: 'resumen-group',
    label: null,
    items: [
      {
        id: 'resumen', label: 'Resumen', href: '/gestion-turnos', icon: LuLayoutGrid,
      },
    ],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    items: [
      {
        id: 'tipos-turno', label: 'Tipos de turno', href: '/gestion-turnos/tipos-turno', icon: LuCalendarClock,
      },
      {
        id: 'enfermeras', label: 'Personal de enfermería', href: '/gestion-turnos/enfermeras', icon: LuUsers,
      },
    ],
  },
  {
    id: 'planificacion',
    label: 'Planificación',
    items: [
      {
        id: 'programacion-turnos', label: 'Programación de turnos', href: '/gestion-turnos/planificacion/programacion', icon: LuCalendarDays,
      },
    ],
  },
  {
    id: 'administracion',
    label: 'Administración',
    items: [
      {
        id: 'auditoria', label: 'Auditoría / Historial', href: '/gestion-turnos/auditoria', icon: LuHistory,
      },
    ],
  },
];

export default function GestionTurnosSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  const [tooltip, setTooltip] = useState(null);

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
    const active = pathname === item.href;
    const className = `cts-nav-item${active ? ' active' : ''}`;
    const hoverHandlers = {
      onMouseEnter: (e) => showTooltip(e, item.label),
      onMouseLeave: hideTooltip,
      onFocus: (e) => showTooltip(e, item.label),
      onBlur: hideTooltip,
    };
    return (
      <Link key={item.id} href={item.href} className={className} aria-current={active ? 'page' : undefined} {...hoverHandlers}>
        <item.icon className="icon cts-nav-icon" aria-hidden="true" />
        <span className="cts-nav-label">{item.label}</span>
      </Link>
    );
  }

  return (
    <aside className={`cts-sidebar${collapsed ? ' collapsed' : ''}`}>
      <nav className="cts-nav" aria-label="Secciones de Gestión de turnos">
        <div className="cts-nav-header">
          <span className="cts-nav-label-group" aria-hidden="true">Secciones</span>
          <button
            type="button"
            className="cts-collapse-btn"
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
          <div key={seccion.id} className="cts-nav-group">
            {seccion.label && <div className="cts-nav-section-label" aria-hidden="true">{seccion.label}</div>}
            {seccion.items.map(renderItem)}
          </div>
        ))}
      </nav>

      {tooltip && createPortal(
        <div
          className="cts-tooltip-float"
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
