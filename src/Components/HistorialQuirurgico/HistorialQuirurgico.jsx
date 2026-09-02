'use client';

import { useEffect, useState } from 'react';
import './HistorialQuirurgico.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import PatientBanner from '@/Components/PatientBanner/PatientBanner';
import IntervencionesTable from './IntervencionesTable/IntervencionesTable';
import IntervencionResumen from './IntervencionResumen/IntervencionResumen';
import ProcedimientosList from './ProcedimientosList/ProcedimientosList';
import ProcedimientoDetalle from './ProcedimientoDetalle/ProcedimientoDetalle';
import { PACIENTE_DEMO, INTERVENCIONES } from '@/hooks/HistorialQuirurgico/mockHistorialQuirurgico';

// Pantalla de solo consulta -- sin mutaciones, todo apilado en una sola
// página con scroll (ver spec). El único modal es "Ver más" de PatientBanner
// (PatientDetailModal, propio de ese componente global) -- ninguna sección
// de esta pantalla abre uno propio. El `id` de la ruta
// (src/app/historial-quirurgico/[id]/page.jsx) no llega hasta acá a
// propósito: el contenido clínico es siempre el mismo dataset de demo fijo
// (encargo explícito -- no existe historial real por cada uno de los ~46
// pacientes mock de ListaPacientes).
export default function HistorialQuirurgico() {
  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  const [selectedIntervencionId, setSelectedIntervencionId] = useState(INTERVENCIONES[0]?.id ?? null);
  const [selectedProcedimientoId, setSelectedProcedimientoId] = useState(
    INTERVENCIONES[0]?.procedimientos[0]?.id ?? null,
  );

  const intervencionSeleccionada = INTERVENCIONES.find((i) => i.id === selectedIntervencionId) ?? null;

  // Al cambiar de intervención, el procedimiento seleccionado se resetea al
  // primero de la nueva intervención -- mismo truco "ajustar estado durante
  // el render" que usa DetalleCirugiaPanel para `lastCirugiaId`.
  const [lastIntervencionId, setLastIntervencionId] = useState(selectedIntervencionId);
  if (selectedIntervencionId !== lastIntervencionId) {
    setLastIntervencionId(selectedIntervencionId);
    setSelectedProcedimientoId(intervencionSeleccionada?.procedimientos[0]?.id ?? null);
  }

  const procedimientos = intervencionSeleccionada?.procedimientos ?? [];
  const procedimientoSeleccionado = procedimientos.find((p) => p.id === selectedProcedimientoId) ?? null;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Hospitalización', { label: 'Programación sala de cirugías', href: '/programacion-sala-cirugias' }]}
          page="Historial quirúrgico"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <PatientBanner patient={PACIENTE_DEMO} />

          <div className="hq-body">
            <section className="hq-card hq-card--flush">
              <div className="hq-card-header">
                <h2>Intervenciones quirúrgicas</h2>
                <span className="hq-count-badge">
                  {INTERVENCIONES.length} {INTERVENCIONES.length === 1 ? 'intervención' : 'intervenciones'}
                </span>
              </div>
              <IntervencionesTable
                intervenciones={INTERVENCIONES}
                selectedId={selectedIntervencionId}
                onSelect={setSelectedIntervencionId}
              />
            </section>

            {intervencionSeleccionada && (
              <section className="hq-card">
                <h2>Detalle de la intervención</h2>
                <IntervencionResumen intervencion={intervencionSeleccionada} />
              </section>
            )}

            {intervencionSeleccionada && (
              <section className="hq-card">
                <h2>Procedimientos realizados</h2>
                <ProcedimientosList
                  procedimientos={procedimientos}
                  selectedId={selectedProcedimientoId}
                  onSelect={setSelectedProcedimientoId}
                />
              </section>
            )}

            {procedimientoSeleccionado && (
              <section className="hq-card">
                <h2>Detalle del procedimiento</h2>
                <ProcedimientoDetalle procedimiento={procedimientoSeleccionado} />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
