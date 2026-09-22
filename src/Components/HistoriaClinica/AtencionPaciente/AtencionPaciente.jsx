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
import OrdenesMedicasTab from './OrdenesMedicasTab/OrdenesMedicasTab';
import PlantillaModal from './PlantillaModal/PlantillaModal';
import CreandoPlantillaModal from './CreandoPlantillaModal/CreandoPlantillaModal';
import PlantillaCrecimt2 from './PlantillaCrecimt2/PlantillaCrecimt2';
import PlantillaIngresoHospitalizacion from './PlantillaIngresoHospitalizacion/PlantillaIngresoHospitalizacion';
import { DOCTOR, getAtencionData } from '@/hooks/HistoriaClinica/mockAgendaData';
import { getRegistrosGrupos, getRegistrosGruposHospitalizacion } from '@/hooks/HistoriaClinica/mockHistoriaClinicaRecords';
import { getOrdenesMedicas } from '@/hooks/HistoriaClinica/mockOrdenesMedicas';
import { PLANTILLAS, PLANTILLAS_HOSPITALIZACION } from '@/hooks/HistoriaClinica/mockPlantillas';
import { getHospitalizadoData } from '@/hooks/HistoriaClinicaHospitalizacion/mockHospitalizadosData';
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

// Delay simulado al elegir/crear una plantilla (ver handleElegirPlantilla) —
// mismo criterio que PRINT_LOADING_DELAY_MS en FacturaVistaClasica.jsx.
const CREAR_PLANTILLA_DELAY_MS = 1200;

// Pestañas de la atención — "Historia clínica" y "Órdenes médicas" tienen
// contenido hoy; el resto queda deshabilitada con "Próximamente", mismo patrón que Monitoreo/
// Notas de enfermería en GestionEnfermeria (ver AGENTS.md).
const TABS = [
  { id: 'historia-clinica', label: 'Historia clínica', icon: LuFileText, enabled: true },
  { id: 'ordenes-medicas', label: 'Órdenes médicas', icon: LuClipboardList, enabled: true },
  { id: 'incapacidades', label: 'Incapacidades', icon: LuCalendarOff, enabled: false },
  { id: 'consentimiento-informado', label: 'Consentimiento informado', icon: LuFileCheck, enabled: false },
  { id: 'resultados', label: 'Resultados', icon: LuFlaskConical, enabled: false },
  { id: 'alergias', label: 'Alergias', icon: LuCircleAlert, enabled: false },
  { id: 'alertas', label: 'Alertas', icon: LuTriangleAlert, enabled: false },
  { id: 'archivos', label: 'Archivos', icon: LuPaperclip, enabled: false },
];

// Variantes de la pantalla — la misma atención (banner + pestañas) se monta
// bajo 2 rutas: la cita de Consulta Externa (/historia-clinica/atencion/[id])
// y el paciente hospitalizado (/hospitalizacion/historia-clinica/[id], ver
// HistoriaClinicaHospitalizacion). Las pestañas (TABS) son las mismas; lo que
// cambia es de dónde salen los datos, el breadcrumb, la segunda fila del
// banner y a dónde vuelve el estado "no encontrado".
const VARIANTES = {
  'consulta-externa': {
    fetchData: getAtencionData,
    getRegistros: (data) => getRegistrosGrupos(data.patient.documento),
    plantillas: PLANTILLAS,
    plantillasConSexo: false,
    section: ['Consulta Externa', { label: 'Historias Clínicas', href: '/historia-clinica' }],
    volverHref: '/historia-clinica',
    volverLabel: 'Volver a la agenda',
    // Encargo explícito: al entrar desde Historias Clínicas, el banner abre
    // ya contraído (ver `defaultCollapsed` en PatientBanner.jsx).
    bannerCollapsed: true,
    notFound: {
      title: 'No encontramos esta cita',
      subtitle: 'Puede que el enlace esté vencido o la cita ya no exista en la agenda del día.',
    },
    secondRow: (data) => [
      { label: 'Cita', value: data.cita.citaHora },
      { label: 'Servicio', value: `${data.cita.idServicio} · ${data.cita.descripcionServicio}` },
      { label: 'Tipo cita', value: <TipoBadge tipo={data.cita.tipoCita} /> },
    ],
  },
  hospitalizacion: {
    fetchData: getHospitalizadoData,
    getRegistros: getRegistrosGruposHospitalizacion,
    plantillas: PLANTILLAS_HOSPITALIZACION,
    plantillasConSexo: true,
    section: ['Hospitalización', { label: 'Historia Clínica', href: '/hospitalizacion/historia-clinica' }],
    volverHref: '/hospitalizacion/historia-clinica',
    volverLabel: 'Volver a mis pacientes',
    // Mismo criterio que consulta-externa (ver comentario arriba): abre con
    // el banner ya contraído.
    bannerCollapsed: true,
    notFound: {
      title: 'No encontramos este paciente',
      subtitle: 'Puede que el enlace esté vencido o el paciente ya no esté hospitalizado.',
    },
    // Orden de la fila 2: N° Admisión, Fecha de ingreso y Cama son campos
    // fijos de PatientBanner (`patient.numeroAdmision/fechaIngreso/cama`, en
    // ese orden); acá van solo los dos que siguen.
    secondRow: (data) => [
      { label: 'Médico tratante', value: data.hospitalizacion.medico },
      { label: 'Diagnóstico', value: data.hospitalizacion.diagnostico },
    ],
  },
};

export default function AtencionPaciente({ id, variante = 'consulta-externa' }) {
  const router = useRouter();
  const cfg = VARIANTES[variante];
  const [status, setStatus] = useState('loading'); // loading | ready | not-found
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('historia-clinica');
  const [plantillaModalOpen, setPlantillaModalOpen] = useState(false);
  const tabRefs = useRef(new Map());
  const [plantillaActiva, setPlantillaActiva] = useState(null); // null | 'crecimt2' | 'inghosp'
  // "Maximizar"/"Expandir pantalla" (ver ViewSettingsMenu.jsx dentro de
  // PlantillaCrecimt2, y el botón homólogo en PlantillaIngresoHospitalizacion.jsx):
  // vive acá porque también compacta PatientBanner, hermano de la card, no
  // solo algo interno a cada plantilla — mismo estado reusado por ambas en
  // vez de que cada una lleve el suyo. Se resetea al salir de la plantilla
  // (ver handleSalirPlantilla) para no dejar el banner compacto en la vista
  // de pestañas normal.
  const [plantillaMaximizada, setPlantillaMaximizada] = useState(false);
  // Guarda qué elemento tenía el foco antes de abrir el catálogo de
  // plantillas, para devolvérselo al cerrar (PlantillaModal no lo sabe: solo
  // conoce su propio contenido, no quién lo disparó — WCAG 2.1.2/2.4.3).
  const plantillaTriggerRef = useRef(null);
  // Plantilla en curso de "creación" (delay simulado antes de montarla, ver
  // handleElegirPlantilla) -- null cuando no hay ninguna en vuelo. Guarda el
  // objeto entero (no solo un booleano) para que CreandoPlantillaModal pueda
  // mostrar su descripción.
  const [creandoPlantilla, setCreandoPlantilla] = useState(null);
  const creandoPlantillaTimeoutRef = useRef(null);

  // El timeout sobrevive a un cambio de pestaña/desmontaje de este árbol
  // (navegación fuera de la atención) si no se limpia acá.
  useEffect(() => () => {
    if (creandoPlantillaTimeoutRef.current) clearTimeout(creandoPlantillaTimeoutRef.current);
  }, []);

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

  // Sin backend real (mock: "solo pinta el front"), crear la plantilla
  // elegida es un delay simulado (mismo criterio que PRINT_LOADING_DELAY_MS
  // en FacturaVistaClasica.jsx) antes de montarla, con CreandoPlantillaModal
  // como feedback mientras dura (encargo explícito: "utiliza el pequeño
  // modal de carga que utilizamos al imprimir una factura"). Extraído de lo
  // que antes vivía inline en el onElegir de PlantillaModal — un único punto
  // de delay/loading acá porque también lo dispara el botón "+" de un
  // agrupador (ver handleAgregarRegistro abajo), que no pasa por el
  // catálogo.
  function handleElegirPlantilla(plantilla) {
    if (plantilla.codigo !== 'CRECIMT2' && plantilla.codigo !== 'INGHOSP') {
      window.ncToast?.(`Plantilla "${plantilla.descripcion}" seleccionada (flujo de nueva atención en desarrollo).`);
      return;
    }
    setCreandoPlantilla(plantilla);
    creandoPlantillaTimeoutRef.current = setTimeout(() => {
      setPlantillaActiva(plantilla.codigo === 'CRECIMT2' ? 'crecimt2' : 'inghosp');
      setCreandoPlantilla(null);
    }, CREAR_PLANTILLA_DELAY_MS);
  }

  // Botón "+" de un agrupador en RegistrosPanel (encargo explícito): abre
  // directo la plantilla cuyo `codigo` coincide con el `tipo` del agrupador,
  // sin pasar por PlantillaModal. No todo `tipo` tiene hoy un `codigo` que le
  // calce exacto en el catálogo (ej. HCURG, NOTAS DE ENFERMERÍA) — en ese
  // caso se avisa que no hay plantilla asociada, distinto del toast de
  // handleElegirPlantilla (ese es para plantillas que sí existen en el
  // catálogo pero cuyo formulario todavía no está construido).
  function handleAgregarRegistro(tipo) {
    const plantilla = cfg.plantillas.find((p) => p.codigo === tipo);
    if (!plantilla) {
      window.ncToast?.(`No hay una plantilla asociada a "${tipo}" todavía.`);
      return;
    }
    handleElegirPlantilla(plantilla);
  }

  // Patrón ARIA APG de tablist: el roving tabIndex ya deja Tab llegar a la
  // pestaña activa, pero dentro del tablist las flechas deben moverse entre
  // pestañas habilitadas (WCAG 4.1.2 / expectativa estándar del patrón). Hoy
  // hay dos pestañas enabled; el handler ya cubre las que se habiliten (ver
  // TABS más arriba) sin volver a tocarlo.
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

  // Atajo "+" (sola, sin Ctrl/Cmd) para "Nueva atención" (ver
  // rg-shortcut-hint en RegistrosPanel.jsx, misma tecla representada en el
  // botón). Ni Ctrl+N (el navegador la captura antes para "Nueva ventana")
  // ni Ctrl++ (zoom del navegador) llegan de forma confiable a la página —
  // por eso la tecla va sola. e.key es '+' en la mayoría de teclados con
  // Shift, pero en el bloque numérico (sin Shift) o en teclados donde '+'
  // comparte tecla con '=' llega como '=' — se aceptan ambos. Sin modificador
  // que la distinga de tipeo normal, se ignora mientras el foco está en un
  // campo editable (input/textarea/select/contenteditable) — hoy esta
  // pantalla no tiene ninguno mientras el atajo está activo (el buscador de
  // PlantillaModal solo existe con plantillaModalOpen, ya excluido abajo),
  // pero queda a prueba de que se agregue uno más adelante. Gateado además
  // por plantillaActiva===null && !plantillaModalOpen: evita reabrir el
  // catálogo de plantillas encima de sí mismo o encima del wizard ya en
  // curso si el usuario repite el atajo.
  useEffect(() => {
    function handleKeyDown(e) {
      if (!(e.key === '+' || e.key === '=')) return;
      if (status !== 'ready' || activeTab !== 'historia-clinica' || plantillaActiva !== null || plantillaModalOpen) return;
      const target = e.target;
      const isEditable = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA'
        || target?.tagName === 'SELECT' || target?.isContentEditable;
      if (isEditable) return;
      e.preventDefault();
      openPlantillaModal();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [status, activeTab, plantillaActiva, plantillaModalOpen]);

  useEffect(() => {
    let cancelled = false;
    VARIANTES[variante].fetchData(id).then((result) => {
      if (cancelled) return;
      if (!result) { setStatus('not-found'); return; }
      setData(result);
      setStatus('ready');
    });
    return () => { cancelled = true; };
  }, [id, variante]);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={cfg.section}
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
                    title={cfg.notFound.title}
                    subtitle={cfg.notFound.subtitle}
                  />
                  <button type="button" className="btn btn-primary" onClick={() => router.push(cfg.volverHref)}>
                    {cfg.volverLabel}
                  </button>
                </div>
              )}
            </div>
          )}

          {status === 'ready' && data && (
            <>
              <PatientBanner
                patient={data.patient}
                compact={plantillaActiva !== null && plantillaMaximizada}
                defaultCollapsed={cfg.bannerCollapsed}
                secondRow={cfg.secondRow(data)}
              />

              <div className="card">
                {plantillaActiva === 'crecimt2' ? (
                  <PlantillaCrecimt2
                    onSalir={handleSalirPlantilla}
                    maximizada={plantillaMaximizada}
                    onToggleMaximizar={() => setPlantillaMaximizada((v) => !v)}
                    patient={data.patient}
                  />
                ) : plantillaActiva === 'inghosp' ? (
                  <PlantillaIngresoHospitalizacion
                    onSalir={handleSalirPlantilla}
                    maximizada={plantillaMaximizada}
                    onToggleMaximizar={() => setPlantillaMaximizada((v) => !v)}
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

                    <div className="ap-tab-panel" role="tabpanel" id={`panel-${activeTab}`}>
                      {activeTab === 'historia-clinica' && (
                        <HistoriaClinicaTab
                          grupos={cfg.getRegistros(data)}
                          usuarioActual={DOCTOR.nombre}
                          nuevaAtencionLabel="Nueva atención"
                          onNuevaAtencion={openPlantillaModal}
                          onAgregarRegistro={handleAgregarRegistro}
                        />
                      )}
                      {activeTab === 'ordenes-medicas' && (
                        <OrdenesMedicasTab
                          ordenes={getOrdenesMedicas()}
                          usuarioActual={DOCTOR.nombre}
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
        plantillas={cfg.plantillas}
        conSexo={cfg.plantillasConSexo}
        onElegir={(plantilla) => {
          closePlantillaModal();
          handleElegirPlantilla(plantilla);
        }}
      />
      {creandoPlantilla && <CreandoPlantillaModal plantilla={creandoPlantilla} />}
    </div>
  );
}
