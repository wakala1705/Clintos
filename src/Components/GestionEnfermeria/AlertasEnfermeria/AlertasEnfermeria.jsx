'use client';

import { useEffect, useState } from 'react';
import './AlertasEnfermeria.css';
import '@/Components/GestionEnfermeria/shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import GestionEnfermeriaSidebar from '@/Components/GestionEnfermeria/GestionEnfermeriaSidebar/GestionEnfermeriaSidebar';
import Button from '@/Components/Button/Button';
import AlertListPanel from './AlertListPanel/AlertListPanel';
import AlertDetailDrawer from './AlertDetailDrawer/AlertDetailDrawer';
import ResolverAlertaModal from './modals/ResolverAlertaModal/ResolverAlertaModal';
import PosponerAlertaModal from './modals/PosponerAlertaModal/PosponerAlertaModal';
import EscalarAlertaModal from './modals/EscalarAlertaModal/EscalarAlertaModal';
import { AHORA_LABEL, RESPONSABLES_ESCALAMIENTO, TODAS_LAS_ALERTAS } from '@/hooks/GestionEnfermeria/mockAlertasData';
import { LuDownload } from 'react-icons/lu';

const RESPONSABLES_LABEL = Object.fromEntries(RESPONSABLES_ESCALAMIENTO.map((r) => [r.value, r.label]));

// Pantalla "Centro de Alertas" (encargo completo) — mismo shell
// Sidebar+Topbar+GestionEnfermeriaSidebar+.ge-page-body que TareasEnfermeria/
// PanelGeneral (ver AGENTS.md), con su propio breadcrumb ("Hospitalización /
// Gestión de Enfermería / Centro de Alertas") y su propio dataset
// (mockAlertasData.js). `initialTab` (opcional, sección 1 del encargo):
// siembra la pestaña activa cuando se entra desde uno de los 5 sub-ítems del
// sidebar ("Pendientes"/"Críticas"/...) — ver page.jsx, que lo resuelve desde
// `?tab=` sin necesitar useSearchParams/Suspense.
export default function AlertasEnfermeria({ initialTab }) {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [alertas, setAlertas] = useState(TODAS_LAS_ALERTAS);
  const [selectedId, setSelectedId] = useState(null);
  const [resolverTarget, setResolverTarget] = useState(null);
  const [posponerTarget, setPosponerTarget] = useState(null);
  const [escalarTarget, setEscalarTarget] = useState(null);

  function actualizarAlerta(id, cambios) {
    setAlertas((as) => as.map((a) => (a.id === id ? { ...a, ...cambios } : a)));
  }

  function agregarHistorial(id, texto) {
    setAlertas((as) => as.map((a) => (a.id === id ? { ...a, historial: [...a.historial, { hora: AHORA_LABEL, texto }] } : a)));
  }

  // Resolver una alerta → cambia automáticamente a "Resuelta" (regla 14).
  function confirmarResolucion(id, { hora, observaciones }) {
    actualizarAlerta(id, { estado: 'resuelta', retrasoMin: null });
    agregarHistorial(id, `Resuelta por Laura Méndez${observaciones ? ` — ${observaciones}` : ''} (registrado ${hora})`);
    setResolverTarget(null);
    window.ncToast?.('Alerta resuelta correctamente.');
  }

  // Posponer → cambia a "Pospuesta" y muestra cuándo vuelve a estar
  // pendiente (regla 14) — `pospuestaHasta` alimenta el banner del drawer y
  // el subtítulo "Creada" de la tabla (ver AlertTable.jsx).
  function confirmarPosponer(id, { minutos, hastaHora, hastaFecha }) {
    actualizarAlerta(id, { estado: 'pospuesta', pospuestaHasta: hastaHora });
    const texto = minutos ? `Pospuesta ${minutos} minutos` : `Pospuesta hasta ${hastaFecha} ${hastaHora}`;
    agregarHistorial(id, texto);
    setPosponerTarget(null);
    window.ncToast?.(`Alerta pospuesta hasta las ${hastaHora}.`);
  }

  // Escalar → registra la escalación y actualiza el historial (regla 14) —
  // no cambia `estado`: la alerta sigue necesitando resolución, solo cambia
  // quién debe atenderla.
  function confirmarEscalar(id, { responsable, motivo }) {
    const opcion = RESPONSABLES_LABEL[responsable] ?? responsable;
    agregarHistorial(id, `Escalada a ${opcion}${motivo ? ` — ${motivo}` : ''}`);
    setEscalarTarget(null);
    window.ncToast?.(`Alerta escalada a ${opcion}.`);
  }

  // Agregar nota → registra la nota en el historial (regla 14) — además
  // queda visible como nota propia en el drawer (ver alerta.notas).
  function agregarNota(id, texto) {
    setAlertas((as) => as.map((a) => (a.id === id
      ? { ...a, notas: [...a.notas, { autor: 'Laura Méndez', hora: AHORA_LABEL, texto }] }
      : a)));
    agregarHistorial(id, `Nota agregada: "${texto}"`);
  }

  const selectedAlerta = alertas.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Hospitalización', { label: 'Gestión de Enfermería', href: '/gestion-enfermeria' }]}
          page="Centro de Alertas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ge-shell-content">
          <GestionEnfermeriaSidebar />

          <div className="ge-page-body">
            <div className="al-header">
              <div>
                <h1>Centro de Alertas</h1>
                <p>Gestiona y da seguimiento a las alertas clínicas y operativas</p>
              </div>
              <div className="al-header-actions">
                <Button variant="secondary" icon={LuDownload} onClick={() => window.ncToast?.('Exportación en desarrollo.')}>
                  Exportar
                </Button>
              </div>
            </div>

            <AlertListPanel
              alertas={alertas}
              initialTab={initialTab}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAccionPrimaria={setResolverTarget}
            />
          </div>
        </div>
      </div>

      {selectedAlerta && (
        <AlertDetailDrawer
          alerta={selectedAlerta}
          onClose={() => setSelectedId(null)}
          onVerPaciente={() => window.ncToast?.('Ficha de paciente en desarrollo.')}
          onAdministrar={setResolverTarget}
          onPosponer={setPosponerTarget}
          onEscalar={setEscalarTarget}
          onAgregarNota={agregarNota}
        />
      )}

      {resolverTarget && <ResolverAlertaModal alerta={resolverTarget} onClose={() => setResolverTarget(null)} onConfirm={confirmarResolucion} />}
      {posponerTarget && <PosponerAlertaModal alerta={posponerTarget} onClose={() => setPosponerTarget(null)} onConfirm={confirmarPosponer} />}
      {escalarTarget && <EscalarAlertaModal alerta={escalarTarget} onClose={() => setEscalarTarget(null)} onConfirm={confirmarEscalar} />}
    </div>
  );
}
