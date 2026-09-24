'use client';

import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useRouter } from 'next/navigation';
import './HistoriaClinicaHospitalizacion.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import ClintosAI from '@/Components/ClintosAI/ClintosAI';
import KoraTopbarButton from '@/Components/ClintosAI/KoraTopbarButton/KoraTopbarButton';
import PatientsPanel from './PatientsPanel/PatientsPanel';
import PendientesPanel from './PendientesPanel/PendientesPanel';
import {
  AREAS_OPERATIVAS, getDetalleAdmision, PACIENTES_HOSPITALIZADOS, pendientesOrdenados, sectorDeCama,
} from '@/hooks/HistoriaClinicaHospitalizacion/mockHospitalizadosData';
import DetalleAdmisionModal from '@/Components/DetalleAdmisionModal/DetalleAdmisionModal';
import {
  LuFilePen, LuFlaskConical, LuLogOut, LuUsers,
} from 'react-icons/lu';

// El panel lateral "Pendientes clínicos" queda oculto en esta versión (encargo
// explícito) — el componente y sus datos siguen intactos; poner en true
// para volver a mostrarlo (la tabla vuelve a ocupar ~70% del ancho).
const MOSTRAR_PENDIENTES = false;

// Tablero del médico sobre sus pacientes hospitalizados — mismo layout que
// el Panel General de Enfermería (PanelGeneral.jsx: encabezado, fila de
// KPIs, tabla de pacientes ~70% + panel lateral ~30%), pero con contenido
// clínico en vez de operativo (evolución, resultados, altas — el KPI
// "Órdenes por firmar" se quitó por encargo explícito; las órdenes siguen
// visibles por paciente en la columna Pendientes de la tabla). Todo (KPIs, tabla y panel de pendientes) se deriva de
// `pacientesFiltrados`, ya recortado por el selector de área, así que nunca
// hay un número que no cuadre con la lista que se ve. El filtro rápido vive
// acá (no en PatientsPanel) porque el botón del panel lateral también lo
// controla ("Ver pacientes con pendientes").
export default function HistoriaClinicaHospitalizacion() {
  const router = useRouter();
  const [areaOperativa, setAreaOperativa] = useState('todo');
  const [filtro, setFiltro] = useState('todos');
  // Levantado desde PatientsTable.jsx (antes vivía local ahí) — Clintos AI
  // necesita saber qué paciente está seleccionado para volverse contextual
  // (brief "Contexto dinámico", ver <ClintosAI selectedPaciente=.../> abajo).
  const [selectedPacienteId, setSelectedPacienteId] = useState(null);
  // Segundo punto de entrada a Kora desde el Topbar (KoraTopbarButton, ver
  // AGENTS.md-style comentario ahí) — necesita abrir el mismo <ClintosAI/>
  // de más abajo, que vive fuera del Topbar.
  const clintosAIRef = useRef(null);
  // Espejo de si el panel de Kora está abierto (vía onOpenChange de
  // <ClintosAI/>) — estado `active` del switch del Topbar.
  const [koraOpen, setKoraOpen] = useState(false);
  // Botón expandir de la barra de la tabla (PatientsPanel.jsx): compacta
  // los KPIs a una sola línea para darle ese alto a la tabla.
  const [tablaExpandida, setTablaExpandida] = useState(false);
  // "Ver detalle" del menú "⋯" (DetalleAdmisionModal) — id del paciente o null.
  const [detalleId, setDetalleId] = useState(null);
  const detalle = useMemo(() => (detalleId ? getDetalleAdmision(detalleId) : null), [detalleId]);

  // Theme claro/oscuro + colapsar/expandir el Sidebar — mismo init que
  // PanelGeneral.jsx/HistoriaClinica.jsx: sin este efecto los onClick de
  // Sidebar.jsx (window.toggleTheme/toggleSidebar/toggleNavGroup) quedan
  // sin definir.
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  // `tab` opcional: abre la atención directo en esa pestaña (ej.
  // 'ordenes-medicas' desde el menú "⋯" de la tabla, ver RowActionsMenu.jsx).
  function goToHistoria(pacienteId, tab) {
    const query = tab ? `?tab=${tab}` : '';
    router.push(`/hospitalizacion/historia-clinica/${pacienteId}${query}`);
  }

  // "Preguntar a Kora sobre este paciente" (menú "⋯"): selecciona la fila
  // —eso es lo que vuelve contextual a Kora, ver selectedPaciente abajo— y
  // abre el panel.
  function preguntarKora(pacienteId) {
    setSelectedPacienteId(pacienteId);
    clintosAIRef.current?.open();
  }

  const pacientesFiltrados = useMemo(() => (
    areaOperativa === 'todo'
      ? PACIENTES_HOSPITALIZADOS
      : PACIENTES_HOSPITALIZADOS.filter((p) => sectorDeCama(p.cama) === areaOperativa)
  ), [areaOperativa]);

  const pendientes = useMemo(() => pendientesOrdenados(pacientesFiltrados), [pacientesFiltrados]);
  const areaLabel = AREAS_OPERATIVAS.find((a) => a.value === areaOperativa)?.label;
  // Si el paciente seleccionado queda fuera del filtro de área activo, la
  // búsqueda no lo encuentra y el contexto de Clintos AI vuelve solo a
  // pantalla — nunca queda "seleccionado" un paciente que ya no se ve.
  const selectedPaciente = pacientesFiltrados.find((p) => p.id === selectedPacienteId);

  const kpis = useMemo(() => ({
    total: pacientesFiltrados.length,
    evolucionPendiente: pacientesFiltrados.filter((p) => p.evolucionPendiente).length,
    resultadosNuevos: pacientesFiltrados.reduce((n, p) => n + p.resultadosNuevos, 0),
    resultadosCriticos: pacientesFiltrados.reduce((n, p) => n + p.resultadosCriticos, 0),
    altasProbables: pacientesFiltrados.filter((p) => p.altaProbable).length,
  }), [pacientesFiltrados]);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Historia Clínica"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        >
          <KoraTopbarButton
            variant="secondary-accent"
            active={koraOpen}
            onClick={() => (koraOpen ? clintosAIRef.current?.close() : clintosAIRef.current?.open())}
          />
        </Topbar>

        <div className="hh-body-row">
          <div className="content hh-content">
            <div className="hh-header">
              <h1>Historia Clínica - Hospitalización</h1>
              <p>Mis pacientes hospitalizados</p>
            </div>

            <div className={`hh-kpi-row${tablaExpandida ? ' compact' : ''}`}>
              <KpiCard
                icon={LuUsers}
                label="Mis pacientes"
                value={kpis.total}
                description="En piso"
                variant="neutral"
              />
              <KpiCard
                icon={LuFilePen}
                label="Evolución pendiente"
                value={kpis.evolucionPendiente}
                description="Sin nota del día"
                variant="warning"
              />
              <KpiCard
                icon={LuFlaskConical}
                label="Resultados nuevos"
                value={kpis.resultadosNuevos}
                description={kpis.resultadosCriticos > 0
                  ? `${kpis.resultadosCriticos} ${kpis.resultadosCriticos === 1 ? 'crítico' : 'críticos'}`
                  : 'Sin críticos'}
                variant={kpis.resultadosCriticos > 0 ? 'danger' : 'info'}
              />
              <KpiCard
                icon={LuLogOut}
                label="Altas probables"
                value={kpis.altasProbables}
                description="Egreso hoy o mañana"
                variant="success"
              />
            </div>

            <div className="hh-main-row">
              <PatientsPanel
                pacientes={pacientesFiltrados}
                onOpenHistoria={goToHistoria}
                filtro={filtro}
                onFiltroChange={setFiltro}
                areaOperativa={areaOperativa}
                onAreaOperativaChange={setAreaOperativa}
                areaOptions={AREAS_OPERATIVAS}
                selectedId={selectedPacienteId}
                onSelectRow={setSelectedPacienteId}
                onPreguntarKora={preguntarKora}
                onVerDetalle={setDetalleId}
                expandida={tablaExpandida}
                onToggleExpandida={() => setTablaExpandida((v) => !v)}
              />
              {MOSTRAR_PENDIENTES && (
                <PendientesPanel
                  pendientes={pendientes}
                  onOpenHistoria={goToHistoria}
                  onVerPacientesConPendientes={() => setFiltro('pendientes')}
                />
              )}
            </div>
          </div>

          <ClintosAI
            ref={clintosAIRef}
            pacientes={pacientesFiltrados}
            areaLabel={areaLabel}
            userFirstName="Camilo"
            onOpenHistoria={goToHistoria}
            onNavigate={router.push}
            selectedPaciente={selectedPaciente}
            screenLabel="Hospitalización · Historia Clínica"
            onClearPaciente={() => setSelectedPacienteId(null)}
            onOpenChange={setKoraOpen}
          />
        </div>
      </div>

      {detalle && (
        <DetalleAdmisionModal
          detalle={detalle}
          onClose={() => setDetalleId(null)}
          onVerHistoria={() => goToHistoria(detalle.id)}
        />
      )}
    </div>
  );
}
