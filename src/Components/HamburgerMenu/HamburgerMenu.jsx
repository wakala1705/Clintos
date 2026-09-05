'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './HamburgerMenu.css';
import {
  LuBed,
  LuChevronRight,
  LuFileSearch,
  LuFileText,
  LuFlaskConical,
  LuFolder,
  LuGlobe,
  LuLayoutGrid,
  LuMenu,
  LuReceipt,
  LuSettings,
  LuSquarePlus,
} from 'react-icons/lu';

// Megamenú del ícono de hamburguesa en el Topbar (app-wide, ver Topbar.jsx).
// Cascada progresiva de 3 niveles, uno a la vez por hover (no un panel ancho
// con todo a la vista): 1) módulos asistenciales (Consulta Externa,
// Hospitalización, Ayudas Diagnósticas, Facturación) — `openModule`; 2) al
// pasar el mouse sobre uno con contenido (`columns.length`) se abre una sola
// columna con sus categorías (Archivo, Procesos, Ayuda...) — `openColumn`;
// 3) al pasar el mouse sobre una categoría con ítems se abre un tercer panel
// a la derecha con esos ítems. Cada panel se ancla a la esquina superior del
// anterior (top:0; left:100%), no a la fila que lo dispara. Facturación
// arranca sin columnas (contenido pendiente) — deshabilitado en vez de
// clickeable-sin-efecto, mismo criterio que las columnas sin ítems propios
// (Archivo/Operación/Seguridad/Consulta/Reportes/Configuración del sistema)
// o los ítems marcados hasSubmenu (Correcciones, RIPS, 890, cuarto nivel no
// provisto todavía).
const MEGA_MENU = [
  {
    id: 'consulta-externa',
    label: 'Consulta Externa',
    icon: LuSquarePlus,
    columns: [
      { id: 'archivo', label: 'Archivo', icon: LuFolder, items: [] },
      { id: 'operacion', label: 'Operación', icon: LuSettings, items: [] },
      {
        id: 'procesos',
        label: 'Procesos',
        icon: LuLayoutGrid,
        items: [
          { id: 'multas', label: 'Multas' },
          { divider: true },
          { id: 'gestion-consultorios', label: 'Gestión de consultorios' },
          { id: 'cancelar-citas', label: 'Cancelar citas paciente' },
          { id: 'programacion-agendas', label: 'Programación Agendas' },
          { id: 'correcciones', label: 'Correcciones', hasSubmenu: true },
          { id: 'gestor-autorizaciones', label: 'Gestor de autorizaciones' },
          { id: 'cambio-medico', label: 'Cambio de médico' },
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
      { id: 'seguridad', label: 'Seguridad', icon: LuGlobe, items: [] },
      { id: 'consulta', label: 'Consulta', icon: LuFileSearch, items: [] },
      { id: 'reportes', label: 'Reportes', icon: LuFileText, items: [] },
    ],
  },
  {
    id: 'hospitalizacion',
    label: 'Hospitalización',
    icon: LuBed,
    columns: [
      {
        id: 'procesos',
        label: 'Procesos',
        icon: LuLayoutGrid,
        items: [
          { id: 'gestion-camas', label: 'Gestión de camas', href: '/gestion-camas' },
          { id: 'gestion-turnos', label: 'Gestión de turnos', href: '/gestion-turnos' },
        ],
      },
    ],
  },
  {
    id: 'ayudas-diagnosticas',
    label: 'Ayudas Diagnósticas',
    icon: LuFlaskConical,
    columns: [
      {
        id: 'procesos',
        label: 'Procesos',
        icon: LuLayoutGrid,
        items: [
          { id: 'solicitud-consumo', label: 'Solicitud de consumo', href: '/solicitud-consumo' },
        ],
      },
    ],
  },
  { id: 'facturacion', label: 'Facturación', icon: LuReceipt, columns: [] },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [openModule, setOpenModule] = useState(null);
  const [openColumn, setOpenColumn] = useState(null);
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
    setOpenModule(null);
    setOpenColumn(null);
  }

  const activeModule = MEGA_MENU.find((item) => item.id === openModule);
  const activeColumn = activeModule?.columns.find((column) => column.id === openColumn);

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
          {MEGA_MENU.map((item) => {
            const disabled = item.columns.length === 0;
            return (
              <button
                key={item.id}
                type="button"
                className={`hmenu-item${openModule === item.id ? ' active' : ''}`}
                role="menuitem"
                disabled={disabled}
                aria-disabled={disabled || undefined}
                aria-haspopup="menu"
                aria-expanded={disabled ? undefined : openModule === item.id}
                onMouseEnter={() => { if (!disabled) { setOpenModule(item.id); setOpenColumn(null); } }}
                onClick={() => { if (!disabled) { setOpenModule(item.id); setOpenColumn(null); } }}
              >
                <item.icon className="icon" aria-hidden="true" />
                <span>{item.label}</span>
                {!disabled && <LuChevronRight className="icon chev" aria-hidden="true" />}
              </button>
            );
          })}

          {activeModule && (
            <div className="hmenu-megapanel" role="menu" onMouseEnter={() => setOpenModule(activeModule.id)}>
              {activeModule.columns.map((column) => {
                const columnDisabled = column.items.length === 0;
                return (
                  <button
                    key={column.id}
                    type="button"
                    className={`hmenu-item${openColumn === column.id ? ' active' : ''}`}
                    role="menuitem"
                    disabled={columnDisabled}
                    aria-disabled={columnDisabled || undefined}
                    aria-haspopup="menu"
                    aria-expanded={columnDisabled ? undefined : openColumn === column.id}
                    onMouseEnter={() => { if (!columnDisabled) setOpenColumn(column.id); }}
                    onClick={() => { if (!columnDisabled) setOpenColumn(column.id); }}
                  >
                    <column.icon className="icon" aria-hidden="true" />
                    <span>{column.label}</span>
                    {!columnDisabled && <LuChevronRight className="icon chev" aria-hidden="true" />}
                  </button>
                );
              })}

              {activeColumn && (
                <div className="hmenu-megaflyout" role="menu" onMouseEnter={() => setOpenColumn(activeColumn.id)}>
                  {activeColumn.items.map((sub, i) => {
                    if (sub.divider) return <div key={`div-${i}`} className="hmenu-divider"></div>;
                    if (sub.href) {
                      return (
                        <Link key={sub.id} href={sub.href} className="hmenu-item" role="menuitem" onClick={closeAll}>
                          <span>{sub.label}</span>
                        </Link>
                      );
                    }
                    // Sin `href` = sin pantalla propia todavía (incluye
                    // los marcados hasSubmenu: su 3er nivel no fue
                    // provisto) — deshabilitado en vez de un botón que
                    // solo cierra el menú.
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
      )}
    </div>
  );
}
