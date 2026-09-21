'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Topbar.css';
import HamburgerMenu from '@/Components/HamburgerMenu/HamburgerMenu';
import UserMenu from '@/Components/UserMenu/UserMenu';
import SedePickerButton from '@/Components/SedePickerButton/SedePickerButton';
import AreaFuncionalPickerButton from '@/Components/AreaFuncionalPickerButton/AreaFuncionalPickerButton';
import { useActiveModule, useActiveModuleLabel } from '@/hooks/Session/session';

// Topbar global, compartida por /asignacion-citas, /programar-cita y
// /gestion-enfermeria (antes duplicada inline en cada page.jsx, con CSS
// repetido y ya divergente entre rutas — ver AGENTS.md, mismo criterio que
// Sidebar y UserMenu). El breadcrumb y el usuario los define cada ruta vía
// props; el contenido extra del lado derecho (chip de sede, toggle de tema,
// meta-items de especialidad/área...) se pasa como children porque varía por
// página y no todas lo necesitan.
//
// Pickers de Sede y Área funcional (encargo explícito: "en todas las rutas"):
// viven acá y no en cada pantalla, así que toda ruta con Topbar los muestra
// sin que su page.jsx tenga que montarlos. Se ven para el módulo Asistencial y
// para el administrador (que navega el árbol completo, ver Sidebar.jsx) — no
// para Contable/Inventario/Nómina, cuyo contexto es bodega y no sede/área
// asistencial (ver BodegaPickerButton, y de ahí la excepción de
// /insumos-farmacia para el admin). `pickers` permite a una pantalla forzarlo
// (Home lo deriva del módulo que se está previsualizando). Al admin el área no
// se le exige elegir (`obligatorio=false`): el login solo abre ese modal para
// el módulo Asistencial, así que sin esto le saltaría bloqueante en cada ruta.
export default function Topbar({ section, page, user, pickers, children }) {
  // El rol mostrado se deriva del módulo con el que se entró a sesión (ver
  // Sidebar, mismo patrón), no del `user.role` que cada página venía
  // hardcodeando -- así los dos quedan sincronizados sin tocar los 36 call
  // sites que todavía pasan ese campo (queda sin usar, no rompe nada).
  const roleLabel = useActiveModuleLabel();
  const activeModule = useActiveModule();
  const pathname = usePathname();
  const isAdmin = activeModule === 'administrador';
  const mostrarPickers = pickers
    ?? (activeModule === 'asistencial' || (isAdmin && !pathname.startsWith('/insumos-farmacia')));

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
        {mostrarPickers && (
          <>
            <SedePickerButton />
            <AreaFuncionalPickerButton obligatorio={!isAdmin} />
          </>
        )}
        {children}
        <div className="divider-v"></div>
        <UserMenu name={user.name} role={roleLabel} initials={user.initials} />
      </div>
    </header>
  );
}
