'use client';

import { useEffect } from 'react';
import { LuUserCog } from 'react-icons/lu';
import './SubmoduleAdministracion.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import UnderConstruction from '@/Components/UnderConstruction/UnderConstruction';

// Pantalla "Administración" de un submódulo (Consulta Externa, Hospitalización,
// Ayudas DX, Facturación) -- un único componente reusado por las 4 rutas en
// vez de 4 copias casi idénticas, ya que hoy son todas el mismo placeholder
// "en desarrollo" con un breadcrumb distinto (ver AGENTS.md "Component
// organization": componente app-wide usado por 2+ rutas).
export default function SubmoduleAdministracion({ section }) {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: false });
    return cleanup;
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={section}
          page="Administración"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <UnderConstruction
            icon={LuUserCog}
            title="Administración en desarrollo"
            subtitle="Esta sección todavía no está disponible. Estamos trabajando en ella."
          />
        </div>
      </div>
    </div>
  );
}
