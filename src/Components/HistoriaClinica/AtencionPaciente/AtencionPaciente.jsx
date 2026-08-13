'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../HistoriaClinica.css';
import '../shared/shared.css';
import './AtencionPaciente.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import PatientBanner from '@/Components/PatientBanner/PatientBanner';
import TipoBadge from '../TipoBadge/TipoBadge';
import AgendaEmptyState from '../AgendaEmptyState/AgendaEmptyState';
import HistoriaClinicaTab from './HistoriaClinicaTab/HistoriaClinicaTab';
import PlantillaModal from './PlantillaModal/PlantillaModal';
import PlantillaCrecimt2 from './PlantillaCrecimt2/PlantillaCrecimt2';
import { getAtencionData } from '@/hooks/HistoriaClinica/mockAgendaData';
import { getRegistrosGrupos } from '@/hooks/HistoriaClinica/mockHistoriaClinicaRecords';
import {
  LuCalendarOff,
  LuCircleAlert,
  LuClipboardList,
  LuFileCheck,
  LuFileText,
  LuFlaskConical,
  LuPaperclip,
  LuTriangleAlert,
} from 'react-icons/lu';

// Pestañas de la atención — solo "Historia clínica" tiene contenido hoy; el
// resto queda deshabilitada con "Próximamente", mismo patrón que Monitoreo/
// Notas de enfermería en GestionEnfermeria (ver AGENTS.md).
const TABS = [
  { id: 'historia-clinica', label: 'Historia clínica', icon: LuFileText, enabled: true },
  { id: 'ordenes-medicas', label: 'Órdenes médicas', icon: LuClipboardList, enabled: false },
  { id: 'incapacidades', label: 'Incapacidades', icon: LuCalendarOff, enabled: false },
  { id: 'consentimiento-informado', label: 'Consentimiento informado', icon: LuFileCheck, enabled: false },
  { id: 'resultados', label: 'Resultados', icon: LuFlaskConical, enabled: false },
  { id: 'alergias', label: 'Alergias', icon: LuCircleAlert, enabled: false },
  { id: 'alertas', label: 'Alertas', icon: LuTriangleAlert, enabled: false },
  { id: 'archivos', label: 'Archivos', icon: LuPaperclip, enabled: false },
];

export default function AtencionPaciente({ id }) {
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading | ready | not-found
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('historia-clinica');
  const [plantillaModalOpen, setPlantillaModalOpen] = useState(false);
  const tabRefs = useRef(new Map());
  const [plantillaActiva, setPlantillaActiva] = useState(null); // null | 'crecimt2'
  // "Maximizar" (ver ViewSettingsMenu.jsx, dentro de PlantillaCrecimt2): vive
  // acá porque también compacta PatientBanner, hermano de la card, no solo
  // algo interno a PlantillaCrecimt2. Se resetea al salir de la plantilla
  // (ver handleSalirPlantilla) para no dejar el banner compacto en la vista
  // de pestañas normal.
  const [plantillaMaximizada, setPlantillaMaximizada] = useState(false);
  // Guarda qué elemento tenía el foco antes de abrir el catálogo de
  // plantillas, para devolvérselo al cerrar (PlantillaModal no lo sabe: solo
  // conoce su propio contenido, no quién lo disparó — WCAG 2.1.2/2.4.3).
  const plantillaTriggerRef = useRef(null);

  function openPlantillaModal() {
    plantillaTriggerRef.current = document.activeElement;
    setPlantillaModalOpen(true);
  }

  function closePlantillaModal() {
    setPlantillaModalOpen(false);
    plantillaTriggerRef.current?.focus?.();
  }

  function handleSalirPlantilla() {
    setPlantillaActiva(null);
    setPlantillaMaximizada(false);
  }

  // Patrón ARIA APG de tablist: el roving tabIndex ya deja Tab llegar a la
  // pestaña activa, pero dentro del tablist las flechas deben moverse entre
  // pestañas habilitadas (WCAG 4.1.2 / expectativa estándar del patrón). Hoy
  // solo hay una pestaña enabled, así que esto queda listo para cuando se
  // habiliten más (ver TABS más arriba) sin volver a tocar este handler.
  function handleTabsKeyDown(e) {
    const enabledTabs = TABS.filter((t) => t.enabled);
    if (enabledTabs.length <= 1) return;
    const currentIndex = enabledTabs.findIndex((t) => t.id === activeTab);
    let nextIndex;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % enabledTabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = enabledTabs.length - 1;
    else return;

    e.preventDefault();
    const nextTab = enabledTabs[nextIndex];
    setActiveTab(nextTab.id);
    tabRefs.current.get(nextTab.id)?.focus();
  }

  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAtencionData(id).then((result) => {
      if (cancelled) return;
      if (!result) { setStatus('not-found'); return; }
      setData(result);
      setStatus('ready');
    });
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Consulta Externa', { label: 'Historias Clínicas', href: '/historia-clinica' }]}
          page="Atención del paciente"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content hc-content">
          {/* aria-live: sin esto, un lector de pantalla que ya leyó "Cargando
              atención…" no se entera cuando ese estado cambia a "no
              encontramos esta cita" — no hay foco ni anuncio que lo avise
              (WCAG 4.1.3). Solo se monta mientras status !== 'ready': una
              vez listo, el contenido real se encuentra con la lectura normal
              de la página y este wrapper no debe seguir ocupando flex:1
              junto a él (ver .ap-status-live en AtencionPaciente.css). */}
          {status !== 'ready' && (
            <div className="ap-status-live" aria-live="polite">
              {status === 'loading' && <div className="ap-loading">Cargando atención…</div>}

              {status === 'not-found' && (
                <div className="ap-not-found">
                  <AgendaEmptyState
                    icon={LuFileText}
                    title="No encontramos esta cita"
                    subtitle="Puede que el enlace esté vencido o la cita ya no exista en la agenda del día."
                  />
                  <button type="button" className="btn btn-primary" onClick={() => router.push('/historia-clinica')}>
                    Volver a la agenda
                  </button>
                </div>
              )}
            </div>
          )}

          {status === 'ready' && data && (
            <>
              <PatientBanner
                patient={data.patient}
                compact={plantillaActiva === 'crecimt2' && plantillaMaximizada}
                secondRow={[
                  { label: 'Cita', value: data.cita.citaHora },
                  { label: 'Servicio', value: `${data.cita.idServicio} · ${data.cita.descripcionServicio}` },
                  { label: 'Tipo cita', value: <TipoBadge tipo={data.cita.tipoCita} /> },
                ]}
              />

              <div className="card">
                {plantillaActiva === 'crecimt2' ? (
                  <PlantillaCrecimt2
                    onSalir={handleSalirPlantilla}
                    maximizada={plantillaMaximizada}
                    onToggleMaximizar={() => setPlantillaMaximizada((v) => !v)}
                    patient={data.patient}
                  />
                ) : (
                  <>
                    <div className="card-tabs-bar" role="tablist" aria-label="Secciones de la atención" onKeyDown={handleTabsKeyDown}>
                      {TABS.map((tab) => (
                        <button
                          key={tab.id}
                          ref={(el) => { if (el) tabRefs.current.set(tab.id, el); else tabRefs.current.delete(tab.id); }}
                          type="button"
                          className={`card-tab${activeTab === tab.id ? ' active' : ''}`}
                          role="tab"
                          aria-selected={activeTab === tab.id}
                          aria-controls={`panel-${tab.id}`}
                          tabIndex={activeTab === tab.id ? 0 : -1}
                          disabled={!tab.enabled}
                          aria-disabled={!tab.enabled}
                          title={!tab.enabled ? 'Próximamente' : undefined}
                          onClick={() => tab.enabled && setActiveTab(tab.id)}
                        >
                          <tab.icon className="icon" aria-hidden="true" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="ap-tab-panel" role="tabpanel" id="panel-historia-clinica">
                      {activeTab === 'historia-clinica' && (
                        <HistoriaClinicaTab
                          grupos={getRegistrosGrupos(data.patient.documento)}
                          nuevaAtencionLabel="Nueva atención"
                          onNuevaAtencion={openPlantillaModal}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <PlantillaModal
        open={plantillaModalOpen}
        onClose={closePlantillaModal}
        onElegir={(plantilla) => {
          closePlantillaModal();
          if (plantilla.codigo === 'CRECIMT2') {
            setPlantillaActiva('crecimt2');
            return;
          }
          window.ncToast?.(`Plantilla "${plantilla.descripcion}" seleccionada (flujo de nueva atención en desarrollo).`);
        }}
      />
    </div>
  );
}
