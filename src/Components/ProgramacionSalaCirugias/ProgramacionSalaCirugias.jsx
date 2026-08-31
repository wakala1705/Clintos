'use client';

import { useEffect } from 'react';
import './ProgramacionSalaCirugias.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import { LuScissors } from 'react-icons/lu';

export default function ProgramacionSalaCirugias() {
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
          page="Programación sala de cirugías"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="psc-page-header">
            <div>
              <h1>Programación sala de cirugías</h1>
              <p>Agenda y gestiona la ocupación de las salas de cirugía.</p>
            </div>
          </div>

          <div className="psc-empty-state">
            <div className="psc-empty-icon"><LuScissors className="icon" /></div>
            <div className="psc-empty-title">Este módulo está en construcción.</div>
            <div className="psc-empty-sub">Muy pronto vas a poder programar y gestionar la sala de cirugías desde acá.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
