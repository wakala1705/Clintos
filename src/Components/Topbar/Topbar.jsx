'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import './Topbar.css';
import UserMenu from '@/Components/UserMenu/UserMenu';
import { LuMenu } from 'react-icons/lu';

// Topbar global, compartida por /asignacion-citas, /programar-cita y
// /gestion-enfermeria (antes duplicada inline en cada page.jsx, con CSS
// repetido y ya divergente entre rutas — ver AGENTS.md, mismo criterio que
// Sidebar y UserMenu). El breadcrumb y el usuario los define cada ruta vía
// props; el contenido extra del lado derecho (chip de sede, toggle de tema,
// meta-items de especialidad/área...) se pasa como children porque varía por
// página y no todas lo necesitan.
export default function Topbar({ section, page, user, children }) {
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
      <LuMenu className="hamburger icon" />
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
        <UserMenu name={user.name} role={user.role} initials={user.initials} />
      </div>
    </header>
  );
}
