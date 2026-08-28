'use client';

import { useEffect } from 'react';
import '../GestionTurnos.css';
import './Auditoria.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import GestionTurnosSidebar from '../GestionTurnosSidebar/GestionTurnosSidebar';
import { LuHistory } from 'react-icons/lu';

// Placeholder de "Auditoría / Historial" (encargo explícito: fuera de
// alcance de V1 — solo la navegación queda funcionando, sin registro de
// eventos todavía). Mismo patrón de empty-state de página completa que el
// resto del proyecto (AdmisionesEmptyState/FichaNotFound).
export default function Auditoria() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de turnos', href: '/gestion-turnos' }]}
          page="Auditoría / Historial"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ct-content">
          <GestionTurnosSidebar />

          <div className="ct-page-body">
            <div className="ct-page-header">
              <div>
                <h1>Auditoría / Historial</h1>
                <p>Registro de cambios sobre tipos de turno y configuración del personal.</p>
              </div>
            </div>

            <div className="ct-empty-state">
              <div className="ct-empty-icon"><LuHistory className="icon" /></div>
              <div className="ct-empty-title">Sin actividad registrada aún</div>
              <div className="ct-empty-sub">El historial de auditoría de esta sección estará disponible en una próxima versión.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
