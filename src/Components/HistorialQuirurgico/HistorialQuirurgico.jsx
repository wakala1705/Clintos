'use client';

import { useEffect, useState } from 'react';
import './HistorialQuirurgico.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import PatientBanner from '@/Components/PatientBanner/PatientBanner';
import IntervencionesTable from './IntervencionesTable/IntervencionesTable';
import IntervencionDetalleModal from './modals/IntervencionDetalleModal/IntervencionDetalleModal';
import { PACIENTE_DEMO, INTERVENCIONES } from '@/hooks/HistorialQuirurgico/mockHistorialQuirurgico';

// Pantalla de solo consulta -- sin mutaciones. El "Detalle de la
// intervención"/"Procedimientos realizados"/"Detalle del procedimiento" ya
// no viven apilados en la página (encargo explícito): se trasladaron a
// IntervencionDetalleModal, que se abre desde "Ver detalle" en
// IntervencionesTable (o clickeando la fila, mismo handler) -- ver ese modal
// para el resto de la lógica de selección de procedimiento. El único modal
// que quedaba antes de este cambio era "Ver más" de PatientBanner
// (PatientDetailModal, propio de ese componente global). El `id` de la ruta
// (src/app/historial-quirurgico/[id]/page.jsx) no llega hasta acá a
// propósito: el contenido clínico es siempre el mismo dataset de demo fijo
// (encargo explícito -- no existe historial real por cada uno de los ~46
// pacientes mock de ListaPacientes).
export default function HistorialQuirurgico() {
  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  const [modalIntervencionId, setModalIntervencionId] = useState(null);
  const intervencionDelModal = INTERVENCIONES.find((i) => i.id === modalIntervencionId) ?? null;

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
                selectedId={modalIntervencionId}
                onSelect={setModalIntervencionId}
              />
            </section>
          </div>
        </div>
      </div>

      {intervencionDelModal && (
        <IntervencionDetalleModal
          intervencion={intervencionDelModal}
          onClose={() => setModalIntervencionId(null)}
        />
      )}
    </div>
  );
}
