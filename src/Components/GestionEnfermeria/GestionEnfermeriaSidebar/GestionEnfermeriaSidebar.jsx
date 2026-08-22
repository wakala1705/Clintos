'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './GestionEnfermeriaSidebar.css';
import {
  LuCalendarClock, LuLayoutGrid, LuListChecks, LuUsers,
} from 'react-icons/lu';

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

  return (
    <aside className="ges-sidebar">
      <nav className="ges-nav" aria-label="Secciones de Gestión de Enfermería">
        <span className="ges-nav-label-group" aria-hidden="true">Secciones</span>
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`ges-nav-item${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="icon ges-nav-icon" aria-hidden="true" />
              <span className="ges-nav-label">{item.label}</span>
              <span className="ges-tooltip" role="tooltip">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
