'use client';

import { useEffect } from 'react';
import './PacientesEnfermeria.css';
import '@/Components/GestionEnfermeria/shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import GestionEnfermeriaNav from '@/Components/GestionEnfermeria/GestionEnfermeriaNav/GestionEnfermeriaNav';
import { LuUsers } from 'react-icons/lu';

// Sección "Pacientes" de la navegación interna de Gestión de Enfermería (ver
// GestionEnfermeriaNav) — todavía sin listado propio; "Pacientes en piso"
// sigue viviendo en Panel General (PatientsPanel) hasta que esta pantalla
// tenga su propio diseño. Mismo patrón de empty-state de página completa
// que ConfiguracionTurnos (icono en círculo + título + subtítulo, sin CTA).
export default function PacientesEnfermeria() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Hospitalización', { label: 'Gestión de Enfermería', href: '/gestion-enfermeria' }]}
          page="Pacientes"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content pe-content">
          <div className="pe-header">
            <h1>Pacientes</h1>
            <p>Listado y gestión detallada de los pacientes del área seleccionada.</p>
          </div>

          <GestionEnfermeriaNav />

          <div className="card">
            <div className="ge-empty-state">
              <div className="ge-empty-icon"><LuUsers className="icon" /></div>
              <div className="ge-empty-title">Sección de pacientes en desarrollo</div>
              <div className="ge-empty-sub">
                Por ahora, el listado de pacientes en piso está disponible en Panel general.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
