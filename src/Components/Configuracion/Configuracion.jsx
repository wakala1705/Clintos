'use client';

import { useEffect } from 'react';
import { LuSettings } from 'react-icons/lu';
import './Configuracion.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import UnderConstruction from '@/Components/UnderConstruction/UnderConstruction';

export default function Configuracion() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: false });
    return cleanup;
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar page="Configuración" user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }} />

        <div className="content">
          <UnderConstruction
            icon={LuSettings}
            title="Configuración en desarrollo"
            subtitle="Esta sección todavía no está disponible. Estamos trabajando en ella."
          />
        </div>
      </div>
    </div>
  );
}
