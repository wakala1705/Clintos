'use client';

import { useEffect } from 'react';
import { LuPill } from 'react-icons/lu';
import './Solicitudes.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import UnderConstruction from '@/Components/UnderConstruction/UnderConstruction';

export default function Solicitudes() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: false });
    return cleanup;
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar page="Solicitudes" user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }} />

        <div className="content">
          <UnderConstruction
            icon={LuPill}
            title="Solicitudes de Insumos Farmacia en desarrollo"
            subtitle="Esta sección todavía no está disponible. Estamos trabajando en ella."
          />
        </div>
      </div>
    </div>
  );
}
