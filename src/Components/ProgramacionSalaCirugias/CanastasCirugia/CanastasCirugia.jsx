'use client';

import { useEffect } from 'react';
import './CanastasCirugia.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';

// Ruta nueva para "Canastas de cirugía" (encargo explícito, 2026-09-29) --
// por ahora página en blanco, solo el shell de la app para que el botón de
// ProgramacionSalaCirugias.jsx tenga a dónde navegar. El contenido real
// (catálogo de canastas) se construye en un paso aparte.
export default function CanastasCirugia() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Canastas de cirugía"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="cc-page-header">
            <h1>Canastas de cirugía</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
