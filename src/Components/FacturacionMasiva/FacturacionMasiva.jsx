'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './FacturacionMasiva.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import FacturacionMasivaCEModal from './modals/FacturacionMasivaCEModal/FacturacionMasivaCEModal';

// Dos procesos distintos, una ruta por cada uno (ver /app/facturacion-masiva/*).
const PROCESOS = {
  hospitalizacion: {
    nombre: 'Hospitalización',
    descripcion: 'Genera facturas de forma masiva para las admisiones hospitalarias.',
  },
  'consulta-externa': {
    nombre: 'Consulta externa',
    descripcion: 'Genera facturas de forma masiva para las atenciones de consulta externa.',
  },
};

export default function FacturacionMasiva({ proceso }) {
  const { nombre, descripcion } = PROCESOS[proceso];
  // Consulta externa abre su ventana de filtros apenas se entra a la ruta.
  const tieneVentana = proceso === 'consulta-externa';
  const [ventanaAbierta, setVentanaAbierta] = useState(tieneVentana);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }
  const cerrarVentana = useCallback(() => setVentanaAbierta(false), []);

  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Finanzas"
          page={`Facturación masiva · ${nombre}`}
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content fm-content">
          <div className="fm-page-header">
            <h1>Facturación masiva · {nombre}</h1>
            <p>{descripcion}</p>
          </div>

          <div className="fm-card">
            {tieneVentana && !ventanaAbierta && (
              <div className="fm-empty">
                <p>Configura los filtros para elegir qué facturar.</p>
                <Button onClick={() => setVentanaAbierta(true)}>Abrir facturación masiva</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {tieneVentana && ventanaAbierta && (
        <FacturacionMasivaCEModal onClose={cerrarVentana} onNotify={showToast} />
      )}

      <div className={`fm-toast${toast ? ' show' : ''}`} role="status">
        <span className="fm-toast-dot"></span>
        <span>{toast}</span>
      </div>
    </div>
  );
}
