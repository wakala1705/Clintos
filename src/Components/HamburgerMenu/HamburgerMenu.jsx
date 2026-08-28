'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './HamburgerMenu.css';
import {
  LuChevronRight,
  LuCircleHelp,
  LuFileSearch,
  LuFileText,
  LuFolder,
  LuGlobe,
  LuLayoutGrid,
  LuMenu,
  LuSettings,
} from 'react-icons/lu';

// Menú del ícono de hamburguesa en el Topbar (app-wide, ver Topbar.jsx).
// Estructura de menú clásica de escritorio: lista vertical de secciones, con
// "Procesos" y "Ayuda" abriendo un segundo panel (flyout) anclado siempre a
// la esquina superior del panel principal, no a la fila que lo dispara — así
// se ve en el mock. Encargo: los ítems sin pantalla propia (sin `href`) se
// muestran deshabilitados en vez de clickeables-sin-efecto — ver
// `disabledItem`/`disabledSubItem` más abajo. Los ítems marcados hasSubmenu
// (Correcciones, RIPS, 890) muestran la flecha de un tercer nivel que no fue
// provisto todavía, y entran en esa misma regla (deshabilitados).
const MENU = [
  { id: 'archivo', label: 'Archivo', icon: LuFolder },
  { id: 'operacion', label: 'Operación', icon: LuSettings },
  {
    id: 'procesos',
    label: 'Procesos',
    icon: LuLayoutGrid,
    items: [
      { id: 'multas', label: 'Multas' },
      { divider: true },
      { id: 'gestion-consultorios', label: 'Gestión de consultorios' },
      { id: 'gestion-camas', label: 'Gestión de camas', href: '/gestion-camas' },
      { id: 'cancelar-citas', label: 'Cancelar citas paciente' },
      { id: 'programacion-agendas', label: 'Programación Agendas' },
      { id: 'configuracion-turnos', label: 'Configuración de turnos', href: '/configuracion-turnos' },
      { id: 'correcciones', label: 'Correcciones', hasSubmenu: true },
      { id: 'gestor-autorizaciones', label: 'Gestor de autorizaciones' },
      { id: 'cambio-medico', label: 'Cambio de médico' },
      { id: 'solicitud-consumo', label: 'Solicitud de consumo', href: '/solicitud-consumo' },
      { divider: true },
      { id: 'cambio-medico-familiar', label: 'Cambio de médico familiar' },
      { divider: true },
      { id: 'facturas', label: 'Facturas' },
      { id: 'facturacion-masiva', label: 'Facturación masiva' },
      { divider: true },
      { id: 'rips', label: 'RIPS', hasSubmenu: true },
      { id: '890', label: '890', hasSubmenu: true },
      { divider: true },
      { id: 'auditoria', label: 'Auditoría' },
    ],
  },
  { id: 'seguridad', label: 'Seguridad', icon: LuGlobe },
  { id: 'consulta', label: 'Consulta', icon: LuFileSearch },
  { id: 'reportes', label: 'Reportes', icon: LuFileText },
  {
    id: 'ayuda',
    label: 'Ayuda',
    icon: LuCircleHelp,
    items: [
      { id: 'temas-ayuda', label: 'Temas de ayuda' },
      { id: 'buscar-ayuda', label: 'Buscar ayuda sobre' },
      { id: 'como-usar-ayuda', label: 'Como usar la ayuda' },
      { divider: true },
      { id: 'acerca-de', label: 'Acerca de...' },
      { id: 'registro', label: 'Registro' },
    ],
  },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) closeAll();
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') closeAll();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function closeAll() {
    setOpen(false);
    setOpenSubmenu(null);
  }

  const activeItem = MENU.find((item) => item.id === openSubmenu);

  return (
    <div className="hmenu" ref={rootRef}>
      <button
        type="button"
        className="hamburger-btn"
        onClick={() => (open ? closeAll() : setOpen(true))}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú principal"
      >
        <LuMenu className="hamburger icon" aria-hidden="true" />
      </button>

      {open && (
        <div className="hmenu-dropdown" role="menu">
          {MENU.map((item) => {
            // Sin flyout propio (item.items) ni pantalla propia (item.href)
            // no hay nada que este ítem pueda abrir — deshabilitado en vez
            // de un botón que solo cierra el menú sin hacer nada.
            const disabled = !item.items && !item.href;
            return (
              <button
                key={item.id}
                type="button"
                className={`hmenu-item${openSubmenu === item.id ? ' active' : ''}`}
                role="menuitem"
                disabled={disabled}
                aria-disabled={disabled || undefined}
                aria-haspopup={item.items ? 'menu' : undefined}
                aria-expanded={item.items ? openSubmenu === item.id : undefined}
                onMouseEnter={() => { if (!disabled) setOpenSubmenu(item.items ? item.id : null); }}
                onClick={() => { if (!disabled) (item.items ? setOpenSubmenu(item.id) : closeAll()); }}
              >
                <item.icon className="icon" aria-hidden="true" />
                <span>{item.label}</span>
                {item.items && <LuChevronRight className="icon chev" aria-hidden="true" />}
              </button>
            );
          })}

          {activeItem && (
            <div className="hmenu-submenu" role="menu" onMouseEnter={() => setOpenSubmenu(activeItem.id)}>
              {activeItem.items.map((sub, i) => {
                if (sub.divider) return <div key={`div-${i}`} className="hmenu-divider"></div>;
                if (sub.href) {
                  return (
                    <Link key={sub.id} href={sub.href} className="hmenu-item" role="menuitem" onClick={closeAll}>
                      <span>{sub.label}</span>
                    </Link>
                  );
                }
                // Sin `href` = sin pantalla propia todavía (incluye los
                // marcados hasSubmenu: su 3er nivel no fue provisto) —
                // deshabilitado en vez de un botón que solo cierra el menú.
                return (
                  <button key={sub.id} type="button" className="hmenu-item" role="menuitem" disabled aria-disabled="true">
                    <span>{sub.label}</span>
                    {sub.hasSubmenu && <LuChevronRight className="icon chev" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
