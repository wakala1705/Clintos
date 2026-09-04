'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import './Topbar.css';
import HamburgerMenu from '@/Components/HamburgerMenu/HamburgerMenu';
import UserMenu from '@/Components/UserMenu/UserMenu';
import { useActiveModuleLabel } from '@/hooks/Session/session';

// Topbar global, compartida por /asignacion-citas, /programar-cita y
// /gestion-enfermeria (antes duplicada inline en cada page.jsx, con CSS
// repetido y ya divergente entre rutas — ver AGENTS.md, mismo criterio que
// Sidebar y UserMenu). El breadcrumb y el usuario los define cada ruta vía
// props; el contenido extra del lado derecho (chip de sede, toggle de tema,
// meta-items de especialidad/área...) se pasa como children porque varía por
// página y no todas lo necesitan.
export default function Topbar({ section, page, user, children }) {
  // El rol mostrado se deriva del módulo con el que se entró a sesión (ver
  // Sidebar, mismo patrón), no del `user.role` que cada página venía
  // hardcodeando -- así los dos quedan sincronizados sin tocar los 36 call
  // sites que todavía pasan ese campo (queda sin usar, no rompe nada).
  const roleLabel = useActiveModuleLabel();

  // `section` acepta un string plano (caso más común, 1 nivel, sin link — la
  // mayoría de "secciones" hoy no son rutas navegables), o un array donde
  // cada ítem es un string o un { label, href } cuando ese nivel SÍ debe ser
  // clicable (ej. ficha de paciente: "Consulta Externa / Lista de Pacientes"
  // con el segundo nivel devolviendo a /lista-pacientes) — mismo prop, sin
  // romper a quien ya pasa un string o un array de strings.
  const rawCrumbs = Array.isArray(section) ? section : section ? [section] : [];
  const crumbs = rawCrumbs.map((c) => (typeof c === 'string' ? { label: c } : c));

  return (
    <header className="topbar">
      <HamburgerMenu />
      <div className="breadcrumb">
        {crumbs.map((crumb) => (
          <Fragment key={crumb.label}>
            {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
            <span className="sep">/</span>
          </Fragment>
        ))}
        <span className="current">{page}</span>
      </div>
      <div className="spacer"></div>
      <div className="topbar-right">
        {children}
        <div className="divider-v"></div>
        <UserMenu name={user.name} role={roleLabel} initials={user.initials} />
      </div>
    </header>
  );
}
