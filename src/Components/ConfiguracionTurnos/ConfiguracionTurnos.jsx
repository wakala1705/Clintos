'use client';

import { useEffect } from 'react';
import './ConfiguracionTurnos.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import { LuCalendarClock } from 'react-icons/lu';

// Ruta /configuracion-turnos, colgada del ítem "Configuración de turnos"
// dentro de Procesos en HamburgerMenu.jsx — pantalla nueva, todavía sin
// funcionalidad propia (ver auditoría de mock de ese menú). Mismo patrón de
// empty-state de página completa que FichaNotFound/AdmisionesEmptyState
// (icono en círculo + título + subtítulo), sin CTA porque no hay ninguna
// acción que ofrecer todavía.
export default function ConfiguracionTurnos() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Consulta Externa"
          page="Configuración de turnos"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ct-content">
          <div className="ct-page-header">
            <h1>Configuración de turnos</h1>
            <p>Define los turnos de trabajo del personal asistencial.</p>
          </div>

          <div className="ct-empty-state">
            <div className="ct-empty-icon"><LuCalendarClock className="icon" /></div>
            <div className="ct-empty-title">Configuración de turnos en desarrollo</div>
            <div className="ct-empty-sub">Estamos trabajando en esta funcionalidad. Vuelve pronto.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
