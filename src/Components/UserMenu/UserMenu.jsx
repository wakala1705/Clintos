'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import './UserMenu.css';
import ConfigModal from './ConfigModal/ConfigModal';
import { LuBell, LuChevronDown, LuLifeBuoy, LuLogOut, LuSettings } from 'react-icons/lu';

// Menú desplegable del usuario, compartido por /asignacion-citas y
// /historia-clinica (mismo criterio que Sidebar — ver AGENTS.md). Cada ruta le
// pasa sus propios name/role/initials; el propio componente resuelve
// apertura/cierre del dropdown y del ConfigModal con estado local, sin
// depender de las funciones globales de legacy-app.js.
export default function UserMenu({ name, role, initials }) {
  const [open, setOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const rootRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleLogout() {
    setOpen(false);
    router.push('/Login');
  }

  return (
    <>
      <div className="user-menu" ref={rootRef}>
        <button
          type="button"
          className="user-chip"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <div className="user-avatar">{initials}</div>
          <div className="who">
            <div className="name">{name}</div>
            <div className="role">{role}</div>
          </div>
          <LuChevronDown className="icon chev" aria-hidden="true" />
        </button>

        {open && (
          <div className="user-menu-dropdown" role="menu">
            <button type="button" className="user-menu-item" role="menuitem" onClick={() => setOpen(false)}>
              <LuBell className="icon" aria-hidden="true" />
              Notificaciones
            </button>
            <button type="button" className="user-menu-item" role="menuitem" onClick={() => setOpen(false)}>
              <LuLifeBuoy className="icon" aria-hidden="true" />
              Soporte
            </button>
            <button
              type="button"
              className="user-menu-item"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setConfigOpen(true);
              }}
            >
              <LuSettings className="icon" aria-hidden="true" />
              Configuración
            </button>
            <div className="user-menu-divider"></div>
            <button type="button" className="user-menu-item danger" role="menuitem" onClick={handleLogout}>
              <LuLogOut className="icon" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <ConfigModal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        name={name}
        role={role}
        initials={initials}
      />
    </>
  );
}
