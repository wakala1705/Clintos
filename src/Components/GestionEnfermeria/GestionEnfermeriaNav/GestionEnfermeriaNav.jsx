'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './GestionEnfermeriaNav.css';
import { LuCalendarClock, LuLayoutGrid, LuListChecks, LuUsers } from 'react-icons/lu';

const ITEMS = [
  { id: 'panel-general', label: 'Panel general', href: '/gestion-enfermeria', icon: LuLayoutGrid },
  { id: 'pacientes', label: 'Pacientes', href: '/gestion-enfermeria/pacientes', icon: LuUsers },
  { id: 'turnos', label: 'Turnos', href: '/gestion-enfermeria/turnos', icon: LuCalendarClock },
  { id: 'tareas', label: 'Tareas', href: '/gestion-enfermeria/tareas', icon: LuListChecks },
];

// Navegación entre las 4 secciones de nivel superior de Gestión de
// Enfermería — antes solo existían 2 botones sueltos en el header de Panel
// General ("Turnos"/"Tareas", ver PanelGeneral.jsx) sin ninguna forma de
// volver a Panel General desde las otras pantallas. "Camas" salió de este
// grupo a su propia ruta de nivel superior (/gestion-camas, ver Sidebar.jsx/
// Home.jsx) — ya no es un tab de Gestión de Enfermería. Se monta igual en las
// 4 rutas restantes (Panel general/Pacientes/Turnos/Tareas); el activo se
// deriva de usePathname() en vez de un prop, mismo criterio que Sidebar.jsx (ver
// AGENTS.md "App-wide components") para que este componente no necesite
// saber en cuál pantalla está montado.
export default function GestionEnfermeriaNav() {
  const pathname = usePathname();

  return (
    <nav className="ge-nav" aria-label="Secciones de Gestión de Enfermería">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`ge-nav-tab${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <item.icon className="icon" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
